"use client";
import { useState } from "react";
import { useUIStore } from "@/store/ui-store";
import { RingChart } from "@/components/ui/sparkline";

interface Patch {
  id: string;
  cve: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  affected: number;
  product: string;
  published: string;
  status: "Pending" | "Scheduled" | "Deployed";
}

const PATCHES: Patch[] = [
  { id: "p-1", cve: "CVE-2024-3400", title: "PAN-OS Command Injection", severity: "Critical", affected: 14, product: "Palo Alto", published: "2024-04-12", status: "Pending" },
  { id: "p-2", cve: "CVE-2024-21762", title: "FortiOS SSL-VPN RCE", severity: "Critical", affected: 9, product: "Fortinet", published: "2024-02-08", status: "Pending" },
  { id: "p-3", cve: "CVE-2024-1709", title: "ConnectWise Auth Bypass", severity: "Critical", affected: 22, product: "ConnectWise", published: "2024-02-21", status: "Scheduled" },
  { id: "p-4", cve: "CVE-2023-46805", title: "Ivanti ICS Auth Bypass", severity: "High", affected: 6, product: "Ivanti", published: "2024-01-10", status: "Pending" },
  { id: "p-5", cve: "CVE-2024-27198", title: "JetBrains TeamCity RCE", severity: "High", affected: 3, product: "JetBrains", published: "2024-03-04", status: "Scheduled" },
  { id: "p-6", cve: "CVE-2024-6387", title: "OpenSSH RegreSSHion RCE", severity: "High", affected: 31, product: "OpenSSH", published: "2024-07-01", status: "Pending" },
  { id: "p-7", cve: "CVE-2024-38094", title: "SharePoint RCE", severity: "High", affected: 5, product: "Microsoft", published: "2024-07-09", status: "Deployed" },
  { id: "p-8", cve: "CVE-2024-38213", title: "Windows SmartScreen Bypass", severity: "Medium", affected: 18, product: "Microsoft", published: "2024-08-13", status: "Deployed" },
];

const SEV_COLORS: Record<string, { bg: string; color: string }> = {
  Critical: { bg: "var(--crit-tint)", color: "var(--crit)" },
  High:     { bg: "var(--high-tint)", color: "var(--high)" },
  Medium:   { bg: "var(--med-tint)",  color: "var(--med)"  },
  Low:      { bg: "var(--ok-tint)",   color: "var(--ok)"   },
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Pending:   { bg: "var(--crit-tint)", color: "var(--crit)" },
  Scheduled: { bg: "var(--med-tint)",  color: "var(--med)"  },
  Deployed:  { bg: "var(--ok-tint)",   color: "var(--ok)"   },
};

export function Patch() {
  const { addToast } = useUIStore();
  const [patches, setPatches] = useState(PATCHES);
  const [filter, setFilter] = useState<string>("All");

  const deployed  = patches.filter((p) => p.status === "Deployed").length;
  const total     = patches.length;
  const compliance = Math.round((deployed / total) * 100);

  const critical = patches.filter((p) => p.severity === "Critical" && p.status !== "Deployed");
  const filtered = filter === "All" ? patches : patches.filter((p) => p.severity === filter || p.status === filter);

  function deployAll() {
    setPatches((ps) => ps.map((p) => p.severity === "Critical" ? { ...p, status: "Scheduled" } : p));
    addToast(`${critical.length} critical patches scheduled`, "success");
  }

  function deploy(id: string, name: string) {
    setPatches((ps) => ps.map((p) => p.id === id ? { ...p, status: "Scheduled" } : p));
    addToast(`${name} scheduled`, "success");
  }

  return (
    <div className="p-6 fade-in flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Patch Management</h1>
          <p className="text-[13px]" style={{ color: "var(--ink-4)" }}>{patches.filter((p) => p.status === "Pending").length} pending · {patches.filter((p) => p.severity === "Critical" && p.status !== "Deployed").length} critical</p>
        </div>
        {critical.length > 0 && (
          <button className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold"
            style={{ background: "var(--crit-tint)", color: "var(--crit)" }}
            onClick={deployAll}>
            Deploy All Critical ({critical.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-[200px_1fr] gap-5">
        {/* Compliance ring */}
        <div className="p-5 rounded-[13px] flex flex-col items-center gap-3"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <div className="text-[13px] font-semibold self-start" style={{ color: "var(--ink)" }}>Patch Compliance</div>
          <div className="relative">
            <RingChart value={compliance} size={96} strokeWidth={10} color={compliance >= 80 ? "var(--ok)" : compliance >= 60 ? "var(--med)" : "var(--crit)"} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[20px] font-bold mono" style={{ color: "var(--ink)" }}>{compliance}%</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 w-full">
            {[["Deployed", deployed, "var(--ok)"], ["Scheduled", patches.filter((p) => p.status === "Scheduled").length, "var(--med)"], ["Pending", patches.filter((p) => p.status === "Pending").length, "var(--crit)"]].map(([label, val, color]) => (
              <div key={label as string} className="flex items-center gap-2 text-[12px]">
                <div className="w-2 h-2 rounded-full" style={{ background: color as string }} />
                <span className="flex-1" style={{ color: "var(--ink-3)" }}>{label as string}</span>
                <span className="mono font-semibold" style={{ color: "var(--ink)" }}>{val as number}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Patch table */}
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
                  <td className="px-5 py-3 mono text-[11.5px]" style={{ color: "var(--primary)" }}>{p.cve}</td>
                  <td className="px-3 py-3 font-medium" style={{ color: "var(--ink)" }}>{p.title}</td>
                  <td className="px-3 py-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                      style={{ background: SEV_COLORS[p.severity].bg, color: SEV_COLORS[p.severity].color }}>
                      {p.severity}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[12.5px]" style={{ color: "var(--ink-3)" }}>{p.product}</td>
                  <td className="px-3 py-3 text-right mono text-[12px]" style={{ color: "var(--ink-2)" }}>{p.affected}</td>
                  <td className="px-3 py-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                      style={{ background: STATUS_COLORS[p.status].bg, color: STATUS_COLORS[p.status].color }}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right">
                    {p.status === "Pending" && (
                      <button className="px-2.5 py-1 rounded-[7px] text-[11.5px] font-semibold"
                        style={{ background: "var(--primary-tint)", color: "var(--primary)" }}
                        onClick={() => deploy(p.id, p.cve)}>
                        Schedule
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
