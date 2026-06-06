"use client";
import { X } from "lucide-react";
import { useUIStore } from "@/store/ui-store";

export function ToastRegion() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="fade-in pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-[10px] text-[13.5px] font-medium shadow-pop text-ink min-w-[260px] max-w-[380px]"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: t.variant === "error" ? "var(--crit)" : t.variant === "success" ? "var(--ok)" : "var(--ink)",
          }}
        >
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="text-ink-4 hover:text-ink">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
