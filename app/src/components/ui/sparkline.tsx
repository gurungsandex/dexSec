"use client";

interface SparklineProps {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function Sparkline({ data, color = "var(--primary)", width = 64, height = 24 }: SparklineProps) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <polyline points={pts.join(" ")} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface RingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
}

export function RingChart({ value, size = 64, strokeWidth = 7, color = "var(--primary)", trackColor = "var(--surface-3)" }: RingProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

interface DonutSlice { label: string; value: number; color: string; }

export function DonutChart({ slices, size = 120, strokeWidth = 18 }: { slices: DonutSlice[]; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {slices.map((s, i) => {
        const dash = (s.value / total) * circ;
        const gap = circ - dash;
        const el = (
          <circle
            key={i}
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={s.color} strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
          />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

export function RiskMeter({ score, width = 80, height = 8 }: { score: number; width?: number; height?: number }) {
  const color = score >= 67 ? "var(--crit)" : score >= 50 ? "var(--high)" : score >= 34 ? "var(--med)" : "var(--ok)";
  return (
    <div style={{ width, height, background: "var(--surface-3)", borderRadius: 99, overflow: "hidden" }}>
      <div style={{ width: `${score}%`, height: "100%", background: color, borderRadius: 99 }} />
    </div>
  );
}
