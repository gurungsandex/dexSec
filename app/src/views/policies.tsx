"use client";
import { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { useUIStore } from "@/store/ui-store";

interface Policy {
  id: string;
  name: string;
  framework: string;
  category: string;
  status: "Deployed" | "Draft";
  rules: number;
  groups: number;
  vendor: string;
}

const POLICIES: Policy[] = [
  { id: "pol-1", name: "CrowdStrike Behavioral Detection", framework: "MITRE ATT&CK", category: "Endpoint Detection", status: "Deployed", rules: 142, groups: 6, vendor: "CrowdStrike" },
  { id: "pol-2", name: "MFA Enforcement — All Users", framework: "CIS Controls v8", category: "Identity & Access", status: "Deployed", rules: 8, groups: 8, vendor: "Microsoft" },
  { id: "pol-3", name: "DNS Filtering — Corporate", framework: "NIST CSF", category: "Network Security", status: "Deployed", rules: 24, groups: 5, vendor: "Cisco Umbrella" },
  { id: "pol-4", name: "USB Mass Storage Control", framework: "CIS Controls v8", category: "Device Control", status: "Deployed", rules: 4, groups: 7, vendor: "CrowdStrike" },
  { id: "pol-5", name: "Vulnerability Scan — Weekly", framework: "NIST SP 800-53", category: "Vulnerability Mgmt", status: "Deployed", rules: 11, groups: 8, vendor: "Tenable" },
  { id: "pol-6", name: "Ransomware Protection — EDR", framework: "MITRE ATT&CK", category: "Endpoint Detection", status: "Deployed", rules: 38, groups: 4, vendor: "SentinelOne" },
  { id: "pol-7", name: "HIPAA Data Loss Prevention", framework: "HIPAA", category: "Data Protection", status: "Draft", rules: 19, groups: 0, vendor: "Microsoft" },
  { id: "pol-8", name: "Zero Trust Network Access", framework: "NIST CSF", category: "Network Security", status: "Draft", rules: 31, groups: 0, vendor: "Palo Alto" },
];

const RULE_SECTIONS = [
  { label: "Process Injection Detection", rules: ["Block process hollowing", "Alert on reflective DLL injection", "Monitor CreateRemoteThread calls"] },
  { label: "Lateral Movement", rules: ["Block PsExec from non-admin paths", "Alert on SMB enumeration", "Monitor admin share access"] },
  { label: "Credential Access", rules: ["Block LSASS memory read", "Alert on Mimikatz signatures", "Monitor SAM database access"] },
];

function PolicyEditorDrawer({ policy, onClose }: { policy: Policy; onClose: () => void }) {
  const { addToast } = useUIStore();
  const [rules, setRules] = useState<Record<string, boolean>>(
    Object.fromEntries(RULE_SECTIONS.flatMap((s) => s.rules.map((r) => [r, true])))
  );

  return (
    <>
      <div className="fixed inset-0 z-[900]" style={{ background: "rgba(17,21,29,.35)" }} onClick={onClose} />
      <aside className="slide-in-right fixed right-0 top-0 h-full z-[901] flex flex-col overflow-hidden"
        style={{ width: "min(540px,100vw)", background: "var(--surface)", borderLeft: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}>
        <div className="flex items-start gap-3 p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold"
                style={{ background: policy.status === "Deployed" ? "var(--ok-tint)" : "var(--surface-3)", color: policy.status === "Deployed" ? "var(--ok)" : "var(--ink-3)" }}>
                {policy.status}
              </span>
              <span className="text-[11px]" style={{ color: "var(--ink-4)" }}>{policy.framework}</span>
            </div>
            <h2 className="text-[16px] font-bold" style={{ color: "var(--ink)" }}>{policy.name}</h2>
            <div className="text-[12px] mt-0.5" style={{ color: "var(--ink-4)" }}>{policy.vendor} · {policy.category}</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[7px] hover:bg-surface-3">
            <span style={{ color: "var(--ink-3)", fontSize: 16 }}>✕</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Deployed to */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.1em] mb-2" style={{ color: "var(--ink-4)" }}>Deployed to</div>
            <div className="flex flex-wrap gap-1.5">
              {["Domain Controllers", "Web Servers", "Finance", "Clinical", "R&D", "Production Floor"].slice(0, policy.groups).map((g) => (
                <span key={g} className="px-2 py-1 rounded-[7px] text-[12px] font-medium"
                  style={{ background: "var(--primary-tint)", color: "var(--primary)" }}>{g}</span>
              ))}
              {policy.groups === 0 && <span className="text-[12px]" style={{ color: "var(--ink-4)" }}>No groups — deploy to activate</span>}
            </div>
          </div>

          {/* Rule sections */}
          {RULE_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="text-[13px] font-semibold mb-2" style={{ color: "var(--ink)" }}>{section.label}</div>
              <div className="flex flex-col gap-1.5">
                {section.rules.map((rule) => (
                  <label key={rule} className="flex items-center gap-3 p-2.5 rounded-[8px] cursor-pointer hover:bg-surface-2"
                    style={{ border: "1px solid var(--border-faint)" }}>
                    <input type="checkbox" checked={rules[rule] ?? true}
                      onChange={(e) => setRules((r) => ({ ...r, [rule]: e.target.checked }))}
                      className="accent-primary" />
                    <span className="text-[13px]" style={{ color: "var(--ink-2)" }}>{rule}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 p-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold text-white"
            style={{ background: "var(--primary)" }}
            onClick={() => { addToast(`${policy.name} deployed`, "success"); onClose(); }}>
            Deploy to Groups
          </button>
          <button className="px-4 py-2 rounded-[10px] text-[13px] font-semibold"
            style={{ background: "var(--surface-3)", color: "var(--ink-2)" }}
            onClick={() => { addToast(`${policy.name} cloned`); onClose(); }}>
            Clone
          </button>
        </div>
      </aside>
    </>
  );
}

export function Policies() {
  const { addToast } = useUIStore();
  const [selected, setSelected] = useState<Policy | null>(null);
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="p-6 fade-in flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Policies</h1>
          <p className="text-[13px]" style={{ color: "var(--ink-4)" }}>{POLICIES.filter((p) => p.status === "Deployed").length} deployed · {POLICIES.filter((p) => p.status === "Draft").length} draft</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white"
          style={{ background: "var(--primary)" }}
          onClick={() => setShowNew(true)}>
          <Plus size={14} /> New Policy
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {POLICIES.map((pol) => (
          <button key={pol.id} onClick={() => setSelected(pol)}
            className="text-left p-4 rounded-[13px] hover:shadow-md transition-shadow flex flex-col gap-3"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold leading-snug" style={{ color: "var(--ink)" }}>{pol.name}</div>
                <div className="text-[11.5px] mt-0.5" style={{ color: "var(--ink-4)" }}>{pol.vendor}</div>
              </div>
              <ChevronRight size={14} color="var(--ink-4)" className="shrink-0 mt-0.5" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
                style={{ background: "var(--surface-3)", color: "var(--ink-3)" }}>{pol.framework}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{ background: pol.status === "Deployed" ? "var(--ok-tint)" : "var(--surface-3)", color: pol.status === "Deployed" ? "var(--ok)" : "var(--ink-4)" }}>
                {pol.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[12px]" style={{ color: "var(--ink-4)" }}>
              <span>{pol.rules} rules</span>
              <span>{pol.groups} groups</span>
            </div>
          </button>
        ))}
      </div>

      {selected && <PolicyEditorDrawer policy={selected} onClose={() => setSelected(null)} />}

      {/* New Policy modal */}
      {showNew && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center" onClick={() => setShowNew(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(17,21,29,.4)" }} />
          <div className="relative rounded-[13px] p-6 w-full max-w-[440px] fade-in flex flex-col gap-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[16px] font-bold" style={{ color: "var(--ink)" }}>New Policy</h2>
            {[["Name", "text", "e.g. Zero Trust Network Access"], ["Framework", "text", "e.g. NIST CSF"], ["Category", "text", "e.g. Network Security"]].map(([label, type, placeholder]) => (
              <div key={label}>
                <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>{label}</label>
                <input type={type} placeholder={placeholder as string}
                  className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
                  style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }} />
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <button className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold text-white"
                style={{ background: "var(--primary)" }}
                onClick={() => { addToast("Policy created as Draft", "success"); setShowNew(false); }}>
                Create Policy
              </button>
              <button className="px-4 py-2 rounded-[10px] text-[13px] font-semibold"
                style={{ background: "var(--surface-3)", color: "var(--ink-2)" }}
                onClick={() => setShowNew(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
