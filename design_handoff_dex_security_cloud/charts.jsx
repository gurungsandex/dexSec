/* ============================================================
   Dex Security Cloud — SVG charts
   ============================================================ */
const { useState: _cuseState } = React;

/* ---- Sparkline ---- */
function Sparkline({ data, w = 88, h = 28, color = "#3052E6", fill = true, strokeW = 1.6 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - 2 - ((v - min) / range) * (h - 4);
    return [x, y];
  });
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = line + ` L ${w} ${h} L 0 ${h} Z`;
  const gid = "sg" + Math.random().toString(36).slice(2, 7);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block", overflow: "visible" }}>
      {fill && (
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth={strokeW} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.4" fill={color} />
    </svg>
  );
}

/* ---- Donut ---- */
function Donut({ segments, size = 168, thickness = 22, center, centerSub, gap = 0.018 }) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const arcs = segments.map((seg, i) => {
    const frac = seg.value / total;
    const len = Math.max(0, frac - gap) * circ;
    const dash = `${len} ${circ - len}`;
    const dashOffset = -offset * circ + circ * 0.25;
    offset += frac;
    return (
      <circle key={i} cx={c} cy={c} r={r} fill="none"
        stroke={seg.color} strokeWidth={thickness}
        strokeDasharray={dash} strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: "stroke-dasharray .5s ease" }} />
    );
  });
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="#EFF1F5" strokeWidth={thickness} />
        {arcs}
      </svg>
      {center !== undefined && (
        <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
          <div>
            <div className="mono" style={{ fontSize: size * 0.2, fontWeight: 600, color: "var(--ink)", lineHeight: 1, letterSpacing: "-.02em" }}>{center}</div>
            {centerSub && <div style={{ fontSize: 11.5, color: "var(--ink-4)", fontWeight: 600, marginTop: 5 }}>{centerSub}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Radial gauge (0-100 risk) ---- */
function RiskGauge({ value, size = 196, thickness = 16 }) {
  const r = (size - thickness) / 2;
  const c = size / 2;
  const startAngle = 135, sweep = 270;
  const circ = 2 * Math.PI * r;
  const arcFrac = sweep / 360;
  const col = window.DEX.riskColor(value);
  const valFrac = (value / 100) * arcFrac;
  const trackDash = `${arcFrac * circ} ${circ}`;
  const valDash = `${valFrac * circ} ${circ}`;
  const rot = startAngle;
  // ticks
  const ticks = [];
  for (let i = 0; i <= 10; i++) {
    const ang = (startAngle + (sweep * i / 10)) * Math.PI / 180;
    const inner = r - thickness / 2 - 6;
    const outer = r - thickness / 2 - 2;
    ticks.push(
      <line key={i}
        x1={c + Math.cos(ang) * inner} y1={c + Math.sin(ang) * inner}
        x2={c + Math.cos(ang) * outer} y2={c + Math.sin(ang) * outer}
        stroke="#D8DDE6" strokeWidth="1.5" />
    );
  }
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="#EFF1F5" strokeWidth={thickness}
          strokeDasharray={trackDash} strokeLinecap="round"
          transform={`rotate(${rot} ${c} ${c})`} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={col} strokeWidth={thickness}
          strokeDasharray={valDash} strokeLinecap="round"
          transform={`rotate(${rot} ${c} ${c})`}
          style={{ transition: "stroke-dasharray .6s cubic-bezier(.2,.8,.2,1)" }} />
        {ticks}
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <div className="mono" style={{ fontSize: 46, fontWeight: 600, color: "var(--ink)", lineHeight: 1, letterSpacing: "-.03em" }}>{value}</div>
          <div style={{ fontSize: 12, fontWeight: 700, color: col, marginTop: 4, letterSpacing: ".02em" }}>{window.DEX.riskLabel(value).toUpperCase()} RISK</div>
          <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 3 }}>0–100 composite</div>
        </div>
      </div>
    </div>
  );
}

/* ---- Progress ring (patch compliance) ---- */
function Ring({ value, size = 132, thickness = 13, color = "#18935A", label, sub }) {
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = `${(value / 100) * circ} ${circ}`;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="#EFF1F5" strokeWidth={thickness} />
        <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={thickness}
          strokeDasharray={dash} strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`}
          style={{ transition: "stroke-dasharray .6s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <div className="mono" style={{ fontSize: size * 0.24, fontWeight: 600, color: "var(--ink)", lineHeight: 1 }}>{label}</div>
          {sub && <div style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 4, fontWeight: 600 }}>{sub}</div>}
        </div>
      </div>
    </div>
  );
}

/* ---- Area / line chart (incident trend) ---- */
function AreaChart({ data, w = 560, h = 180, color = "#3052E6", labels }) {
  const padL = 30, padB = 22, padT = 14, padR = 8;
  const iw = w - padL - padR, ih = h - padB - padT;
  const max = Math.max(...data, 4);
  const niceMax = Math.ceil(max / 4) * 4;
  const pts = data.map((v, i) => {
    const x = padL + (i / (data.length - 1)) * iw;
    const y = padT + ih - (v / niceMax) * ih;
    return [x, y];
  });
  // smooth path
  function smooth(points) {
    if (points.length < 2) return "";
    let d = `M ${points[0][0]} ${points[0][1]}`;
    for (let i = 0; i < points.length - 1; i++) {
      const [x0, y0] = points[i], [x1, y1] = points[i + 1];
      const cx = (x0 + x1) / 2;
      d += ` C ${cx} ${y0} ${cx} ${y1} ${x1} ${y1}`;
    }
    return d;
  }
  const line = smooth(pts);
  const area = line + ` L ${pts[pts.length - 1][0]} ${padT + ih} L ${pts[0][0]} ${padT + ih} Z`;
  const gid = "ac" + Math.random().toString(36).slice(2, 7);
  const gridY = [0, 0.25, 0.5, 0.75, 1].map(f => padT + ih - f * ih);
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridY.map((y, i) => (
        <line key={i} x1={padL} y1={y} x2={w - padR} y2={y} stroke="#EFF1F5" strokeWidth="1" />
      ))}
      {[0, 0.5, 1].map((f, i) => (
        <text key={i} x={padL - 7} y={padT + ih - f * ih + 3} textAnchor="end" fontSize="9.5" fill="#98A0AD" fontFamily="var(--mono)">{Math.round(f * niceMax)}</text>
      ))}
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {pts.map((p, i) => (i === pts.length - 1 ? <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill={color} stroke="#fff" strokeWidth="1.5" /> : null))}
      {labels && labels.map((l, i) => (
        <text key={i} x={padL + (i / (labels.length - 1)) * iw} y={h - 6} textAnchor="middle" fontSize="9.5" fill="#98A0AD" fontFamily="var(--mono)">{l}</text>
      ))}
    </svg>
  );
}

/* ---- Horizontal bar (per-tenant compare) ---- */
function HBar({ value, max = 100, color = "#3052E6", h = 7, track = "#EFF1F5", w }) {
  return (
    <div style={{ width: w || "100%", height: h, background: track, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: Math.min(100, (value / max) * 100) + "%", height: "100%", background: color, borderRadius: 4, transition: "width .5s ease" }} />
    </div>
  );
}

Object.assign(window, { Sparkline, Donut, RiskGauge, Ring, AreaChart, HBar });
