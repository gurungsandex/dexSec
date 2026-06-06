"use client";
import { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { usePolicies, useCreatePolicy, useUpdatePolicy, useUpdatePolicyRule } from "@/lib/hooks";
import type { Policy, PolicyRule, PolicyGroup } from "@/lib/supabase/types";

type PolicyWithRelations = Policy & { policy_rules: PolicyRule[]; policy_groups: PolicyGroup[] };

function PolicyEditorDrawer({ policy, onClose }: { policy: PolicyWithRelations; onClose: () => void }) {
  const { addToast } = useUIStore();
  const updateRule = useUpdatePolicyRule();
  const updatePolicy = useUpdatePolicy();

  async function handleDeploy() {
    await updatePolicy.mutateAsync({ id: policy.id, status: "deployed" });
    addToast(`${policy.name} deployed`, "success");
    onClose();
  }

  const sections = Array.from(new Set(policy.policy_rules.map((r) => r.section)));

  return (
    <>
      <div className="fixed inset-0 z-[900]" style={{ background: "rgba(17,21,29,.35)" }} onClick={onClose} />
      <aside className="slide-in-right fixed right-0 top-0 h-full z-[901] flex flex-col overflow-hidden"
        style={{ width: "min(540px,100vw)", background: "var(--surface)", borderLeft: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}>
        <div className="flex items-start gap-3 p-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold capitalize"
                style={{ background: policy.status === "deployed" ? "var(--ok-tint)" : "var(--surface-3)", color: policy.status === "deployed" ? "var(--ok)" : "var(--ink-3)" }}>
                {policy.status}
              </span>
              <span className="text-[11px]" style={{ color: "var(--ink-4)" }}>{policy.framework}</span>
            </div>
            <h2 className="text-[16px] font-bold" style={{ color: "var(--ink)" }}>{policy.name}</h2>
            <div className="text-[12px] mt-0.5" style={{ color: "var(--ink-4)" }}>{policy.category}</div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-[7px] hover:bg-surface-3">
            <span style={{ color: "var(--ink-3)", fontSize: 16 }}>✕</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[.1em] mb-2" style={{ color: "var(--ink-4)" }}>Deployed to</div>
            <div className="flex flex-wrap gap-1.5">
              {policy.policy_groups.map((g) => (
                <span key={g.id} className="px-2 py-1 rounded-[7px] text-[12px] font-medium"
                  style={{ background: "var(--primary-tint)", color: "var(--primary)" }}>{g.group_name}</span>
              ))}
              {policy.policy_groups.length === 0 && <span className="text-[12px]" style={{ color: "var(--ink-4)" }}>No groups — deploy to activate</span>}
            </div>
          </div>

          {sections.map((section) => (
            <div key={section}>
              <div className="text-[13px] font-semibold mb-2" style={{ color: "var(--ink)" }}>{section}</div>
              <div className="flex flex-col gap-1.5">
                {policy.policy_rules.filter((r) => r.section === section).map((rule) => (
                  <label key={rule.id} className="flex items-center gap-3 p-2.5 rounded-[8px] cursor-pointer hover:bg-surface-2"
                    style={{ border: "1px solid var(--border-faint)" }}>
                    <input type="checkbox" checked={rule.enabled}
                      onChange={(e) => updateRule.mutateAsync({ id: rule.id, enabled: e.target.checked })}
                      className="accent-primary" />
                    <span className="text-[13px]" style={{ color: "var(--ink-2)" }}>{rule.name}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {policy.policy_rules.length === 0 && (
            <div className="text-[13px]" style={{ color: "var(--ink-4)" }}>No rules defined for this policy.</div>
          )}
        </div>

        <div className="flex items-center gap-2 p-4 border-t" style={{ borderColor: "var(--border)" }}>
          <button className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold text-white"
            style={{ background: "var(--primary)" }} disabled={updatePolicy.isPending}
            onClick={handleDeploy}>
            {updatePolicy.isPending ? "Deploying…" : "Deploy to Groups"}
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
  const { addToast, scope } = useUIStore();
  const { data: policies = [], isLoading } = usePolicies(scope);
  const createPolicy = useCreatePolicy();
  const typedPolicies = policies as PolicyWithRelations[];

  const [selected, setSelected] = useState<PolicyWithRelations | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", framework: "", category: "" });

  async function handleCreate() {
    if (!newForm.name || !newForm.category) return;
    await createPolicy.mutateAsync({ ...newForm, status: "draft", tenant_id: scope !== "all" ? scope : null });
    addToast("Policy created as Draft", "success");
    setShowNew(false);
    setNewForm({ name: "", framework: "", category: "" });
  }

  return (
    <div className="p-6 fade-in flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Policies</h1>
          <p className="text-[13px]" style={{ color: "var(--ink-4)" }}>
            {typedPolicies.filter((p) => p.status === "deployed").length} deployed · {typedPolicies.filter((p) => p.status === "draft").length} draft
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white"
          style={{ background: "var(--primary)" }} onClick={() => setShowNew(true)}>
          <Plus size={14} /> New Policy
        </button>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>Loading…</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {typedPolicies.map((pol) => (
            <button key={pol.id} onClick={() => setSelected(pol)}
              className="text-left p-4 rounded-[13px] hover:shadow-md transition-shadow flex flex-col gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold leading-snug" style={{ color: "var(--ink)" }}>{pol.name}</div>
                  <div className="text-[11.5px] mt-0.5" style={{ color: "var(--ink-4)" }}>{pol.category}</div>
                </div>
                <ChevronRight size={14} color="var(--ink-4)" className="shrink-0 mt-0.5" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {pol.framework && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide"
                    style={{ background: "var(--surface-3)", color: "var(--ink-3)" }}>{pol.framework}</span>
                )}
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize"
                  style={{ background: pol.status === "deployed" ? "var(--ok-tint)" : "var(--surface-3)", color: pol.status === "deployed" ? "var(--ok)" : "var(--ink-4)" }}>
                  {pol.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-[12px]" style={{ color: "var(--ink-4)" }}>
                <span>{pol.policy_rules?.length ?? 0} rules</span>
                <span>{pol.policy_groups?.length ?? 0} groups</span>
              </div>
            </button>
          ))}
          {typedPolicies.length === 0 && (
            <div className="col-span-3 py-12 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>No policies yet</div>
          )}
        </div>
      )}

      {selected && <PolicyEditorDrawer policy={selected} onClose={() => setSelected(null)} />}

      {showNew && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center" onClick={() => setShowNew(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(17,21,29,.4)" }} />
          <div className="relative rounded-[13px] p-6 w-full max-w-[440px] fade-in flex flex-col gap-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[16px] font-bold" style={{ color: "var(--ink)" }}>New Policy</h2>
            {(["name", "framework", "category"] as const).map((field) => (
              <div key={field}>
                <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>{field}</label>
                <input value={newForm[field]} onChange={(e) => setNewForm((f) => ({ ...f, [field]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
                  style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }} />
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <button className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold text-white"
                style={{ background: "var(--primary)" }} disabled={createPolicy.isPending}
                onClick={handleCreate}>
                {createPolicy.isPending ? "Creating…" : "Create Policy"}
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
