"use client";
import { Search, Bell, Bot, LogOut } from "lucide-react";
import { TenantSwitcher } from "./tenant-switcher";
import { useUIStore } from "@/store/ui-store";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function TopBar() {
  const { openCommandPalette, openAria, ariaOpen } = useUIStore();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";

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
        onClick={() => openAria()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] text-[13px] font-medium transition-all"
        style={{
          background: ariaOpen ? "var(--primary)" : "var(--primary-tint)",
          color: ariaOpen ? "white" : "var(--primary)",
          boxShadow: ariaOpen ? "0 0 0 2px var(--primary)" : "none",
        }}
      >
        <Bot size={14} />
        Ask ARIA
        {ariaOpen && (
          <span className="w-1.5 h-1.5 rounded-full animate-pulse ml-0.5" style={{ background: "white" }} />
        )}
      </button>

      {/* Bell */}
      <button className="relative p-2 rounded-[10px] hover:bg-surface-3 transition-colors">
        <Bell size={18} color="var(--ink-3)" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: "var(--crit)" }} />
      </button>

      {/* User avatar + logout */}
      <div className="flex items-center gap-1.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold"
          style={{ background: "var(--primary)" }}
          title={user?.email ?? ""}
        >
          {initials}
        </div>
        <button
          onClick={handleLogout}
          className="p-1.5 rounded-[7px] hover:bg-surface-3 transition-colors"
          title="Sign out"
        >
          <LogOut size={15} color="var(--ink-3)" />
        </button>
      </div>
    </header>
  );
}
