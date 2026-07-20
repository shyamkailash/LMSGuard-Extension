"""
LMSGuard — FastAPI application entry point.

Run:
    cd backend
    python -m uvicorn main:app --reload
"""
import json
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.auth import create_access_token, decode_token
from app.database import engine, get_db, SessionLocal

# ── Legacy raw-sqlite helpers (monitoring events / security controls) ──────────
from database import (
    get_dashboard_summary,
    get_live_alerts as _db_get_live_alerts,
    get_monitoring_events,
    init_db,
    save_live_alert,
    save_monitoring_event,
    seed_demo_data,
)
from security_controls import (
    get_all_security_controls,
    get_security_control,
    init_security_controls,
    update_security_control,
)
from live_monitoring_agent import LiveMonitoringAgent

from exam_access import (
    init_exam_access_tables,
    teacher_start_exam,
    student_join_exam_lobby,
    student_heartbeat,
    student_confirm_start,
    get_student_exam_status,
    teacher_quit_student,
    teacher_quit_all_students,
    get_exam_dashboard_summary,
    get_exam_students,
    submit_code
)
from seb_integration import (
    init_seb_integration_tables,
    save_seb_exam_config,
    get_seb_exam_config,
    update_agent_heartbeat,
    get_agent_status as _get_agent_status,
    get_gateway_status,
)
from pydantic import BaseModel

# ── Bootstrap ─────────────────────────────────────────────────────────────────

# Create all SQLAlchemy ORM tables (users, departments, classes, exams …)
models.Base.metadata.create_all(bind=engine)

# Create legacy sqlite3 tables (monitoring_events, live_alerts,
# exam_security_controls) and seed demo monitoring data
init_db()
seed_demo_data()
init_security_controls()
init_exam_access_tables()
init_seb_integration_tables()

# Seed ORM demo data (users, academic structure) if DB is empty
with SessionLocal() as _seed_db:
    crud.seed_if_empty(_seed_db)

# ── FastAPI app ───────────────────────────────────────────────────────────────

app = FastAPI(
    title="LMSGuard API",
    description="AI-Based Examination Monitoring System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── In-memory state ───────────────────────────────────────────────────────────
agent_events:      list[dict[str, Any]] = []
live_alerts_cache: list[dict[str, Any]] = []
live_monitoring_agent = LiveMonitoringAgent()

# ── Auth helpers ──────────────────────────────────────────────────────────────
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def get_current_user_optional(token: str = Depends(oauth2_scheme)) -> dict | None:
    """Returns decoded token payload or None (does NOT raise)."""
    if not token:
        return None
    return decode_token(token)


def require_auth(payload: dict | None = Depends(get_current_user_optional)) -> dict:
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload


def require_role(*roles: str):
    def _checker(payload: dict = Depends(require_auth)) -> dict:
        if payload.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {list(roles)}",
            )
        return payload
    return _checker


# ── Utilities ─────────────────────────────────────────────────────────────────

def _sanitize(event: dict[str, Any]) -> dict[str, Any]:
    safe = event.copy()
    if "image" in safe:
        safe["image"] = f"<base64 image hidden, size={len(event.get('image', ''))}>"
    return safe


# ── Health / Root ─────────────────────────────────────────────────────────────

@app.get("/")
def health_check():
    return {
        "message":  "Backend Connected Successfully",
        "service":  "LMSGuard API",
        "version":  "1.0.0",
        "database": "SQLite connected",
        "status":   "running",
    }


# ── Authentication ────────────────────────────────────────────────────────────

@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate a user and return a JWT.

    Body::

        { "identifier": "admin@lmsguard.edu", "password": "admin123", "role": "admin" }
    """
    user = crud.authenticate_user(db, payload.role, payload.identifier, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials or role",
        )
    token = create_access_token({
        "sub":  str(user.id),
        "role": user.role,
        "name": user.full_name,
    })
    return schemas.TokenResponse(
        access_token = token,
        role         = user.role,
        full_name    = user.full_name,
        identifier   = user.identifier,
        user_id      = user.id,
    )


@app.post("/api/auth/logout")
def logout(_: dict = Depends(require_auth)):
    """
    Stateless logout — client drops the token.
    This endpoint is provided so the client can signal intent.
    """
    return {"message": "Logged out successfully"}


@app.get("/api/auth/me", response_model=schemas.UserOut)
def me(payload: dict = Depends(require_auth), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ── Users / Admin ─────────────────────────────────────────────────────────────

@app.get("/api/admin/users", response_model=list[schemas.UserOut])
def list_users(
    role: str | None = None,
    _: dict = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    if role:
        return crud.get_users_by_role(db, role)
    return crud.get_all_users(db)


@app.post("/api/admin/users", response_model=schemas.UserOut, status_code=201)
def create_user(
    data: schemas.UserCreate,
    _: dict = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    existing = crud.get_user_by_identifier(db, data.identifier)
    if existing:
        raise HTTPException(status_code=409, detail="Identifier already registered")
    return crud.create_user(db, data)


# ── Dashboard ─────────────────────────────────────────────────────────────────

@app.get("/api/dashboard-summary")
def dashboard_summary(_: dict = Depends(require_auth)):
    return get_dashboard_summary()


# ── Students ─────────────────────────────────────────────────────────────────

@app.get("/api/students", response_model=list[schemas.StudentOut])
def list_students(
    _: dict = Depends(require_role("admin", "invigilator")),
    db: Session = Depends(get_db),
):
    return crud.get_all_students(db)


# ── Departments ───────────────────────────────────────────────────────────────

@app.get("/api/departments", response_model=list[schemas.DepartmentOut])
def list_departments(
    _: dict = Depends(require_role("admin", "invigilator")),
    db: Session = Depends(get_db),
):
    return crud.get_all_departments(db)


# ── Classes ───────────────────────────────────────────────────────────────────

@app.get("/api/classes", response_model=list[schemas.ClassOut])
def list_classes(
    _: dict = Depends(require_role("admin", "invigilator")),
    db: Session = Depends(get_db),
):
    return crud.get_all_classes(db)


# ── Exams ─────────────────────────────────────────────────────────────────────

@app.get("/api/exams", response_model=list[schemas.ExamOut])
def list_exams(
    _: dict = Depends(require_role("admin", "invigilator")),
    db: Session = Depends(get_db),
):
    return crud.get_all_exams(db)


# ── Monitoring events ─────────────────────────────────────────────────────────

@app.get("/api/agent-events")
def get_agent_events(_: dict = Depends(require_auth)):
    return get_monitoring_events(limit=50)


@app.get("/api/live-alerts")
def get_live_alerts(_: dict = Depends(require_auth)):
    return _db_get_live_alerts(limit=50)


@app.get("/api/latest-screenshot")
def get_latest_screenshot(_: dict = Depends(require_auth)):
    for event in reversed(agent_events):
        if event.get("type") == "SCREEN_CAPTURE":
            return _sanitize(event)
    return {"message": "No screenshot found"}


# ── Security Controls ─────────────────────────────────────────────────────────

@app.get("/api/admin/security-controls")
def admin_get_security_controls(_: dict = Depends(require_role("admin", "invigilator"))):
    return get_all_security_controls()


@app.post("/api/admin/security-controls")
def admin_update_security_control(
    data: schemas.SecurityControlUpdate,
    _: dict = Depends(require_role("admin", "invigilator")),
):
    return update_security_control(data.model_dump(exclude_none=True))


@app.get("/api/student/security-control/{student_id}")
def student_get_security_control(
    student_id: str,
    _: dict = Depends(require_auth),
):
    return get_security_control(student_id)


# ── Invigilators ─────────────────────────────────────────────────────────────

@app.get("/api/invigilators", response_model=list[schemas.UserOut])
def list_invigilators(
    _: dict = Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    return crud.get_users_by_role(db, "invigilator")


# ── Reports ───────────────────────────────────────────────────────────────────

@app.get("/api/reports/summary")
def reports_summary(_: dict = Depends(require_role("admin", "invigilator"))):
    """Aggregate monitoring stats used by the Reports page."""
    summary = get_dashboard_summary()
    alerts  = _db_get_live_alerts(limit=1000)
    high    = sum(1 for a in alerts if a.get("risk") == "HIGH")
    return {
        **summary,
        "high_risk_violations": high,
        "medium_risk_violations": len(alerts) - high,
    }

# ── Exam Access / Controls ───────────────────────────────────────────────────

class StartExamRequest(BaseModel):
    exam_id: str
    exam_name: str
    class_id: str
    created_by: str
    created_by_role: str

@app.post("/api/exam/start")
def api_start_exam(req: StartExamRequest):
    teacher_start_exam(req.exam_id, req.class_id, req.created_by, req.created_by_role)
    return {
        "success": True,
        "message": "Exam started successfully",
        "exam_id": req.exam_id,
        "start_status": "STARTED"
    }

class JoinLobbyRequest(BaseModel):
    student_id: str
    roll_number: str
    student_name: str
    exam_id: str
    class_id: str

@app.post("/api/student/exam/join")
def api_student_join(req: JoinLobbyRequest):
    student_join_exam_lobby(req.student_id, req.roll_number, req.student_name, req.exam_id, req.class_id)
    return {
        "success": True,
        "status": "WAITING_START",
        "message": "Student joined exam lobby"
    }

@app.get("/api/student/exam/status/{exam_id}/{roll_number}")
def api_student_status(exam_id: str, roll_number: str):
    return get_student_exam_status("", roll_number, exam_id)

class ConfirmStartRequest(BaseModel):
    student_id: str
    roll_number: str
    exam_id: str

@app.post("/api/student/exam/confirm-start")
def api_student_confirm_start(req: ConfirmStartRequest):
    student_confirm_start(req.student_id, req.roll_number, req.exam_id)
    return {
        "success": True,
        "status": "IN_EXAM",
        "message": "Exam access confirmed"
    }

class HeartbeatRequest(BaseModel):
    student_id: str
    roll_number: str
    exam_id: str

@app.post("/api/student/exam/heartbeat")
def api_student_heartbeat(req: HeartbeatRequest):
    student_heartbeat(req.student_id, req.roll_number, req.exam_id)
    return {"success": True}


# ── SEB / Gateway integration APIs ───────────────────────────────────────────


class SebExamConfigRequest(BaseModel):
    exam_id: str
    exam_name: str | None = None
    class_id: str | None = None
    moodle_quiz_url: str
    seb_required: int | None = 1
    created_by: str | None = None
    created_by_role: str | None = None


@app.post("/api/seb/exam/config")
def api_save_seb_exam_config(req: SebExamConfigRequest):
    data = req.model_dump()
    row = save_seb_exam_config(data)
    return {"success": True, "config": row}


@app.get("/api/seb/exam/config/{exam_id}")
def api_get_seb_exam_config(exam_id: str):
    cfg = get_seb_exam_config(exam_id)
    if not cfg:
        raise HTTPException(status_code=404, detail="SEB config not found")
    return cfg


class AgentHeartbeatRequest(BaseModel):
    exam_id: str
    roll_number: str
    student_id: str | None = None
    student_name: str | None = None
    agent_status: str | None = None
    seb_detected: int | None = 0
    active_window: str | None = None
    network_status: str | None = None


@app.post("/api/agent/heartbeat")
def api_agent_heartbeat(req: AgentHeartbeatRequest):
    # Agent heartbeats are allowed unauthenticated (agents run on student machines)
    row = update_agent_heartbeat(req.model_dump())
    return {"success": True, "session": row}


@app.get("/api/agent/status/{exam_id}/{roll_number}")
def api_agent_status(exam_id: str, roll_number: str, _: dict = Depends(require_auth)):
    s = _get_agent_status(exam_id, roll_number)
    if not s:
        raise HTTPException(status_code=404, detail="Agent session not found")
    return s

@app.get("/api/seb/gateway/status/{exam_id}/{roll_number}")
def seb_gateway_status(exam_id: str, roll_number: str):
    return get_gateway_status(exam_id, roll_number)

@app.get("/api/exam/dashboard-summary/{exam_id}")
def api_exam_dashboard_summary(exam_id: str):
    return get_exam_dashboard_summary(exam_id)

@app.get("/api/exam/students/{exam_id}")
def api_exam_students(exam_id: str):
    return get_exam_students(exam_id)

class QuitStudentRequest(BaseModel):
    exam_id: str
    roll_number: str
    approved_by: str
    approved_by_role: str

@app.post("/api/exam/quit-student")
def api_quit_student(req: QuitStudentRequest):
    teacher_quit_student(req.exam_id, req.roll_number, req.approved_by, req.approved_by_role)
    return {"success": True}

class QuitAllRequest(BaseModel):
    exam_id: str
    approved_by: str
    approved_by_role: str

@app.post("/api/exam/quit-all")
def api_quit_all(req: QuitAllRequest):
    teacher_quit_all_students(req.exam_id, req.approved_by, req.approved_by_role)
    return {"success": True}

class SubmitCodeRequest(BaseModel):
    exam_id: str
    roll_number: str
    question_id: str
    language: str
    code: str
    result_status: str

@app.post("/api/student/exam/submit-code")
def api_submit_code(req: SubmitCodeRequest):
    submit_code(req.exam_id, req.roll_number, req.question_id, req.language, req.code, req.result_status)
    return {"success": True}


# ── WebSocket — Student Agent ─────────────────────────────────────────────────

@app.websocket("/ws/student-agent")
async def student_agent_ws(websocket: WebSocket):
    await websocket.accept()
    print("[WS] Student agent connected")

    try:
        while True:
            raw = await websocket.receive_text()

            try:
                event = json.loads(raw)
            except json.JSONDecodeError:
                print("[WS] Invalid JSON received")
                continue

            event["timestamp"]  = event.get("timestamp") or datetime.now().isoformat()
            event.setdefault("student_id", "student-001")

            # Fix event-type mismatch: agent sends IDLE_DETECTED; agent uses IDLE_STATUS
            if event.get("type") == "IDLE_DETECTED":
                event["type"] = "IDLE_STATUS"

            agent_events.append(event)

            event_id = save_monitoring_event(event)

            alert            = live_monitoring_agent.process_event(event)
            alert["event_id"] = event_id
            live_alerts_cache.append(alert)
            save_live_alert(alert)

            print("[WS] Event:", _sanitize(event).get("type"), "| student:", event.get("student_id"))

            await websocket.send_json({
                "status":   "received",
                "type":     event.get("type", "UNKNOWN"),
                "event_id": event_id,
            })

    except WebSocketDisconnect:
        print("[WS] Student agent disconnected")
