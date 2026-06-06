"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Search, AlertTriangle, Laptop, Users, LayoutDashboard } from "lucide-react";
import { useUIStore } from "@/store/ui-store";
import { useTenants, useIncidents, useEndpoints } from "@/lib/hooks";
import type { Tenant, Incident, Endpoint } from "@/lib/supabase/types";

interface Result {
  id: string;
  label: string;
  sub: string;
  icon: React.ReactNode;
  action: () => void;
}

function PaletteInner({ onClose }: { onClose: () => void }) {
  const { setScope, setNav, openIncidentDrawer, openEndpointDrawer } = useUIStore();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { data: tenantsData = [] } = useTenants();
  const { data: incidentsData = [] } = useIncidents("all");
  const { data: endpointsData = [] } = useEndpoints("all");
  const tenants = tenantsData as Tenant[];
  const incidents = incidentsData as Incident[];
  const endpoints = endpointsData as Endpoint[];

  useEffect(() => {
    const id = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(id);
  }, []);

  const q = query.toLowerCase();

  const results: Result[] = [
    ...tenants
      .filter((t) => !q || t.name.toLowerCase().includes(q) || (t.industry ?? "").toLowerCase().includes(q))
      .map((t) => ({
        id: `tenant-${t.id}`,
        label: t.name,
        sub: t.industry ?? t.status,
        icon: <Users size={14} />,
        action: () => { setScope(t.id); setNav("overview"); onClose(); },
      })),
    ...incidents
      .filter((i) => !q || i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q))
      .slice(0, 4)
      .map((i) => ({
        id: `inc-${i.id}`,
        label: `${i.id} — ${i.title}`,
        sub: i.severity,
        icon: <AlertTriangle size={14} />,
        action: () => { setNav("incidents"); openIncidentDrawer(i.id); onClose(); },
      })),
    ...endpoints
      .filter((e) => !q || e.hostname.toLowerCase().includes(q) || (e.ip_address ?? "").includes(q))
      .slice(0, 3)
      .map((e) => ({
        id: `ep-${e.id}`,
        label: e.hostname,
        sub: e.ip_address ?? "",
        icon: <Laptop size={14} />,
        action: () => { setNav("endpoints"); openEndpointDrawer(e.id); onClose(); },
      })),
    ...(!q || "overview".includes(q) ? [{
      id: "nav-overview", label: "Overview", sub: "Navigation",
      icon: <LayoutDashboard size={14} />,
      action: () => { setNav("overview"); onClose(); },
    }] : []),
  ].slice(0, 8);

  const stateRef = useRef({ results, selected });
  useEffect(() => {
    stateRef.current = { results, selected };
  });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowDown") { setSelected((s) => Math.min(s + 1, stateRef.current.results.length - 1)); return; }
      if (e.key === "ArrowUp") { setSelected((s) => Math.max(0, s - 1)); return; }
      if (e.key === "Enter") { stateRef.current.results[stateRef.current.selected]?.action(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3.5 border-b" style={{ borderColor: "var(--border)" }}>
        <Search size={16} color="var(--ink-4)" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
          placeholder="Search clients, incidents, endpoints…"
          className="flex-1 text-[14px] outline-none"
          style={{ color: "var(--ink)", background: "transparent" }}
        />
        <kbd className="text-[11px] px-1.5 py-0.5 rounded-[5px]"
          style={{ background: "var(--surface-3)", border: "1px solid var(--border)", color: "var(--ink-4)" }}>
          Esc
        </kbd>
      </div>
      <div className="py-1.5 max-h-80 overflow-y-auto">
        {results.length === 0 && (
          <div className="px-4 py-8 text-center text-[13px]" style={{ color: "var(--ink-4)" }}>No results</div>
        )}
        {results.map((r, i) => (
          <button
            key={r.id}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors"
            style={{ background: i === selected ? "var(--primary-tint)" : "transparent" }}
            onClick={r.action}
            onMouseEnter={() => setSelected(i)}
          >
            <span style={{ color: "var(--ink-4)" }}>{r.icon}</span>
            <span className="flex-1 text-[13.5px] font-medium" style={{ color: "var(--ink)" }}>{r.label}</span>
            <span className="text-[12px]" style={{ color: "var(--ink-4)" }}>{r.sub}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export function CommandPalette() {
  const { commandPaletteOpen, closeCommandPalette } = useUIStore();

  const handleGlobalKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      const { commandPaletteOpen: isOpen, openCommandPalette, closeCommandPalette: close } = useUIStore.getState();
      if (isOpen) { close(); } else { openCommandPalette(); }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKey);
    return () => document.removeEventListener("keydown", handleGlobalKey);
  }, [handleGlobalKey]);

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] flex items-start justify-center pt-[15vh]" onClick={closeCommandPalette}>
      <div className="absolute inset-0" style={{ background: "rgba(17,21,29,.4)" }} />
      <div
        className="relative w-full max-w-[560px] rounded-[13px] overflow-hidden shadow-pop fade-in"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <PaletteInner key={String(commandPaletteOpen)} onClose={closeCommandPalette} />
      </div>
    </div>
  );
}
