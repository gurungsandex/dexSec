"use client";
import { useEffect, useState } from "react";
import { X, Monitor, Wifi, Settings, Play } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { ENDPOINTS, TENANTS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/ui/badge";
import { RiskMeter } from "@/components/ui/sparkline";

const TABS = ["Overview", "Software", "Network", "Actions"] as const;
type Tab = (typeof TABS)[number];

export function EndpointDrawer() {
  const { endpointDrawerId, closeEndpointDrawer, addToast } = useUIStore();
  const ep = endpointDrawerId ? ENDPOINTS.find((e) => e.id === endpointDrawerId) : null;
  const tenant = ep ? TENANTS.find((t) => t.id === ep.tenantId) : null;
  const [tab, setTab] = useState<Tab>("Overview");

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeEndpointDrawer(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeEndpointDrawer]);

  useEffect(() => { setTab("Overview"); }, [endpointDrawerId]);

  if (!ep) return null;

  return (
    <>
      <div className="fixed inset-0 z-[900]" style={{ background: "rgba(17,21,29,.35)" }} onClick={closeEndpointDrawer} />
      <aside
        className="slide-in-right fixed right-0 top-0 h-full z-[901] flex flex-col overflow-hidden"
        style={{ width: "min(520px,100vw)", background: "var(--surface)", borderLeft: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}
      >
        <div className="flex items-start gap-3 p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={ep.status} />
              <span className="mono text-[12px]" style={{ color: "var(--ink-4)" }}>{ep.ip}</span>
            </div>
            <h2 className="text-[18px] font-bold mono" style={{ color: "var(--ink)" }}>{ep.hostname}</h2>
            <div className="text-[12px] mt-0.5" style={{ color: "var(--ink-4)" }}>{tenant?.name} · {ep.group}</div>
          </div>
          <button onClick={closeEndpointDrawer} className="p-1.5 rounded-[7px] hover:bg-surface-3">
            <X size={16} color="var(--ink-3)" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: "var(--border)" }}>
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="flex-1 py-2.5 text-[12.5px] font-semibold transition-colors"
              style={{ color: tab === t ? "var(--primary)" : "var(--ink-3)", borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent" }}>
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === "Overview" && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-y-3 text-[13px]">
                {[
                  ["User",     ep.user],
                  ["OS",       ep.os],
                  ["IP",       ep.ip],
                  ["Group",    ep.group],
                  ["Client",   tenant?.name ?? "—"],
                  ["Last Seen",ep.lastSeen],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-[.1em]" style={{ color: "var(--ink-4)" }}>{k}</span>
                    <span className="font-medium" style={{ color: "var(--ink)" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[.1em] mb-2" style={{ color: "var(--ink-4)" }}>Health Score</div>
                <div className="flex items-center gap-3">
                  <RiskMeter score={100 - ep.health} width={160} height={8} />
                  <span className="mono font-semibold" style={{ color: "var(--ink)" }}>{ep.health}%</span>
                </div>
              </div>
            </div>
          )}

          {tab === "Software" && (
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-[10px]" style={{ background: "var(--ok-tint)", border: "1px solid var(--ok)" }}>
                <div className="text-[13px] font-semibold" style={{ color: "var(--ok)" }}>Patch status: Up to date</div>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[.1em] mb-2" style={{ color: "var(--ink-4)" }}>Installed Software</div>
                <div className="flex flex-wrap gap-2">
                  {["Chrome 124", "VS Code 1.89", "Node 20.x", "Git 2.44", "Slack 4.38"].map((s) => (
                    <span key={s} className="px-2 py-1 rounded-[7px] text-[12px]"
                      style={{ background: "var(--surface-3)", color: "var(--ink-2)" }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "Network" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-y-3 text-[13px]">
                {[["IP", ep.ip], ["Firewall", "Corporate"], ["Connections", "12 active"]].map(([k, v]) => (
                  <div key={k} className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-[.1em]" style={{ color: "var(--ink-4)" }}>{k}</span>
                    <span className="font-medium mono" style={{ color: "var(--ink)" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[.1em] mb-2" style={{ color: "var(--ink-4)" }}>Open Ports</div>
                {[22, 80, 443, 8080].map((p) => (
                  <div key={p} className="flex items-center gap-2 py-1.5 border-b text-[12.5px]" style={{ borderColor: "var(--border-faint)" }}>
                    <span className="mono font-semibold" style={{ color: "var(--ink)" }}>{p}</span>
                    {p === 22 && <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: "var(--med-tint)", color: "var(--med)" }}>CIS Flagged</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "Actions" && (
            <div className="flex flex-col gap-3">
              {[
                { label: "Isolate Endpoint", color: "var(--crit)", bg: "var(--crit-tint)", action: () => addToast("Isolation command sent", "success") },
                { label: "Run Full Scan",    color: "var(--primary)", bg: "var(--primary-tint)", action: () => addToast("Scan initiated", "success") },
                { label: "Deploy Patches",   color: "var(--ok)", bg: "var(--ok-tint)", action: () => addToast("Patch deployment queued", "success") },
                { label: "Remote Shell",     color: "var(--ink-2)", bg: "var(--surface-3)", action: () => addToast("Remote shell not available in demo") },
                { label: "Reboot",           color: "var(--ink-2)", bg: "var(--surface-3)", action: () => addToast("Reboot scheduled", "success") },
              ].map((a) => (
                <button key={a.label} onClick={a.action}
                  className="w-full py-2.5 rounded-[10px] text-[13.5px] font-semibold text-left px-4 transition-opacity hover:opacity-80"
                  style={{ background: a.bg, color: a.color }}>
                  {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
