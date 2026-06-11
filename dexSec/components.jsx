/* ============================================================
   Dex Security Cloud — shared UI components
   ============================================================ */
const { useState, useRef, useEffect } = React;

/* ---------- Icon set (stroke, lucide-style) ---------- */
const ICONS = {
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  alert: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  monitor: "M3 4h18v12H3zM8 20h8M12 16v4",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  doc: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M9 13h6M9 17h4",
  box: "M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8",
  patch: "M12 3v12M8 11l4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2",
  report: "M3 3v18h18M7 14l4-4 3 3 5-6",
  plug: "M9 2v6M15 2v6M6 8h12v3a6 6 0 0 1-12 0zM12 17v5",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.2a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 15H4a2 2 0 0 1 0-4h.2a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 11 4.6V4a2 2 0 0 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 0 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  chevron: "M6 9l6 6 6-6",
  chevronR: "M9 18l6-6-6-6",
  plus: "M12 5v14M5 12h14",
  export: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  filter: "M22 3H2l8 9.5V19l4 2v-8.5z",
  check: "M20 6 9 17l-5-5",
  spark: "M12 2l1.8 5.5L19 9l-5.2 1.5L12 16l-1.8-5.5L5 9l5.2-1.5zM19 14l.9 2.6L22 17l-2.1.4L19 20l-.9-2.6L16 17l2.1-.4z",
  isolate: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM5 5l14 14",
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2",
  pulse: "M22 12h-4l-3 9L9 3l-3 9H2",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  cpu: "M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3M5 5h14v14H5zM9 9h6v6H9z",
  windows: "M3 5.5 10.5 4.5v7H3zM3 12.5h7.5v7L3 18.5zM11.5 4.3 21 3v8.5h-9.5zM11.5 12.5H21V21l-9.5-1.3z",
  apple: "M16.5 12c0-2 1.5-3 1.6-3-0.9-1.3-2.3-1.5-2.8-1.5-1.2-.1-2.3.7-2.9.7-.6 0-1.5-.7-2.5-.7-1.3 0-2.5.7-3.1 1.9-1.4 2.3-.4 5.7 1 7.6.6.9 1.4 1.9 2.4 1.9.9 0 1.3-.6 2.4-.6 1.1 0 1.4.6 2.4.6 1 0 1.6-.9 2.2-1.8.7-1 1-2 1-2-.1 0-1.9-.7-1.9-2.8M14 5.5c.5-.6.9-1.5.8-2.5-.8 0-1.7.5-2.3 1.2-.5.5-.9 1.5-.8 2.4.9 0 1.8-.5 2.3-1.1",
  linux: "M12 2c-2 0-3 2-3 4 0 1.5.5 2.5.5 3.5s-2 2.5-2.5 4.5 0 4 .5 5 1.5 1 2 1c1 0 1.5-.5 2.5-.5s1.5.5 2.5.5 1.5 0 2-1 1-3 .5-5-2.5-3.5-2.5-4.5.5-2 .5-3.5c0-2-1-4-3-4z",
  arrowUp: "M12 19V5M5 12l7-7 7 7",
  arrowDown: "M12 5v14M5 12l7 7 7-7",
  download: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3",
  scan: "M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10",
  external: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  fire: "M12 2s4 4 4 8a4 4 0 0 1-8 0c0-1 .5-2 .5-2S6 11 6 14a6 6 0 1 0 12 0c0-5-6-12-6-12z",
};

function Icon({ name, size = 18, stroke = 2, fill = "none", className, style }) {
  const d = ICONS[name] || "";
  const solid = name === "windows" || name === "apple";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className}
      fill={solid ? "currentColor" : "none"} stroke={solid ? "none" : "currentColor"}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d={d} />
    </svg>
  );
}

/* ---------- Severity / status badges ---------- */
function Sev({ level }) {
  return <span className={"sev " + level.toLowerCase()}><i className="sev-dot" />{level}</span>;
}
const STATUS_MAP = {
  "New": "status-new", "Assigned": "status-assigned", "In Progress": "status-progress",
  "Resolved": "status-resolved", "Closed": "status-closed",
};
function StatusTag({ status }) {
  return <span className={"status-tag " + STATUS_MAP[status]}><i className="st-dot" />{status}</span>;
}

/* ---------- Tenant avatar ---------- */
function TenantAvatar({ tenant, size = 30, radius = 8 }) {
  return (
    <div className="tenant-avatar" style={{ width: size, height: size, borderRadius: radius, background: tenant.color, fontSize: size * 0.4 }}>
      {tenant.short}
    </div>
  );
}

/* ---------- Tenant switcher ---------- */
function TenantSwitcher({ tenants, current, onSelect }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);
  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const isAll = current === "all";
  const cur = isAll ? null : tenants.find(t => t.id === current);
  const filtered = tenants.filter(t => t.name.toLowerCase().includes(q.toLowerCase()) || t.industry.toLowerCase().includes(q.toLowerCase()));
  const totalEps = tenants.reduce((s, t) => s + t.endpoints, 0);

  return (
    <div className="tenant-switch" ref={ref}>
      <button className={"tenant-trigger" + (open ? " open" : "")} onClick={() => setOpen(o => !o)}>
        {isAll ? (
          <div className="tenant-avatar" style={{ background: "linear-gradient(140deg,#11151D,#39414F)" }}>
            <Icon name="grid" size={15} stroke={2.2} />
          </div>
        ) : <TenantAvatar tenant={cur} />}
        <div className="tenant-meta">
          <b>{isAll ? "All Clients" : cur.name}</b>
          <span>{isAll ? tenants.length + " tenants · " + totalEps.toLocaleString() + " endpoints" : cur.industry + " · " + cur.region}</span>
        </div>
        <Icon name="chevron" size={16} className="chev" />
      </button>
      {open && (
        <div className="tenant-menu">
          <div className="tenant-search">
            <Icon name="search" size={15} style={{ color: "var(--ink-4)" }} />
            <input autoFocus placeholder="Search clients…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="tenant-list">
            <button className={"tenant-item" + (isAll ? " active" : "")} onClick={() => { onSelect("all"); setOpen(false); }}>
              <div className="tenant-avatar" style={{ background: "linear-gradient(140deg,#11151D,#39414F)" }}>
                <Icon name="grid" size={15} stroke={2.2} />
              </div>
              <div className="ti-meta">
                <b>All Clients</b>
                <span>Portfolio-wide aggregate view</span>
              </div>
              <div className="ti-right"><span className="ti-eps mono">{totalEps.toLocaleString()}</span></div>
            </button>
            <div className="tenant-group-label">Clients · {filtered.length}</div>
            {filtered.map(t => (
              <button key={t.id} className={"tenant-item" + (current === t.id ? " active" : "")} onClick={() => { onSelect(t.id); setOpen(false); }}>
                <TenantAvatar tenant={t} />
                <div className="ti-meta">
                  <b>{t.name}</b>
                  <span>{t.industry}</span>
                </div>
                <div className="ti-right">
                  <span className="ti-eps mono">{t.endpoints.toLocaleString()}</span>
                  <span className="risk-dot" style={{ background: window.DEX.riskColor(t.risk) }} title={"Risk " + t.risk} />
                </div>
              </button>
            ))}
            {filtered.length === 0 && <div style={{ padding: "20px", textAlign: "center", color: "var(--ink-4)", fontSize: 13 }}>No clients match.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Top bar ---------- */
function TopBar({ tenants, current, onSelect, onPalette, onAria }) {
  return (
    <>
      <div className="brandcell">
        <div className="logo-mark">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        </div>
        <div className="logo-word"><b>Dex</b><span>SECURITY CLOUD</span></div>
      </div>
      <div className="topbar">
        <TenantSwitcher tenants={tenants} current={current} onSelect={onSelect} />
        <div className="topbar-spacer" />
        <button className="global-search" onClick={onPalette}>
          <Icon name="search" size={15} />
          <span style={{ flex: 1, textAlign: "left", fontSize: 13 }}>Search assets, incidents, IOCs…</span>
          <span className="kbd">⌘K</span>
        </button>
        <button className="aria-btn" onClick={onAria}><Icon name="spark" size={15} className="spark" />Ask ARIA</button>
        <button className="icon-btn"><Icon name="bell" size={18} /><span className="notif-dot" /></button>
        <button className="user-chip">
          <div className="avatar">AO</div>
        </button>
      </div>
    </>
  );
}

/* ---------- Sidebar ---------- */
const NAV = [
  { section: "Operations", items: [
    { id: "overview", label: "Overview", icon: "grid" },
    { id: "incidents", label: "Incidents", icon: "alert", badge: true },
    { id: "soc", label: "SOC Workspace", icon: "users" },
    { id: "endpoints", label: "Endpoints", icon: "monitor" },
  ]},
  { section: "Defense", items: [
    { id: "policies", label: "Policies", icon: "shield" },
    { id: "firewall", label: "Firewall", icon: "lock" },
    { id: "patch", label: "Patch", icon: "patch" },
  ]},
  { section: "Manage", items: [
    { id: "assets", label: "Assets", icon: "box" },
    { id: "reports", label: "Reports", icon: "report" },
    { id: "integrations", label: "Integrations", icon: "plug" },
    { id: "audit", label: "Audit Log", icon: "list" },
  ]},
];

function Sidebar({ active, onNav, openIncidents, scopeLabel }) {
  return (
    <aside className="sidebar">
      {NAV.map(group => (
        <div key={group.section}>
          <div className="nav-section-label">{group.section}</div>
          {group.items.map(it => (
            <button key={it.id} className={"nav-item" + (active === it.id ? " active" : "")} onClick={() => onNav(it.id)}>
              <Icon name={it.icon} size={17} stroke={active === it.id ? 2.3 : 2} />
              {it.label}
              {it.badge && openIncidents > 0 && <span className="nav-badge">{openIncidents}</span>}
            </button>
          ))}
        </div>
      ))}
      <div className="nav-spacer" />
      <div className="sidebar-card">
        <div className="sc-top"><Icon name="shield" size={15} style={{ color: "var(--ok)" }} />Coverage healthy</div>
        <p>{scopeLabel} · agents reporting normally. Last sync 42s ago.</p>
        <div className="sc-bar"><i style={{ width: "97%" }} /></div>
      </div>
      <button className="nav-item" onClick={() => onNav("settings")} style={{ marginTop: 4 }}>
        <Icon name="gear" size={17} />Settings
      </button>
    </aside>
  );
}

/* ---------- KPI tile ---------- */
function Kpi({ label, icon, iconColor, iconBg, value, unit, delta, deltaGood, foot, spark, sparkColor }) {
  let cls = "delta flat";
  if (delta != null && delta !== 0) {
    const positive = delta > 0;
    cls = "delta " + (positive ? (deltaGood ? "good-up" : "bad-up") : (deltaGood ? "bad-up" : "good-up"));
  }
  return (
    <div className="kpi">
      <div className="kpi-label">
        {icon && <span className="ic" style={{ background: iconBg, color: iconColor }}><Icon name={icon} size={15} /></span>}
        {label}
      </div>
      <div className="kpi-val">{value}{unit && <small> {unit}</small>}</div>
      <div className="kpi-foot">
        {delta != null && (
          <span className={cls}>
            <Icon name={delta > 0 ? "arrowUp" : delta < 0 ? "arrowDown" : "pulse"} size={12} stroke={2.4} />
            {delta > 0 ? "+" : ""}{delta}{typeof delta === "number" && foot && foot.pct ? "%" : ""}
          </span>
        )}
        <span>{foot && foot.text}</span>
      </div>
      {spark && <div className="kpi-spark"><Sparkline data={spark} color={sparkColor || "var(--primary)"} w={76} h={26} /></div>}
    </div>
  );
}

/* ---------- Risk meter (inline table) ---------- */
function RiskMeter({ value }) {
  const col = window.DEX.riskColor(value);
  return (
    <div className="riskmeter">
      <div className="rm-track"><div className="rm-fill" style={{ width: value + "%", background: col }} /></div>
      <span className="rm-val" style={{ color: col }}>{value}</span>
    </div>
  );
}

/* ---------- Sev dot cluster ---------- */
function SevDots({ critical, high, total }) {
  return (
    <div className="sevdots">
      {critical > 0 && <span className="sd"><i style={{ background: "var(--crit)" }} />{critical}</span>}
      {high > 0 && <span className="sd"><i style={{ background: "var(--high)" }} />{high}</span>}
      <span className="sd" style={{ color: "var(--ink-4)" }}>· {total} open</span>
    </div>
  );
}

/* ---------- Tenant tag (cross-tenant rows) ---------- */
function TenantTag({ tenant }) {
  return (
    <span className="ttag">
      <span className="tt-av" style={{ background: tenant.color }}>{tenant.short}</span>
      {tenant.name}
    </span>
  );
}

/* ---------- Assignee ---------- */
function avColor(name) {
  const colors = ["#3052E6", "#6B4FE0", "#0E9389", "#EE7117", "#0EA5E9", "#C99400", "#E5484D"];
  let h = 0; for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}
function Assignee({ name }) {
  if (!name) return <span className="muted" style={{ fontSize: 12.5, fontStyle: "italic" }}>Unassigned</span>;
  const initials = name.split(/[ .]/).filter(Boolean).map(s => s[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="assignee">
      <span className="av-sm" style={{ background: avColor(name) }}>{initials}</span>
      <span style={{ fontSize: 12.5, color: "var(--ink-2)", fontWeight: 500 }}>{name}</span>
    </span>
  );
}

function OsIcon({ os }) {
  const map = { Windows: "windows", macOS: "apple", Linux: "linux" };
  return <span className="os-ic"><Icon name={map[os] || "monitor"} size={15} /></span>;
}

Object.assign(window, {
  Icon, Sev, StatusTag, TenantAvatar, TenantSwitcher, TopBar, Sidebar, NAV,
  Kpi, RiskMeter, SevDots, TenantTag, Assignee, OsIcon, avColor,
});
