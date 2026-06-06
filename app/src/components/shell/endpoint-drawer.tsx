"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useUpdateEndpoint } from "@/lib/hooks";
import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/ui/badge";
import { RiskMeter } from "@/components/ui/sparkline";
import type { Endpoint } from "@/lib/supabase/types";

const TABS = ["Overview", "Network", "Actions"] as const;
type Tab = (typeof TABS)[number];

function DrawerBody({ epId, onClose }: { epId: string; onClose: () => void }) {
  const { addToast } = useUIStore();
  const updateEndpoint = useUpdateEndpoint();
  const [tab, setTab] = useState<Tab>("Overview");

  const { data: ep, isLoading } = useQuery({
    queryKey: ["endpoints", epId],
    queryFn: async () => {
      const res = await fetch(`/api/endpoints/${epId}`);
      if (!res.ok) throw new Error("Not found");
      return res.json() as Promise<Endpoint & { tenants?: { name: string } }>;
    },
  });

  if (isLoading) return <div className="flex-1 flex items-center justify-center text-[13px]" style={{ color: "var(--ink-4)" }}>Loading…</div>;
  if (!ep) return null;

  async function handleIsolate() {
    await updateEndpoint.mutateAsync({ id: ep!.id, status: "isolated" });
    addToast(`${ep!.hostname} isolated`, "success");
  }

  async function handleUnisolate() {
    await updateEndpoint.mutateAsync({ id: ep!.id, status: "online" });
    addToast(`${ep!.hostname} reconnected`, "success");
  }

  return (
    <>
      <div className="flex items-start gap-3 p-5 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <StatusBadge status={ep.status} />
            <span className="mono text-[12px]" style={{ color: "var(--ink-4)" }}>{ep.ip_address ?? "—"}</span>
          </div>
          <h2 className="text-[18px] font-bold mono" style={{ color: "var(--ink)" }}>{ep.hostname}</h2>
          <div className="text-[12px] mt-0.5" style={{ color: "var(--ink-4)" }}>
            {ep.tenants?.name} {ep.department ? `· ${ep.department}` : ""}
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-[7px] hover:bg-surface-3">
          <X size={16} color="var(--ink-3)" />
        </button>
      </div>

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
              {([
                ["Owner",     ep.owner ?? "—"],
                ["OS",        ep.os ?? "—"],
                ["OS Version",ep.os_version ?? "—"],
                ["IP",        ep.ip_address ?? "—"],
                ["Department",ep.department ?? "—"],
                ["Client",    ep.tenants?.name ?? "—"],
                ["Last Seen", ep.last_seen ? new Date(ep.last_seen).toLocaleString() : "—"],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-[.1em]" style={{ color: "var(--ink-4)" }}>{k}</span>
                  <span className="font-medium" style={{ color: "var(--ink)" }}>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[.1em] mb-2" style={{ color: "var(--ink-4)" }}>Health Score</div>
              <div className="flex items-center gap-3">
                <RiskMeter score={100 - ep.health_score} />
                <span className="mono font-semibold" style={{ color: "var(--ink)" }}>{ep.health_score}%</span>
              </div>
            </div>
          </div>
        )}

        {tab === "Network" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-y-3 text-[13px]">
              {([["IP", ep.ip_address ?? "—"], ["Status", ep.status]] as [string, string][]).map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold uppercase tracking-[.1em]" style={{ color: "var(--ink-4)" }}>{k}</span>
                  <span className="font-medium mono capitalize" style={{ color: "var(--ink)" }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Actions" && (
          <div className="flex flex-col gap-3">
            {ep.status !== "isolated" ? (
              <button onClick={handleIsolate} disabled={updateEndpoint.isPending}
                className="w-full py-2.5 rounded-[10px] text-[13.5px] font-semibold px-4 transition-opacity hover:opacity-80"
                style={{ background: "var(--crit-tint)", color: "var(--crit)" }}>
                {updateEndpoint.isPending ? "Isolating…" : "Isolate Endpoint"}
              </button>
            ) : (
              <button onClick={handleUnisolate} disabled={updateEndpoint.isPending}
                className="w-full py-2.5 rounded-[10px] text-[13.5px] font-semibold px-4 transition-opacity hover:opacity-80"
                style={{ background: "var(--ok-tint)", color: "var(--ok)" }}>
                {updateEndpoint.isPending ? "Reconnecting…" : "Remove Isolation"}
              </button>
            )}
            {[
              { label: "Run Full Scan",    color: "var(--primary)", bg: "var(--primary-tint)", msg: "Scan initiated" },
              { label: "Deploy Patches",   color: "var(--ok)",      bg: "var(--ok-tint)",      msg: "Patch deployment queued" },
              { label: "Reboot",           color: "var(--ink-2)",   bg: "var(--surface-3)",    msg: "Reboot scheduled" },
            ].map((a) => (
              <button key={a.label} onClick={() => addToast(a.msg, "success")}
                className="w-full py-2.5 rounded-[10px] text-[13.5px] font-semibold text-left px-4 transition-opacity hover:opacity-80"
                style={{ background: a.bg, color: a.color }}>
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export function EndpointDrawer() {
  const { endpointDrawerId, closeEndpointDrawer } = useUIStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeEndpointDrawer(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeEndpointDrawer]);

  if (!endpointDrawerId) return null;

  return (
    <>
      <div className="fixed inset-0 z-[900]" style={{ background: "rgba(17,21,29,.35)" }} onClick={closeEndpointDrawer} />
      <aside className="slide-in-right fixed right-0 top-0 h-full z-[901] flex flex-col overflow-hidden"
        style={{ width: "min(520px,100vw)", background: "var(--surface)", borderLeft: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}>
        <DrawerBody key={endpointDrawerId} epId={endpointDrawerId} onClose={closeEndpointDrawer} />
      </aside>
    </>
  );
}
