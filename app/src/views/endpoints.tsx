"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useEndpoints } from "@/lib/hooks";
import { StatusBadge } from "@/components/ui/badge";
import { RiskMeter } from "@/components/ui/sparkline";
import type { Endpoint } from "@/lib/supabase/types";

export function Endpoints() {
  const { scope, openEndpointDrawer } = useUIStore();
  const { data: endpoints = [], isLoading } = useEndpoints(scope);
  const typedEndpoints = endpoints as Endpoint[];

  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");

  const statusOpts = ["all", "online", "at_risk", "offline", "isolated"] as const;

  const filtered = typedEndpoints.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (q && !e.hostname.toLowerCase().includes(q.toLowerCase()) && !(e.ip_address ?? "").includes(q) && !(e.owner ?? "").toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-6 fade-in flex flex-col gap-5">
      <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Endpoints</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-[10px]" style={{ background: "var(--surface-3)" }}>
          {statusOpts.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-1 rounded-[7px] text-[12.5px] font-semibold transition-colors capitalize"
              style={{ background: statusFilter === s ? "var(--surface)" : "transparent", color: statusFilter === s ? "var(--ink)" : "var(--ink-3)", boxShadow: statusFilter === s ? "var(--shadow-sm)" : "none" }}>
              {s === "at_risk" ? "At Risk" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] ml-auto" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <Search size={13} color="var(--ink-4)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search endpoints…"
            className="text-[13px] outline-none bg-transparent w-40" style={{ color: "var(--ink)" }} />
        </div>
      </div>

      <div className="rounded-[13px] overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        {isLoading ? (
          <div className="p-8 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>Loading…</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-[.08em] border-b" style={{ color: "var(--ink-4)", borderColor: "var(--border)" }}>
                <th className="px-5 py-3 text-left">Hostname</th>
                <th className="px-3 py-3 text-left">OS</th>
                <th className="px-3 py-3 text-left">IP</th>
                <th className="px-3 py-3 text-left">Owner</th>
                {scope === "all" && <th className="px-3 py-3 text-left">Client</th>}
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-right">Health</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="border-t hover:bg-surface-2 transition-colors cursor-pointer"
                  style={{ borderColor: "var(--border-faint)" }}
                  onClick={() => openEndpointDrawer(e.id)}>
                  <td className="px-5 py-3 font-medium mono text-[12.5px]" style={{ color: "var(--ink)" }}>{e.hostname}</td>
                  <td className="px-3 py-3 text-[12px]" style={{ color: "var(--ink-3)" }}>{e.os ?? "—"}</td>
                  <td className="px-3 py-3 mono text-[12px]" style={{ color: "var(--ink-3)" }}>{e.ip_address ?? "—"}</td>
                  <td className="px-3 py-3 text-[12.5px]" style={{ color: "var(--ink-3)" }}>{e.owner ?? "—"}</td>
                  {scope === "all" && (
                    <td className="px-3 py-3 text-[12px]" style={{ color: "var(--ink-4)" }}>
                      {(e as Endpoint & { tenants?: { name: string } }).tenants?.name ?? "—"}
                    </td>
                  )}
                  <td className="px-3 py-3"><StatusBadge status={e.status} /></td>
                  <td className="px-3 py-3 flex justify-end items-center gap-2">
                    <RiskMeter score={100 - e.health_score} />
                    <span className="mono text-[12px]" style={{ color: "var(--ink-3)" }}>{e.health_score}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !isLoading && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>No endpoints found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
