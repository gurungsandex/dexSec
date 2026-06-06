"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useIncidents } from "@/lib/hooks";
import { SeverityBadge, StatusBadge } from "@/components/ui/badge";
import type { Incident } from "@/lib/supabase/types";

type Severity = Incident["severity"] | "all";
type IncidentStatus = Incident["status"] | "all";

const SEVERITIES: Severity[] = ["all", "critical", "high", "medium", "low"];
const STATUSES: IncidentStatus[] = ["all", "new", "assigned", "investigating", "resolved"];
const PAGE_LOAD_TS = Date.now();

function ageLabel(detected: string) {
  const h = Math.round((PAGE_LOAD_TS - new Date(detected).getTime()) / 3_600_000);
  return h < 24 ? `${h}h ago` : `${Math.round(h / 24)}d ago`;
}

export function Incidents() {
  const { scope, openIncidentDrawer } = useUIStore();
  const { data: incidents = [], isLoading } = useIncidents(scope);
  const typedIncidents = incidents as Incident[];

  const [sev, setSev] = useState<Severity>("all");
  const [status, setStatus] = useState<IncidentStatus>("all");
  const [q, setQ] = useState("");

  const filtered = typedIncidents.filter((i) => {
    if (sev !== "all" && i.severity !== sev) return false;
    if (status !== "all" && i.status !== status) return false;
    if (q && !i.title.toLowerCase().includes(q.toLowerCase()) && !i.id.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const countBySev = (s: Incident["severity"]) => typedIncidents.filter((i) => i.severity === s).length;

  return (
    <div className="p-6 fade-in flex flex-col gap-5">
      <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Incident Queue</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-[10px]" style={{ background: "var(--surface-3)" }}>
          {SEVERITIES.map((s) => (
            <button key={s} onClick={() => setSev(s)}
              className="px-3 py-1 rounded-[7px] text-[12.5px] font-semibold transition-colors capitalize"
              style={{ background: sev === s ? "var(--surface)" : "transparent", color: sev === s ? "var(--ink)" : "var(--ink-3)", boxShadow: sev === s ? "var(--shadow-sm)" : "none" }}>
              {s === "all" ? "All" : `${s.charAt(0).toUpperCase() + s.slice(1)} (${countBySev(s as Incident["severity"])})`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 p-1 rounded-[10px]" style={{ background: "var(--surface-3)" }}>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className="px-3 py-1 rounded-[7px] text-[12.5px] font-semibold transition-colors capitalize"
              style={{ background: status === s ? "var(--surface)" : "transparent", color: status === s ? "var(--ink)" : "var(--ink-3)", boxShadow: status === s ? "var(--shadow-sm)" : "none" }}>
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] ml-auto" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <Search size={13} color="var(--ink-4)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter incidents…"
            className="text-[13px] outline-none bg-transparent w-40" style={{ color: "var(--ink)" }} />
        </div>
      </div>

      <div className="rounded-[13px] overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        {isLoading ? (
          <div className="p-8 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>Loading…</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b text-[11px] font-semibold uppercase tracking-[.08em]" style={{ borderColor: "var(--border)", color: "var(--ink-4)" }}>
                <th className="px-5 py-3 text-left">ID</th>
                <th className="px-3 py-3 text-left">Title</th>
                <th className="px-3 py-3 text-left">Severity</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-left">TTP</th>
                <th className="px-3 py-3 text-left">Assignee</th>
                <th className="px-3 py-3 text-right">Age</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-t hover:bg-surface-2 transition-colors cursor-pointer" style={{ borderColor: "var(--border-faint)" }}
                  onClick={() => openIncidentDrawer(i.id)}>
                  <td className="px-5 py-3 mono text-[11.5px]" style={{ color: "var(--primary)" }}>{i.id}</td>
                  <td className="px-3 py-3 font-medium max-w-[260px] truncate" style={{ color: "var(--ink)" }}>{i.title}</td>
                  <td className="px-3 py-3"><SeverityBadge severity={i.severity} /></td>
                  <td className="px-3 py-3"><StatusBadge status={i.status} /></td>
                  <td className="px-3 py-3 text-[12px]" style={{ color: "var(--ink-3)" }}>{i.ttp ?? "—"}</td>
                  <td className="px-3 py-3 text-[12.5px]" style={{ color: "var(--ink-3)" }}>
                    {(i as Incident & { analysts?: { name: string } }).analysts?.name ?? "Unassigned"}
                  </td>
                  <td className="px-3 py-3 text-right mono text-[12px]" style={{ color: "var(--ink-4)" }}>{ageLabel(i.detected_at)}</td>
                </tr>
              ))}
              {filtered.length === 0 && !isLoading && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>No incidents found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
