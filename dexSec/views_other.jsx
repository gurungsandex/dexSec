/* ============================================================
   Dex Security Cloud — remaining stub modules
   ============================================================ */
const PLACEHOLDERS = {
  integrations: { icon: "plug", title: "Integrations", desc: "Native connectors for Slack, Teams, Jira, ServiceNow, PagerDuty, Splunk, Sentinel, and Chronicle via OAuth 2.0 or API key.",
    items: ["Slack", "Microsoft Teams", "Jira", "ServiceNow", "PagerDuty", "Splunk", "Microsoft Sentinel", "Google Chronicle"] },
  audit: { icon: "list", title: "Audit Log", desc: "Immutable record of every admin action, policy change, and agent event — exportable to CEF, JSON, and syslog for your SIEM." },
  settings: { icon: "gear", title: "Settings", desc: "Tenant configuration, notification routing, escalation rules, exclusion baselines, and role-based access control." },
};

function Placeholder() {
  const { state } = useStore();
  const D = window.DEX;
  const id = state.nav;
  const tenant = state.scope === "all" ? null : D.tenants.find(t => t.id === state.scope);
  const p = PLACEHOLDERS[id] || { icon: "grid", title: id, desc: "" };

  if (id === "integrations") {
    return (
      <div className="main-inner fade-in">
        <div className="page-head">
          <div className="ph-left">
            <h1 className="page-title">Integrations</h1>
            <p className="page-sub">{state.scope === "all" ? "All clients" : tenant.name} · connect your SOC tooling &amp; notification channels</p>
          </div>
        </div>
        <div className="report-type-grid">
          {p.items.map((it, i) => (
            <div className="report-type" key={it} style={{ cursor: "default" }}>
              <div className="rt-ic" style={{ background: i % 3 === 0 ? "var(--primary-tint)" : i % 3 === 1 ? "var(--teal-tint)" : "var(--violet-tint)", color: i % 3 === 0 ? "var(--primary)" : i % 3 === 1 ? "var(--teal)" : "var(--violet)" }}><Icon name="plug" size={18} /></div>
              <div className="rt-name">{it}</div>
              <div style={{ marginTop: 4 }}>{i < 4 ? <span className="pill ok dot">Connected</span> : <button className="btn" style={{ padding: "5px 11px", fontSize: 12 }}>Connect</button>}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="main-inner fade-in">
      <div className="page-head">
        <div className="ph-left">
          <h1 className="page-title">{p.title}</h1>
          <p className="page-sub">{state.scope === "all" ? "All clients" : tenant.name}</p>
        </div>
      </div>
      <div className="card">
        <div className="empty">
          <div className="em-ic"><Icon name={p.icon} size={26} /></div>
          <h3>{p.title}</h3>
          <p>{p.desc}</p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Placeholder });
