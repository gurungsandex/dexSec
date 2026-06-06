"use client";
import { useState } from "react";
import { useUIStore } from "@/store/ui-store";
import { usePatches, useUpdatePatch } from "@/lib/hooks";
import { RingChart } from "@/components/ui/sparkline";
import type { Patch } from "@/lib/supabase/types";

const SEV_COLORS: Record<string, { bg: string; color: string }> = {
  critical: { bg: "var(--crit-tint)", color: "var(--crit)" },
  high:     { bg: "var(--high-tint)", color: "var(--high)" },
  medium:   { bg: "var(--med-tint)",  color: "var(--med)"  },
  low:      { bg: "var(--ok-tint)",   color: "var(--ok)"   },
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending:   { bg: "var(--crit-tint)", color: "var(--crit)" },
  scheduled: { bg: "var(--med-tint)",  color: "var(--med)"  },
  deployed:  { bg: "var(--ok-tint)",   color: "var(--ok)"   },
  failed:    { bg: "var(--high-tint)", color: "var(--high)" },
};

export function Patch() {
  const { addToast, scope } = useUIStore();
  const { data: patches = [], isLoading } = usePatches(scope);
  const updatePatch = useUpdatePatch();
  const [filter, setFilter] = useState("All");

  const typedPatches = patches as Patch[];
  const deployed   = typedPatches.filter((p) => p.status === "deployed").length;
  const total      = typedPatches.length;
  const compliance = total > 0 ? Math.round((deployed / total) * 100) : 0;
  const critical   = typedPatches.filter((p) => p.severity === "critical" && p.status !== "deployed");

  const filtered = filter === "All" ? typedPatches
    : typedPatches.filter((p) => p.severity === filter.toLowerCase() || p.status === filter.toLowerCase());

  async function scheduleOne(p: Patch) {
    await updatePatch.mutateAsync({ id: p.id, status: "scheduled", scheduled_at: new Date().toISOString() });
    addToast(`${p.cve_id ?? p.title} scheduled`, "success");
  }

  async function deployAllCritical() {
    await Promise.all(critical.map((p) => updatePatch.mutateAsync({ id: p.id, status: "scheduled", scheduled_at: new Date().toISOString() })));
    addToast(`${critical.length} critical patches scheduled`, "success");
  }

  return (
    <div className="p-6 fade-in flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Patch Management</h1>
          <p className="text-[13px]" style={{ color: "var(--ink-4)" }}>
            {typedPatches.filter((p) => p.status === "pending").length} pending · {critical.length} critical
          </p>
        </div>
        {critical.length > 0 && (
          <button className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold"
            style={{ background: "var(--crit-tint)", color: "var(--crit)" }}
            onClick={deployAllCritical} disabled={updatePatch.isPending}>
            Deploy All Critical ({critical.length})
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>Loading…</div>
      ) : (
        <div className="grid grid-cols-[200px_1fr] gap-5">
          <div className="p-5 rounded-[13px] flex flex-col items-center gap-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div className="text-[13px] font-semibold self-start" style={{ color: "var(--ink)" }}>Patch Compliance</div>
            <div className="relative">
              <RingChart value={compliance} size={96} strokeWidth={10}
                color={compliance >= 80 ? "var(--ok)" : compliance >= 60 ? "var(--med)" : "var(--crit)"} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[20px] font-bold mono" style={{ color: "var(--ink)" }}>{compliance}%</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 w-full">
              {[["Deployed", deployed, "var(--ok)"], ["Scheduled", typedPatches.filter((p) => p.status === "scheduled").length, "var(--med)"], ["Pending", typedPatches.filter((p) => p.status === "pending").length, "var(--crit)"]].map(([label, val, color]) => (
                <div key={label as string} className="flex items-center gap-2 text-[12px]">
                  <div className="w-2 h-2 rounded-full" style={{ background: color as string }} />
                  <span className="flex-1" style={{ color: "var(--ink-3)" }}>{label as string}</span>
                  <span className="mono font-semibold" style={{ color: "var(--ink)" }}>{val as number}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[13px] overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--border)" }}>
              {["All", "Critical", "High", "Medium", "Pending", "Scheduled", "Deployed"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className="px-2.5 py-1 rounded-[7px] text-[12px] font-semibold transition-colors"
                  style={{ background: filter === f ? "var(--primary)" : "var(--surface-3)", color: filter === f ? "white" : "var(--ink-3)" }}>
                  {f}
                </button>
              ))}
            </div>
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b text-[11px] font-semibold uppercase tracking-[.08em]" style={{ borderColor: "var(--border)", color: "var(--ink-4)" }}>
                  <th className="px-5 py-3 text-left">CVE</th>
                  <th className="px-3 py-3 text-left">Title</th>
                  <th className="px-3 py-3 text-left">Severity</th>
                  <th className="px-3 py-3 text-left">Product</th>
                  <th className="px-3 py-3 text-right">Affected</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-t hover:bg-surface-2 transition-colors" style={{ borderColor: "var(--border-faint)" }}>
                    <td className="px-5 py-3 mono text-[11.5px]" style={{ color: "var(--primary)" }}>{p.cve_id ?? "—"}</td>
                    <td className="px-3 py-3 font-medium" style={{ color: "var(--ink)" }}>{p.title}</td>
                    <td className="px-3 py-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize"
                        style={{ background: SEV_COLORS[p.severity]?.bg, color: SEV_COLORS[p.severity]?.color }}>
                        {p.severity}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[12.5px]" style={{ color: "var(--ink-3)" }}>{p.product}</td>
                    <td className="px-3 py-3 text-right mono text-[12px]" style={{ color: "var(--ink-2)" }}>{p.affected_count}</td>
                    <td className="px-3 py-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize"
                        style={{ background: STATUS_COLORS[p.status]?.bg, color: STATUS_COLORS[p.status]?.color }}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {p.status === "pending" && (
                        <button className="px-2.5 py-1 rounded-[7px] text-[11.5px] font-semibold"
                          style={{ background: "var(--primary-tint)", color: "var(--primary)" }}
                          disabled={updatePatch.isPending}
                          onClick={() => scheduleOne(p)}>
                          Schedule
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-5 py-8 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>No patches found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
