import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <section className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xl shadow-slate-200/60">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          LMSGuard Extension Way
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Moodle + Safe Exam Browser + LMSGuard Monitoring
        </p>
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/student/launcher" className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700">
            Student Launcher
          </Link>
          <Link href="/teacher/dashboard" className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-800 transition hover:bg-slate-100">
            Teacher Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
