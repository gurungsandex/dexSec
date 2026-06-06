"use client";
import { useState } from "react";
import { Plus, ShieldOff, ShieldCheck, Activity, AlertTriangle } from "lucide-react";
import { useUIStore } from "@/store/ui-store";

interface FirewallRule {
  id: string;
  name: string;
  direction: "Inbound" | "Outbound";
  action: "Allow" | "Block" | "Log";
  protocol: "TCP" | "UDP" | "ICMP" | "Any";
  port: string;
  source: string;
  destination: string;
  groups: number;
  enabled: boolean;
}

const RULES: FirewallRule[] = [
  { id: "fw-1", name: "Block Tor Exit Nodes", direction: "Inbound", action: "Block", protocol: "TCP", port: "Any", source: "TOR-list", destination: "Any", groups: 8, enabled: true },
  { id: "fw-2", name: "Allow HTTPS Outbound", direction: "Outbound", action: "Allow", protocol: "TCP", port: "443", source: "Any", destination: "Any", groups: 8, enabled: true },
  { id: "fw-3", name: "Block SMB Inbound", direction: "Inbound", action: "Block", protocol: "TCP", port: "445", source: "Any", destination: "Internal", groups: 6, enabled: true },
  { id: "fw-4", name: "Allow DNS Corporate", direction: "Outbound", action: "Allow", protocol: "UDP", port: "53", source: "Any", destination: "10.0.0.1", groups: 8, enabled: true },
  { id: "fw-5", name: "Log SSH Access", direction: "Inbound", action: "Log", protocol: "TCP", port: "22", source: "Any", destination: "Servers", groups: 3, enabled: true },
  { id: "fw-6", name: "Block RDP External", direction: "Inbound", action: "Block", protocol: "TCP", port: "3389", source: "0.0.0.0/0", destination: "Any", groups: 8, enabled: true },
  { id: "fw-7", name: "Allow HTTP Redirect", direction: "Outbound", action: "Allow", protocol: "TCP", port: "80", source: "Any", destination: "Any", groups: 5, enabled: false },
  { id: "fw-8", name: "Block ICMP Flood", direction: "Inbound", action: "Block", protocol: "ICMP", port: "—", source: "Any", destination: "Any", groups: 8, enabled: true },
];

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  Allow: { bg: "var(--ok-tint)", color: "var(--ok)" },
  Block: { bg: "var(--crit-tint)", color: "var(--crit)" },
  Log:   { bg: "var(--med-tint)", color: "var(--med)" },
};

function RuleModal({ onClose }: { onClose: () => void }) {
  const { addToast } = useUIStore();
  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(17,21,29,.4)" }} />
      <div className="relative rounded-[13px] p-6 w-full max-w-[480px] fade-in flex flex-col gap-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}
        onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[16px] font-bold" style={{ color: "var(--ink)" }}>New Firewall Rule</h2>
        {[["Rule Name", "text", "e.g. Block Tor Exit Nodes"], ["Source", "text", "e.g. 0.0.0.0/0"], ["Destination", "text", "e.g. Internal"]].map(([label, type, placeholder]) => (
          <div key={label as string}>
            <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>{label}</label>
            <input type={type as string} placeholder={placeholder as string}
              className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }} />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          {[["Direction", ["Inbound", "Outbound"]], ["Action", ["Allow", "Block", "Log"]], ["Protocol", ["TCP", "UDP", "ICMP", "Any"]]].map(([label, opts]) => (
            <div key={label as string}>
              <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>{label as string}</label>
              <select className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
                style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }}>
                {(opts as string[]).map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>Port</label>
            <input type="text" placeholder="e.g. 443"
              className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }} />
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold text-white"
            style={{ background: "var(--primary)" }}
            onClick={() => { addToast("Rule created", "success"); onClose(); }}>
            Create Rule
          </button>
          <button className="px-4 py-2 rounded-[10px] text-[13px] font-semibold"
            style={{ background: "var(--surface-3)", color: "var(--ink-2)" }}
            onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function Firewall() {
  const { addToast } = useUIStore();
  const [showNew, setShowNew] = useState(false);
  const [rules, setRules] = useState(RULES);

  const blocked = rules.filter((r) => r.action === "Block" && r.enabled).length;
  const allowed = rules.filter((r) => r.action === "Allow" && r.enabled).length;
  const logged  = rules.filter((r) => r.action === "Log"   && r.enabled).length;
  const disabled = rules.filter((r) => !r.enabled).length;

  return (
    <div className="p-6 fade-in flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Firewall</h1>
          <p className="text-[13px]" style={{ color: "var(--ink-4)" }}>{rules.length} rules · {disabled} disabled</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white"
          style={{ background: "var(--primary)" }}
          onClick={() => setShowNew(true)}>
          <Plus size={14} /> New Rule
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Block Rules", value: blocked, icon: <ShieldOff size={18} />, color: "var(--crit)" },
          { label: "Allow Rules", value: allowed, icon: <ShieldCheck size={18} />, color: "var(--ok)" },
          { label: "Log Rules",   value: logged,  icon: <Activity size={18} />,   color: "var(--med)" },
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

      {/* Rules table */}
      <div className="rounded-[13px] overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b text-[11px] font-semibold uppercase tracking-[.08em]" style={{ borderColor: "var(--border)", color: "var(--ink-4)" }}>
              <th className="px-5 py-3 text-left">Rule</th>
              <th className="px-3 py-3 text-left">Direction</th>
              <th className="px-3 py-3 text-left">Action</th>
              <th className="px-3 py-3 text-left">Protocol</th>
              <th className="px-3 py-3 text-left">Port</th>
              <th className="px-3 py-3 text-left">Source → Dest</th>
              <th className="px-3 py-3 text-right">Groups</th>
              <th className="px-3 py-3 text-right">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((rule) => (
              <tr key={rule.id} className="border-t hover:bg-surface-2 transition-colors"
                style={{ borderColor: "var(--border-faint)", opacity: rule.enabled ? 1 : 0.5 }}>
                <td className="px-5 py-3 font-medium" style={{ color: "var(--ink)" }}>{rule.name}</td>
                <td className="px-3 py-3">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                    style={{ background: "var(--surface-3)", color: "var(--ink-3)" }}>{rule.direction}</span>
                </td>
                <td className="px-3 py-3">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                    style={{ background: ACTION_COLORS[rule.action].bg, color: ACTION_COLORS[rule.action].color }}>
                    {rule.action}
                  </span>
                </td>
                <td className="px-3 py-3 mono text-[12px]" style={{ color: "var(--ink-2)" }}>{rule.protocol}</td>
                <td className="px-3 py-3 mono text-[12px]" style={{ color: "var(--ink-2)" }}>{rule.port}</td>
                <td className="px-3 py-3 mono text-[12px]" style={{ color: "var(--ink-3)" }}>{rule.source} → {rule.destination}</td>
                <td className="px-3 py-3 text-right mono text-[12px]" style={{ color: "var(--ink-4)" }}>{rule.groups}</td>
                <td className="px-3 py-3 text-right">
                  <button
                    onClick={() => {
                      setRules((rs) => rs.map((r) => r.id === rule.id ? { ...r, enabled: !r.enabled } : r));
                      addToast(`${rule.name} ${rule.enabled ? "disabled" : "enabled"}`, rule.enabled ? "default" : "success");
                    }}
                    className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                    style={{ background: rule.enabled ? "var(--primary)" : "var(--surface-3)" }}>
                    <span className="inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform"
                      style={{ transform: rule.enabled ? "translateX(18px)" : "translateX(2px)" }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showNew && <RuleModal onClose={() => setShowNew(false)} />}
    </div>
  );
}
