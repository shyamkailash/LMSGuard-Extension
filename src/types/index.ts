// ─── Shared TypeScript Interfaces ─────────────────────────────────────────────

// Network status
export type NetworkStatus = "stable" | "weak" | "disconnected";

// Violation severity
export type Severity = "critical" | "warning" | "medium";

// Student exam status
export type StudentStatus = "safe" | "warning" | "violation";

// ─── Student (Monitoring) ─────────────────────────────────────────────────────
export interface StudentViolation {
  time: string;
  type: string;
  detail?: string;
  severity: Severity;
}

export interface MonitoringStudent {
  id: string;
  name: string;
  regno: string;
  avatar: string;
  risk: number;
  status: StudentStatus;
  exam?: string;
  networkStatus?: NetworkStatus;
  violations?: StudentViolation[];
  currentWindow?: string;
}

// ─── Violation record ─────────────────────────────────────────────────────────
export interface ViolationRecord {
  id: string;
  studentId: string;
  studentName: string;
  regno: string;
  type: string;
  detail?: string;
  severity: Severity;
  time: string;
  timestamp: number;
  assignedClass?: string;
}

// ─── Network Issue ────────────────────────────────────────────────────────────
export interface NetworkIssue {
  id: string;
  studentId: string;
  studentName: string;
  regno: string;
  classLabel: string;
  examTitle: string;
  issue: string;
  networkStatus: NetworkStatus;
  disconnectedAt: string;
  durationMin: number;
  resolved: boolean;
  resolution?: string;
  extraMinutes?: number;
  timestamp: number;
  assignedClass?: string;
}

// ─── Invigilator ─────────────────────────────────────────────────────────────
export interface InvigilatorProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  department: string;
}

export interface AvailableClass {
  id: string;
  label: string;
  dept: string;
  year: string;
  section: string;
  strength: number;
}

export interface AvailableExam {
  id: string;
  title: string;
  subject: string;
  code: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  eligibleClasses: string[];
}

export interface Department {
  id: string;
  name: string;
  code: string;
  hod: string;
  students: number;
  classes: number;
}

export interface SchoolClass {
  id: string;
  name: string;
  dept: string;
  deptCode: string;
  year: string;
  section: string;
  strength: number;
}

export interface MonitoringSession {
  id: string;
  invigilator: string;
  class: string;
  exam: string;
  students: number;
  violations: number;
  status: "active" | "paused" | "stopped";
  startTime: string;
}

export interface SystemStats {
  totalStudents: number;
  totalInvigilators: number;
  activeExams: number;
  totalViolations: number;
  aiAccuracy: string;
  serverUptime: string;
}

// ─── Student Portal ───────────────────────────────────────────────────────────
export interface Assessment {
  id: string;
  title: string;
  subject: string;
  code: string;
  duration: number;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  startTime: string;
  endTime: string;
  date: string;
  status: "available" | "upcoming" | "completed";
  instructions: string[];
}

export interface ExamQuestion {
  id: number;
  text: string;
  options: string[];
  correct: number;
}

// ─── WebSocket events ─────────────────────────────────────────────────────────
export interface WSStudentStatusEvent {
  students: MonitoringStudent[];
  assignedClass: string;
}

export interface WSViolationEvent extends ViolationRecord {
  exam?: string;
  risk: number;
}

export interface WSScreenUpdateEvent {
  studentId: string;
  risk: number;
  currentWindow?: string;
  assignedClass?: string;
  networkStatus?: NetworkStatus;
}

export interface WSNetworkIssueEvent extends NetworkIssue {}

export interface WSNetworkUpdateEvent {
  studentId: string;
  networkStatus: NetworkStatus;
  assignedClass?: string;
}

export type WSEventMap = {
  connection:         { mode: "live" | "demo" };
  student_status:     WSStudentStatusEvent;
  violation_detected: WSViolationEvent;
  screen_update:      WSScreenUpdateEvent;
  violations_list:    { violations: ViolationRecord[]; assignedClass: string };
  network_issue:      WSNetworkIssueEvent;
  network_update:     WSNetworkUpdateEvent;
};
