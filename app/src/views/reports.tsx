"use client";
import { useState } from "react";
import { FileText, Download, Plus } from "lucide-react";
import { useUIStore } from "@/store/ui-store";

interface ReportTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  format: "PDF" | "CSV" | "XLSX";
}

interface RecentReport {
  id: string;
  name: string;
  generated: string;
  size: string;
  format: "PDF" | "CSV" | "XLSX";
  tenant: string;
}

const TEMPLATES: ReportTemplate[] = [
  { id: "rt-1", name: "Executive Security Summary", category: "Executive", description: "High-level risk posture, KPIs, and incident trends for leadership.", format: "PDF" },
  { id: "rt-2", name: "Incident Response Report", category: "Operations", description: "Detailed breakdown of incidents, response times, and outcomes.", format: "PDF" },
  { id: "rt-3", name: "Vulnerability Exposure", category: "Vulnerability", description: "CVE inventory, CVSS scores, patch coverage, and remediation status.", format: "XLSX" },
  { id: "rt-4", name: "Compliance Gap Analysis", category: "Compliance", description: "Control coverage against NIST CSF, CIS, HIPAA, and PCI-DSS.", format: "PDF" },
  { id: "rt-5", name: "Endpoint Health Audit", category: "Operations", description: "Patch levels, EDR coverage, and risk scores across all endpoints.", format: "XLSX" },
  { id: "rt-6", name: "User Activity Audit", category: "Compliance", description: "Authentication logs, privilege usage, and policy violations.", format: "CSV" },
];

const RECENT: RecentReport[] = [
  { id: "rr-1", name: "Executive Security Summary", generated: "2024-06-01 09:12", size: "1.4 MB", format: "PDF", tenant: "Northwind Healthcare" },
  { id: "rr-2", name: "Vulnerability Exposure", generated: "2024-05-31 14:30", size: "3.1 MB", format: "XLSX", tenant: "Voltaic Energy" },
  { id: "rr-3", name: "Incident Response Report", generated: "2024-05-30 08:55", size: "892 KB", format: "PDF", tenant: "Meridian Logistics" },
  { id: "rr-4", name: "Compliance Gap Analysis", generated: "2024-05-28 16:22", size: "2.2 MB", format: "PDF", tenant: "Cobalt Financial" },
  { id: "rr-5", name: "Endpoint Health Audit", generated: "2024-05-27 11:00", size: "5.8 MB", format: "XLSX", tenant: "All Tenants" },
];

const FORMAT_COLORS: Record<string, { bg: string; color: string }> = {
  PDF:  { bg: "var(--crit-tint)", color: "var(--crit)" },
  XLSX: { bg: "var(--ok-tint)",   color: "var(--ok)"   },
  CSV:  { bg: "var(--med-tint)",  color: "var(--med)"  },
};

const CAT_COLORS: Record<string, string> = {
  Executive:     "var(--primary)",
  Operations:    "var(--ok)",
  Vulnerability: "var(--crit)",
  Compliance:    "var(--med)",
};

function GenerateModal({ template, onClose }: { template: ReportTemplate; onClose: () => void }) {
  const { addToast } = useUIStore();
  return (
    <div className="fixed inset-0 z-[800] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(17,21,29,.4)" }} />
      <div className="relative rounded-[13px] p-6 w-full max-w-[420px] fade-in flex flex-col gap-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}
        onClick={(e) => e.stopPropagation()}>
        <div>
          <h2 className="text-[16px] font-bold" style={{ color: "var(--ink)" }}>Generate Report</h2>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--ink-4)" }}>{template.name}</p>
        </div>
        {[["Date Range", "select", ["Last 7 days", "Last 30 days", "Last 90 days", "Custom"]], ["Tenant Scope", "select", ["All Tenants", "Northwind Healthcare", "Meridian Logistics", "Voltaic Energy", "Cobalt Financial"]], ["Format", "select", ["PDF", "XLSX", "CSV"]]].map(([label, , opts]) => (
          <div key={label as string}>
            <label className="block text-[11px] font-bold uppercase tracking-[.1em] mb-1.5" style={{ color: "var(--ink-4)" }}>{label as string}</label>
            <select className="w-full px-3 py-2 rounded-[7px] text-[13px] outline-none"
              style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink)" }}>
              {(opts as string[]).map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <button className="flex-1 py-2 rounded-[10px] text-[13px] font-semibold text-white"
            style={{ background: "var(--primary)" }}
            onClick={() => { addToast(`${template.name} generation queued`, "success"); onClose(); }}>
            Generate
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

export function Reports() {
  const { addToast } = useUIStore();
  const [generating, setGenerating] = useState<ReportTemplate | null>(null);

  return (
    <div className="p-6 fade-in flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Reports</h1>
          <p className="text-[13px]" style={{ color: "var(--ink-4)" }}>{TEMPLATES.length} templates · {RECENT.length} recent</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold text-white"
          style={{ background: "var(--primary)" }}
          onClick={() => addToast("Custom report builder coming soon")}>
          <Plus size={14} /> Custom Report
        </button>
      </div>

      {/* Template grid */}
      <div>
        <h2 className="text-[14.5px] font-semibold mb-3" style={{ color: "var(--ink)" }}>Templates</h2>
        <div className="grid grid-cols-3 gap-4">
          {TEMPLATES.map((t) => (
            <div key={t.id} className="p-4 rounded-[13px] flex flex-col gap-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0"
                  style={{ background: "var(--primary-tint)" }}>
                  <FileText size={16} color="var(--primary)" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold leading-snug" style={{ color: "var(--ink)" }}>{t.name}</div>
                  <div className="text-[11px] mt-0.5 font-semibold" style={{ color: CAT_COLORS[t.category] ?? "var(--ink-4)" }}>{t.category}</div>
                </div>
              </div>
              <p className="text-[12px] leading-relaxed" style={{ color: "var(--ink-4)" }}>{t.description}</p>
              <div className="flex items-center gap-2 mt-auto">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                  style={{ background: FORMAT_COLORS[t.format].bg, color: FORMAT_COLORS[t.format].color }}>
                  {t.format}
                </span>
                <button className="ml-auto px-3 py-1.5 rounded-[8px] text-[12px] font-semibold"
                  style={{ background: "var(--primary)", color: "white" }}
                  onClick={() => setGenerating(t)}>
                  Generate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent reports */}
      <div>
        <h2 className="text-[14.5px] font-semibold mb-3" style={{ color: "var(--ink)" }}>Recent Reports</h2>
        <div className="rounded-[13px] overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b text-[11px] font-semibold uppercase tracking-[.08em]" style={{ borderColor: "var(--border)", color: "var(--ink-4)" }}>
                <th className="px-5 py-3 text-left">Report</th>
                <th className="px-3 py-3 text-left">Tenant</th>
                <th className="px-3 py-3 text-left">Generated</th>
                <th className="px-3 py-3 text-left">Format</th>
                <th className="px-3 py-3 text-right">Size</th>
                <th className="px-3 py-3 text-right">Download</th>
              </tr>
            </thead>
            <tbody>
              {RECENT.map((r) => (
                <tr key={r.id} className="border-t hover:bg-surface-2 transition-colors" style={{ borderColor: "var(--border-faint)" }}>
                  <td className="px-5 py-3 font-medium" style={{ color: "var(--ink)" }}>{r.name}</td>
                  <td className="px-3 py-3 text-[12.5px]" style={{ color: "var(--ink-3)" }}>{r.tenant}</td>
                  <td className="px-3 py-3 mono text-[12px]" style={{ color: "var(--ink-4)" }}>{r.generated}</td>
                  <td className="px-3 py-3">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                      style={{ background: FORMAT_COLORS[r.format].bg, color: FORMAT_COLORS[r.format].color }}>
                      {r.format}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right mono text-[12px]" style={{ color: "var(--ink-4)" }}>{r.size}</td>
                  <td className="px-3 py-3 text-right">
                    <button className="p-1.5 rounded-[7px] hover:bg-surface-3 transition-colors"
                      onClick={() => addToast(`Downloading ${r.name}`, "success")}>
                      <Download size={14} color="var(--primary)" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {generating && <GenerateModal template={generating} onClose={() => setGenerating(null)} />}
    </div>
  );
}
