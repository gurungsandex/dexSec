"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { INCIDENTS, TENANTS, type Severity, type IncidentStatus } from "@/lib/mock-data";
import { useUIStore } from "@/store/ui-store";
import { SeverityBadge, StatusBadge } from "@/components/ui/badge";

const SEVERITIES: (Severity | "all")[] = ["all", "critical", "high", "medium", "low"];
const STATUSES: (IncidentStatus | "all")[] = ["all", "new", "assigned", "investigating", "resolved"];

export function Incidents() {
  const { scope, openIncidentDrawer } = useUIStore();
  const [sev, setSev] = useState<Severity | "all">("all");
  const [status, setStatus] = useState<IncidentStatus | "all">("all");
  const [q, setQ] = useState("");

  const base = scope === "all" ? INCIDENTS : INCIDENTS.filter((i) => i.tenantId === scope);
  const filtered = base.filter((i) => {
    if (sev !== "all" && i.severity !== sev) return false;
    if (status !== "all" && i.status !== status) return false;
    if (q && !i.title.toLowerCase().includes(q.toLowerCase()) && !i.id.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const countBySev = (s: Severity) => base.filter((i) => i.severity === s).length;

  return (
    <div className="p-6 fade-in flex flex-col gap-5">
      <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Incident Queue</h1>

      {/* Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Severity pills */}
        <div className="flex items-center gap-1 p-1 rounded-[10px]" style={{ background: "var(--surface-3)" }}>
          {SEVERITIES.map((s) => (
            <button
              key={s}
              onClick={() => setSev(s)}
              className="px-3 py-1 rounded-[7px] text-[12.5px] font-semibold transition-colors capitalize"
              style={{
                background: sev === s ? "var(--surface)" : "transparent",
                color: sev === s ? "var(--ink)" : "var(--ink-3)",
                boxShadow: sev === s ? "var(--shadow-sm)" : "none",
              }}
            >
              {s === "all" ? "All" : `${s.charAt(0).toUpperCase() + s.slice(1)} (${countBySev(s as Severity)})`}
            </button>
          ))}
        </div>

        {/* Status pills */}
        <div className="flex items-center gap-1 p-1 rounded-[10px]" style={{ background: "var(--surface-3)" }}>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className="px-3 py-1 rounded-[7px] text-[12.5px] font-semibold transition-colors capitalize"
              style={{
                background: status === s ? "var(--surface)" : "transparent",
                color: status === s ? "var(--ink)" : "var(--ink-3)",
                boxShadow: status === s ? "var(--shadow-sm)" : "none",
              }}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] ml-auto" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <Search size={13} color="var(--ink-4)" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Filter incidents…"
            className="text-[13px] outline-none bg-transparent w-40" style={{ color: "var(--ink)" }} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[13px] overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-[.08em] border-b" style={{ color: "var(--ink-4)", borderColor: "var(--border)" }}>
              <th className="px-5 py-3 text-left">ID</th>
              <th className="px-3 py-3 text-left">Severity</th>
              <th className="px-3 py-3 text-left">Title</th>
              {scope === "all" && <th className="px-3 py-3 text-left">Client</th>}
              <th className="px-3 py-3 text-left">Asset</th>
              <th className="px-3 py-3 text-left">TTP</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Assignee</th>
              <th className="px-3 py-3 text-right">Age</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inc) => {
              const tenant = TENANTS.find((t) => t.id === inc.tenantId);
              return (
                <tr key={inc.id}
                  className="border-t hover:bg-surface-2 cursor-pointer transition-colors"
                  style={{ borderColor: "var(--border-faint)" }}
                  onClick={() => openIncidentDrawer(inc.id)}>
                  <td className="px-5 py-3 mono text-[12px]" style={{ color: "var(--ink-4)" }}>{inc.id}</td>
                  <td className="px-3 py-3"><SeverityBadge severity={inc.severity} /></td>
                  <td className="px-3 py-3 font-medium max-w-[240px] truncate" style={{ color: "var(--ink)" }}>{inc.title}</td>
                  {scope === "all" && <td className="px-3 py-3 text-[12px]" style={{ color: "var(--ink-3)" }}>{tenant?.name}</td>}
                  <td className="px-3 py-3 mono text-[12px]" style={{ color: "var(--ink-3)" }}>{inc.asset}</td>
                  <td className="px-3 py-3"><span className="px-1.5 py-0.5 rounded text-[11px] font-mono"
                    style={{ background: "var(--surface-3)", color: "var(--ink-3)" }}>{inc.ttp}</span></td>
                  <td className="px-3 py-3"><StatusBadge status={inc.status} /></td>
                  <td className="px-3 py-3 text-[12px]" style={{ color: "var(--ink-3)" }}>{inc.assignee ?? "—"}</td>
                  <td className="px-3 py-3 text-right mono text-[12px]" style={{ color: "var(--ink-4)" }}>{inc.ageHours}h</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-5 py-12 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>No incidents match current filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
