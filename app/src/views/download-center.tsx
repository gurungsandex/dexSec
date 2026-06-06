"use client";
import { useState } from "react";
import {
  Download, Copy, Check, Terminal, Shield, Key,
  Monitor, Server, Apple, BookOpen, ChevronRight, Package
} from "lucide-react";
import { useUIStore } from "@/store/ui-store";

const AGENT_VERSION = "2.4.1";
const BASE_URL = "https://agents.dexsec.io";

interface Package {
  os: string;
  icon: React.ReactNode;
  arch: string;
  filename: string;
  size: string;
  sha256: string;
  installCmd: string;
  verifyCmd: string;
}

const PACKAGES: Package[] = [
  {
    os: "Windows",
    icon: <Monitor size={20} />,
    arch: "x64 / ARM64",
    filename: `dexsec-agent-${AGENT_VERSION}-windows-amd64.msi`,
    size: "18.4 MB",
    sha256: "a3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
    installCmd: `msiexec /i dexsec-agent-${AGENT_VERSION}-windows-amd64.msi APIKEY=<YOUR_API_KEY> /quiet`,
    verifyCmd: `Get-Service DexSecAgent | Select-Object Status`,
  },
  {
    os: "Linux (Debian/Ubuntu)",
    icon: <Server size={20} />,
    arch: "x64 / ARM64",
    filename: `dexsec-agent_${AGENT_VERSION}_amd64.deb`,
    size: "14.2 MB",
    sha256: "b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5",
    installCmd: `curl -sSL ${BASE_URL}/install.sh | sudo bash -s -- --api-key <YOUR_API_KEY> --os debian`,
    verifyCmd: `sudo systemctl status dexsec-agent`,
  },
  {
    os: "Linux (RHEL/CentOS)",
    icon: <Server size={20} />,
    arch: "x64 / ARM64",
    filename: `dexsec-agent-${AGENT_VERSION}-1.x86_64.rpm`,
    size: "15.1 MB",
    sha256: "c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
    installCmd: `curl -sSL ${BASE_URL}/install.sh | sudo bash -s -- --api-key <YOUR_API_KEY> --os rhel`,
    verifyCmd: `sudo systemctl status dexsec-agent`,
  },
  {
    os: "macOS",
    icon: <Apple size={20} />,
    arch: "Intel / Apple Silicon",
    filename: `dexsec-agent-${AGENT_VERSION}-darwin-universal.pkg`,
    size: "16.8 MB",
    sha256: "d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
    installCmd: `curl -sSL ${BASE_URL}/install.sh | sudo bash -s -- --api-key <YOUR_API_KEY> --os macos`,
    verifyCmd: `sudo launchctl list | grep dexsec`,
  },
];

const DEPLOYMENT_GUIDES = [
  { title: "Quick-Start: Deploy in 5 minutes", icon: <Terminal size={14} />, color: "var(--primary)" },
  { title: "NIST CSF Agent Configuration Guide", icon: <Shield size={14} />, color: "var(--ok)" },
  { title: "HIPAA-Compliant Deployment Checklist", icon: <BookOpen size={14} />, color: "var(--high)" },
  { title: "PCI DSS Scoped Deployment Guide", icon: <BookOpen size={14} />, color: "var(--crit)" },
  { title: "Silent / GPO Mass Deployment (Windows)", icon: <Monitor size={14} />, color: "var(--ink-3)" },
  { title: "Ansible Playbook for Linux Fleet", icon: <Terminal size={14} />, color: "var(--ink-3)" },
  { title: "Kubernetes DaemonSet Manifest", icon: <Server size={14} />, color: "var(--ink-3)" },
  { title: "Terraform Module for Cloud Agents", icon: <Package size={14} />, color: "var(--ink-3)" },
];

const FRAMEWORK_CONFIGS = [
  { label: "NIST CSF 2.0", desc: "Baseline telemetry + detection profile aligned to Identify/Protect/Detect/Respond/Recover functions", tag: "Recommended" },
  { label: "CIS Benchmark", desc: "Hardened configuration mapped to CIS Controls v8 IG2 with audit log forwarding", tag: "" },
  { label: "HIPAA", desc: "PHI-aware policy with access logging, encryption enforcement, and 6-year audit retention", tag: "" },
  { label: "PCI DSS v4.0", desc: "Cardholder Data Environment scoping with Requirement 10 log collection and 11.5 IDS rules", tag: "" },
  { label: "ISO 27001:2022", desc: "Annex A control mapping with evidence collection for Clause 9 performance evaluation", tag: "" },
  { label: "SOC 2 Type II", desc: "Continuous control monitoring for Security, Availability, and Confidentiality TSC criteria", tag: "" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-[6px] transition-colors"
      style={{ color: copied ? "var(--ok)" : "var(--ink-4)", background: "transparent" }}
      title="Copy to clipboard">
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-[8px] font-mono text-[12px]"
      style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--ok)" }}>
      <span className="flex-1 overflow-x-auto whitespace-nowrap">{code}</span>
      <CopyButton text={code} />
    </div>
  );
}

export function DownloadCenter() {
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<"packages" | "scripts" | "frameworks">("packages");
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const mockApiKey = "dxs_live_sk_3f8b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1";

  return (
    <div className="p-6 fade-in flex flex-col gap-6 max-w-[1100px]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>Download Center</h1>
          <p className="text-[13px] mt-0.5" style={{ color: "var(--ink-4)" }}>
            Agent binaries, deployment scripts, and framework configuration packages — Agent v{AGENT_VERSION}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-[8px] text-[11.5px] font-semibold"
          style={{ background: "var(--ok-tint)", color: "var(--ok)" }}>
          v{AGENT_VERSION} · Stable
        </span>
      </div>

      {/* API Key section */}
      <div className="p-4 rounded-[13px]" style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
        <div className="flex items-center gap-2 mb-3">
          <Key size={15} color="var(--primary)" />
          <span className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>Deployment API Key</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: "var(--crit-tint)", color: "var(--crit)" }}>Keep secret</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-[8px] font-mono text-[12.5px]"
            style={{ background: "var(--surface-3)", border: "1px solid var(--border-strong)", color: "var(--ink-2)" }}>
            <span className="flex-1">{apiKeyVisible ? mockApiKey : "dxs_live_sk_" + "•".repeat(32)}</span>
          </div>
          <button className="px-3 py-2 rounded-[8px] text-[12.5px] font-semibold"
            style={{ background: "var(--surface-3)", color: "var(--ink-3)", border: "1px solid var(--border)" }}
            onClick={() => setApiKeyVisible((v) => !v)}>
            {apiKeyVisible ? "Hide" : "Reveal"}
          </button>
          <CopyButton text={mockApiKey} />
          <button className="px-3 py-2 rounded-[8px] text-[12.5px] font-semibold"
            style={{ background: "var(--primary-tint)", color: "var(--primary)", border: "1px solid var(--primary)" }}
            onClick={() => addToast("New API key generated", "success")}>
            Rotate Key
          </button>
        </div>
        <p className="mt-2 text-[11.5px]" style={{ color: "var(--ink-4)" }}>
          Replace {"<YOUR_API_KEY>"} in installation commands with this key. Rotating creates a new key; existing agents have a 24-hour grace period.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-[10px] self-start" style={{ background: "var(--surface-3)" }}>
        {(["packages", "scripts", "frameworks"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)}
            className="px-4 py-1.5 rounded-[7px] text-[13px] font-semibold transition-colors capitalize"
            style={{ background: activeTab === t ? "var(--surface)" : "transparent", color: activeTab === t ? "var(--ink)" : "var(--ink-3)", boxShadow: activeTab === t ? "var(--shadow-sm)" : "none" }}>
            {t === "packages" ? "Agent Packages" : t === "scripts" ? "Deploy Scripts" : "Framework Configs"}
          </button>
        ))}
      </div>

      {activeTab === "packages" && (
        <div className="flex flex-col gap-3">
          {PACKAGES.map((pkg) => (
            <div key={pkg.os} className="p-5 rounded-[13px] flex flex-col gap-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[9px] flex items-center justify-center"
                    style={{ background: "var(--primary-tint)", color: "var(--primary)" }}>
                    {pkg.icon}
                  </div>
                  <div>
                    <div className="text-[14px] font-semibold" style={{ color: "var(--ink)" }}>{pkg.os}</div>
                    <div className="text-[12px]" style={{ color: "var(--ink-4)" }}>{pkg.arch} · {pkg.size}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-[13px] font-semibold"
                    style={{ background: "var(--primary)", color: "white" }}
                    onClick={() => addToast(`Downloading ${pkg.filename}…`)}>
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-[.08em] mb-1.5" style={{ color: "var(--ink-4)" }}>One-line install</div>
                <CodeBlock code={pkg.installCmd} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[.08em] mb-1.5" style={{ color: "var(--ink-4)" }}>Verify service</div>
                  <CodeBlock code={pkg.verifyCmd} />
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[.08em] mb-1.5" style={{ color: "var(--ink-4)" }}>SHA-256</div>
                  <div className="px-3 py-2 rounded-[8px] font-mono text-[10.5px] overflow-x-auto"
                    style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--ink-4)" }}>
                    {pkg.sha256.slice(0, 48)}…
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "scripts" && (
        <div className="grid grid-cols-2 gap-4">
          {DEPLOYMENT_GUIDES.map((guide) => (
            <button key={guide.title}
              className="flex items-center gap-3 p-4 rounded-[13px] text-left transition-colors"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}
              onClick={() => addToast(`Opening: ${guide.title}`)}>
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0"
                style={{ background: "var(--surface-3)", color: guide.color }}>
                {guide.icon}
              </div>
              <div className="flex-1 text-[13px] font-medium" style={{ color: "var(--ink)" }}>{guide.title}</div>
              <ChevronRight size={14} color="var(--ink-4)" />
            </button>
          ))}

          <div className="col-span-2 p-4 rounded-[13px]" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-[12px] font-semibold mb-2" style={{ color: "var(--ink)" }}>Universal one-liner (auto-detects OS)</div>
            <CodeBlock code={`curl -sSL ${BASE_URL}/install | sudo bash -s -- --api-key <YOUR_API_KEY>`} />
            <p className="mt-2 text-[11.5px]" style={{ color: "var(--ink-4)" }}>
              Supports Ubuntu 20+, Debian 11+, RHEL 8+, CentOS 8+, Fedora 36+, Amazon Linux 2023, macOS 12+.
              For Windows, use the PowerShell one-liner or MSI package above.
            </p>
          </div>

          <div className="col-span-2 p-4 rounded-[13px]" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-[12px] font-semibold mb-2" style={{ color: "var(--ink)" }}>Windows PowerShell</div>
            <CodeBlock code={`[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; iex ((New-Object System.Net.WebClient).DownloadString('${BASE_URL}/install.ps1'))`} />
          </div>
        </div>
      )}

      {activeTab === "frameworks" && (
        <div className="flex flex-col gap-3">
          <p className="text-[13px]" style={{ color: "var(--ink-3)" }}>
            Select a pre-built agent configuration template aligned to your compliance framework. Templates configure telemetry collection, detection rules, log retention, and reporting to satisfy framework-specific requirements.
          </p>
          {FRAMEWORK_CONFIGS.map((fw) => (
            <div key={fw.label} className="flex items-center gap-4 p-4 rounded-[13px]"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[14px] font-semibold" style={{ color: "var(--ink)" }}>{fw.label}</span>
                  {fw.tag && (
                    <span className="px-1.5 py-0.5 rounded text-[10.5px] font-semibold"
                      style={{ background: "var(--primary-tint)", color: "var(--primary)" }}>
                      {fw.tag}
                    </span>
                  )}
                </div>
                <p className="text-[12.5px]" style={{ color: "var(--ink-3)" }}>{fw.desc}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12.5px] font-semibold"
                  style={{ background: "var(--surface-3)", color: "var(--ink-2)", border: "1px solid var(--border)" }}
                  onClick={() => addToast(`${fw.label} config copied`)}>
                  <Copy size={12} /> Copy config
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12.5px] font-semibold"
                  style={{ background: "var(--primary)", color: "white" }}
                  onClick={() => addToast(`${fw.label} template downloaded`, "success")}>
                  <Download size={12} /> Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
