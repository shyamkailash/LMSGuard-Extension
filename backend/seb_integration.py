import sqlite3
import os
import time
import calendar
from typing import Any, Dict, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "lmsguard.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def get_current_time_iso():
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def init_seb_integration_tables() -> None:
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS seb_exam_configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exam_id TEXT NOT NULL UNIQUE,
            exam_name TEXT,
            class_id TEXT,
            moodle_quiz_url TEXT NOT NULL,
            seb_required INTEGER NOT NULL DEFAULT 1,
            created_by TEXT,
            created_by_role TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS student_agent_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exam_id TEXT NOT NULL,
            roll_number TEXT NOT NULL,
            student_id TEXT,
            student_name TEXT,
            agent_status TEXT NOT NULL DEFAULT 'OFFLINE',
            seb_detected INTEGER NOT NULL DEFAULT 0,
            active_window TEXT,
            last_heartbeat TEXT,
            network_status TEXT NOT NULL DEFAULT 'UNKNOWN',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(exam_id, roll_number)
        )
    """)

    conn.commit()
    conn.close()


def save_seb_exam_config(data: Dict[str, Any]) -> Dict[str, Any]:
    """Insert or update a SEB exam config. Expects a dict containing at least
    `exam_id` and `moodle_quiz_url`.
    """
    now = get_current_time_iso()
    exam_id = data.get("exam_id")
    if not exam_id:
        raise ValueError("exam_id is required")
    moodle_quiz_url = data.get("moodle_quiz_url")
    if not moodle_quiz_url:
        raise ValueError("moodle_quiz_url is required")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM seb_exam_configs WHERE exam_id = ?", (exam_id,))
    existing = cursor.fetchone()

    if existing:
        cursor.execute(
            """
            UPDATE seb_exam_configs
            SET exam_name = ?, class_id = ?, moodle_quiz_url = ?, seb_required = ?,
                created_by = ?, created_by_role = ?, updated_at = ?
            WHERE exam_id = ?
            """,
            (
                data.get("exam_name"),
                data.get("class_id"),
                moodle_quiz_url,
                int(bool(data.get("seb_required", 1))),
                data.get("created_by"),
                data.get("created_by_role"),
                now,
                exam_id,
            ),
        )
    else:
        cursor.execute(
            """
            INSERT INTO seb_exam_configs
            (exam_id, exam_name, class_id, moodle_quiz_url, seb_required, created_by, created_by_role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                exam_id,
                data.get("exam_name"),
                data.get("class_id"),
                moodle_quiz_url,
                int(bool(data.get("seb_required", 1))),
                data.get("created_by"),
                data.get("created_by_role"),
                now,
                now,
            ),
        )

    conn.commit()
    cursor.execute("SELECT * FROM seb_exam_configs WHERE exam_id = ?", (exam_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else {}


def get_seb_exam_config(exam_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM seb_exam_configs WHERE exam_id = ?", (exam_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def update_agent_heartbeat(data: Dict[str, Any]) -> Dict[str, Any]:
    """Upsert agent heartbeat and session info.
    Expected fields: exam_id, roll_number, student_id(optional), student_name(optional),
    agent_status(optional), seb_detected(optional), active_window(optional), network_status(optional)
    """
    now = get_current_time_iso()
    exam_id = data.get("exam_id")
    roll_number = data.get("roll_number")
    if not exam_id or not roll_number:
        raise ValueError("exam_id and roll_number are required")

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM student_agent_sessions WHERE exam_id = ? AND roll_number = ?",
        (exam_id, roll_number),
    )
    existing = cursor.fetchone()

    if existing:
        cursor.execute(
            """
            UPDATE student_agent_sessions
            SET student_id = ?, student_name = ?, agent_status = ?, seb_detected = ?,
                active_window = ?, last_heartbeat = ?, network_status = ?, updated_at = ?
            WHERE exam_id = ? AND roll_number = ?
            """,
            (
                data.get("student_id"),
                data.get("student_name"),
                data.get("agent_status", existing["agent_status"]),
                int(bool(data.get("seb_detected", existing["seb_detected"]))),
                data.get("active_window"),
                now,
                data.get("network_status", existing["network_status"]),
                now,
                exam_id,
                roll_number,
            ),
        )
    else:
        cursor.execute(
            """
            INSERT INTO student_agent_sessions
            (exam_id, roll_number, student_id, student_name, agent_status, seb_detected, active_window, last_heartbeat, network_status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                exam_id,
                roll_number,
                data.get("student_id"),
                data.get("student_name"),
                data.get("agent_status", "OFFLINE"),
                int(bool(data.get("seb_detected", 0))),
                data.get("active_window"),
                now,
                data.get("network_status", "UNKNOWN"),
                now,
                now,
            ),
        )

    conn.commit()
    cursor.execute("SELECT * FROM student_agent_sessions WHERE exam_id = ? AND roll_number = ?", (exam_id, roll_number))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else {}


def get_agent_status(exam_id: str, roll_number: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM student_agent_sessions WHERE exam_id = ? AND roll_number = ?", (exam_id, roll_number))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None


def get_gateway_status(exam_id: str, roll_number: str) -> Dict[str, Any]:
    """Return whether the student is allowed to proceed to Moodle/SEB gateway along
    with reasons per the specified logic.
    """
    # 1. Check SEB config
    config = get_seb_exam_config(exam_id)
    if not config:
        return {"allowed": False, "reason": "NO_CONFIG"}

    # 2. Check agent heartbeat
    agent = get_agent_status(exam_id, roll_number)
    if not agent or not agent.get("last_heartbeat"):
        return {"allowed": False, "reason": "AGENT_OFFLINE"}

    # parse heartbeat timestamp and compare
    try:
        hb_time_struct = time.strptime(agent["last_heartbeat"], "%Y-%m-%dT%H:%M:%SZ")
        hb_seconds = calendar.timegm(hb_time_struct)
    except Exception:
        # if parsing fails, treat as offline
        return {"allowed": False, "reason": "AGENT_OFFLINE"}

    if time.time() - hb_seconds > 30:
        return {"allowed": False, "reason": "AGENT_OFFLINE"}

    # 4. All good — return allowed with Moodle URL. Do not leak secrets.
    return {"allowed": True, "moodle_quiz_url": config.get("moodle_quiz_url")}
