"use client";
import { useEffect } from "react";
import { X, Bot } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useIncident, useUpdateIncident, useUpdateIncidentAction, useAnalysts } from "@/lib/hooks";
import { SeverityBadge, StatusBadge } from "@/components/ui/badge";
import type { Incident, IncidentAction, IncidentTimeline, Analyst } from "@/lib/supabase/types";

type FullIncident = Incident & {
  analysts?: Analyst;
  tenants?: { name: string };
  incident_timeline?: IncidentTimeline[];
  incident_actions?: IncidentAction[];
};

export function IncidentDrawer() {
  const { incidentDrawerId, closeIncidentDrawer, addToast, openAria } = useUIStore();
  const { data: incident, isLoading } = useIncident(incidentDrawerId) as { data: FullIncident | undefined; isLoading: boolean };
  const { data: analysts = [] } = useAnalysts();
  const updateIncident = useUpdateIncident();
  const updateAction = useUpdateIncidentAction();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeIncidentDrawer(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeIncidentDrawer]);

  if (!incidentDrawerId) return null;

  async function handleAssign(analystId: string) {
    if (!incident) return;
    await updateIncident.mutateAsync({ id: incident.id, analyst_id: analystId || null, status: analystId ? "assigned" : "new" });
    addToast(analystId ? "Incident assigned" : "Assignment cleared", "success");
  }

  async function handleStatus(status: Incident["status"]) {
    if (!incident) return;
    await updateIncident.mutateAsync({ id: incident.id, status, resolved_at: status === "resolved" ? new Date().toISOString() : null });
    addToast(`Status → ${status}`, "success");
  }

  async function handleResolve() {
    if (!incident) return;
    await updateIncident.mutateAsync({ id: incident.id, status: "resolved", resolved_at: new Date().toISOString() });
    addToast(`${incident.id} resolved`, "success");
    closeIncidentDrawer();
  }

  async function handleToggleAction(action: IncidentAction) {
    await updateAction.mutateAsync({ id: action.id, incidentId: action.incident_id, completed: !action.completed, completed_at: !action.completed ? new Date().toISOString() : null });
  }

  function handleAskAria(prefill?: string) {
    if (!incident) return;
    closeIncidentDrawer();
    openAria({
      incidentId: incident.id,
      incidentTitle: incident.title,
      incidentSeverity: incident.severity,
      incidentTtp: incident.ttp ?? undefined,
      tenantName: incident.tenants?.name,
      affectedAsset: incident.affected_asset ?? undefined,
      prefillMessage: prefill,
    });
  }

  const timeline = incident?.incident_timeline ?? [];
  const actions  = incident?.incident_actions ?? [];

  return (
    <>
      <div className="fixed inset-0 z-[900]" style={{ background: "rgba(17,21,29,.35)" }} onClick={closeIncidentDrawer} />
      <aside className="slide-in-right fixed right-0 top-0 h-full z-[901] flex flex-col overflow-hidden"
        style={{ width: "min(560px,100vw)", background: "var(--surface)", borderLeft: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}>

        {isLoading || !incident ? (
          <div className="flex-1 flex items-center justify-center text-[13px]" style={{ color: "var(--ink-4)" }}>Loading…</div>
        ) : (
          <>
            <div className="flex items-start gap-3 p-5 border-b" style={{ borderColor: "var(--border)" }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <SeverityBadge severity={incident.severity} />
                  <StatusBadge status={incident.status} />
                  <span className="mono text-[12px]" style={{ color: "var(--ink-4)" }}>{incident.id}</span>
                  {incident.cvss && incident.cvss >= 7 && (
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold" style={{ background: "var(--crit-tint)", color: "var(--crit)" }}>
                      CVSS {incident.cvss}
                    </span>
                  )}
                  {incident.ttp && (
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold mono" style={{ background: "var(--surface-3)", color: "var(--ink-3)" }}>
                      {incident.ttp}
                    </span>
                  )}
                </div>
                <h2 className="text-[16px] font-bold leading-snug" style={{ color: "var(--ink)" }}>{incident.title}</h2>
                {incident.tenants?.name && (
                  <div className="mt-1 text-[12px]" style={{ color: "var(--ink-4)" }}>{incident.tenants.name}</div>
                )}
              </div>
              <button onClick={closeIncidentDrawer} className="p-1.5 rounded-[7px] hover:bg-surface-3 transition-colors">
                <X size={16} color="var(--ink-3)" />
              </button>
            </div>

            {/* ARIA quick-action strip */}
            <div className="px-5 py-3 border-b flex items-center gap-2 flex-wrap"
              style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}>
              <span className="text-[11px] font-semibold uppercase tracking-[.08em]" style={{ color: "var(--ink-4)" }}>Ask ARIA:</span>
              {[
                { label: "Triage", msg: "Triage this incident. Give me: severity assessment, MITRE ATT&CK mapping, affected scope, and top 3 immediate containment actions." },
                { label: "Playbook", msg: "Generate a step-by-step incident response playbook for this incident type." },
                { label: "Resolve", msg: "Help me draft a resolution summary for this incident including root cause, impact scope, and remediation steps." },
                { label: "Compliance", msg: "Which compliance frameworks (HIPAA, PCI DSS, ISO 27001, NIST) are implicated by this incident? What are the reporting obligations?" },
              ].map((a) => (
                <button key={a.label} onClick={() => handleAskAria(a.msg)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-[7px] text-[12px] font-semibold transition-colors"
                  style={{ background: "var(--primary-tint)", color: "var(--primary)", border: "1px solid var(--primary)" }}>
                  <Bot size={11} /> {a.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
              {incident.description && (
                <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--ink-2)" }}>{incident.description}</p>
              )}

              {/* Assign + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>Assignee</label>
                  <select className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
                    style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }}
                    value={incident.analyst_id ?? ""}
                    onChange={(e) => handleAssign(e.target.value)}>
                    <option value="">Unassigned</option>
                    {(analysts as Analyst[]).map((a) => (
                      <option key={a.id} value={a.id}>{a.name}{a.on_call ? " (on-call)" : ""}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>Status</label>
                  <select className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
                    style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }}
                    value={incident.status}
                    onChange={(e) => handleStatus(e.target.value as Incident["status"])}>
                    {["new", "assigned", "investigating", "resolved"].map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Affected asset */}
              {incident.affected_asset && (
                <div className="p-4 rounded-[10px]" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <div className="text-[11px] font-bold uppercase tracking-[.1em] mb-3" style={{ color: "var(--ink-4)" }}>Affected Asset</div>
                  <div className="grid grid-cols-2 gap-y-2 text-[13px]">
                    <span style={{ color: "var(--ink-4)" }}>Asset</span>
                    <span className="font-semibold mono" style={{ color: "var(--ink)" }}>{incident.affected_asset}</span>
                    {incident.tenants?.name && <>
                      <span style={{ color: "var(--ink-4)" }}>Client</span>
                      <span className="font-medium" style={{ color: "var(--ink)" }}>{incident.tenants.name}</span>
                    </>}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[.1em] mb-3" style={{ color: "var(--ink-4)" }}>Timeline</div>
                {timeline.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {timeline.map((step) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--ok)" }} />
                        <span className="text-[13px] flex-1" style={{ color: "var(--ink-2)" }}>{step.event}</span>
                        <span className="text-[12px] mono" style={{ color: "var(--ink-4)" }}>
                          {new Date(step.occurred_at).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[12.5px]" style={{ color: "var(--ink-4)" }}>
                    Detected {new Date(incident.detected_at).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Actions checklist */}
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[.1em] mb-3" style={{ color: "var(--ink-4)" }}>Response Actions</div>
                {actions.length > 0 ? (
                  actions.map((action) => (
                    <label key={action.id} className="flex items-start gap-3 py-2 cursor-pointer group">
                      <input type="checkbox" checked={action.completed}
                        onChange={() => handleToggleAction(action)}
                        className="mt-0.5 accent-primary" />
                      <div className="flex-1">
                        <div className="text-[13px]" style={{ color: action.completed ? "var(--ink-4)" : "var(--ink-2)", textDecoration: action.completed ? "line-through" : "none" }}>
                          {action.label}
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="text-[12.5px]" style={{ color: "var(--ink-4)" }}>No response actions defined.</div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 border-t" style={{ borderColor: "var(--border)" }}>
              <button className="flex items-center gap-1.5 py-2 px-3 rounded-[10px] text-[13px] font-semibold transition-colors"
                style={{ background: "var(--primary-tint)", color: "var(--primary)" }}
                onClick={() => handleAskAria()}>
                <Bot size={14} /> Ask ARIA
              </button>
              <button className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold transition-colors"
                style={{ background: "var(--crit-tint)", color: "var(--crit)" }}
                onClick={() => addToast("Isolate command sent", "success")}>
                Isolate Asset
              </button>
              <button className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold text-white transition-colors"
                style={{ background: "var(--primary)" }} disabled={updateIncident.isPending}
                onClick={handleResolve}>
                Resolve
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
