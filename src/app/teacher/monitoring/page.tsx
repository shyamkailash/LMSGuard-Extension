"use client";

import { AlertTriangle, Camera, Monitor, ShieldCheck, Wifi, Zap } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const students = [
  { name: "Aman Kumar", roll: "ST001", status: "Online", seb: "Opened", network: "Stable", examStatus: "In Progress", violationCount: 0, lastHeartbeat: "10:15 AM" },
  { name: "Neha Singh", roll: "ST002", status: "Online", seb: "Opened", network: "Stable", examStatus: "In Progress", violationCount: 1, lastHeartbeat: "10:16 AM" },
  { name: "Ravi Verma", roll: "ST003", status: "Offline", seb: "Pending", network: "Issue", examStatus: "Not Started", violationCount: 0, lastHeartbeat: "09:50 AM" },
  { name: "Priya Sharma", roll: "ST004", status: "Online", seb: "Opened", network: "Stable", examStatus: "In Progress", violationCount: 0, lastHeartbeat: "10:14 AM" },
  { name: "Kiran Patel", roll: "ST005", status: "Online", seb: "Opened", network: "Stable", examStatus: "In Progress", violationCount: 2, lastHeartbeat: "10:13 AM" },
];

export default function TeacherMonitoringPage() {
  return (
    <DashboardLayout title="Teacher Monitoring" subtitle="Watch student sessions and incident activity">
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Student List</p>
              <h2 className="text-lg font-semibold text-slate-900">Active monitoring feed</h2>
            </div>
            <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Live</div>
          </div>
          <div className="space-y-3">
            {students.map((student) => (
              <div key={student.roll} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{student.name}</p>
                    <p className="text-sm text-slate-500">{student.roll}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${student.status === "Online" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                    {student.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-white px-2.5 py-1">SEB: {student.seb}</span>
                  <span className="rounded-full bg-white px-2.5 py-1">Network: {student.network}</span>
                  <span className="rounded-full bg-white px-2.5 py-1">Exam: {student.examStatus}</span>
                  <span className="rounded-full bg-white px-2.5 py-1">Violations: {student.violationCount}</span>
                  <span className="rounded-full bg-white px-2.5 py-1">Last HB: {student.lastHeartbeat}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Live Screen</p>
                <h2 className="text-lg font-semibold text-slate-900">Student desktop view</h2>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-600">Placeholder</div>
            </div>
            <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
              <div className="text-center">
                <Monitor size={36} className="mx-auto mb-3 text-slate-400" />
                <p className="font-medium">Live screen preview will appear here.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Camera size={16} /> Latest Screenshot
              </div>
              <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
                Screenshot placeholder
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <AlertTriangle size={16} className="text-rose-500" /> Alert Timeline
              </div>
              <div className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-rose-50 p-3 text-rose-700">Suspicious tab switch detected at 10:12 AM</div>
                <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">Network fluctuation observed</div>
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">Agent connected and healthy</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><ShieldCheck size={16} className="text-emerald-500" /> Violation Status</div>
          <p className="mt-2 text-sm text-slate-600">No critical violations in the last 5 minutes.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Zap size={16} className="text-blue-500" /> Agent Status</div>
          <p className="mt-2 text-sm text-slate-600">2 agents online and reporting heartbeat.</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Wifi size={16} className="text-violet-500" /> SEB Status</div>
          <p className="mt-2 text-sm text-slate-600">2 students launched Safe Exam Browser.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}
