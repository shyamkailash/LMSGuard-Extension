"use client";
import { useState, useEffect, useCallback } from "react";
import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronDown, Wifi, WifiOff, Search, Users, BookOpen, LogOut } from "lucide-react";
import Sidebar from "./Sidebar";
import AlertPopup from "./AlertPopup";
import NetworkIssuePopup from "./NetworkIssuePopup";
import BackendStatus from "./BackendStatus";
import { connectSocket, onEvent } from "@/services/websocket";
import { useRouter } from "next/navigation";
import Link from "next/link";

import type { WSViolationEvent, NetworkIssue, InvigilatorProfile, AvailableClass, AvailableExam } from "@/types";

export default function DashboardLayout({
  children,
  title,
  subtitle,
}: {
  children:  React.ReactNode;
  title:     string;
  subtitle?: string;
}) {
  const [collapsed,    setCollapsed]    = useState(false);
  const [alertCurrent, setAlertCurrent] = useState<WSViolationEvent | null>(null);
  const [alertQueue,   setAlertQueue]   = useState<WSViolationEvent[]>([]);
  const [netIssue,     setNetIssue]     = useState<NetworkIssue | null>(null);
  const [netQueue,     setNetQueue]     = useState<NetworkIssue[]>([]);
  const [mode,         setMode]         = useState("connecting");
  const [notifs,       setNotifs]       = useState(0);
  const [invProfile,   setInvProfile]   = useState<InvigilatorProfile | null>(null);
  const [sessionClass, setSessionClass] = useState<AvailableClass | null>(null);
  const [sessionExam,  setSessionExam]  = useState<AvailableExam | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const p = sessionStorage.getItem("invProfile");
      const c = sessionStorage.getItem("invSelectedClass");
      const e = sessionStorage.getItem("invSelectedExam");
      if (p) setInvProfile(JSON.parse(p));
      if (c) { const cls = JSON.parse(c); if (cls?.id) setSessionClass(cls); }
      if (e) { const ex  = JSON.parse(e); if (ex?.id)  setSessionExam(ex);  }
    } catch {}

    const assignedClass = (() => {
      try { const c = JSON.parse(sessionStorage.getItem("invSelectedClass")); return c?.id || "CSE-3A"; }
      catch { return "CSE-3A"; }
    })();

    connectSocket(assignedClass);
    const offConn = onEvent("connection", ({ mode:m }) => setMode(m));
    const offVio  = onEvent("violation_detected", data => {
      if (!data.assignedClass || data.assignedClass === assignedClass) {
        setAlertQueue(q => [...q, data]);
        setNotifs(n => n + 1);
      }
    });
    const offNet = onEvent("network_issue", data => {
      if (!data.assignedClass || data.assignedClass === assignedClass) {
        setNetQueue(q => [...q, data]);
        setNotifs(n => n + 1);
      }
    });
    const t = setTimeout(() => setMode(m => m === "connecting" ? "demo" : m), 4000);
    return () => { offConn(); offVio(); offNet(); clearTimeout(t); };
  }, []);

  useEffect(() => {
    if (!alertCurrent && alertQueue.length > 0) {
      setAlertCurrent(alertQueue[0]);
      setAlertQueue(q => q.slice(1));
    }
  }, [alertCurrent, alertQueue]);

  useEffect(() => {
    if (!netIssue && !alertCurrent && netQueue.length > 0) {
      setNetIssue(netQueue[0]);
      setNetQueue(q => q.slice(1));
    }
  }, [netIssue, netQueue, alertCurrent]);

  const handleAlertClose   = useCallback(() => setAlertCurrent(null), []);
  const handleNetClose     = useCallback(() => setNetIssue(null), []);

  const displayName = invProfile?.name || "Invigilator";
  const initials    = displayName.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase();

  const STATUS = {
    live:       { color:"var(--success)", label:"Live",        dot:true  },
    demo:       { color:"var(--warning)", label:"Demo Mode",   dot:true  },
    connecting: { color:"var(--text-muted)", label:"Connecting…", dot:false },
  };
  const st = STATUS[mode] || STATUS.connecting;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:"var(--bg)" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)}/>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* ── Sticky Navbar ── */}
        <header className="h-15 shrink-0 sticky top-0 z-10 flex items-center justify-between px-6 gap-4"
          style={{
            background:"rgba(255,255,255,0.85)",
            backdropFilter:"blur(20px)",
            WebkitBackdropFilter:"blur(20px)",
            borderBottom:"1px solid var(--border)",
            boxShadow:"var(--shadow-xs)",
            height:56,
          }}>
          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <h1 className="text-base font-bold truncate leading-tight" style={{ color:"var(--text-primary)" }}>
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs truncate leading-tight" style={{ color:"var(--text-muted)" }}>{subtitle}</p>
              )}
            </div>
            {/* Session chips */}
            {sessionClass && (
              <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{ background:"var(--primary-soft)", border:"1px solid var(--primary-border)", color:"var(--primary)" }}>
                <Users size={10}/> {sessionClass.label}
              </div>
            )}
            {sessionExam && (
              <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{ background:"var(--bg-subtle)", border:"1px solid var(--border)", color:"var(--text-secondary)" }}>
                <BookOpen size={10}/> {sessionExam.title}
              </div>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Connection status */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
              style={{ background:"var(--bg-subtle)", border:"1px solid var(--border)", color:st.color }}>
              {st.dot && <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background:st.color }}/>}
              {st.label}
            </div>

            {/* Notifications */}
            <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
              onClick={() => setNotifs(0)}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
              style={{ background:"var(--bg-subtle)", border:"1px solid var(--border)", color:"var(--text-secondary)" }}>
              <Bell size={16}/>
              <AnimatePresence>
                {notifs > 0 && (
                  <motion.span initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }}
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                    style={{ background:"var(--danger)" }}>
                    {notifs > 9 ? "9+" : notifs}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Backend API status */}
            <div className="hidden md:block">
              <BackendStatus />
            </div>

            {/* User */}
            <div className="flex items-center gap-2 pl-2.5" style={{ borderLeft:"1px solid var(--border)" }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                style={{ background:"linear-gradient(135deg,#2563EB,#1D4ED8)" }}>
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-semibold leading-tight" style={{ color:"var(--text-primary)" }}>{displayName}</p>
                <p className="text-[10px] leading-tight" style={{ color:"var(--primary)" }}>Invigilator</p>
              </div>
              <Link href="/login">
                <motion.button whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                  onClick={() => sessionStorage.clear()}
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background:"var(--danger-soft)", color:"var(--danger)" }}
                  title="Logout">
                  <LogOut size={13}/>
                </motion.button>
              </Link>
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto">
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.25 }}
            className="p-6 max-w-screen-2xl mx-auto">
            {children}
          </motion.div>
        </main>
      </div>

      <AlertPopup alert={alertCurrent} onClose={handleAlertClose}
        onViewStudent={a => { router.push(`/teacher/monitoring?s=${a.studentId}`); handleAlertClose(); }}
        onIgnore={handleAlertClose} onRemark={handleAlertClose}/>

      <NetworkIssuePopup issue={netIssue} onClose={handleNetClose}
        onAction={() => { handleNetClose(); }}/>
    </div>
  );
}
