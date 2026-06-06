"use client";
import {
  LayoutDashboard, AlertTriangle, Monitor, Shield, Flame, Puzzle,
  BarChart2, Settings, FileText, ClipboardList, Laptop, ShieldCheck
} from "lucide-react";
import type { NavItem } from "@/store/ui-store";
import { useUIStore } from "@/store/ui-store";
import { INCIDENTS } from "@/lib/mock-data";

interface NavGroup {
  label: string;
  items: { id: NavItem; label: string; icon: React.ReactNode }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { id: "overview",   label: "Overview",      icon: <LayoutDashboard size={16} /> },
      { id: "incidents",  label: "Incidents",     icon: <AlertTriangle size={16} /> },
      { id: "soc",        label: "SOC Workspace", icon: <Monitor size={16} /> },
      { id: "endpoints",  label: "Endpoints",     icon: <Laptop size={16} /> },
    ],
  },
  {
    label: "Defense",
    items: [
      { id: "policies",  label: "Policies",  icon: <Shield size={16} /> },
      { id: "firewall",  label: "Firewall",  icon: <Flame size={16} /> },
      { id: "patch",     label: "Patch",     icon: <ShieldCheck size={16} /> },
    ],
  },
  {
    label: "Manage",
    items: [
      { id: "assets",       label: "Assets",       icon: <BarChart2 size={16} /> },
      { id: "reports",      label: "Reports",      icon: <FileText size={16} /> },
      { id: "integrations", label: "Integrations", icon: <Puzzle size={16} /> },
      { id: "audit",        label: "Audit Log",    icon: <ClipboardList size={16} /> },
    ],
  },
];

export function Sidebar() {
  const { nav, setNav, scope } = useUIStore();

  const openIncidents = scope === "all"
    ? INCIDENTS.filter((i) => i.status !== "resolved").length
    : INCIDENTS.filter((i) => i.tenantId === scope && i.status !== "resolved").length;

  return (
    <aside
      className="flex flex-col border-r overflow-y-auto"
      style={{
        width: "var(--sidebar-w)",
        background: "var(--surface)",
        borderColor: "var(--border)",
        gridArea: "sidebar",
      }}
    >
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="pt-4 pb-2">
          <div
            className="px-4 mb-1.5 text-[10px] font-bold uppercase tracking-[.1em]"
            style={{ color: "var(--ink-4)" }}
          >
            {group.label}
          </div>
          {group.items.map((item) => {
            const active = nav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setNav(item.id)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-[13.5px] font-medium transition-colors text-left"
                style={{
                  color: active ? "var(--primary)" : "var(--ink-2)",
                  background: active ? "var(--primary-tint)" : "transparent",
                  borderRadius: 0,
                }}
              >
                <span style={{ color: active ? "var(--primary)" : "var(--ink-4)" }}>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {item.id === "incidents" && openIncidents > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "var(--crit)", color: "white" }}
                  >
                    {openIncidents}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}

      <div className="flex-1" />

      {/* Coverage health card */}
      <div className="mx-3 mb-3 p-3 rounded-[10px]" style={{ background: "var(--ok-tint)", border: "1px solid var(--ok)" }}>
        <div className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--ok)" }} />
          <span className="text-[11.5px] font-semibold" style={{ color: "var(--ok)" }}>Coverage Healthy</span>
        </div>
        <div className="text-[11px]" style={{ color: "var(--ink-3)" }}>All agents reporting</div>
      </div>

      {/* Settings */}
      <button
        onClick={() => setNav("settings")}
        className="flex items-center gap-2.5 px-4 py-3 text-[13.5px] font-medium border-t transition-colors"
        style={{
          color: nav === "settings" ? "var(--primary)" : "var(--ink-3)",
          background: nav === "settings" ? "var(--primary-tint)" : "transparent",
          borderColor: "var(--border)",
        }}
      >
        <Settings size={16} color={nav === "settings" ? "var(--primary)" : "var(--ink-4)"} />
        Settings
      </button>
    </aside>
  );
}
