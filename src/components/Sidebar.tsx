"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Monitor, BarChart3,
  ChevronLeft, ChevronRight, Shield, Zap, BookOpen
} from "lucide-react";

const NAV = [
  { label:"Teacher Dashboard", href:"/teacher/dashboard", icon:LayoutDashboard },
  { label:"Exams",      href:"/teacher/exams",     icon:BookOpen        },
  { label:"Monitoring", href:"/teacher/monitoring", icon:Monitor        },
  { label:"Reports",    href:"/teacher/reports",    icon:BarChart3       },
];

export default function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle:  () => void;
}) {
  const path = usePathname();

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 236 }}
      transition={{ duration:0.25, ease:[0.4,0,0.2,1] }}
      className="relative flex flex-col h-screen shrink-0 z-20 overflow-visible"
      style={{ background:"var(--sidebar)", borderRight:"1px solid var(--border)" }}
    >
      {/* ── Brand Header ── */}
      <div className="flex items-center gap-3 px-4 py-5 overflow-hidden shrink-0">
        {/* Logo placeholder — replace CollegeLogo with actual logo later */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
             style={{ background:"linear-gradient(135deg,#2563EB,#1D4ED8)" }}>
          <Shield size={17} className="text-white"/>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:-8 }} transition={{ duration:0.15 }} className="overflow-hidden">
              <p className="text-sm font-bold whitespace-nowrap" style={{ color:"var(--text-primary)" }}>
                LMSGuard <span style={{ color:"var(--primary)" }}>AI</span>
              </p>
              <p className="text-[10px] whitespace-nowrap" style={{ color:"var(--text-muted)" }}>
                Exam Monitoring System
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── AI status pill ── */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
            exit={{ opacity:0, height:0 }}
            className="mx-3 mb-2 px-3 py-1.5 rounded-xl flex items-center gap-2"
            style={{ background:"var(--primary-soft)", border:"1px solid var(--primary-border)" }}>
            <Zap size={11} style={{ color:"var(--primary)" }}/>
            <span className="text-[11px] font-semibold" style={{ color:"var(--primary)" }}>AI Engine Active</span>
            <span className="ml-auto w-1.5 h-1.5 rounded-full pulse-dot" style={{ background:"var(--success)" }}/>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-px mx-4 mb-3 shrink-0" style={{ background:"var(--border)" }}/>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon:Icon }) => {
          const active = path === href || path.startsWith(href+"/");
          return (
            <Link key={href} href={href}>
              <motion.div whileHover={{ x:collapsed?0:2 }} whileTap={{ scale:0.97 }}
                className={`sidebar-item group relative ${active?"active":""}`}>
                <div className={`relative flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  active ? "bg-[var(--primary)]" : "group-hover:bg-[var(--primary-soft)]"
                }`}>
                  <Icon size={14} style={{ color: active ? "#fff" : "var(--text-secondary)" }}/>
                </div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity:0, x:-6 }} animate={{ opacity:1, x:0 }}
                      exit={{ opacity:0, x:-6 }} transition={{ duration:0.12 }}
                      className="whitespace-nowrap" style={{ color: active ? "var(--primary)" : "inherit" }}>
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Active pill indicator */}
                {active && !collapsed && (
                  <motion.span layoutId="navPill"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full"
                    style={{ background:"var(--primary)" }}/>
                )}
                {/* Tooltip */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 rounded-xl text-xs font-medium
                    whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100
                    transition-opacity z-50 shadow-lg"
                    style={{ background:"var(--text-primary)", color:"var(--card)" }}>
                    {label}
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse button */}
      <motion.button whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
        onClick={onToggle}
        className="absolute -right-3.5 top-[76px] w-7 h-7 rounded-full flex items-center justify-center z-30 shadow-md"
        style={{ background:"var(--card)", border:"1px solid var(--border)", color:"var(--text-muted)" }}>
        {collapsed ? <ChevronRight size={12}/> : <ChevronLeft size={12}/>}
      </motion.button>
    </motion.aside>
  );
}
