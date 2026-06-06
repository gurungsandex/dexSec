"use client";
import { useState } from "react";
import { INCIDENTS, ANALYSTS } from "@/lib/mock-data";
import { useUIStore } from "@/store/ui-store";
import { SeverityBadge } from "@/components/ui/badge";
import type { IncidentStatus } from "@/lib/mock-data";

const COLUMNS: { id: IncidentStatus; label: string }[] = [
  { id: "new",          label: "Triage Queue" },
  { id: "assigned",     label: "Assigned" },
  { id: "investigating",label: "Investigating" },
  { id: "resolved",     label: "Resolved" },
];

const NEXT_STATUS: Record<IncidentStatus, IncidentStatus | null> = {
  new: "assigned", assigned: "investigating", investigating: "resolved", resolved: null,
};

export function SocWorkspace() {
  const { openIncidentDrawer, addToast } = useUIStore();
  const [statuses, setStatuses] = useState<Record<string, IncidentStatus>>(
    Object.fromEntries(INCIDENTS.map((i) => [i.id, i.status]))
  );

  const advance = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = statuses[id];
    const next = NEXT_STATUS[current];
    if (!next) return;
    setStatuses((s) => ({ ...s, [id]: next }));
    addToast(`${id} → ${next}`, "success");
  };

  const kpis = [
    { label: "Triage Queue",   value: INCIDENTS.filter((i) => statuses[i.id] === "new").length },
    { label: "Critical Open",  value: INCIDENTS.filter((i) => i.severity === "critical" && statuses[i.id] !== "resolved").length },
    { label: "Analysts On-Call", value: ANALYSTS.filter((a) => a.onCall).length },
    { label: "Avg MTTR",       value: "4.2h" },
  ];

  return (
    <div className="p-6 fade-in flex flex-col gap-5">
      <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>SOC Workspace</h1>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="p-4 rounded-[13px]" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div className="text-[12px] font-semibold uppercase tracking-[.08em] mb-1" style={{ color: "var(--ink-4)" }}>{k.label}</div>
            <div className="text-[26px] font-bold mono" style={{ color: "var(--ink)" }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Triage board */}
      <div className="grid grid-cols-4 gap-4 flex-1">
        {COLUMNS.map((col) => {
          const cards = INCIDENTS.filter((i) => statuses[i.id] === col.id);
          return (
            <div key={col.id}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>{col.label}</span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--surface-3)", color: "var(--ink-4)" }}>{cards.length}</span>
              </div>
              <div className="flex flex-col gap-2">
                {cards.map((inc) => (
                  <div key={inc.id}
                    className="p-3 rounded-[10px] cursor-pointer hover:shadow-md transition-shadow"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
                    onClick={() => openIncidentDrawer(inc.id)}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <SeverityBadge severity={inc.severity} />
                      <span className="mono text-[10px]" style={{ color: "var(--ink-4)" }}>{inc.id}</span>
                    </div>
                    <div className="text-[12.5px] font-medium leading-snug mb-2" style={{ color: "var(--ink)" }}>{inc.title}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]" style={{ color: "var(--ink-4)" }}>{inc.assignee ?? "Unassigned"}</span>
                      {NEXT_STATUS[col.id] && (
                        <button
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-[5px] transition-colors"
                          style={{ background: "var(--primary-tint)", color: "var(--primary)" }}
                          onClick={(e) => advance(inc.id, e)}>
                          Advance →
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {cards.length === 0 && (
                  <div className="py-8 text-center text-[12px] rounded-[10px]"
                    style={{ color: "var(--ink-4)", border: "1.5px dashed var(--border)" }}>
                    Empty
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Analyst workload */}
      <div className="p-5 rounded-[13px]" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <h2 className="text-[14.5px] font-semibold mb-4" style={{ color: "var(--ink)" }}>Analyst Workload</h2>
        <div className="grid grid-cols-4 gap-4">
          {ANALYSTS.map((a) => (
            <div key={a.id} className="p-3 rounded-[10px]" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                  style={{ background: "var(--primary)" }}>{a.avatar}</div>
                <div>
                  <div className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>{a.name}</div>
                  <div className="text-[11px]" style={{ color: "var(--ink-4)" }}>{a.role}</div>
                </div>
                {a.onCall && (
                  <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-semibold"
                    style={{ background: "var(--ok-tint)", color: "var(--ok)" }}>On-Call</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "var(--surface-3)" }}>
                  <div className="h-full rounded-full" style={{ width: `${(a.openCount / 6) * 100}%`, background: "var(--primary)" }} />
                </div>
                <span className="mono text-[12px] font-semibold" style={{ color: "var(--ink)" }}>{a.openCount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
