"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, ShieldAlert, Clock3 } from "lucide-react";

type GatewayState = "loading" | "allowed" | "blocked" | "invalid";

const AGENT_OFFLINE_MESSAGE =
  "LMSGuard Student Agent is not connected. Please start the agent and relaunch SEB.";
const MOODLE_URL_MISSING_MESSAGE =
  "Moodle quiz is not configured. Contact invigilator.";
const BACKEND_ERROR_MESSAGE =
  "Unable to connect to LMSGuard backend. Please check agent/backend connection.";

export default function SebGatewayPage() {
  const searchParams = useSearchParams();
  const examId = searchParams.get("exam_id") ?? "";
  const rollNumber = searchParams.get("roll_number") ?? "";
  const [state, setState] = useState<GatewayState>("loading");
  const [message, setMessage] = useState("Checking access...");

  useEffect(() => {
    if (!examId || !rollNumber) {
      setState("invalid");
      setMessage("Invalid SEB launch link.");
      return;
    }

    let cancelled = false;
    let redirectTimer: number | undefined;

    const verifyAccess = async () => {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/seb/gateway/status/${encodeURIComponent(examId)}/${encodeURIComponent(rollNumber)}`,
        );
        if (!res.ok) throw new Error(`Request failed with ${res.status}`);

        const data = await res.json();
        if (cancelled) return;

        if (data.reason === "AGENT_OFFLINE") {
          setState("blocked");
          setMessage(AGENT_OFFLINE_MESSAGE);
          return;
        }

        if (data.moodle_quiz_url) {
          setState("allowed");
          setMessage("Access verified. Redirecting to Moodle quiz...");
          redirectTimer = window.setTimeout(() => {
            window.location.replace(data.moodle_quiz_url);
          }, 1000);
          return;
        }

        setState("blocked");
        setMessage(MOODLE_URL_MISSING_MESSAGE);
      } catch (error) {
        if (cancelled) return;
        setState("blocked");
        setMessage(BACKEND_ERROR_MESSAGE);
        console.error(error);
      }
    };

    verifyAccess();
    return () => {
      cancelled = true;
      if (redirectTimer !== undefined) window.clearTimeout(redirectTimer);
    };
  }, [examId, rollNumber]);

  const status = {
    allowed: {
      icon: <CheckCircle2 size={30} />,
      iconClass: "bg-emerald-100 text-emerald-700",
      title: "Access verified",
    },
    invalid: {
      icon: <AlertCircle size={30} />,
      iconClass: "bg-rose-100 text-rose-700",
      title: "Invalid SEB launch link",
    },
    blocked: {
      icon: <ShieldAlert size={30} />,
      iconClass: "bg-amber-100 text-amber-700",
      title: "Unable to launch exam",
    },
    loading: {
      icon: <Clock3 size={30} />,
      iconClass: "bg-slate-100 text-slate-700",
      title: "Preparing your exam access",
    },
  }[state];

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-800">
      <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full ${status.iconClass}`}>
            {status.icon}
          </div>
          <h1 className="text-xl font-semibold text-slate-900">{status.title}</h1>
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      </div>
    </main>
  );
}
