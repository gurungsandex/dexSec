"use client";
import { useState } from "react";
import { Plus, ShieldOff, ShieldCheck, Activity, AlertTriangle } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useFirewallRules, useCreateFirewallRule, useUpdateFirewallRule } from "@/lib/hooks";
import type { FirewallRule } from "@/lib/supabase/types";

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  Allow: { bg: "var(--ok-tint)", color: "var(--ok)" },
  Block: { bg: "var(--crit-tint)", color: "var(--crit)" },
  Log:   { bg: "var(--med-tint)", color: "var(--med)" },
};

function RuleModal({ onClose, tenantId }: { onClose: () => void; tenantId?: string }) {
  const { addToast } = useUIStore();
  const create = useCreateFirewallRule();
  const [form, setForm] = useState({ name: "", source: "", destination: "", port: "", direction: "Inbound" as FirewallRule["direction"], action: "Block" as FirewallRule["action"], protocol: "TCP" as FirewallRule["protocol"] });

  async function handleCreate() {
    if (!form.name) return;
    await create.mutateAsync({ ...form, tenant_id: tenantId ?? null, enabled: true });
    addToast("Rule created", "success");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(17,21,29,.4)" }} />
      <div className="relative rounded-[13px] p-6 w-full max-w-[480px] flex flex-col gap-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}
        onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[16px] font-bold" style={{ color: "var(--ink)" }}>New Firewall Rule</h2>
        {(["name", "source", "destination"] as const).map((field) => (
          <div key={field}>
            <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>{field}</label>
            <input value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }} />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          {([["direction", ["Inbound", "Outbound", "Both"]], ["action", ["Allow", "Block", "Log"]], ["protocol", ["TCP", "UDP", "ICMP", "Any"]]] as const).map(([field, opts]) => (
            <div key={field}>
              <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>{field}</label>
              <select value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
                style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }}>
                {(opts as readonly string[]).map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>Port</label>
            <input value={form.port} onChange={(e) => setForm((f) => ({ ...f, port: e.target.value }))} placeholder="e.g. 443"
              className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }} />
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold text-white"
            style={{ background: "var(--primary)" }} disabled={create.isPending}
            onClick={handleCreate}>
            {create.isPending ? "Creating…" : "Create Rule"}
          </button>
          <button className="px-4 py-2 rounded-[10px] text-[13px] font-semibold"
            style={{ background: "var(--surface-3)", color: "var(--ink-2)" }} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function Firewall() {
  const { addToast, scope } = useUIStore();
  const { data: rules = [], isLoading } = useFirewallRules(scope);
  const updateRule = useUpdateFirewallRule();
  const [showNew, setShowNew] = useState(false);

  const typedRules = rules as FirewallRule[];
  const blocked  = typedRules.filter((r) => r.action === "Block" && r.enabled).length;
  const allowed  = typedRules.filter((r) => r.action === "Allow" && r.enabled).length;
  const logged   = typedRules.filter((r) => r.action === "Log"   && r.enabled).length;
  const disabled = typedRules.filter((r) => !r.enabled).length;

  async function toggleRule(rule: FirewallRule) {
    await updateRule.mutateAsync({ id: rule.id, enabled: !rule.enabled });
    addToast(`${rule.name} ${rule.enabled ? "disabled" : "enabled"}`, rule.enabled ? "default" : "success");
  }

  return (
    <div className="p-6 fade-in flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Firewall</h1>
          <p className="text-[13px]" style={{ color: "var(--ink-4)" }}>{typedRules.length} rules · {disabled} disabled</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white"
          style={{ background: "var(--primary)" }} onClick={() => setShowNew(true)}>
          <Plus size={14} /> New Rule
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Block Rules", value: blocked,  icon: <ShieldOff size={18} />,    color: "var(--crit)"  },
          { label: "Allow Rules", value: allowed,  icon: <ShieldCheck size={18} />,  color: "var(--ok)"    },
          { label: "Log Rules",   value: logged,   icon: <Activity size={18} />,     color: "var(--med)"   },
          { label: "Disabled",    value: disabled, icon: <AlertTriangle size={18} />, color: "var(--ink-4)" },
        ].map((k) => (
          <div key={k.label} className="p-4 rounded-[13px] flex items-center gap-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <span style={{ color: k.color }}>{k.icon}</span>
            <div>
              <div className="text-[24px] font-bold mono leading-none" style={{ color: "var(--ink)" }}>{k.value}</div>
              <div className="text-[11px] font-semibold mt-0.5" style={{ color: "var(--ink-4)" }}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-[13px] overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        {isLoading ? (
          <div className="p-8 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>Loading…</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b text-[11px] font-semibold uppercase tracking-[.08em]" style={{ borderColor: "var(--border)", color: "var(--ink-4)" }}>
                <th className="px-5 py-3 text-left">Rule</th>
                <th className="px-3 py-3 text-left">Direction</th>
                <th className="px-3 py-3 text-left">Action</th>
                <th className="px-3 py-3 text-left">Protocol</th>
                <th className="px-3 py-3 text-left">Port</th>
                <th className="px-3 py-3 text-left">Source → Dest</th>
                <th className="px-3 py-3 text-right">Enabled</th>
              </tr>
            </thead>
            <tbody>
              {typedRules.map((rule) => (
                <tr key={rule.id} className="border-t hover:bg-surface-2 transition-colors"
                  style={{ borderColor: "var(--border-faint)", opacity: rule.enabled ? 1 : 0.5 }}>
                  <td className="px-5 py-3 font-medium" style={{ color: "var(--ink)" }}>{rule.name}</td>
                  <td className="px-3 py-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                      style={{ background: "var(--surface-3)", color: "var(--ink-3)" }}>{rule.direction}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                      style={{ background: ACTION_COLORS[rule.action]?.bg, color: ACTION_COLORS[rule.action]?.color }}>
                      {rule.action}
                    </span>
                  </td>
                  <td className="px-3 py-3 mono text-[12px]" style={{ color: "var(--ink-2)" }}>{rule.protocol}</td>
                  <td className="px-3 py-3 mono text-[12px]" style={{ color: "var(--ink-2)" }}>{rule.port ?? "—"}</td>
                  <td className="px-3 py-3 mono text-[12px]" style={{ color: "var(--ink-3)" }}>{rule.source} → {rule.destination}</td>
                  <td className="px-3 py-3 text-right">
                    <button onClick={() => toggleRule(rule)} disabled={updateRule.isPending}
                      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                      style={{ background: rule.enabled ? "var(--primary)" : "var(--surface-3)" }}>
                      <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                        style={{ transform: rule.enabled ? "translateX(18px)" : "translateX(2px)" }} />
                    </button>
                  </td>
                </tr>
              ))}
              {typedRules.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>No firewall rules</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showNew && <RuleModal onClose={() => setShowNew(false)} tenantId={scope !== "all" ? scope : undefined} />}
    </div>
  );
}
