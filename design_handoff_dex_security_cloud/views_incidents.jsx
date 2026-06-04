/* ============================================================
   Dex Security Cloud — Incidents (live)
   ============================================================ */

/* ---------- Assignee dropdown ---------- */
function AssignMenu({ current, onAssign, align = "left" }) {
  const D = window.DEX;
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button className="btn" style={{ width: "100%", justifyContent: "center" }} onClick={() => setOpen(o => !o)}>
        <Icon name="users" size={16} />{current ? "Reassign" : "Assign"}
      </button>
      {open && (
        <div className="menu-pop" style={{ [align]: 0 }}>
          <div className="menu-label">On-call analysts</div>
          {D.roster.filter(r => r.oncall).map(r => (
            <button key={r.name} className="menu-item" onClick={() => { onAssign(r.name); setOpen(false); }}>
              <span className="av-sm" style={{ background: avColor(r.name) }}>{r.name.split(/[ .]/).filter(Boolean).map(s => s[0]).slice(0, 2).join("")}</span>
              <span style={{ flex: 1 }}><b style={{ fontSize: 13, color: "var(--ink)" }}>{r.name}</b><span style={{ display: "block", fontSize: 11, color: "var(--ink-4)" }}>{r.tier}</span></span>
              {current === r.name && <Icon name="check" size={15} style={{ color: "var(--primary)" }} />}
            </button>
          ))}
          <div className="menu-label">Available</div>
          {D.roster.filter(r => !r.oncall).map(r => (
            <button key={r.name} className="menu-item" onClick={() => { onAssign(r.name); setOpen(false); }}>
              <span className="av-sm" style={{ background: avColor(r.name) }}>{r.name.split(/[ .]/).filter(Boolean).map(s => s[0]).slice(0, 2).join("")}</span>
              <span style={{ flex: 1 }}><b style={{ fontSize: 13, color: "var(--ink)" }}>{r.name}</b><span style={{ display: "block", fontSize: 11, color: "var(--ink-4)" }}>{r.tier}</span></span>
              {current === r.name && <Icon name="check" size={15} style={{ color: "var(--primary)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Status dropdown ---------- */
function StatusMenu({ current, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const opts = ["New", "Assigned", "In Progress", "Resolved", "Closed"];
  React.useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button className="btn" style={{ width: "100%", justifyContent: "center" }} onClick={() => setOpen(o => !o)}>
        <StatusTag status={current} /><Icon name="chevron" size={14} style={{ marginLeft: 2 }} />
      </button>
      {open && (
        <div className="menu-pop" style={{ left: 0 }}>
          {opts.map(o => (
            <button key={o} className="menu-item" onClick={() => { onChange(o); setOpen(false); }}>
              <StatusTag status={o} />
              {current === o && <Icon name="check" size={15} style={{ marginLeft: "auto", color: "var(--primary)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Incidents queue ---------- */
function IncidentsView() {
  const { state, openIncident } = useStore();
  const D = window.DEX;
  const [sevFilter, setSevFilter] = React.useState("All");
  const [statusFilter, setStatusFilter] = React.useState("Open");
  const [q, setQ] = React.useState("");

  const tenant = state.scope === "all" ? null : D.tenants.find(t => t.id === state.scope);
  let list = scopedIncidents(state);
  const counts = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  list.forEach(i => { if (counts[i.sev] != null) counts[i.sev]++; });

  let filtered = list.filter(i => {
    if (sevFilter !== "All" && i.sev !== sevFilter) return false;
    if (statusFilter === "Open" && (i.status === "Closed" || i.status === "Resolved")) return false;
    if (statusFilter === "Resolved" && i.status !== "Resolved" && i.status !== "Closed") return false;
    if (q && !(i.id.toLowerCase().includes(q.toLowerCase()) || i.title.toLowerCase().includes(q.toLowerCase()) || i.asset.toLowerCase().includes(q.toLowerCase()) || i.ttp.join(" ").toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });
  filtered.sort((a, b) => D.sevRank[a.sev] - D.sevRank[b.sev]);

  return (
    <div className="main-inner fade-in">
      <div className="page-head">
        <div className="ph-left">
          <h1 className="page-title">Incident Queue</h1>
          <p className="page-sub">{state.scope === "all" ? "All clients" : tenant.name} · prioritized by severity &amp; SLA · NIST SP 800-61r2 workflow</p>
        </div>
        <div className="ph-right">
          <div className="search-inline">
            <Icon name="search" size={15} />
            <input placeholder="Filter incidents…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <button className="btn"><Icon name="export" size={16} />Export</button>
        </div>
      </div>

      <div className="filterbar">
        {["All", "Critical", "High", "Medium", "Low"].map(s => (
          <button key={s} className={"fbtn" + (sevFilter === s ? " active" : "")} onClick={() => setSevFilter(s)}>
            {s !== "All" && <span className="risk-dot" style={{ background: D.sevColor[s] || "var(--ink-4)" }} />}
            {s}{s !== "All" && <span className="cnt">{counts[s]}</span>}
          </button>
        ))}
        <div className="filter-divider" />
        {["Open", "Resolved", "All"].map(s => (
          <button key={s} className={"fbtn" + (statusFilter === s ? " active" : "")} onClick={() => setStatusFilter(s)}>{s}</button>
        ))}
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: "6px 6px" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>ID</th><th>Severity</th><th>Incident</th>
                {state.scope === "all" && <th>Client</th>}
                <th>Asset</th><th>MITRE TTP</th><th>Status</th><th>Assignee</th><th>Age</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inc => {
                const t = D.tenants.find(x => x.id === inc.tenant);
                return (
                  <tr key={inc.id} className="clickable" onClick={() => openIncident(inc.id)}>
                    <td className="t-num" style={{ color: "var(--ink-4)" }}>{inc.id}</td>
                    <td><Sev level={inc.sev} /></td>
                    <td className="td-strong" style={{ maxWidth: 340 }}>{inc.title}</td>
                    {state.scope === "all" && <td><TenantTag tenant={t} /></td>}
                    <td className="t-num">{inc.asset}</td>
                    <td><span className="chip ttp">{inc.ttp[0]}</span></td>
                    <td><StatusTag status={inc.status} /></td>
                    <td><Assignee name={inc.assignee} /></td>
                    <td className="t-num muted nowrap">{inc.age}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={state.scope === "all" ? 9 : 8} style={{ textAlign: "center", padding: 40, color: "var(--ink-4)" }}>No incidents match these filters.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------- Incident detail drawer (live) ---------- */
function IncidentDrawer() {
  const { state, dispatch, ui, toast, openPlaybook } = useStore();
  const D = window.DEX;
  const incId = state.ui.incidentId;
  const inc = state.incidents.find(i => i.id === incId);
  React.useEffect(() => {
    function onKey(e) { if (e.key === "Escape") ui({ incidentId: null }); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  if (!inc) return null;
  const t = D.tenants.find(x => x.id === inc.tenant);
  const timeline = D.incTimeline(inc);
  const iocs = D.incIOCs(inc);
  const actions = D.incActions(inc);
  const tlColor = { detect: "var(--crit)", correlate: "var(--primary)", enrich: "var(--teal)", assign: "var(--violet)", queue: "var(--med)" };

  const pbMatch = inc.title.toLowerCase().includes("ransom") ? "pb-ransom" : inc.title.toLowerCase().includes("phish") ? "pb-phish" : inc.title.toLowerCase().includes("exfil") ? "pb-exfil" : "pb-ransom";

  function assign(name) { dispatch({ type: "assign", id: inc.id, assignee: name }); toast("Assigned to " + name, "ok", inc.id + " · status set to Assigned"); }
  function setStatus(s) { dispatch({ type: "incStatus", id: inc.id, status: s }); toast("Status → " + s, "info", inc.id); }
  function isolate() { toast("Isolating " + inc.asset, "isolate", "Host quarantined from network"); dispatch({ type: "incStatus", id: inc.id, status: "In Progress" }); }

  return (
    <>
      <div className="drawer-scrim" onClick={() => ui({ incidentId: null })} />
      <div className="drawer">
        <div className="drawer-head">
          <div className="dh-top">
            <Sev level={inc.sev} />
            <span className="dh-id">{inc.id}</span>
            <span className="dotsep" />
            <StatusTag status={inc.status} />
            <button className="icon-btn" style={{ marginLeft: "auto" }} onClick={() => ui({ incidentId: null })}>
              <Icon name="plus" size={20} style={{ transform: "rotate(45deg)" }} />
            </button>
          </div>
          <h2>{inc.title}</h2>
          <div className="dh-meta">
            <TenantTag tenant={t} />
            <span className="dotsep" />
            <span className="pill"><Icon name="target" size={13} />CVSS {inc.cvss}</span>
            {inc.ttp.map(tp => <span key={tp} className="chip ttp">{tp}</span>)}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <div style={{ flex: 1 }}><AssignMenu current={inc.assignee} onAssign={assign} /></div>
            <div style={{ flex: 1 }}><StatusMenu current={inc.status} onChange={setStatus} /></div>
          </div>
          {inc.assignee && <div style={{ marginTop: 10, fontSize: 12, color: "var(--ink-3)", display: "flex", alignItems: "center", gap: 7 }}>Owned by <Assignee name={inc.assignee} /></div>}
        </div>

        <div className="drawer-body">
          <div className="d-section">
            <h4>Affected Asset</h4>
            <div className="kv">
              <span className="kv-k">Hostname</span><span className="kv-v mono">{inc.asset}</span>
              <span className="kv-k">IP address</span><span className="kv-v mono">{inc.assetIp}</span>
              <span className="kv-k">Client</span><span className="kv-v">{t.name} · {t.industry}</span>
              <span className="kv-k">Detection</span><span className="kv-v">{inc.detected}</span>
              <span className="kv-k">ATT&CK</span><span className="kv-v">{inc.ttp.join(", ")} — {inc.ttpName}</span>
            </div>
          </div>

          <div className="d-section">
            <h4>Timeline</h4>
            <div className="timeline">
              {timeline.map((ev, i) => (
                <div className="tl-item" key={i}>
                  <div className="tl-dot"><i style={{ background: tlColor[ev.kind] || "var(--ink-4)" }} /></div>
                  <div className="tl-body">
                    <div className="tl-title">{ev.title}</div>
                    <div className="tl-time">{ev.time}</div>
                    <div className="tl-desc">{ev.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="d-section">
            <h4>Correlated IOCs</h4>
            {iocs.map((io, i) => (
              <div className="ioc-row" key={i}>
                <span className="ioc-type">{io.type}</span>
                <span className="ioc-val">{io.val}</span>
              </div>
            ))}
          </div>

          <div className="d-section">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <h4 style={{ margin: 0 }}>Recommended Actions</h4>
              <button className="link-btn" style={{ marginLeft: "auto" }} onClick={() => openPlaybook(pbMatch)}>Open playbook<Icon name="chevronR" size={14} /></button>
            </div>
            {actions.now.map((a, i) => <ActionRow key={"n" + i} text={a} tag="now" label="IMMEDIATE" />)}
            {actions.short.map((a, i) => <ActionRow key={"s" + i} text={a} tag="short" label="SHORT-TERM" />)}
            {actions.long.map((a, i) => <ActionRow key={"l" + i} text={a} tag="long" label="LONG-TERM" />)}
          </div>
        </div>

        <div className="drawer-foot">
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={isolate}><Icon name="isolate" size={16} />Isolate asset</button>
          <button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={() => { setStatus("Resolved"); }}><Icon name="check" size={16} />Resolve</button>
          <button className="btn" onClick={() => openPlaybook(pbMatch)}><Icon name="external" size={16} />Playbook</button>
        </div>
      </div>
    </>
  );
}

function ActionRow({ text, tag, label }) {
  const [done, setDone] = React.useState(false);
  return (
    <div className="action-row" onClick={() => setDone(d => !d)} style={{ cursor: "pointer" }}>
      <div className="ar-check" style={done ? { background: "var(--ok)", borderColor: "var(--ok)" } : {}}>{done && <Icon name="check" size={12} stroke={3} style={{ color: "#fff" }} />}</div>
      <div className="ar-text" style={done ? { color: "var(--ink-4)", textDecoration: "line-through" } : {}}>{text}<span className={"ar-tag " + tag}>{label}</span></div>
    </div>
  );
}

/* ---------- Playbook drawer ---------- */
function PlaybookDrawer() {
  const { state, ui } = useStore();
  const D = window.DEX;
  const pb = D.playbooks.find(p => p.id === state.ui.playbookId);
  React.useEffect(() => {
    function onKey(e) { if (e.key === "Escape") ui({ playbookId: null }); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  if (!pb) return null;
  const phaseColor = { "Detection & Analysis": "var(--primary)", "Containment": "var(--crit)", "Eradication": "var(--high)", "Recovery": "var(--teal)", "Post-Incident": "var(--violet)" };
  return (
    <>
      <div className="drawer-scrim" onClick={() => ui({ playbookId: null })} style={{ zIndex: 95 }} />
      <div className="drawer" style={{ zIndex: 96, width: 600 }}>
        <div className="drawer-head">
          <div className="dh-top">
            <span className="pill"><Icon name="external" size={13} />Playbook</span>
            <button className="icon-btn" style={{ marginLeft: "auto" }} onClick={() => ui({ playbookId: null })}>
              <Icon name="plus" size={20} style={{ transform: "rotate(45deg)" }} />
            </button>
          </div>
          <h2>{pb.name}</h2>
          <div className="dh-meta"><span className="muted" style={{ fontSize: 12.5 }}>Source: {pb.source}</span></div>
        </div>
        <div className="drawer-body">
          <div style={{ display: "flex", gap: 6, marginBottom: 22, flexWrap: "wrap" }}>
            {pb.phases.map((ph, i) => (
              <div key={ph} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: phaseColor[ph], background: phaseColor[ph] + "1A", padding: "4px 9px", borderRadius: 20 }}>{i + 1}. {ph}</span>
                {i < pb.phases.length - 1 && <Icon name="chevronR" size={13} style={{ color: "var(--ink-4)" }} />}
              </div>
            ))}
          </div>
          <div className="timeline">
            {pb.steps.map((st, i) => (
              <div className="tl-item" key={i}>
                <div className="tl-dot"><i style={{ background: phaseColor[st.phase] }} /></div>
                <div className="tl-body" style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div className="tl-title">{st.text}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <span className="chip" style={{ background: "var(--surface-3)" }}>{st.role}</span>
                    <span className="muted" style={{ fontSize: 11.5 }}>{st.phase}</span>
                  </div>
                  {st.decision && <div style={{ marginTop: 8, fontSize: 12, color: "var(--high)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6, background: "var(--high-tint)", padding: "7px 10px", borderRadius: 7 }}><Icon name="target" size={13} />{st.decision}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="drawer-foot">
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }}><Icon name="check" size={16} />Run playbook</button>
          <button className="btn"><Icon name="export" size={16} />Export</button>
        </div>
      </div>
    </>
  );
}

Object.assign(window, { IncidentsView, IncidentDrawer, PlaybookDrawer, ActionRow, AssignMenu, StatusMenu });
