"use client";

export function StubView({ title }: { title: string }) {
  return (
    <div className="p-6 fade-in flex flex-col gap-6">
      <h1 className="text-[23px] font-bold tracking-[-0.02em]" style={{ color: "var(--ink)" }}>{title}</h1>
      <div className="flex-1 rounded-[13px] p-12 flex flex-col items-center justify-center gap-3"
        style={{ background: "var(--surface)", border: "1.5px dashed var(--border)" }}>
        <div className="text-[15px] font-semibold" style={{ color: "var(--ink-3)" }}>Coming soon</div>
        <div className="text-[13px]" style={{ color: "var(--ink-4)" }}>This screen is in the build queue per the design handoff.</div>
      </div>
    </div>
  );
}
