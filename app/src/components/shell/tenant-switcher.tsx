"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Globe } from "lucide-react";
import { TENANTS } from "@/lib/mock-data";
import { useUIStore } from "@/store/ui-store";

function TenantAvatar({ short, color, size = 28 }: { short: string; color: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-[7px] text-white font-bold text-[11px] shrink-0"
      style={{ width: size, height: size, background: color }}
    >
      {short}
    </div>
  );
}

export function TenantSwitcher() {
  const { scope, setScope } = useUIStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = scope === "all" ? null : TENANTS.find((t) => t.id === scope);
  const filtered = TENANTS.filter((t) =>
    !query || t.name.toLowerCase().includes(query.toLowerCase()) || t.industry.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] hover:bg-surface-3 transition-colors"
      >
        {current ? (
          <TenantAvatar short={current.short} color={current.color} />
        ) : (
          <div className="w-7 h-7 rounded-[7px] flex items-center justify-center" style={{ background: "var(--primary-tint)" }}>
            <Globe size={14} color="var(--primary)" />
          </div>
        )}
        <div className="text-left">
          <div className="text-[13px] font-semibold leading-none" style={{ color: "var(--ink)" }}>
            {current ? current.name : "All Clients"}
          </div>
          <div className="text-[11px] leading-none mt-0.5" style={{ color: "var(--ink-4)" }}>
            {current ? current.tier : "Portfolio view"}
          </div>
        </div>
        <ChevronDown size={14} color="var(--ink-4)" className={`ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-1 w-80 rounded-[13px] shadow-pop overflow-hidden z-50"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="p-2 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-[7px]" style={{ background: "var(--surface-3)" }}>
              <Search size={13} color="var(--ink-4)" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search clients…"
                className="flex-1 bg-transparent text-[13px] outline-none"
                style={{ color: "var(--ink)" }}
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-80">
            {/* All clients option */}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-2 transition-colors text-left"
              onClick={() => { setScope("all"); setOpen(false); setQuery(""); }}
            >
              <div className="w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0" style={{ background: "var(--primary-tint)" }}>
                <Globe size={13} color="var(--primary)" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold" style={{ color: "var(--ink)" }}>All Clients</div>
                <div className="text-[11px]" style={{ color: "var(--ink-4)" }}>Portfolio view</div>
              </div>
              {scope === "all" && (
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--primary)" }} />
              )}
            </button>
            {/* Divider */}
            <div className="my-1 border-t" style={{ borderColor: "var(--border-faint)" }} />
            {filtered.map((t) => (
              <button
                key={t.id}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-surface-2 transition-colors text-left"
                onClick={() => { setScope(t.id); setOpen(false); setQuery(""); }}
              >
                <TenantAvatar short={t.short} color={t.color} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold truncate" style={{ color: "var(--ink)" }}>{t.name}</div>
                  <div className="text-[11px]" style={{ color: "var(--ink-4)" }}>{t.industry} · {t.endpoints} endpoints</div>
                </div>
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: t.risk >= 67 ? "var(--crit)" : t.risk >= 50 ? "var(--high)" : t.risk >= 34 ? "var(--med)" : "var(--ok)" }}
                />
                {scope === t.id && (
                  <div className="w-1.5 h-1.5 rounded-full ml-1" style={{ background: "var(--primary)" }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
