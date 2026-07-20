"use client";

import { useState } from "react";
import { PlayCircle, ShieldCheck, Wifi, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StudentLauncherPage() {
  const router = useRouter();
  const [examId, setExamId] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto flex max-w-3xl flex-col items-center rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-400">
          <ShieldCheck size={28} />
        </div>
        <h1 className="text-3xl font-semibold">LMSGuard Student Agent</h1>
        <p className="mt-3 max-w-xl text-center text-sm text-slate-400">
          Launch Safe Exam Browser from this simple student portal. No monitoring dashboard or teacher controls are shown here.
        </p>

        <div className="mt-8 grid w-full gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-400"><ShieldCheck size={16} className="text-emerald-400" /> Agent Status</div>
            <p className="mt-2 text-lg font-semibold text-white">Ready</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <label className="block text-sm font-medium text-slate-400">Exam ID</label>
            <input className="mt-2 w-full bg-transparent text-lg font-semibold text-white outline-none" value={examId} onChange={e => setExamId(e.target.value)} placeholder="Enter ID" />
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <label className="block text-sm font-medium text-slate-400">Roll Number</label>
            <input className="mt-2 w-full bg-transparent text-lg font-semibold text-white outline-none" value={rollNumber} onChange={e => setRollNumber(e.target.value)} placeholder="Enter Roll" />
          </div>
        </div>

        <button className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500" onClick={() => router.push(`/seb/gateway?exam_id=${encodeURIComponent(examId)}&roll_number=${encodeURIComponent(rollNumber)}`)}>
          <PlayCircle size={18} /> Launch Safe Exam Browser
        </button>
      </div>
    </div>
  );
}
