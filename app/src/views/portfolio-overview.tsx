"use client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useTenants, useIncidents } from "@/lib/hooks";
import { useUIStore } from "@/store/ui-store";
import { Sparkline, DonutChart, RiskMeter } from "@/components/ui/sparkline";
import { SeverityBadge } from "@/components/ui/badge";
import type { Tenant, Incident } from "@/lib/supabase/types";

const AVATAR_COLORS = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#14b8a6"];
function tenantShort(name: string) { return name.slice(0, 2).toUpperCase(); }
function tenantColor(id: string) {
  let h = 0;
  for (const c of id) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function riskColor(score: number): string {
  if (score >= 67) return "var(--crit)";
  if (score >= 50) return "var(--high)";
  if (score >= 34) return "var(--med)";
  return "var(--ok)";
}

function seededSpark(seed: number, n = 14): number[] {
  let a = seed;
  const rng = () => { a = (a * 1664525 + 1013904223) & 0xffffffff; return (a >>> 0) / 0xffffffff; };
  const vals: number[] = [];
  let v = 40 + rng() * 30;
  for (let i = 0; i < n; i++) { v = Math.max(0, v + (rng() - 0.5) * 12); vals.push(Math.round(v)); }
  return vals;
}

function idSeed(id: string): number {
  let h = 0;
  for (const c of id) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return Math.abs(h) % 1000;
}

function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="text-[11px] flex items-center gap-0.5" style={{ color: "var(--ink-4)" }}><Minus size={11} />0</span>;
  const up = value > 0;
  return (
    <span className="text-[11px] flex items-center gap-0.5 font-semibold"
      style={{ color: up ? "var(--crit)" : "var(--ok)" }}>
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? "+" : ""}{value}
    </span>
  );
}

function KpiTile({ label, value, delta, spark }: { label: string; value: string | number; delta: number; spark: number[] }) {
  return (
    <div className="p-4 rounded-[13px] flex flex-col gap-1" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
      <div className="text-[12px] font-semibold uppercase tracking-[.08em]" style={{ color: "var(--ink-4)" }}>{label}</div>
      <div className="text-[26px] font-bold mono leading-none" style={{ color: "var(--ink)" }}>{value}</div>
      <div className="flex items-center justify-between mt-auto pt-2">
        <Delta value={delta} />
        <Sparkline data={spark} color="var(--primary)" width={56} height={22} />
      </div>
    </div>
  );
}

export function PortfolioOverview() {
  const { setScope, setNav, openIncidentDrawer } = useUIStore();
  const { data: tenantsData = [], isLoading: tenantsLoading } = useTenants();
  const { data: incidentsData = [] } = useIncidents("all");
  const tenants = tenantsData as Tenant[];
  const allIncidents = incidentsData as Incident[];

  const openIncidents = allIncidents.filter((i) => i.status !== "resolved");
  const criticalCount = openIncidents.filter((i) => i.severity === "critical").length;
  const totalEndpoints = tenants.reduce((s, t) => s + t.endpoints_total, 0);
  const avgRisk = tenants.length ? Math.round(tenants.reduce((s, t) => s + t.risk_score, 0) / tenants.length) : 0;
  const avgPatch = tenants.length ? Math.round(tenants.reduce((s, t) => s + t.patch_compliance, 0) / tenants.length) : 0;

  const sevCounts = { critical: 0, high: 0, medium: 0, low: 0 };
  openIncidents.forEach((i) => { if (i.severity in sevCounts) sevCounts[i.severity as keyof typeof sevCounts]++; });
  const donutSlices = [
    { label: "Critical", value: sevCounts.critical, color: "var(--crit)" },
    { label: "High",     value: sevCounts.high,     color: "var(--high)" },
    { label: "Medium",   value: sevCounts.medium,   color: "var(--med)" },
    { label: "Low",      value: sevCounts.low,       color: "var(--low)" },
  ];

  const priorityIncidents = openIncidents
    .filter((i) => i.severity === "critical" || i.severity === "high")
    .slice(0, 5);

  if (tenantsLoading) {
    return <div className="p-6 text-[13px]" style={{ color: "var(--ink-4)" }}>Loading…</div>;
  }

  return (
    <div className="p-6 fade-in flex flex-col gap-6">
      <div>
        <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Portfolio Overview</h1>
        <p className="text-[13px]" style={{ color: "var(--ink-4)" }}>All {tenants.length} clients · real-time</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <KpiTile label="Endpoints"      value={totalEndpoints.toLocaleString()} delta={+24} spark={seededSpark(1)} />
        <KpiTile label="Open Incidents" value={openIncidents.length}            delta={+3}  spark={seededSpark(2)} />
        <KpiTile label="Critical"       value={criticalCount}                   delta={+1}  spark={seededSpark(3)} />
        <KpiTile label="Avg Risk"       value={avgRisk}                         delta={+4}  spark={seededSpark(4)} />
        <KpiTile label="Patch Compliance" value={`${avgPatch}%`}               delta={-2}  spark={seededSpark(5)} />
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-4">
        <div className="rounded-[13px] overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
            <h2 className="text-[14.5px] font-semibold" style={{ color: "var(--ink)" }}>Client Risk Posture</h2>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-[11px] font-semibold uppercase tracking-[.08em]" style={{ color: "var(--ink-4)" }}>
                <th className="px-5 py-3 text-left">Client</th>
                <th className="px-3 py-3 text-left">Industry</th>
                <th className="px-3 py-3 text-right">Endpoints</th>
                <th className="px-3 py-3 text-left w-32">Risk</th>
                <th className="px-3 py-3 text-right">Incidents</th>
                <th className="px-3 py-3 text-right">Patch</th>
                <th className="px-3 py-3 text-right">14d</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => {
                const tIncidents = allIncidents.filter((i) => i.tenant_id === t.id && i.status !== "resolved");
                return (
                  <tr
                    key={t.id}
                    className="border-t hover:bg-surface-2 cursor-pointer transition-colors"
                    style={{ borderColor: "var(--border-faint)" }}
                    onClick={() => { setScope(t.id); setNav("overview"); }}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-[7px] flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                          style={{ background: tenantColor(t.id) }}>{tenantShort(t.name)}</div>
                        <span className="font-medium" style={{ color: "var(--ink)" }}>{t.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3" style={{ color: "var(--ink-3)" }}>{t.industry ?? "—"}</td>
                    <td className="px-3 py-3 text-right mono" style={{ color: "var(--ink-2)" }}>{t.endpoints_total.toLocaleString()}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <RiskMeter score={t.risk_score} width={60} />
                        <span className="mono text-[12px]" style={{ color: riskColor(t.risk_score) }}>{t.risk_score}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="mono font-semibold"
                        style={{ color: tIncidents.filter((i) => i.severity === "critical").length > 0 ? "var(--crit)" : "var(--ink-2)" }}>
                        {tIncidents.length}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right mono" style={{ color: t.patch_compliance < 80 ? "var(--high)" : "var(--ok)" }}>{t.patch_compliance}%</td>
                    <td className="px-3 py-3 text-right">
                      <Sparkline data={seededSpark(idSeed(t.id), 7)} color="var(--primary)" width={40} height={18} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4">
          <div className="p-5 rounded-[13px]" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h2 className="text-[14.5px] font-semibold mb-4" style={{ color: "var(--ink)" }}>Incident Severity</h2>
            <div className="flex items-center gap-4">
              <DonutChart slices={donutSlices} size={100} strokeWidth={16} />
              <div className="flex flex-col gap-2">
                {donutSlices.map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-[12.5px]">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                    <span style={{ color: "var(--ink-3)" }}>{s.label}</span>
                    <span className="mono font-semibold ml-auto" style={{ color: "var(--ink)" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 rounded-[13px] flex-1" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h2 className="text-[14.5px] font-semibold mb-3" style={{ color: "var(--ink)" }}>Priority Incidents</h2>
            <div className="flex flex-col gap-2">
              {priorityIncidents.map((inc) => {
                const t = tenants.find((x) => x.id === inc.tenant_id);
                return (
                  <button
                    key={inc.id}
                    className="text-left p-3 rounded-[10px] hover:bg-surface-2 transition-colors"
                    style={{ border: "1px solid var(--border-faint)" }}
                    onClick={() => openIncidentDrawer(inc.id)}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <SeverityBadge severity={inc.severity} />
                      <span className="mono text-[11px]" style={{ color: "var(--ink-4)" }}>{inc.id}</span>
                    </div>
                    <div className="text-[12.5px] font-medium leading-snug" style={{ color: "var(--ink)" }}>{inc.title}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "var(--ink-4)" }}>{t?.name}</div>
                  </button>
                );
              })}
              {priorityIncidents.length === 0 && (
                <div className="text-center py-4 text-[13px]" style={{ color: "var(--ink-4)" }}>No priority incidents</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
