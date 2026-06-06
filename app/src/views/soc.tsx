"use client";
import { useUIStore } from "@/store/ui-store";
import { useIncidents, useAnalysts, useUpdateIncident } from "@/lib/hooks";
import { SeverityBadge } from "@/components/ui/badge";
import type { Incident, Analyst } from "@/lib/supabase/types";

type IncidentStatus = Incident["status"];

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
  const { openIncidentDrawer, addToast, scope } = useUIStore();
  const { data: incidents = [], isLoading } = useIncidents(scope);
  const { data: analysts = [] } = useAnalysts();
  const updateIncident = useUpdateIncident();

  const typedIncidents = incidents as Incident[];
  const typedAnalysts = analysts as Analyst[];

  async function advance(inc: Incident, e: React.MouseEvent) {
    e.stopPropagation();
    const next = NEXT_STATUS[inc.status];
    if (!next) return;
    await updateIncident.mutateAsync({ id: inc.id, status: next });
    addToast(`${inc.id} → ${next}`, "success");
  }

  const kpis = [
    { label: "Triage Queue",    value: typedIncidents.filter((i) => i.status === "new").length },
    { label: "Critical Open",   value: typedIncidents.filter((i) => i.severity === "critical" && i.status !== "resolved").length },
    { label: "Analysts On-Call",value: typedAnalysts.filter((a) => a.on_call).length },
    { label: "Avg MTTR",        value: "—" },
  ];

  return (
    <div className="p-6 fade-in flex flex-col gap-5">
      <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>SOC Workspace</h1>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="p-4 rounded-[13px]" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div className="text-[12px] font-semibold uppercase tracking-[.08em] mb-1" style={{ color: "var(--ink-4)" }}>{k.label}</div>
            <div className="text-[26px] font-bold mono" style={{ color: "var(--ink)" }}>{k.value}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>Loading…</div>
      ) : (
        <div className="grid grid-cols-4 gap-4 flex-1">
          {COLUMNS.map((col) => {
            const cards = typedIncidents.filter((i) => i.status === col.id);
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
                        <span className="text-[11px]" style={{ color: "var(--ink-4)" }}>
                          {(inc as Incident & { analysts?: { name: string } }).analysts?.name ?? "Unassigned"}
                        </span>
                        {NEXT_STATUS[col.id] && (
                          <button
                            onClick={(e) => advance(inc, e)}
                            disabled={updateIncident.isPending}
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-[5px] transition-colors"
                            style={{ background: "var(--primary-tint)", color: "var(--primary)" }}>
                            Advance →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {cards.length === 0 && (
                    <div className="py-6 text-center text-[12px]" style={{ color: "var(--ink-4)", border: "1px dashed var(--border)", borderRadius: 10 }}>
                      Empty
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Analyst workload panel */}
      {typedAnalysts.length > 0 && (
        <div className="rounded-[13px] p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-[13px] font-semibold mb-3" style={{ color: "var(--ink)" }}>Analyst Workload</div>
          <div className="grid grid-cols-2 gap-2">
            {typedAnalysts.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                  style={{ background: `var(--${a.avatar_color ?? "primary"})` }}>
                  {a.initials ?? a.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-medium truncate" style={{ color: "var(--ink)" }}>{a.name}</span>
                    {a.on_call && (
                      <span className="text-[9px] font-bold px-1 rounded" style={{ background: "var(--ok-tint)", color: "var(--ok)" }}>ON-CALL</span>
                    )}
                  </div>
                  <div className="w-full h-1 rounded-full mt-1" style={{ background: "var(--surface-3)" }}>
                    <div className="h-full rounded-full" style={{ width: `${a.workload}%`, background: a.workload > 80 ? "var(--crit)" : a.workload > 60 ? "var(--med)" : "var(--ok)" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
