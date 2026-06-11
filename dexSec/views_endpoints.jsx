/* ============================================================
   Dex Security Cloud — Endpoints + device detail (live)
   ============================================================ */

function GroupMenu({ current, onChange }) {
  const D = window.DEX;
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const g = D.groups.find(x => x.id === current);
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button className="btn" style={{ width: "100%", justifyContent: "space-between" }} onClick={() => setOpen(o => !o)}>
        <span><Icon name="users" size={15} style={{ marginRight: 7, verticalAlign: "-2px" }} />{g ? g.name : "Unassigned"}</span>
        <Icon name="chevron" size={14} />
      </button>
      {open && (
        <div className="menu-pop" style={{ left: 0, right: 0 }}>
          <div className="menu-label">Policy group</div>
          {D.groups.map(gr => (
            <button key={gr.id} className="menu-item" onClick={() => { onChange(gr.id); setOpen(false); }}>
              <span style={{ flex: 1 }}><b style={{ fontSize: 13, color: "var(--ink)" }}>{gr.name}</b><span style={{ display: "block", fontSize: 11, color: "var(--ink-4)" }}>{gr.desc}</span></span>
              {current === gr.id && <Icon name="check" size={15} style={{ color: "var(--primary)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function statusPill(s) {
  if (s === "online") return <span className="pill ok dot">Online</span>;
  if (s === "atrisk") return <span className="pill warn dot">At risk</span>;
  if (s === "isolated") return <span className="pill danger dot">Isolated</span>;
  return <span className="pill dot" style={{ color: "var(--ink-4)" }}>Offline</span>;
}

function EndpointsView() {
  const { state, openEndpoint } = useStore();
  const D = window.DEX;
  const [statusF, setStatusF] = React.useState("All");
  const [groupF, setGroupF] = React.useState("All");
  const [q, setQ] = React.useState("");
  const tenant = state.scope === "all" ? null : D.tenants.find(t => t.id === state.scope);

  let rows = scopedEndpoints(state);
  const counts = {
    online: rows.filter(r => r.status === "online").length,
    atrisk: rows.filter(r => r.status === "atrisk").length,
    offline: rows.filter(r => r.status === "offline").length,
    isolated: rows.filter(r => r.status === "isolated").length,
  };
  let filtered = rows.filter(e => {
    if (statusF !== "All" && e.status !== statusF) return false;
    if (groupF !== "All" && e.group !== groupF) return false;
    if (q && !(e.host.toLowerCase().includes(q.toLowerCase()) || e.ip.includes(q) || e.user.toLowerCase().includes(q.toLowerCase()) || e.owner.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });

  return (
    <div className="main-inner fade-in">
      <div className="page-head">
        <div className="ph-left">
          <h1 className="page-title">Endpoints</h1>
          <p className="page-sub">{state.scope === "all" ? "All clients" : tenant.name} · {rows.length} managed devices · live agent telemetry</p>
        </div>
        <div className="ph-right">
          <div className="search-inline">
            <Icon name="search" size={15} />
            <input placeholder="Host, IP, user…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <button className="btn"><Icon name="scan" size={16} />Scan all</button>
          <button className="btn btn-primary"><Icon name="download" size={16} />Deploy agent</button>
        </div>
      </div>

      <div className="filterbar">
        <button className={"fbtn" + (statusF === "All" ? " active" : "")} onClick={() => setStatusF("All")}>All<span className="cnt">{rows.length}</span></button>
        <button className={"fbtn" + (statusF === "online" ? " active" : "")} onClick={() => setStatusF("online")}><span className="risk-dot" style={{ background: "var(--ok)" }} />Online<span className="cnt">{counts.online}</span></button>
        <button className={"fbtn" + (statusF === "atrisk" ? " active" : "")} onClick={() => setStatusF("atrisk")}><span className="risk-dot" style={{ background: "var(--high)" }} />At risk<span className="cnt">{counts.atrisk}</span></button>
        <button className={"fbtn" + (statusF === "offline" ? " active" : "")} onClick={() => setStatusF("offline")}><span className="risk-dot" style={{ background: "var(--ink-4)" }} />Offline<span className="cnt">{counts.offline}</span></button>
        {counts.isolated > 0 && <button className={"fbtn" + (statusF === "isolated" ? " active" : "")} onClick={() => setStatusF("isolated")}><span className="risk-dot" style={{ background: "var(--crit)" }} />Isolated<span className="cnt">{counts.isolated}</span></button>}
        <div className="filter-divider" />
        <div className="select-wrap" style={{ width: 180 }}>
          <select className="select" style={{ padding: "7px 32px 7px 12px", fontSize: 12.5 }} value={groupF} onChange={e => setGroupF(e.target.value)}>
            <option value="All">All groups</option>
            {D.groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <Icon name="chevron" size={14} className="select-chev" />
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: "6px 6px" }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Hostname</th><th>OS</th><th>IP address</th><th>User</th>
                {state.scope === "all" && <th>Client</th>}
                <th>Group</th><th>Health</th><th>Status</th><th>Last seen</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const t = D.tenants.find(x => x.id === e.tenant);
                const g = D.groups.find(x => x.id === e.group);
                return (
                  <tr key={e.id} className="clickable" onClick={() => openEndpoint(e.id)}>
                    <td className="td-strong mono">{e.host}</td>
                    <td><span className="os-cell"><OsIcon os={e.os} />{e.os}</span></td>
                    <td className="t-num">{e.ip}</td>
                    <td className="mono" style={{ fontSize: 12.5 }}>{e.user}</td>
                    {state.scope === "all" && <td><span className="ttag"><span className="tt-av" style={{ background: t.color }}>{t.short}</span></span></td>}
                    <td><span className="chip">{g ? g.name : "—"}</span></td>
                    <td>{e.health == null ? <span className="muted">—</span> : <RiskMeter value={e.health} />}</td>
                    <td>{statusPill(e.status)}</td>
                    <td className="t-num muted nowrap">{e.lastSeen}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={state.scope === "all" ? 9 : 8} style={{ textAlign: "center", padding: 40, color: "var(--ink-4)" }}>No devices match.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------- Endpoint detail drawer ---------- */
function EndpointDrawer() {
  const { state, dispatch, ui, toast, setNav, openPolicy } = useStore();
  const D = window.DEX;
  const e = state.endpoints.find(x => x.id === state.ui.endpointId);
  const [tab, setTab] = React.useState("overview");
  React.useEffect(() => {
    function onKey(ev) { if (ev.key === "Escape") ui({ endpointId: null }); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  React.useEffect(() => { setTab("overview"); }, [state.ui.endpointId]);
  if (!e) return null;
  const t = D.tenants.find(x => x.id === e.tenant);
  const g = D.groups.find(x => x.id === e.group);
  const incForHost = state.incidents.filter(i => i.asset === e.host);
  const statusColor = { online: "var(--ok)", atrisk: "var(--high)", offline: "var(--ink-4)", isolated: "var(--crit)" };

  function setGroup(gid) { dispatch({ type: "endpointGroup", id: e.id, group: gid }); toast("Moved to " + D.groups.find(x => x.id === gid).name, "ok", e.host + " · policies re-applied"); }
  function isolate() {
    if (e.status === "isolated") { dispatch({ type: "endpointStatus", id: e.id, status: "online" }); toast("Released " + e.host, "ok", "Network connectivity restored"); }
    else { dispatch({ type: "endpointStatus", id: e.id, status: "isolated" }); toast("Isolated " + e.host, "isolate", "Quarantined from network"); }
  }
  function scan() { toast("Scan started on " + e.host, "info", "On-demand full scan queued"); }

  return (
    <>
      <div className="drawer-scrim" onClick={() => ui({ endpointId: null })} />
      <div className="drawer" style={{ width: 580 }}>
        <div className="drawer-head">
          <div className="dh-top">
            <span className="host-status"><i style={{ background: statusColor[e.status] }} />{e.status === "atrisk" ? "At risk" : e.status[0].toUpperCase() + e.status.slice(1)}</span>
            <span className="dotsep" />
            <span className="dh-id mono">{e.assetTag}</span>
            <button className="icon-btn" style={{ marginLeft: "auto" }} onClick={() => ui({ endpointId: null })}>
              <Icon name="plus" size={20} style={{ transform: "rotate(45deg)" }} />
            </button>
          </div>
          <h2 className="mono" style={{ fontSize: 19 }}>{e.host}</h2>
          <div className="dh-meta">
            <span className="os-cell"><OsIcon os={e.os} />{e.os} {e.osVer}</span>
            <span className="dotsep" />
            <TenantTag tenant={t} />
            {e.health != null && <><span className="dotsep" /><span className="pill"><Icon name="pulse" size={13} />Health {e.health}</span></>}
          </div>
          <div className="seg full" style={{ marginTop: 16 }}>
            {["overview", "software", "network", "actions"].map(tb => (
              <button key={tb} className={tab === tb ? "active" : ""} onClick={() => setTab(tb)}>{tb[0].toUpperCase() + tb.slice(1)}</button>
            ))}
          </div>
        </div>

        <div className="drawer-body">
          {tab === "overview" && (
            <>
              <div className="d-section">
                <h4>Device</h4>
                <div className="profile-grid">
                  <Pg k="Owner" v={e.owner} />
                  <Pg k="User account" v={e.user} mono />
                  <Pg k="Department" v={e.dept} />
                  <Pg k="Location" v={e.location} />
                  <Pg k="IP address" v={e.ip} mono />
                  <Pg k="Last seen" v={e.lastSeen} />
                </div>
              </div>
              <div className="d-section">
                <h4>Hardware</h4>
                <div className="profile-grid">
                  <Pg k="CPU" v={e.cpu} />
                  <Pg k="Memory" v={e.ram} />
                  <Pg k="Storage" v={e.disk} />
                  <Pg k="Warranty" v={e.warranty} />
                </div>
              </div>
              <div className="d-section">
                <h4>Policy Group</h4>
                <GroupMenu current={e.group} onChange={setGroup} />
                <div style={{ marginTop: 10, fontSize: 12, color: "var(--ink-3)" }}>{g ? g.desc : ""} · inherits all policies & firewall rules deployed to this group.</div>
              </div>
              {incForHost.length > 0 && (
                <div className="d-section">
                  <h4>Open Incidents · {incForHost.length}</h4>
                  {incForHost.map(i => (
                    <div key={i.id} className="ioc-row" style={{ cursor: "pointer" }} onClick={() => { ui({ endpointId: null }); setTimeout(() => ui({ incidentId: i.id }), 60); }}>
                      <Sev level={i.sev} />
                      <span style={{ fontSize: 12.5, color: "var(--ink)", flex: 1 }}>{i.title}</span>
                      <Icon name="chevronR" size={15} style={{ color: "var(--ink-4)" }} />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "software" && (
            <>
              <div className="d-section">
                <h4>Patch status</h4>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: e.patchStatus === "Behind" ? "var(--high-tint)" : "var(--ok-tint)", borderRadius: 10 }}>
                  <Icon name="patch" size={20} style={{ color: e.patchStatus === "Behind" ? "var(--high)" : "var(--ok)" }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{e.patchStatus === "Behind" ? "Updates available" : "Up to date"}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>{e.patchStatus === "Behind" ? "3 security patches pending deployment" : "All patches applied · last 24h"}</div>
                  </div>
                  {e.patchStatus === "Behind" && <button className="btn btn-primary" onClick={() => toast("Patches deploying to " + e.host, "info")}>Deploy</button>}
                </div>
              </div>
              <div className="d-section">
                <h4>Installed software · {e.software.length}</h4>
                <div className="tag-list">
                  {e.software.map(s => <span key={s} className="chip">{s}</span>)}
                </div>
              </div>
              <div className="d-section">
                <h4>Running processes</h4>
                {e.procs.map(p => (
                  <div key={p} className="ioc-row"><span className="ioc-val mono">{p}</span><span className="muted" style={{ marginLeft: "auto", fontSize: 11.5 }}>running</span></div>
                ))}
              </div>
            </>
          )}

          {tab === "network" && (
            <>
              <div className="d-section">
                <h4>Network</h4>
                <div className="profile-grid">
                  <Pg k="IP address" v={e.ip} mono />
                  <Pg k="Active connections" v={String(e.connections)} mono />
                  <Pg k="Firewall profile" v={e.firewall} />
                  <Pg k="Group" v={g ? g.name : "—"} />
                </div>
              </div>
              <div className="d-section">
                <h4>Open ports</h4>
                <div className="tag-list">
                  {e.ports.map(p => <span key={p} className={"chip" + ([3389, 23, 445].includes(p) ? "" : "")} style={[3389, 23, 445].includes(p) ? { background: "var(--high-tint)", color: "var(--high)" } : {}}>{p}{[3389, 23, 445].includes(p) ? " ⚠" : ""}</span>)}
                </div>
                <div style={{ marginTop: 10, fontSize: 11.5, color: "var(--ink-4)" }}>Highlighted ports are flagged by the CIS hardening baseline.</div>
              </div>
              <div className="d-section">
                <h4>Firewall</h4>
                <button className="btn" style={{ width: "100%", justifyContent: "center" }} onClick={() => { ui({ endpointId: null }); setNav("firewall"); }}><Icon name="lock" size={16} />Configure firewall rules</button>
              </div>
            </>
          )}

          {tab === "actions" && (
            <div className="d-section">
              <h4>Response actions</h4>
              <div className="action-grid">
                <button className="act-btn danger" onClick={isolate}><Icon name="isolate" size={16} />{e.status === "isolated" ? "Release host" : "Isolate host"}</button>
                <button className="act-btn" onClick={scan}><Icon name="scan" size={16} />Run scan</button>
                <button className="act-btn" onClick={() => toast("Patches deploying to " + e.host, "info")}><Icon name="download" size={16} />Deploy patches</button>
                <button className="act-btn" onClick={() => { ui({ endpointId: null }); setNav("policies"); }}><Icon name="shield" size={16} />View policies</button>
                <button className="act-btn" onClick={() => toast("Remote shell session requested", "info", e.host)}><Icon name="cpu" size={16} />Remote shell</button>
                <button className="act-btn" onClick={() => toast("Reboot command sent", "warn", e.host)}><Icon name="pulse" size={16} />Reboot</button>
              </div>
              <div style={{ marginTop: 18 }}>
                <h4>Move to policy group</h4>
                <GroupMenu current={e.group} onChange={setGroup} />
              </div>
            </div>
          )}
        </div>

        <div className="drawer-foot">
          <button className={"btn " + (e.status === "isolated" ? "" : "btn-primary")} style={{ flex: 1, justifyContent: "center" }} onClick={isolate}>
            <Icon name="isolate" size={16} />{e.status === "isolated" ? "Release" : "Isolate"}
          </button>
          <button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={scan}><Icon name="scan" size={16} />Scan</button>
        </div>
      </div>
    </>
  );
}

function Pg({ k, v, mono }) {
  return <div className="pgrid-item"><span className="pg-k">{k}</span><span className={"pg-v" + (mono ? " mono" : "")}>{v}</span></div>;
}

Object.assign(window, { EndpointsView, EndpointDrawer, GroupMenu, statusPill, Pg });
