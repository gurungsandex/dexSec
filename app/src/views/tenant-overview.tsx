"use client";
import { TENANTS, INCIDENTS, riskColor } from "@/lib/mock-data";
import { useUIStore } from "@/store/ui-store";
import { ComplianceChip, SeverityBadge, StatusBadge } from "@/components/ui/badge";
import { RingChart, DonutChart, Sparkline } from "@/components/ui/sparkline";
import { TrendingUp, TrendingDown } from "lucide-react";

function seededSpark(seed: number, n = 14): number[] {
  let a = seed;
  const rng = () => { a = (a * 1664525 + 1013904223) & 0xffffffff; return (a >>> 0) / 0xffffffff; };
  const vals: number[] = [];
  let v = 30 + rng() * 20;
  for (let i = 0; i < n; i++) { v = Math.max(0, v + (rng() - 0.5) * 8); vals.push(Math.round(v)); }
  return vals;
}

export function TenantOverview() {
  const { scope, openIncidentDrawer } = useUIStore();
  const tenant = TENANTS.find((t) => t.id === scope);
  if (!tenant) return null;

  const incidents = INCIDENTS.filter((i) => i.tenantId === scope);
  const open = incidents.filter((i) => i.status !== "resolved");

  const endpointSlices = [
    { label: "Healthy",  value: tenant.online - tenant.atrisk, color: "var(--ok)" },
    { label: "At Risk",  value: tenant.atrisk, color: "var(--high)" },
    { label: "Offline",  value: tenant.offline, color: "var(--ink-4)" },
  ];

  const policyList = [
    { label: "MFA Enforcement",      state: "On" },
    { label: "Behavioral Detection", state: "On" },
    { label: "DNS Filtering",        state: "Partial" },
    { label: "USB Control",          state: "Review" },
  ];

  const riskLabelColor = riskColor(tenant.risk);

  return (
    <div className="p-6 fade-in flex flex-col gap-6">
      {/* Tenant header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-[13px] flex items-center justify-center text-white text-[15px] font-bold shrink-0"
          style={{ background: tenant.color }}>
          {tenant.short}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>{tenant.name}</h1>
            {tenant.compliance.map((c) => <ComplianceChip key={c} label={c} />)}
          </div>
          <div className="text-[13px] mt-0.5" style={{ color: "var(--ink-4)" }}>
            {tenant.industry} · {tenant.region} · {tenant.tier} · since {tenant.since}
          </div>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: "Endpoints",    value: tenant.endpoints.toLocaleString(), delta: 0 },
          { label: "Open Incidents", value: open.length, delta: +2 },
          { label: "Critical",     value: tenant.critical, delta: +1 },
          { label: "Risk Score",   value: tenant.risk, delta: tenant.riskDelta },
          { label: "Patch",        value: `${tenant.patch}%`, delta: -1 },
        ].map((k) => (
          <div key={k.label} className="p-4 rounded-[13px]" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div className="text-[12px] font-semibold uppercase tracking-[.08em] mb-1" style={{ color: "var(--ink-4)" }}>{k.label}</div>
            <div className="text-[26px] font-bold mono leading-none" style={{ color: "var(--ink)" }}>{k.value}</div>
            <div className="mt-2 text-[11px] font-semibold flex items-center gap-1"
              style={{ color: k.delta > 0 ? "var(--crit)" : k.delta < 0 ? "var(--ok)" : "var(--ink-4)" }}>
              {k.delta > 0 ? <TrendingUp size={11} /> : k.delta < 0 ? <TrendingDown size={11} /> : null}
              {k.delta > 0 ? `+${k.delta}` : k.delta === 0 ? "—" : k.delta} vs last week
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-4">
        <div className="flex flex-col gap-4">
          {/* Incident trend */}
          <div className="p-5 rounded-[13px]" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h2 className="text-[14.5px] font-semibold mb-4" style={{ color: "var(--ink)" }}>Incident Trend — 14 days</h2>
            <Sparkline data={seededSpark(tenant.seed)} color="var(--primary)" width={520} height={56} />
          </div>

          {/* Top incidents */}
          <div className="rounded-[13px] overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div className="px-5 py-4 border-b" style={{ borderColor: "var(--border)" }}>
              <h2 className="text-[14.5px] font-semibold" style={{ color: "var(--ink)" }}>Open Incidents</h2>
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11px] font-semibold uppercase tracking-[.08em]" style={{ color: "var(--ink-4)" }}>
                  <th className="px-5 py-3 text-left">ID</th>
                  <th className="px-3 py-3 text-left">Severity</th>
                  <th className="px-3 py-3 text-left">Title</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-right">Age</th>
                </tr>
              </thead>
              <tbody>
                {open.map((inc) => (
                  <tr key={inc.id} className="border-t hover:bg-surface-2 cursor-pointer transition-colors"
                    style={{ borderColor: "var(--border-faint)" }}
                    onClick={() => openIncidentDrawer(inc.id)}>
                    <td className="px-5 py-3 mono text-[12px]" style={{ color: "var(--ink-4)" }}>{inc.id}</td>
                    <td className="px-3 py-3"><SeverityBadge severity={inc.severity} /></td>
                    <td className="px-3 py-3 font-medium" style={{ color: "var(--ink)" }}>{inc.title}</td>
                    <td className="px-3 py-3"><StatusBadge status={inc.status} /></td>
                    <td className="px-3 py-3 text-right mono text-[12px]" style={{ color: "var(--ink-4)" }}>{inc.ageHours}h</td>
                  </tr>
                ))}
                {open.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>No open incidents</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column widgets */}
        <div className="flex flex-col gap-4">
          {/* Composite risk gauge */}
          <div className="p-5 rounded-[13px] flex flex-col items-center" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h2 className="text-[14.5px] font-semibold mb-3 self-start" style={{ color: "var(--ink)" }}>Risk Score</h2>
            <div className="relative">
              <RingChart value={tenant.risk} size={100} strokeWidth={10} color={riskLabelColor} />
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-[22px] font-bold mono" style={{ color: riskLabelColor }}>{tenant.risk}</span>
              </div>
            </div>
            <div className="mt-2 text-[12px] font-semibold" style={{ color: riskLabelColor }}>
              {tenant.risk >= 67 ? "Critical" : tenant.risk >= 50 ? "Elevated" : tenant.risk >= 34 ? "Moderate" : "Low"}
            </div>
          </div>

          {/* Endpoint health donut */}
          <div className="p-5 rounded-[13px]" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h2 className="text-[14.5px] font-semibold mb-3" style={{ color: "var(--ink)" }}>Endpoint Health</h2>
            <div className="flex items-center gap-3">
              <DonutChart slices={endpointSlices} size={80} strokeWidth={12} />
              <div className="flex flex-col gap-1.5">
                {endpointSlices.map((s) => (
                  <div key={s.label} className="flex items-center gap-2 text-[12px]">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span style={{ color: "var(--ink-3)" }}>{s.label}</span>
                    <span className="mono font-semibold ml-auto" style={{ color: "var(--ink)" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Patch compliance ring */}
          <div className="p-5 rounded-[13px]" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h2 className="text-[14.5px] font-semibold mb-3" style={{ color: "var(--ink)" }}>Patch Compliance</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <RingChart value={tenant.patch} size={64} strokeWidth={8} color="var(--ok)" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[14px] font-bold mono" style={{ color: "var(--ok)" }}>{tenant.patch}%</span>
                </div>
              </div>
              <div>
                <div className="text-[12.5px]" style={{ color: "var(--ink-3)" }}>{tenant.missingCritical} critical patches missing</div>
                <button className="mt-1.5 text-[12px] font-semibold" style={{ color: "var(--primary)" }}>Deploy updates →</button>
              </div>
            </div>
          </div>

          {/* Policy posture */}
          <div className="p-5 rounded-[13px]" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <h2 className="text-[14.5px] font-semibold mb-3" style={{ color: "var(--ink)" }}>Policy Posture</h2>
            <div className="flex flex-col gap-2">
              {policyList.map((p) => (
                <div key={p.label} className="flex items-center gap-2 text-[12.5px]">
                  <div className="w-2 h-2 rounded-full"
                    style={{ background: p.state === "On" ? "var(--ok)" : p.state === "Partial" ? "var(--med)" : "var(--crit)" }} />
                  <span className="flex-1" style={{ color: "var(--ink-2)" }}>{p.label}</span>
                  <span className="font-semibold" style={{ color: p.state === "On" ? "var(--ok)" : p.state === "Partial" ? "var(--med)" : "var(--crit)" }}>{p.state}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
