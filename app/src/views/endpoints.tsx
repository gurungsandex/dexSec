"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { ENDPOINTS, TENANTS } from "@/lib/mock-data";
import { useUIStore } from "@/store/ui-store";
import { StatusBadge } from "@/components/ui/badge";
import { RiskMeter } from "@/components/ui/sparkline";

const OS_ICONS: Record<string, string> = { windows: "⊞", linux: "🐧", macos: "" };

export function Endpoints() {
  const { scope, openEndpointDrawer } = useUIStore();
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");

  const base = scope === "all" ? ENDPOINTS : ENDPOINTS.filter((e) => e.tenantId === scope);
  const filtered = base.filter((e) => {
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (q && !e.hostname.toLowerCase().includes(q.toLowerCase()) && !e.ip.includes(q) && !e.user.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const statusOpts = ["all", "online", "atrisk", "offline", "isolated"] as const;

  return (
    <div className="p-6 fade-in flex flex-col gap-5">
      <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Endpoints</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 rounded-[10px]" style={{ background: "var(--surface-3)" }}>
          {statusOpts.map((s) => (
            <button key={s}
              onClick={() => setStatusFilter(s)}
              className="px-3 py-1 rounded-[7px] text-[12.5px] font-semibold transition-colors capitalize"
              style={{
                background: statusFilter === s ? "var(--surface)" : "transparent",
                color: statusFilter === s ? "var(--ink)" : "var(--ink-3)",
                boxShadow: statusFilter === s ? "var(--shadow-sm)" : "none",
              }}>
              {s === "atrisk" ? "At Risk" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-[10px] ml-auto" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <Search size={13} color="var(--ink-4)" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search endpoints…"
            className="text-[13px] outline-none bg-transparent w-40" style={{ color: "var(--ink)" }} />
        </div>
      </div>

      <div className="rounded-[13px] overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-[11px] font-semibold uppercase tracking-[.08em] border-b" style={{ color: "var(--ink-4)", borderColor: "var(--border)" }}>
              <th className="px-5 py-3 text-left">Hostname</th>
              <th className="px-3 py-3 text-left">OS</th>
              <th className="px-3 py-3 text-left">IP</th>
              <th className="px-3 py-3 text-left">User</th>
              {scope === "all" && <th className="px-3 py-3 text-left">Client</th>}
              <th className="px-3 py-3 text-left">Group</th>
              <th className="px-3 py-3 text-left">Health</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-right">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ep) => {
              const tenant = TENANTS.find((t) => t.id === ep.tenantId);
              return (
                <tr key={ep.id}
                  className="border-t hover:bg-surface-2 cursor-pointer transition-colors"
                  style={{ borderColor: "var(--border-faint)" }}
                  onClick={() => openEndpointDrawer(ep.id)}>
                  <td className="px-5 py-3 font-semibold mono text-[12.5px]" style={{ color: "var(--ink)" }}>{ep.hostname}</td>
                  <td className="px-3 py-3 text-[15px]">{OS_ICONS[ep.os]}</td>
                  <td className="px-3 py-3 mono text-[12px]" style={{ color: "var(--ink-3)" }}>{ep.ip}</td>
                  <td className="px-3 py-3 text-[12px]" style={{ color: "var(--ink-3)" }}>{ep.user}</td>
                  {scope === "all" && <td className="px-3 py-3 text-[12px]" style={{ color: "var(--ink-3)" }}>{tenant?.name}</td>}
                  <td className="px-3 py-3 text-[12px]" style={{ color: "var(--ink-3)" }}>{ep.group}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <RiskMeter score={100 - ep.health} width={50} height={6} />
                      <span className="mono text-[11px]" style={{ color: "var(--ink-4)" }}>{ep.health}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-3"><StatusBadge status={ep.status} /></td>
                  <td className="px-3 py-3 text-right text-[12px]" style={{ color: "var(--ink-4)" }}>{ep.lastSeen}</td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-5 py-12 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>No endpoints match</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
