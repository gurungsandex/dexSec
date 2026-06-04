/* ============================================================
   Dex Security Cloud — SOC Workspace
   Analyst-centric triage board + workload
   ============================================================ */
function SOCView() {
  const { state, openIncident, dispatch, toast } = useStore();
  const D = window.DEX;
  const tenant = state.scope === "all" ? null : D.tenants.find(t => t.id === state.scope);
  const incidents = scopedIncidents(state).filter(i => i.status !== "Closed");

  // columns by status
  const cols = [
    { key: "New", label: "Triage queue", icon: "alert", color: "var(--primary)" },
    { key: "Assigned", label: "Assigned", icon: "users", color: "var(--violet)" },
    { key: "In Progress", label: "Investigating", icon: "pulse", color: "var(--med)" },
    { key: "Resolved", label: "Resolved", icon: "check", color: "var(--ok)" },
  ];
  const byCol = {};
  cols.forEach(c => byCol[c.key] = incidents.filter(i => i.status === c.key).sort((a, b) => D.sevRank[a.sev] - D.sevRank[b.sev]));

  // workload per analyst
  const workload = D.roster.map(r => ({
    ...r,
    count: incidents.filter(i => i.assignee === r.name && i.status !== "Resolved").length,
    crit: incidents.filter(i => i.assignee === r.name && i.sev === "Critical" && i.status !== "Resolved").length,
  })).sort((a, b) => b.count - a.count);
  const maxLoad = Math.max(1, ...workload.map(w => w.count));

  // SLA / metrics
  const critOpen = incidents.filter(i => i.sev === "Critical" && i.status !== "Resolved").length;
  const unassigned = incidents.filter(i => !i.assignee && i.status !== "Resolved").length;

  function advance(inc) {
    const order = ["New", "Assigned", "In Progress", "Resolved"];
    const next = order[Math.min(order.indexOf(inc.status) + 1, order.length - 1)];
    dispatch({ type: "incStatus", id: inc.id, status: next });
    toast(inc.id + " → " + next, "info");
  }
  function autoAssign() {
    const queue = byCol["New"];
    if (!queue.length) { toast("Triage queue empty", "ok"); return; }
    const oncall = D.roster.filter(r => r.oncall);
    queue.forEach((inc, i) => {
      const a = oncall[i % oncall.length];
      dispatch({ type: "assign", id: inc.id, assignee: a.name });
    });
    toast("Auto-routed " + queue.length + " incidents", "ok", "Distributed across " + oncall.length + " on-call analysts");
  }

  return (
    <div className="main-inner fade-in">
      <div className="page-head">
        <div className="ph-left">
          <h1 className="page-title">SOC Workspace</h1>
          <p className="page-sub">{state.scope === "all" ? "All clients" : tenant.name} · live triage board · Tier 1 → IR Lead routing</p>
        </div>
        <div className="ph-right">
          <button className="btn" onClick={autoAssign}><Icon name="target" size={16} />Auto-route queue</button>
          <button className="btn btn-primary" onClick={() => { const c = byCol["New"][0] || incidents[0]; if (c) openIncident(c.id); }}><Icon name="pulse" size={16} />Open next</button>
        </div>
      </div>

      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <Kpi label="In triage queue" icon="alert" iconColor="var(--primary)" iconBg="var(--primary-tint)" value={byCol["New"].length} foot={{ text: unassigned + " unassigned" }} />
        <Kpi label="Critical open" icon="fire" iconColor="var(--crit)" iconBg="var(--crit-tint)" value={critOpen} foot={{ text: "SLA: 15 min response" }} />
        <Kpi label="Analysts on-call" icon="users" iconColor="var(--violet)" iconBg="var(--violet-tint)" value={D.roster.filter(r => r.oncall).length} unit={"/ " + D.roster.length} foot={{ text: "active shift" }} />
        <Kpi label="Avg response" icon="clock" iconColor="var(--ok)" iconBg="var(--ok-tint)" value="11" unit="min" delta={-18} deltaGood={true} foot={{ text: "MTTR this week", pct: true }} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 300px", alignItems: "start" }}>
        {/* triage board */}
        <div className="soc-board">
          {cols.map(c => (
            <div className="soc-col" key={c.key}>
              <div className="soc-col-head">
                <Icon name={c.icon} size={15} style={{ color: c.color }} />
                {c.label}
                <span className="scc-count">{byCol[c.key].length}</span>
              </div>
              {byCol[c.key].length === 0 && <div className="soc-empty">No incidents</div>}
              {byCol[c.key].map(inc => {
                const t = D.tenants.find(x => x.id === inc.tenant);
                return (
                  <div className="soc-card" key={inc.id} onClick={() => openIncident(inc.id)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Sev level={inc.sev} />
                      <span className="sc-id" style={{ marginLeft: "auto" }}>{inc.id}</span>
                    </div>
                    <div className="sc-title">{inc.title}</div>
                    <div className="sc-foot">
                      {state.scope === "all" && <span className="tt-av" style={{ background: t.color, width: 18, height: 18, borderRadius: 5, fontSize: 9 }}>{t.short}</span>}
                      <span className="chip ttp" style={{ fontSize: 10 }}>{inc.ttp[0]}</span>
                      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                        {inc.assignee
                          ? <span className="av-sm" style={{ background: avColor(inc.assignee), width: 22, height: 22 }} title={inc.assignee}>{inc.assignee.split(/[ .]/).filter(Boolean).map(s => s[0]).slice(0, 2).join("")}</span>
                          : <span className="muted" style={{ fontSize: 11, fontStyle: "italic" }}>unassigned</span>}
                        {c.key !== "Resolved" && <button className="mini-btn" onClick={ev => { ev.stopPropagation(); advance(inc); }} title="Advance"><Icon name="chevronR" size={15} /></button>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* analyst workload */}
        <div className="card">
          <div className="card-head"><h3>Analyst Workload</h3></div>
          <div className="card-body" style={{ paddingTop: 4 }}>
            {workload.map(w => (
              <div className="roster-row" key={w.name}>
                <span className="av-sm" style={{ background: avColor(w.name), width: 30, height: 30, borderRadius: 8, fontSize: 11 }}>{w.name.split(/[ .]/).filter(Boolean).map(s => s[0]).slice(0, 2).join("")}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="rr-name">{w.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 3 }}>
                    <span className="rr-tier">{w.tier}</span>
                    {w.oncall && <span className="oncall"><i />on-call</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, justifyContent: "flex-end" }}>
                    {w.crit > 0 && <span className="risk-dot" style={{ background: "var(--crit)" }} title={w.crit + " critical"} />}
                    <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{w.count}</span>
                  </div>
                  <div className="workload-bar" style={{ marginTop: 5 }}><i style={{ width: (w.count / maxLoad * 100) + "%", background: w.crit > 0 ? "var(--crit)" : "var(--primary)" }} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* playbooks quick access */}
      <h3 className="section-title" style={{ marginTop: 24 }}>Response Playbooks</h3>
      <div className="grid" style={{ gridTemplateColumns: "repeat(3,1fr)" }}>
        {D.playbooks.map(pb => (
          <div className="pol-card" key={pb.id} onClick={() => dispatch({ type: "ui", patch: { playbookId: pb.id } })}>
            <div className="pc-top">
              <div className="pc-ic" style={{ background: "var(--ink)", color: "#fff" }}><Icon name="external" size={18} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="pc-name" style={{ fontSize: 14 }}>{pb.name}</div>
                <div className="pc-fw">{pb.source}</div>
              </div>
            </div>
            <div className="pc-foot" style={{ borderTop: "none", paddingTop: 0 }}>
              <span className="pc-rules">{pb.steps.length} steps · {pb.phases.length} phases</span>
              <span className="link-btn">Open<Icon name="chevronR" size={14} /></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { SOCView });
