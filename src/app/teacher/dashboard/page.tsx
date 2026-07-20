"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Copy,
  Monitor,
  PlayCircle,
  ShieldCheck,
  Users,
  Wifi,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatsCard from "@/components/StatsCard";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";

interface MonitorRow {
  rollNumber: string;
  studentName: string;
  agentStatus: string;
  sebStatus: string;
  network: string;
  lastHeartbeat: string;
  examStatus: string;
}

const fallbackRows: MonitorRow[] = [
  { rollNumber: "ST001", studentName: "Aman Kumar", agentStatus: "Online", sebStatus: "Opened", network: "Stable", lastHeartbeat: "2s ago", examStatus: "In Exam" },
  { rollNumber: "ST002", studentName: "Neha Singh", agentStatus: "Online", sebStatus: "Opened", network: "Stable", lastHeartbeat: "4s ago", examStatus: "In Exam" },
  { rollNumber: "ST003", studentName: "Ravi Verma", agentStatus: "Offline", sebStatus: "Not Opened", network: "Network Issue", lastHeartbeat: "38s ago", examStatus: "Pending" },
];

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [students, setStudents] = useState<MonitorRow[]>(fallbackRows);
  const [examId, setExamId] = useState("EX001");
  const [classId, setClassId] = useState("CSE-3A");
  const [moodleQuizUrl, setMoodleQuizUrl] = useState("https://moodle.college.edu/mod/quiz/view.php?id=88");
  const [examStatus, setExamStatus] = useState("Ready");
  const [message, setMessage] = useState<{ text: string; tone: "success" | "warning" } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryRes, studentsRes] = await Promise.all([
          fetch(`${BACKEND_URL}/api/exam/dashboard-summary/EX001`),
          fetch(`${BACKEND_URL}/api/exam/students/EX001`),
        ]);

        if (summaryRes.ok) {
          const summary = await summaryRes.json();
          if (summary?.total_students) {
            setStudents((prev) => prev.length ? prev : fallbackRows);
          }
        }

        if (studentsRes.ok) {
          const payload = await studentsRes.json();
          if (Array.isArray(payload) && payload.length > 0) {
            const mapped = payload.map((item: any) => ({
              rollNumber: item.roll_number || "-",
              studentName: item.student_name || "Unknown",
              agentStatus: item.status === "ABSENT" ? "Offline" : "Online",
              sebStatus: item.status === "IN_EXAM" ? "Opened" : "Not Opened",
              network: item.network_status === "NETWORK_ISSUE" ? "Network Issue" : "Stable",
              lastHeartbeat: item.last_seen_at || item.joined_at || "-",
              examStatus: (item.status || "PENDING").replace(/_/g, " "),
            }));
            setStudents(mapped);
          }
        }
      } catch {
        setStudents(fallbackRows);
      }
    };

    load();
  }, []);

  const stats = useMemo(() => [
    { title: "Total Students", value: students.length, icon: Users, color: "blue" as const, subtitle: "Registered for exam" },
    { title: "Agent Online", value: students.filter((s) => s.agentStatus === "Online").length, icon: ShieldCheck, color: "green" as const, subtitle: "Connected monitoring agents" },
    { title: "SEB Opened", value: students.filter((s) => s.sebStatus === "Opened").length, icon: Monitor, color: "purple" as const, subtitle: "Safe Browser sessions" },
    { title: "Violations", value: 2, icon: AlertTriangle, color: "red" as const, subtitle: "Recent suspicious activity" },
    { title: "Network Issues", value: students.filter((s) => s.network === "Network Issue").length, icon: Wifi, color: "yellow" as const, subtitle: "Connection anomalies" },
    { title: "Completed", value: 1, icon: CheckCircle2, color: "green" as const, subtitle: "Students finished" },
  ], [students]);

  const saveConfig = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/seb/exam/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_id: examId,
          exam_name: "Secure Quiz",
          class_id: classId,
          moodle_quiz_url: moodleQuizUrl,
          seb_required: 1,
          created_by: "invigilator-001",
          created_by_role: "invigilator",
        }),
      });
      setMessage({ text: "Configuration saved successfully.", tone: "success" });
    } catch {
      setMessage({ text: "Could not save configuration. Backend is unavailable.", tone: "warning" });
    }
  };

  const startExam = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/exam/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exam_id: examId,
          exam_name: "Secure Quiz",
          class_id: classId,
          created_by: "invigilator-001",
          created_by_role: "invigilator",
        }),
      });
      setExamStatus("In Progress");
      setMessage({ text: "Exam launch request sent.", tone: "success" });
    } catch {
      setMessage({ text: "Exam launch could not be started right now.", tone: "warning" });
    }
  };

  const copyGateway = async () => {
    const url = `${FRONTEND_URL}/seb/gateway?exam_id=${encodeURIComponent(examId)}&roll_number=student1`;
    try {
      await navigator.clipboard.writeText(url);
      setMessage({ text: "Gateway URL copied to clipboard.", tone: "success" });
    } catch {
      setMessage({ text: "Clipboard is unavailable. Copy the URL manually.", tone: "warning" });
    }
  };

  return (
    <DashboardLayout title="Teacher Dashboard" subtitle="Security monitoring and exam orchestration">
      <div className="space-y-6">
        {message && (
          <div className={`rounded-2xl border px-4 py-3 text-sm ${message.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
            {message.text}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((card, index) => (
            <StatsCard key={card.title} title={card.title} value={card.value} icon={card.icon} color={card.color} subtitle={card.subtitle} index={index} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Moodle + SEB Configuration</p>
                <h2 className="text-xl font-semibold text-slate-900">Exam launch controls</h2>
              </div>
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                {examStatus}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Exam ID</span>
                <input className="input-field" value={examId} onChange={(e) => setExamId(e.target.value)} />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700">
                <span>Class ID</span>
                <input className="input-field" value={classId} onChange={(e) => setClassId(e.target.value)} />
              </label>
              <label className="space-y-2 text-sm font-medium text-slate-700 md:col-span-2">
                <span>Moodle Quiz URL</span>
                <input className="input-field" value={moodleQuizUrl} onChange={(e) => setMoodleQuizUrl(e.target.value)} />
              </label>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button className="btn-primary" onClick={saveConfig}>
                <ShieldCheck size={16} /> Save Config
              </button>
              <button className="btn-primary" onClick={startExam}>
                <PlayCircle size={16} /> Start Monitoring Session
              </button>
              <button className="btn-secondary" onClick={copyGateway}>
                <Copy size={16} /> Copy Gateway URL
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <BookOpen size={16} /> Gateway Preview
            </div>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">Gateway URL</p>
              <p className="mt-2 break-all text-slate-400">{`${FRONTEND_URL}/seb/gateway?exam_id=${examId}&roll_number=student1`}</p>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-sm text-slate-300">
              <CheckCircle2 size={16} className="text-emerald-400" />
              Ready for student launch through Safe Exam Browser.
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Live Student Monitoring</p>
              <h2 className="text-lg font-semibold text-slate-900">Student activity overview</h2>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600">{students.length} monitored</div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-6 py-3">Roll Number</th>
                  <th className="px-6 py-3">Student Name</th>
                  <th className="px-6 py-3">Agent Status</th>
                  <th className="px-6 py-3">SEB Status</th>
                  <th className="px-6 py-3">Network</th>
                  <th className="px-6 py-3">Last Heartbeat</th>
                  <th className="px-6 py-3">Exam Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.rollNumber} className="border-t border-slate-100">
                    <td className="px-6 py-4 font-semibold text-slate-800">{student.rollNumber}</td>
                    <td className="px-6 py-4">{student.studentName}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${student.agentStatus === "Online" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {student.agentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">{student.sebStatus}</td>
                    <td className="px-6 py-4">{student.network}</td>
                    <td className="px-6 py-4 text-slate-500">{student.lastHeartbeat}</td>
                    <td className="px-6 py-4">{student.examStatus}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700" onClick={() => router.push("/teacher/monitoring")}>View Monitor</button>
                        <button className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700" onClick={() => setMessage({ text: `Quit action requested for ${student.rollNumber}.`, tone: "warning" })}>Quit</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
