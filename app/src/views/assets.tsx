"use client";
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { useUIStore } from "@/store/ui-store";

interface Asset {
  id: string;
  name: string;
  type: "Laptop" | "Server" | "Network" | "Mobile" | "VM";
  department: string;
  owner: string;
  location: string;
  os: string;
  status: "Active" | "Inactive" | "Retired";
  risk: "Low" | "Medium" | "High" | "Critical";
}

const ASSETS: Asset[] = [
  { id: "ast-1", name: "WS-FINANCE-01", type: "Laptop", department: "Finance", owner: "J. Smith", location: "HQ Floor 3", os: "Windows 11", status: "Active", risk: "Low" },
  { id: "ast-2", name: "SRV-DC-PRIMARY", type: "Server", department: "IT", owner: "IT Ops", location: "Data Center", os: "Windows Server 2022", status: "Active", risk: "High" },
  { id: "ast-3", name: "WS-CLINICAL-07", type: "Laptop", department: "Clinical", owner: "M. Torres", location: "Ward B", os: "Windows 10", status: "Active", risk: "Critical" },
  { id: "ast-4", name: "NET-CORE-SW-01", type: "Network", department: "IT", owner: "NetOps", location: "Server Room", os: "Cisco IOS 17.x", status: "Active", risk: "Medium" },
  { id: "ast-5", name: "WS-RD-LAB-12", type: "Laptop", department: "R&D", owner: "K. Patel", location: "Lab 2", os: "Ubuntu 22.04", status: "Active", risk: "Low" },
  { id: "ast-6", name: "VM-PROD-WEB-03", type: "VM", department: "Engineering", owner: "DevOps", location: "Cloud (AWS)", os: "Amazon Linux 2", status: "Active", risk: "Medium" },
  { id: "ast-7", name: "MOB-EXEC-CEO", type: "Mobile", department: "Executive", owner: "CEO", location: "Remote", os: "iOS 17.4", status: "Active", risk: "High" },
  { id: "ast-8", name: "SRV-BACKUP-01", type: "Server", department: "IT", owner: "IT Ops", location: "Data Center", os: "Windows Server 2019", status: "Inactive", risk: "Low" },
  { id: "ast-9", name: "WS-HR-05", type: "Laptop", department: "HR", owner: "L. Chen", location: "HQ Floor 2", os: "macOS 14", status: "Active", risk: "Low" },
  { id: "ast-10", name: "NET-EDGE-FW-01", type: "Network", department: "IT", owner: "NetOps", location: "DMZ", os: "Palo Alto PAN-OS", status: "Active", risk: "Critical" },
];

const RISK_COLORS: Record<string, { bg: string; color: string }> = {
  Low:      { bg: "var(--ok-tint)",   color: "var(--ok)"   },
  Medium:   { bg: "var(--med-tint)",  color: "var(--med)"  },
  High:     { bg: "var(--high-tint)", color: "var(--high)" },
  Critical: { bg: "var(--crit-tint)", color: "var(--crit)" },
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Active:   { bg: "var(--ok-tint)",   color: "var(--ok)"   },
  Inactive: { bg: "var(--surface-3)", color: "var(--ink-4)" },
  Retired:  { bg: "var(--surface-3)", color: "var(--ink-4)" },
};

const TYPE_ICONS: Record<string, string> = {
  Laptop: "💻", Server: "🖥️", Network: "🔌", Mobile: "📱", VM: "☁️",
};

const DEPARTMENTS = ["All", ...Array.from(new Set(ASSETS.map((a) => a.department)))];

function EditModal({ asset, onClose }: { asset: Asset; onClose: () => void }) {
  const { addToast } = useUIStore();
  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(17,21,29,.4)" }} />
      <div className="relative rounded-[13px] p-6 w-full max-w-[440px] fade-in flex flex-col gap-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}
        onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[16px] font-bold" style={{ color: "var(--ink)" }}>Edit Asset — {asset.name}</h2>
        {[["Owner", asset.owner], ["Location", asset.location], ["Department", asset.department]].map(([label, val]) => (
          <div key={label as string}>
            <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>{label as string}</label>
            <input defaultValue={val as string} className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }} />
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <button className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold text-white"
            style={{ background: "var(--primary)" }}
            onClick={() => { addToast(`${asset.name} updated`, "success"); onClose(); }}>
            Save Changes
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

export function Assets() {
  const { addToast } = useUIStore();
  const [dept, setDept] = useState("All");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Asset | null>(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = ASSETS.filter((a) =>
    (dept === "All" || a.department === dept) &&
    (search === "" || a.name.toLowerCase().includes(search.toLowerCase()) || a.owner.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 fade-in flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Asset Management</h1>
          <p className="text-[13px]" style={{ color: "var(--ink-4)" }}>{ASSETS.length} assets · {ASSETS.filter((a) => a.status === "Active").length} active</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white"
          style={{ background: "var(--primary)" }}
          onClick={() => setShowNew(true)}>
          <Plus size={14} /> Add Asset
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {DEPARTMENTS.map((d) => (
            <button key={d} onClick={() => setDept(d)}
              className="px-2.5 py-1 rounded-[7px] text-[12px] font-semibold transition-colors"
              style={{ background: dept === d ? "var(--primary)" : "var(--surface)", color: dept === d ? "white" : "var(--ink-3)", border: "1px solid var(--border)" }}>
              {d}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-[8px]" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <Search size={13} color="var(--ink-4)" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets…" className="outline-none text-[13px] w-48 bg-transparent"
            style={{ color: "var(--ink)" }} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[13px] overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b text-[11px] font-semibold uppercase tracking-[.08em]" style={{ borderColor: "var(--border)", color: "var(--ink-4)" }}>
              <th className="px-5 py-3 text-left">Asset</th>
              <th className="px-3 py-3 text-left">Type</th>
              <th className="px-3 py-3 text-left">Department</th>
              <th className="px-3 py-3 text-left">Owner</th>
              <th className="px-3 py-3 text-left">OS</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Risk</th>
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id} className="border-t hover:bg-surface-2 transition-colors" style={{ borderColor: "var(--border-faint)" }}>
                <td className="px-5 py-3 font-semibold mono text-[12.5px]" style={{ color: "var(--ink)" }}>{a.name}</td>
                <td className="px-3 py-3">
                  <span>{TYPE_ICONS[a.type]} </span>
                  <span className="text-[12px]" style={{ color: "var(--ink-3)" }}>{a.type}</span>
                </td>
                <td className="px-3 py-3 text-[12.5px]" style={{ color: "var(--ink-2)" }}>{a.department}</td>
                <td className="px-3 py-3 text-[12.5px]" style={{ color: "var(--ink-2)" }}>{a.owner}</td>
                <td className="px-3 py-3 mono text-[11.5px]" style={{ color: "var(--ink-3)" }}>{a.os}</td>
                <td className="px-3 py-3">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                    style={{ background: STATUS_COLORS[a.status].bg, color: STATUS_COLORS[a.status].color }}>
                    {a.status}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                    style={{ background: RISK_COLORS[a.risk].bg, color: RISK_COLORS[a.risk].color }}>
                    {a.risk}
                  </span>
                </td>
                <td className="px-3 py-3 text-right">
                  <button className="px-2.5 py-1 rounded-[7px] text-[11.5px] font-semibold"
                    style={{ background: "var(--surface-3)", color: "var(--ink-2)" }}
                    onClick={() => setEditing(a)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <EditModal asset={editing} onClose={() => setEditing(null)} />}

      {showNew && (
        <div className="fixed inset-0 z-[800] flex items-center justify-center" onClick={() => setShowNew(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(17,21,29,.4)" }} />
          <div className="relative rounded-[13px] p-6 w-full max-w-[440px] fade-in flex flex-col gap-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-[16px] font-bold" style={{ color: "var(--ink)" }}>Add Asset</h2>
            {[["Asset Name", "e.g. WS-FINANCE-10"], ["Owner", "e.g. J. Smith"], ["Location", "e.g. HQ Floor 3"], ["OS", "e.g. Windows 11"]].map(([label, placeholder]) => (
              <div key={label as string}>
                <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>{label as string}</label>
                <input placeholder={placeholder as string} className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
                  style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }} />
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <button className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold text-white"
                style={{ background: "var(--primary)" }}
                onClick={() => { addToast("Asset added", "success"); setShowNew(false); }}>
                Add Asset
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
