"use client";

import { BookOpen, PlayCircle, StopCircle, ShieldCheck } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function TeacherExamsPage() {
  return (
    <DashboardLayout title="Teacher Exams" subtitle="Manage exam lifecycle and student access">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <BookOpen size={18} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-900">Exam configuration</h2>
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              <span>Exam ID</span>
              <input className="input-field mt-2" defaultValue="EX001" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span>Class ID</span>
              <input className="input-field mt-2" defaultValue="CSE-3A" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span>Moodle Quiz URL</span>
              <input className="input-field mt-2" defaultValue="https://moodle.college.edu/mod/quiz/view.php?id=88" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              <span>Gateway URL</span>
              <input className="input-field mt-2" defaultValue="http://localhost:3000/seb/gateway?exam_id=EX001&roll_number=student1" />
            </label>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn-primary"><PlayCircle size={16} /> Start Monitoring Session</button>
            <button className="btn-secondary"><StopCircle size={16} /> End Monitoring Session</button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
              <ShieldCheck size={16} className="text-emerald-400" /> Current Status
            </div>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-sm text-slate-400">Exam status</p>
              <p className="mt-2 text-2xl font-semibold text-white">Ready to Launch</p>
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Exam Notes</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>• Student access is verified through the SEB gateway.</li>
              <li>• The teacher dashboard remains visible only to invigilators.</li>
              <li>• Student-facing pages stay free of monitoring controls.</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
