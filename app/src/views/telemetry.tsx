"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Activity, Pause, Play, Filter, Download, Trash2, Wifi, WifiOff, AlertTriangle, Shield, Zap } from "lucide-react";

type EventType = "agent" | "incident" | "policy" | "firewall" | "auth" | "threat" | "patch" | "system";

interface TelemetryEvent {
  id: string;
  ts: number;
  type: EventType;
  severity: "info" | "low" | "medium" | "high" | "critical";
  source: string;
  message: string;
  ttp?: string;
  tenant?: string;
  details?: string;
}

const TYPE_CONFIG: Record<EventType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  agent:    { label: "Agent",    color: "var(--primary)",  bg: "var(--primary-tint)",  icon: <Wifi size={11} /> },
  incident: { label: "Incident", color: "var(--crit)",     bg: "var(--crit-tint)",     icon: <AlertTriangle size={11} /> },
  threat:   { label: "Threat",   color: "var(--high)",     bg: "var(--high-tint)",     icon: <Zap size={11} /> },
  policy:   { label: "Policy",   color: "var(--ok)",       bg: "var(--ok-tint)",       icon: <Shield size={11} /> },
  firewall: { label: "Firewall", color: "var(--ok)",       bg: "var(--ok-tint)",       icon: <Shield size={11} /> },
  auth:     { label: "Auth",     color: "var(--high)",     bg: "var(--high-tint)",     icon: <AlertTriangle size={11} /> },
  patch:    { label: "Patch",    color: "var(--ink-3)",    bg: "var(--surface-3)",     icon: <Shield size={11} /> },
  system:   { label: "System",   color: "var(--ink-4)",    bg: "var(--surface-3)",     icon: <Activity size={11} /> },
};

const SEV_COLOR: Record<TelemetryEvent["severity"], string> = {
  info:     "var(--ink-4)",
  low:      "var(--ok)",
  medium:   "var(--high)",
  high:     "var(--high)",
  critical: "var(--crit)",
};

const MOCK_EVENTS: Omit<TelemetryEvent, "id" | "ts">[] = [
  { type: "agent",    severity: "info",     source: "WIN-DC01",       message: "Agent heartbeat received",                    tenant: "Acme Corp" },
  { type: "threat",   severity: "critical", source: "192.168.1.45",   message: "Lateral movement detected via SMB",           ttp: "T1021.002", tenant: "FinServ LLC" },
  { type: "auth",     severity: "high",     source: "LINUX-WEB01",    message: "Brute-force login attempt — 48 failures in 2m", ttp: "T1110", tenant: "HealthCo" },
  { type: "firewall", severity: "medium",   source: "FW-EDGE-01",     message: "Inbound connection blocked — Port 4444",      tenant: "Acme Corp" },
  { type: "policy",   severity: "info",     source: "Policy Engine",  message: "NIST CSF baseline deployed to 12 endpoints",  tenant: "RetailPlus" },
  { type: "agent",    severity: "info",     source: "MACOS-LAPTOP-07",message: "Agent version updated to v2.4.1",             tenant: "FinServ LLC" },
  { type: "incident", severity: "high",     source: "SIEM",           message: "New incident created: Suspicious PowerShell", ttp: "T1059.001", tenant: "HealthCo" },
  { type: "patch",    severity: "info",     source: "Patch Manager",  message: "CVE-2024-1234 patched on 8 endpoints",       tenant: "Acme Corp" },
  { type: "threat",   severity: "high",     source: "EDR",            message: "Credential dumping attempt — LSASS access",  ttp: "T1003.001", tenant: "FinServ LLC" },
  { type: "auth",     severity: "medium",   source: "VPN-GATEWAY",    message: "Unusual login location — IP: 185.220.101.47", tenant: "RetailPlus" },
  { type: "agent",    severity: "low",      source: "WIN-WS-042",     message: "Agent connectivity restored after 4m outage", tenant: "HealthCo" },
  { type: "firewall", severity: "info",     source: "FW-EDGE-02",     message: "Rule #147 triggered: Outbound DNS tunneling",  ttp: "T1071.004", tenant: "Acme Corp" },
  { type: "system",   severity: "info",     source: "Platform",       message: "Log ingestion rate: 12,847 events/min",       tenant: "All" },
  { type: "threat",   severity: "critical", source: "192.168.3.12",   message: "Ransomware pre-stage: mass file enumeration", ttp: "T1083", tenant: "RetailPlus" },
  { type: "policy",   severity: "low",      source: "Policy Engine",  message: "PCI DSS configuration drift detected on 2 hosts", tenant: "FinServ LLC" },
  { type: "agent",    severity: "info",     source: "CLOUD-EC2-019",  message: "New agent registered — AWS us-east-1",       tenant: "HealthCo" },
  { type: "auth",     severity: "low",      source: "AD-CONTROLLER",  message: "Service account password rotation completed", tenant: "Acme Corp" },
  { type: "threat",   severity: "medium",   source: "IDS",            message: "SQL injection attempt detected — Web App",    ttp: "T1190", tenant: "RetailPlus" },
  { type: "patch",    severity: "medium",   source: "Patch Manager",  message: "3 critical patches pending: CVE-2024-2891, CVE-2024-3102, CVE-2024-3456", tenant: "FinServ LLC" },
  { type: "system",   severity: "info",     source: "Platform",       message: "Compliance report generated: HIPAA Q2 2026", tenant: "HealthCo" },
];

let eventIndex = 0;
function nextMockEvent(): TelemetryEvent {
  const base = MOCK_EVENTS[eventIndex % MOCK_EVENTS.length];
  eventIndex++;
  return { ...base, id: Math.random().toString(36).slice(2), ts: Date.now() };
}

const ALL_TYPES: EventType[] = ["agent", "incident", "threat", "policy", "firewall", "auth", "patch", "system"];

export function TelemetryStream() {
  const [events, setEvents] = useState<TelemetryEvent[]>(() => {
    const initial: TelemetryEvent[] = [];
    for (let i = 0; i < 20; i++) initial.unshift(nextMockEvent());
    return initial;
  });
  const [running, setRunning] = useState(true);
  const [typeFilter, setTypeFilter] = useState<Set<EventType>>(new Set(ALL_TYPES));
  const [sevFilter, setSevFilter] = useState<"all" | "medium+" | "high+">("all");
  const [eventRate, setEventRate] = useState(0);
  const [totalCount, setTotalCount] = useState(20);
  const [autoScroll, setAutoScroll] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rateCountRef = useRef(0);

  const addEvent = useCallback(() => {
    const ev = nextMockEvent();
    setEvents((prev) => [ev, ...prev].slice(0, 500));
    setTotalCount((c) => c + 1);
    rateCountRef.current++;
  }, []);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(addEvent, 1200 + Math.random() * 800);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, addEvent]);

  useEffect(() => {
    const rateInterval = setInterval(() => {
      setEventRate(rateCountRef.current);
      rateCountRef.current = 0;
    }, 1000);
    return () => clearInterval(rateInterval);
  }, []);

  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events, autoScroll]);

  const filtered = events.filter((e) => {
    if (!typeFilter.has(e.type)) return false;
    if (sevFilter === "medium+" && !["medium", "high", "critical"].includes(e.severity)) return false;
    if (sevFilter === "high+" && !["high", "critical"].includes(e.severity)) return false;
    return true;
  });

  function toggleType(t: EventType) {
    setTypeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t); else next.add(t);
      return next;
    });
  }

  const critCount = events.filter((e) => e.severity === "critical").length;
  const highCount = events.filter((e) => e.severity === "high").length;

  return (
    <div className="p-6 fade-in flex flex-col gap-5 h-full" style={{ maxHeight: "calc(100vh - var(--topbar-h))" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Telemetry Stream</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--ink-4)" }}>
            Real-time security event feed across all agents and tenants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] font-mono text-[12px]"
            style={{ background: running ? "var(--ok-tint)" : "var(--surface-3)", color: running ? "var(--ok)" : "var(--ink-4)", border: `1px solid ${running ? "var(--ok)" : "var(--border)"}` }}>
            <span className={`w-2 h-2 rounded-full ${running ? "animate-pulse" : ""}`}
              style={{ background: running ? "var(--ok)" : "var(--ink-4)" }} />
            {running ? "LIVE" : "PAUSED"}
          </div>
          <button className="p-2 rounded-[8px]"
            style={{ background: "var(--surface-3)", color: "var(--ink-3)", border: "1px solid var(--border)" }}
            onClick={() => setRunning((r) => !r)}
            title={running ? "Pause stream" : "Resume stream"}>
            {running ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button className="p-2 rounded-[8px]"
            style={{ background: "var(--surface-3)", color: "var(--ink-3)", border: "1px solid var(--border)" }}
            onClick={() => { setEvents([]); setTotalCount(0); }}
            title="Clear events">
            <Trash2 size={14} />
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12.5px] font-semibold"
            style={{ background: "var(--surface-3)", color: "var(--ink-3)", border: "1px solid var(--border)" }}>
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: "Total Events", value: totalCount.toLocaleString(), color: "var(--primary)" },
          { label: "Events/sec", value: eventRate.toFixed(1), color: "var(--ok)" },
          { label: "Critical", value: critCount, color: "var(--crit)" },
          { label: "High", value: highCount, color: "var(--high)" },
          { label: "Visible", value: filtered.length, color: "var(--ink-3)" },
        ].map((k) => (
          <div key={k.label} className="p-3 rounded-[11px]"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div className="text-[10.5px] font-bold uppercase tracking-[.08em] mb-0.5" style={{ color: "var(--ink-4)" }}>{k.label}</div>
            <div className="text-[22px] font-bold mono" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Filter size={12} color="var(--ink-4)" />
          <span className="text-[11.5px] font-semibold uppercase tracking-[.08em]" style={{ color: "var(--ink-4)" }}>Types</span>
        </div>
        {ALL_TYPES.map((t) => {
          const cfg = TYPE_CONFIG[t];
          const active = typeFilter.has(t);
          return (
            <button key={t} onClick={() => toggleType(t)}
              className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[11.5px] font-semibold transition-colors"
              style={{
                background: active ? cfg.bg : "var(--surface-3)",
                color: active ? cfg.color : "var(--ink-4)",
                border: `1px solid ${active ? cfg.color : "transparent"}`,
                opacity: active ? 1 : 0.5,
              }}>
              {cfg.icon} {cfg.label}
            </button>
          );
        })}

        <div className="flex items-center gap-1 p-0.5 rounded-[8px] ml-auto" style={{ background: "var(--surface-3)" }}>
          {(["all", "medium+", "high+"] as const).map((s) => (
            <button key={s} onClick={() => setSevFilter(s)}
              className="px-2.5 py-1 rounded-[6px] text-[11.5px] font-semibold transition-colors"
              style={{ background: sevFilter === s ? "var(--surface)" : "transparent", color: sevFilter === s ? "var(--ink)" : "var(--ink-3)", boxShadow: sevFilter === s ? "var(--shadow-sm)" : "none" }}>
              {s}
            </button>
          ))}
        </div>

        <button onClick={() => setAutoScroll((v) => !v)}
          className="px-2.5 py-1 rounded-[8px] text-[11.5px] font-semibold"
          style={{ background: autoScroll ? "var(--primary-tint)" : "var(--surface-3)", color: autoScroll ? "var(--primary)" : "var(--ink-4)", border: `1px solid ${autoScroll ? "var(--primary)" : "transparent"}` }}>
          Auto-scroll {autoScroll ? "on" : "off"}
        </button>
      </div>

      {/* Event list */}
      <div ref={listRef} className="flex-1 overflow-y-auto rounded-[13px] font-mono text-[11.5px]"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        {/* Table header */}
        <div className="sticky top-0 flex items-center gap-3 px-4 py-2 border-b text-[10px] font-bold uppercase tracking-[.08em] z-10"
          style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--ink-4)" }}>
          <span style={{ width: 64 }}>Time</span>
          <span style={{ width: 70 }}>Type</span>
          <span style={{ width: 52 }}>Severity</span>
          <span style={{ width: 140 }}>Source</span>
          <span className="flex-1">Message</span>
          <span style={{ width: 90 }}>TTP</span>
          <span style={{ width: 100 }}>Tenant</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <WifiOff size={28} color="var(--ink-4)" />
            <div className="text-[12.5px]" style={{ color: "var(--ink-4)" }}>No events match current filters</div>
          </div>
        ) : (
          filtered.map((ev) => {
            const cfg = TYPE_CONFIG[ev.type];
            const t = new Date(ev.ts);
            const timeStr = `${t.getHours().toString().padStart(2,"0")}:${t.getMinutes().toString().padStart(2,"0")}:${t.getSeconds().toString().padStart(2,"0")}`;
            const isHighSev = ["high", "critical"].includes(ev.severity);

            return (
              <div key={ev.id} className="flex items-center gap-3 px-4 py-2 border-b transition-colors hover:bg-surface-2"
                style={{
                  borderColor: "var(--border-faint)",
                  background: ev.severity === "critical" ? "rgba(239,68,68,.03)" : "transparent",
                }}>
                <span style={{ width: 64, color: "var(--ink-4)" }}>{timeStr}</span>
                <span style={{ width: 70 }}>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold w-fit"
                    style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.icon} {cfg.label}
                  </span>
                </span>
                <span style={{ width: 52, color: SEV_COLOR[ev.severity], fontWeight: isHighSev ? 700 : 400 }}>
                  {ev.severity}
                </span>
                <span className="truncate" style={{ width: 140, color: "var(--ink-3)" }}>{ev.source}</span>
                <span className="flex-1 truncate" style={{ color: isHighSev ? "var(--ink)" : "var(--ink-2)", fontWeight: isHighSev ? 600 : 400 }}>
                  {ev.message}
                </span>
                <span style={{ width: 90, color: "var(--primary)", fontFamily: "monospace" }}>
                  {ev.ttp ?? "—"}
                </span>
                <span className="truncate" style={{ width: 100, color: "var(--ink-4)" }}>
                  {ev.tenant ?? "—"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
