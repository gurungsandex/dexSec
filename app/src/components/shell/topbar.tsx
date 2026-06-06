"use client";
import { Search, Bell, Bot } from "lucide-react";
import { TenantSwitcher } from "./tenant-switcher";
import { useUIStore } from "@/store/ui-store";

export function TopBar() {
  const { openCommandPalette } = useUIStore();

  return (
    <header
      className="flex items-center gap-3 px-5 border-b"
      style={{
        height: "var(--topbar-h)",
        background: "var(--surface)",
        borderColor: "var(--border)",
        gridArea: "topbar",
      }}
    >
      <TenantSwitcher />

      <div className="flex-1" />

      {/* Global search */}
      <button
        onClick={openCommandPalette}
        className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-[13px] transition-colors"
        style={{ background: "var(--surface-3)", color: "var(--ink-4)" }}
      >
        <Search size={14} />
        <span>Search</span>
        <kbd className="ml-2 px-1.5 py-0.5 rounded-[5px] text-[10px] font-mono"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink-4)" }}>
          ⌘K
        </kbd>
      </button>

      {/* Ask ARIA */}
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[13px] font-medium transition-colors"
        style={{ background: "var(--primary-tint)", color: "var(--primary)" }}
      >
        <Bot size={14} />
        Ask ARIA
      </button>

      {/* Bell */}
      <button className="relative p-2 rounded-[10px] hover:bg-surface-3 transition-colors">
        <Bell size={18} color="var(--ink-3)" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--crit)" }} />
      </button>

      {/* User avatar */}
      <button
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold"
        style={{ background: "var(--primary)" }}
      >
        GA
      </button>
    </header>
  );
}
