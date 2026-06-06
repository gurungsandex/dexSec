"use client";
import { useState } from "react";
import { Search, Plus, Trash2 } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useAssets, useCreateAsset, useUpdateAsset, useDeleteAsset } from "@/lib/hooks";
import type { Asset } from "@/lib/supabase/types";

const RISK_COLORS: Record<string, { bg: string; color: string }> = {
  low:      { bg: "var(--ok-tint)",   color: "var(--ok)"   },
  medium:   { bg: "var(--med-tint)",  color: "var(--med)"  },
  high:     { bg: "var(--high-tint)", color: "var(--high)" },
  critical: { bg: "var(--crit-tint)", color: "var(--crit)" },
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  active:        { bg: "var(--ok-tint)",   color: "var(--ok)"   },
  inactive:      { bg: "var(--surface-3)", color: "var(--ink-4)" },
  decommissioned:{ bg: "var(--surface-3)", color: "var(--ink-4)" },
};

function EditModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const { addToast } = useUIStore();
  const update = useUpdateAsset();
  const [form, setForm] = useState({ name: asset.name, owner: asset.owner ?? "", department: asset.department ?? "", status: asset.status, risk: asset.risk });

  async function handleSave() {
    await update.mutateAsync({ id: asset.id, ...form });
    addToast("Asset updated", "success");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(17,21,29,.4)" }} />
      <div className="relative rounded-[13px] p-6 w-full max-w-[440px] flex flex-col gap-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}
        onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[16px] font-bold" style={{ color: "var(--ink)" }}>Edit Asset</h2>
        {(["name", "owner", "department"] as const).map((field) => (
          <div key={field}>
            <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>{field}</label>
            <input value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }} />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>Status</label>
            <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Asset["status"] }))}
              className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }}>
              {["active", "inactive", "decommissioned"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>Risk</label>
            <select value={form.risk} onChange={(e) => setForm((f) => ({ ...f, risk: e.target.value as Asset["risk"] }))}
              className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }}>
              {["low", "medium", "high", "critical"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold text-white"
            style={{ background: "var(--primary)" }} disabled={update.isPending}
            onClick={handleSave}>
            {update.isPending ? "Saving…" : "Save Changes"}
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

function AddModal({ onClose, tenantId }: { onClose: () => void; tenantId?: string }) {
  const { addToast } = useUIStore();
  const create = useCreateAsset();
  const [form, setForm] = useState({ name: "", type: "Server" as Asset["type"], owner: "", department: "", risk: "medium" as Asset["risk"], status: "active" as Asset["status"] });

  async function handleCreate() {
    if (!form.name) return;
    await create.mutateAsync({ ...form, tenant_id: tenantId ?? null });
    addToast("Asset added", "success");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(17,21,29,.4)" }} />
      <div className="relative rounded-[13px] p-6 w-full max-w-[440px] flex flex-col gap-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}
        onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[16px] font-bold" style={{ color: "var(--ink)" }}>Add Asset</h2>
        {(["name", "owner", "department"] as const).map((field) => (
          <div key={field}>
            <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>{field}</label>
            <input value={form[field]} onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }} />
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>Type</label>
            <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Asset["type"] }))}
              className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }}>
              {["Server", "Workstation", "Network Device", "Cloud Resource", "IoT", "Mobile"].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>Risk</label>
            <select value={form.risk} onChange={(e) => setForm((f) => ({ ...f, risk: e.target.value as Asset["risk"] }))}
              className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }}>
              {["low", "medium", "high", "critical"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold text-white"
            style={{ background: "var(--primary)" }} disabled={create.isPending}
            onClick={handleCreate}>
            {create.isPending ? "Adding…" : "Add Asset"}
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

export function Assets() {
  const { scope } = useUIStore();
  const { data: assets = [], isLoading } = useAssets(scope);
  const deleteAsset = useDeleteAsset();
  const { addToast } = useUIStore();
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [editTarget, setEditTarget] = useState<Asset | null | undefined>(undefined);
  const [showAdd, setShowAdd] = useState(false);

  const departments = ["All", ...Array.from(new Set((assets as Asset[]).map((a) => a.department).filter((d): d is string => !!d)))];
  const filtered = (assets as Asset[]).filter((a) => {
    const matchDept = deptFilter === "All" || a.department === deptFilter;
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || (a.owner ?? "").toLowerCase().includes(search.toLowerCase());
    return matchDept && matchSearch;
  });

  async function handleDelete(id: string) {
    await deleteAsset.mutateAsync(id);
    addToast("Asset deleted", "default");
  }

  return (
    <div className="p-6 fade-in flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Assets</h1>
          <p className="text-[13px]" style={{ color: "var(--ink-4)" }}>{(assets as Asset[]).length} total assets</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white"
          style={{ background: "var(--primary)" }} onClick={() => setShowAdd(true)}>
          <Plus size={14} /> Add Asset
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--ink-4)" }} />
          <input placeholder="Search assets…" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-[10px] text-[13px] outline-none"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)" }} />
        </div>
        <div className="flex gap-1.5">
          {departments.map((d) => (
            <button key={d} onClick={() => setDeptFilter(d)}
              className="px-2.5 py-1 rounded-[7px] text-[12px] font-semibold transition-colors"
              style={{ background: deptFilter === d ? "var(--primary)" : "var(--surface)", color: deptFilter === d ? "white" : "var(--ink-3)", border: "1px solid var(--border)" }}>
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[13px] overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        {isLoading ? (
          <div className="p-8 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>Loading…</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b text-[11px] font-semibold uppercase tracking-[.08em]" style={{ borderColor: "var(--border)", color: "var(--ink-4)" }}>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-3 py-3 text-left">Type</th>
                <th className="px-3 py-3 text-left">Department</th>
                <th className="px-3 py-3 text-left">Owner</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-3 py-3 text-left">Risk</th>
                <th className="px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => (
                <tr key={asset.id} className="border-t hover:bg-surface-2 transition-colors" style={{ borderColor: "var(--border-faint)" }}>
                  <td className="px-5 py-3 font-medium" style={{ color: "var(--ink)" }}>{asset.name}</td>
                  <td className="px-3 py-3 text-[12.5px]" style={{ color: "var(--ink-3)" }}>{asset.type}</td>
                  <td className="px-3 py-3 text-[12.5px]" style={{ color: "var(--ink-3)" }}>{asset.department}</td>
                  <td className="px-3 py-3 text-[12.5px]" style={{ color: "var(--ink-3)" }}>{asset.owner}</td>
                  <td className="px-3 py-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize"
                      style={{ background: STATUS_COLORS[asset.status]?.bg, color: STATUS_COLORS[asset.status]?.color }}>
                      {asset.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize"
                      style={{ background: RISK_COLORS[asset.risk]?.bg, color: RISK_COLORS[asset.risk]?.color }}>
                      {asset.risk}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right flex items-center justify-end gap-2">
                    <button className="px-2.5 py-1 rounded-[7px] text-[11.5px] font-semibold"
                      style={{ background: "var(--primary-tint)", color: "var(--primary)" }}
                      onClick={() => setEditTarget(asset)}>
                      Edit
                    </button>
                    <button className="p-1.5 rounded-[7px] transition-colors"
                      style={{ color: "var(--crit)" }}
                      onClick={() => handleDelete(asset.id)}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !isLoading && (
                <tr><td colSpan={7} className="px-5 py-8 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>No assets found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {editTarget && <EditModal asset={editTarget} onClose={() => setEditTarget(undefined)} />}
      {showAdd && <AddModal onClose={() => setShowAdd(false)} tenantId={scope !== "all" ? scope : undefined} />}
    </div>
  );
}
