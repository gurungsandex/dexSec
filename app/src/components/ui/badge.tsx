"use client";
import { type Severity, severityColor } from "@/lib/mock-data";

export function SeverityBadge({ severity }: { severity: Severity }) {
  const { fg, bg } = severityColor(severity);
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide"
      style={{ color: fg, background: bg }}
    >
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { fg: string; bg: string }> = {
    new:          { fg: "var(--ink-3)", bg: "var(--surface-3)" },
    assigned:     { fg: "var(--violet)", bg: "var(--violet-tint)" },
    investigating:{ fg: "var(--high)", bg: "var(--high-tint)" },
    resolved:     { fg: "var(--ok)", bg: "var(--ok-tint)" },
    online:       { fg: "var(--ok)", bg: "var(--ok-tint)" },
    atrisk:       { fg: "var(--high)", bg: "var(--high-tint)" },
    offline:      { fg: "var(--ink-4)", bg: "var(--surface-3)" },
    isolated:     { fg: "var(--crit)", bg: "var(--crit-tint)" },
  };
  const style = map[status] ?? { fg: "var(--ink-3)", bg: "var(--surface-3)" };
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wide"
      style={{ color: style.fg, background: style.bg }}
    >
      {status.replace("atrisk", "at risk")}
    </span>
  );
}

export function ComplianceChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold"
      style={{ color: "var(--teal)", background: "var(--teal-tint)" }}>
      {label}
    </span>
  );
}
