"use client";

export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <path
        d="M15 2L4 7v8c0 6.2 4.7 11.9 11 13 6.3-1.1 11-6.8 11-13V7L15 2z"
        fill="var(--primary)" opacity=".15"
      />
      <path
        d="M15 2L4 7v8c0 6.2 4.7 11.9 11 13 6.3-1.1 11-6.8 11-13V7L15 2z"
        stroke="var(--primary)" strokeWidth="1.5" fill="none"
      />
      <path d="M11 15l3 3 5-5" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <div className="flex flex-col leading-none">
      <span className="text-[15px] font-bold tracking-tight" style={{ color: "var(--ink)" }}>Dex</span>
      <span className="text-[9px] font-semibold tracking-[.14em] uppercase" style={{ color: "var(--ink-3)" }}>Security Cloud</span>
    </div>
  );
}
