"use client";
import { useState } from "react";
import { Plus, Wifi, WifiOff, AlertTriangle, RefreshCw, Trash2 } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useAgents, useCreateAgent, useUpdateAgent, useDeleteAgent } from "@/lib/hooks";
import { useTenants } from "@/lib/hooks";
import type { Agent, Tenant } from "@/lib/supabase/types";

type AgentWithTenant = Agent & { tenants?: { name: string } };

const STATUS_CONFIG: Record<Agent["status"], { icon: React.ReactNode; bg: string; color: string; label: string }> = {
  online:   { icon: <Wifi size={12} />,          bg: "var(--ok-tint)",      color: "var(--ok)",      label: "Online"   },
  offline:  { icon: <WifiOff size={12} />,       bg: "var(--surface-3)",    color: "var(--ink-4)",   label: "Offline"  },
  degraded: { icon: <AlertTriangle size={12} />, bg: "var(--high-tint)",    color: "var(--high)",    label: "Degraded" },
  updating: { icon: <RefreshCw size={12} />,     bg: "var(--primary-tint)", color: "var(--primary)", label: "Updating" },
};

function DeployModal({ onClose }: { onClose: () => void }) {
  const { addToast, scope } = useUIStore();
  const createAgent = useCreateAgent();
  const { data: tenants = [] } = useTenants();
  const [form, setForm] = useState({ name: "", hostname: "", ip_address: "", os: "Windows", tenant_id: scope !== "all" ? scope : "" });

  async function handleDeploy() {
    if (!form.name || !form.hostname) return;
    await createAgent.mutateAsync({ ...form, status: "offline", tenant_id: form.tenant_id || null });
    addToast(`Agent ${form.name} registered`, "success");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(17,21,29,.4)" }} />
      <div className="relative rounded-[13px] p-6 w-full max-w-[480px] flex flex-col gap-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}
        onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[16px] font-bold" style={{ color: "var(--ink)" }}>Deploy New Agent</h2>
        <p className="text-[12.5px]" style={{ color: "var(--ink-3)" }}>
          Register an agent endpoint. Once registered, copy the install command to deploy the agent binary on the target host.
        </p>

        {(["name", "hostname", "ip_address"] as const).map((field) => (
          <div key={field}>
            <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>
              {field.replace("_", " ")}
            </label>
            <input value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }} />
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>OS</label>
            <select value={form.os} onChange={(e) => setForm((f) => ({ ...f, os: e.target.value }))}
              className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }}>
              {["Windows", "Linux", "macOS"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          {scope === "all" && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>Client</label>
              <select value={form.tenant_id} onChange={(e) => setForm((f) => ({ ...f, tenant_id: e.target.value }))}
                className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
                style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }}>
                <option value="">— Select client —</option>
                {(tenants as Tenant[]).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="p-3 rounded-[8px] font-mono text-[12px]" style={{ background: "var(--surface-3)", color: "var(--ok)", border: "1px solid var(--border)" }}>
          curl -sSL https://agents.dexsec.io/install | sudo bash -s -- --key {"<API_KEY>"}
        </div>

        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold text-white"
            style={{ background: "var(--primary)" }} disabled={createAgent.isPending}
            onClick={handleDeploy}>
            {createAgent.isPending ? "Registering…" : "Register Agent"}
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

export function Agents() {
  const { scope, addToast } = useUIStore();
  const { data: agents = [], isLoading } = useAgents(scope);
  const updateAgent = useUpdateAgent();
  const deleteAgent = useDeleteAgent();
  const [showDeploy, setShowDeploy] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");

  const typedAgents = agents as AgentWithTenant[];
  const filtered = statusFilter === "all" ? typedAgents : typedAgents.filter((a) => a.status === statusFilter);

  const online   = typedAgents.filter((a) => a.status === "online").length;
  const offline  = typedAgents.filter((a) => a.status === "offline").length;
  const degraded = typedAgents.filter((a) => a.status === "degraded").length;

  async function handleUpdateStatus(agent: AgentWithTenant, status: Agent["status"]) {
    await updateAgent.mutateAsync({ id: agent.id, status });
    addToast(`${agent.name} marked ${status}`, "success");
  }

  async function handleDelete(id: string, name: string) {
    await deleteAgent.mutateAsync(id);
    addToast(`${name} removed`, "default");
  }

  return (
    <div className="p-6 fade-in flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Agents</h1>
          <p className="text-[13px]" style={{ color: "var(--ink-4)" }}>
            {typedAgents.length} registered · {online} online · {offline} offline · {degraded} degraded
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white"
          style={{ background: "var(--primary)" }} onClick={() => setShowDeploy(true)}>
          <Plus size={14} /> Deploy Agent
        </button>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Agents", value: typedAgents.length, color: "var(--primary)" },
          { label: "Online",       value: online,   color: "var(--ok)"    },
          { label: "Offline",      value: offline,  color: "var(--ink-4)" },
          { label: "Degraded",     value: degraded, color: "var(--high)"  },
        ].map((k) => (
          <div key={k.label} className="p-4 rounded-[13px]"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
            <div className="text-[12px] font-semibold uppercase tracking-[.08em] mb-1" style={{ color: "var(--ink-4)" }}>{k.label}</div>
            <div className="text-[26px] font-bold mono" style={{ color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-1 p-1 rounded-[10px] self-start" style={{ background: "var(--surface-3)" }}>
        {["all", "online", "offline", "degraded", "updating"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="px-3 py-1 rounded-[7px] text-[12.5px] font-semibold transition-colors capitalize"
            style={{ background: statusFilter === s ? "var(--surface)" : "transparent", color: statusFilter === s ? "var(--ink)" : "var(--ink-3)", boxShadow: statusFilter === s ? "var(--shadow-sm)" : "none" }}>
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="rounded-[13px] overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        {isLoading ? (
          <div className="p-8 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>Loading…</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b text-[11px] font-semibold uppercase tracking-[.08em]" style={{ borderColor: "var(--border)", color: "var(--ink-4)" }}>
                <th className="px-5 py-3 text-left">Agent Name</th>
                <th className="px-3 py-3 text-left">Hostname</th>
                <th className="px-3 py-3 text-left">IP</th>
                <th className="px-3 py-3 text-left">OS</th>
                {scope === "all" && <th className="px-3 py-3 text-left">Client</th>}
                <th className="px-3 py-3 text-left">Version</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-left">Last Seen</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((agent) => {
                const sc = STATUS_CONFIG[agent.status];
                const lastSeen = agent.last_seen ? new Date(agent.last_seen).toLocaleString() : "Never";
                return (
                  <tr key={agent.id} className="border-t hover:bg-surface-2 transition-colors" style={{ borderColor: "var(--border-faint)" }}>
                    <td className="px-5 py-3 font-medium" style={{ color: "var(--ink)" }}>{agent.name}</td>
                    <td className="px-3 py-3 mono text-[12px]" style={{ color: "var(--ink-2)" }}>{agent.hostname ?? "—"}</td>
                    <td className="px-3 py-3 mono text-[12px]" style={{ color: "var(--ink-3)" }}>{agent.ip_address ?? "—"}</td>
                    <td className="px-3 py-3 text-[12.5px]" style={{ color: "var(--ink-3)" }}>{agent.os ?? "—"}</td>
                    {scope === "all" && <td className="px-3 py-3 text-[12px]" style={{ color: "var(--ink-4)" }}>{agent.tenants?.name ?? "—"}</td>}
                    <td className="px-3 py-3 mono text-[11.5px]" style={{ color: "var(--ink-4)" }}>{agent.version}</td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold w-fit"
                        style={{ background: sc.bg, color: sc.color }}>
                        {sc.icon} {sc.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-[11.5px]" style={{ color: "var(--ink-4)" }}>{lastSeen}</td>
                    <td className="px-3 py-3 text-right flex items-center justify-end gap-1.5">
                      {agent.status === "offline" && (
                        <button className="px-2 py-1 rounded-[7px] text-[11px] font-semibold"
                          style={{ background: "var(--ok-tint)", color: "var(--ok)" }}
                          onClick={() => handleUpdateStatus(agent, "online")}>
                          Activate
                        </button>
                      )}
                      {agent.status === "online" && (
                        <button className="px-2 py-1 rounded-[7px] text-[11px] font-semibold"
                          style={{ background: "var(--surface-3)", color: "var(--ink-3)" }}
                          onClick={() => handleUpdateStatus(agent, "offline")}>
                          Deactivate
                        </button>
                      )}
                      <button className="p-1.5 rounded-[7px]" style={{ color: "var(--crit)" }}
                        onClick={() => handleDelete(agent.id, agent.name)}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <WifiOff size={32} color="var(--ink-4)" />
                      <div className="text-[13px] font-medium" style={{ color: "var(--ink-3)" }}>No agents deployed yet</div>
                      <button className="px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white"
                        style={{ background: "var(--primary)" }} onClick={() => setShowDeploy(true)}>
                        Deploy your first agent
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showDeploy && <DeployModal onClose={() => setShowDeploy(false)} />}
    </div>
  );
}
