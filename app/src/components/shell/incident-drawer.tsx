"use client";
import { useEffect } from "react";
import { X, Clock, User, Shield } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { INCIDENTS, ANALYSTS, TENANTS } from "@/lib/mock-data";
import { SeverityBadge, StatusBadge } from "@/components/ui/badge";

export function IncidentDrawer() {
  const { incidentDrawerId, closeIncidentDrawer, addToast } = useUIStore();
  const incident = incidentDrawerId ? INCIDENTS.find((i) => i.id === incidentDrawerId) : null;
  const tenant = incident ? TENANTS.find((t) => t.id === incident.tenantId) : null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeIncidentDrawer(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeIncidentDrawer]);

  if (!incident) return null;

  const TIMELINE = [
    { label: "Detection",    time: `${incident.ageHours + 1}h ago` },
    { label: "Correlation",  time: `${incident.ageHours}h ago` },
    { label: "Enrichment",   time: `${Math.max(0, incident.ageHours - 1)}h ago` },
    { label: "Assignment",   time: incident.assignee ? `${Math.max(0, incident.ageHours - 2)}h ago` : "Pending" },
  ];

  return (
    <>
      <div className="fixed inset-0 z-[900]" style={{ background: "rgba(17,21,29,.35)" }} onClick={closeIncidentDrawer} />
      <aside
        className="slide-in-right fixed right-0 top-0 h-full z-[901] flex flex-col overflow-hidden"
        style={{
          width: "min(560px,100vw)",
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "var(--shadow-pop)",
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <SeverityBadge severity={incident.severity} />
              <StatusBadge status={incident.status} />
              <span className="mono text-[12px]" style={{ color: "var(--ink-4)" }}>{incident.id}</span>
              {incident.cvss >= 7 && (
                <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold"
                  style={{ background: "var(--crit-tint)", color: "var(--crit)" }}>
                  CVSS {incident.cvss}
                </span>
              )}
              <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold mono"
                style={{ background: "var(--surface-3)", color: "var(--ink-3)" }}>
                {incident.ttp}
              </span>
            </div>
            <h2 className="text-[16px] font-bold leading-snug" style={{ color: "var(--ink)" }}>{incident.title}</h2>
            {tenant && (
              <div className="mt-1 text-[12px]" style={{ color: "var(--ink-4)" }}>{tenant.name}</div>
            )}
          </div>
          <button onClick={closeIncidentDrawer} className="p-1.5 rounded-[7px] hover:bg-surface-3 transition-colors">
            <X size={16} color="var(--ink-3)" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Description */}
          <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{incident.description}</p>

          {/* Assign + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>
                Assignee
              </label>
              <select
                className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
                style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }}
                defaultValue={incident.assignee ?? ""}
                onChange={(e) => addToast(`Assigned to ${e.target.value || "unassigned"}`, "success")}
              >
                <option value="">Unassigned</option>
                {ANALYSTS.map((a) => (
                  <option key={a.id} value={a.name}>{a.name} {a.onCall ? "(on-call)" : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>
                Status
              </label>
              <select
                className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
                style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }}
                defaultValue={incident.status}
                onChange={(e) => addToast(`Status updated to ${e.target.value}`, "success")}
              >
                {["new", "assigned", "investigating", "resolved"].map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Affected asset */}
          <div className="p-4 rounded-[10px]" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <div className="text-[11px] font-bold uppercase tracking-[.1em] mb-3" style={{ color: "var(--ink-4)" }}>Affected Asset</div>
            <div className="grid grid-cols-2 gap-y-2 text-[13px]">
              <span style={{ color: "var(--ink-4)" }}>Hostname</span>
              <span className="font-semibold mono" style={{ color: "var(--ink)" }}>{incident.asset}</span>
              <span style={{ color: "var(--ink-4)" }}>Client</span>
              <span className="font-medium" style={{ color: "var(--ink)" }}>{tenant?.name ?? "—"}</span>
            </div>
          </div>

          {/* Timeline */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.1em] mb-3" style={{ color: "var(--ink-4)" }}>Timeline</div>
            <div className="flex flex-col gap-2">
              {TIMELINE.map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: i < TIMELINE.length - 1 || incident.assignee ? "var(--ok)" : "var(--border-strong)" }} />
                  <span className="text-[13px] flex-1" style={{ color: "var(--ink-2)" }}>{step.label}</span>
                  <span className="text-[12px] mono" style={{ color: "var(--ink-4)" }}>{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended actions */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.1em] mb-3" style={{ color: "var(--ink-4)" }}>Recommended Actions</div>
            {[
              { label: "Isolate affected endpoint from network", phase: "Immediate" },
              { label: "Capture memory dump for forensics", phase: "Immediate" },
              { label: "Rotate credentials for affected accounts", phase: "Short-term" },
              { label: "Review lateral movement indicators in SIEM", phase: "Short-term" },
              { label: "Conduct post-incident review", phase: "Long-term" },
            ].map((action, i) => (
              <label key={i} className="flex items-start gap-3 py-2 cursor-pointer group">
                <input type="checkbox" className="mt-0.5 accent-primary" />
                <div className="flex-1">
                  <div className="text-[13px]" style={{ color: "var(--ink-2)" }}>{action.label}</div>
                  <div className="text-[11px]" style={{ color: "var(--ink-4)" }}>{action.phase}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 p-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-colors"
            style={{ background: "var(--crit-tint)", color: "var(--crit)" }}
            onClick={() => addToast("Isolate command sent", "success")}
          >
            Isolate Asset
          </button>
          <button
            className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold text-white transition-colors"
            style={{ background: "var(--primary)" }}
            onClick={() => addToast(`${incident.id} marked resolved`, "success")}
          >
            Resolve
          </button>
          <button
            className="px-3 py-2 rounded-[10px] text-[13px] font-semibold transition-colors"
            style={{ background: "var(--surface-3)", color: "var(--ink-2)" }}
          >
            Playbook
          </button>
        </div>
      </aside>
    </>
  );
}
