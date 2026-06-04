/* ============================================================
   Dex Security Cloud — Overview views
   ============================================================ */

const DAY_LABELS = ["", "", "", "", "", "", "7d", "", "", "", "", "", "", "now"];

/* ============================================================
   ALL CLIENTS — portfolio overview
   ============================================================ */
function AllClientsOverview() {
  const { state, setScope, setNav, openIncident } = useStore();
  const D = window.DEX;
  const a = D.agg();
  const onPickTenant = (id) => { setScope(id); setNav("overview"); };
  const onNav = setNav;
  const tenantsSorted = [...D.tenants].sort((x, y) => y.risk - x.risk);
  const liveInc = state.incidents;
  const dist = D.sevDist(liveInc.filter(i => i.status !== "Closed" && i.status !== "Resolved"));
  const distTotal = Object.values(dist).reduce((s, v) => s + v, 0);
  const segs = ["Critical", "High", "Medium", "Low"].map(k => ({ value: dist[k], color: D.sevColor[k], label: k }));
  const feed = liveInc.filter(i => i.sev === "Critical" || i.sev === "High").slice(0, 6);

  return (
    <div className="main-inner fade-in">
      <div className="page-head">
        <div className="ph-left">
          <h1 className="page-title">Portfolio Overview</h1>
          <p className="page-sub">{D.tenants.length} managed clients · {a.endpoints.toLocaleString()} endpoints monitored · {a.coverage}% agent coverage</p>
        </div>
        <div className="ph-right">
          <div className="seg">
            <button>24h</button><button className="active">7d</button><button>30d</button>
          </div>
          <button className="btn"><Icon name="export" size={16} />Export</button>
          <button className="btn btn-primary"><Icon name="plus" size={16} />Add client</button>
        </div>
      </div>

      {/* KPI row */}
      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
        <Kpi label="Endpoints" icon="monitor" iconColor="var(--primary)" iconBg="var(--primary-tint)"
          value={a.endpoints.toLocaleString()} delta={null}
          foot={{ text: a.online.toLocaleString() + " online" }} spark={D.tenants[0].riskTrend.map((_, i) => a.online - 30 + i * 2)} sparkColor="#3052E6" />
        <Kpi label="Open incidents" icon="alert" iconColor="var(--high)" iconBg="var(--high-tint)"
          value={a.open} delta={+9} deltaGood={false}
          foot={{ text: "across all clients", pct: false }} spark={D.aggIncTrend()} sparkColor="#EE7117" />
        <Kpi label="Critical" icon="fire" iconColor="var(--crit)" iconBg="var(--crit-tint)"
          value={a.critical} delta={+2} deltaGood={false}
          foot={{ text: "need triage now" }} spark={[1,2,1,3,2,4,3,5,4,6,5,7,6,a.critical]} sparkColor="#E5484D" />
        <Kpi label="Avg risk score" icon="target" iconColor="var(--med)" iconBg="var(--med-tint)"
          value={a.avgRisk} unit="/100" delta={+3} deltaGood={false}
          foot={{ text: "portfolio composite", pct: false }} spark={[52,54,53,55,56,55,57,56,58,57,56,55,56,a.avgRisk]} sparkColor="#C99400" />
        <Kpi label="Patch compliance" icon="patch" iconColor="var(--ok)" iconBg="var(--ok-tint)"
          value={a.patch} unit="%" delta={-1} deltaGood={true}
          foot={{ text: a.missingCritical + " critical missing", pct: false }} spark={[88,87,88,86,85,86,85,84,85,86,85,84,85,a.patch]} sparkColor="#18935A" />
      </div>

      {/* main grid */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 360px", alignItems: "start" }}>
        {/* client risk posture table */}
        <div className="card">
          <div className="card-head">
            <h3>Client Risk Posture</h3>
            <span className="ch-sub">ranked by composite risk</span>
            <div className="ch-right"><button className="link-btn" onClick={() => onNav("incidents")}>Incident queue<Icon name="chevronR" size={14} /></button></div>
          </div>
          <div className="card-body" style={{ padding: "8px 6px 6px" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Client</th><th>Endpoints</th><th>Risk</th><th>Open incidents</th><th>Patch</th><th>14-day risk</th>
                </tr>
              </thead>
              <tbody>
                {tenantsSorted.map(t => (
                  <tr key={t.id} className="clickable" onClick={() => onPickTenant(t.id)}>
                    <td>
                      <span className="ttag">
                        <span className="tt-av" style={{ background: t.color, width: 26, height: 26, borderRadius: 7, fontSize: 11 }}>{t.short}</span>
                        <span style={{ display: "flex", flexDirection: "column", lineHeight: 1.3, whiteSpace: "nowrap" }}>
                          <span className="td-strong">{t.name}</span>
                          <span style={{ fontSize: 11.5, color: "var(--ink-4)" }}>{t.industry}</span>
                        </span>
                      </span>
                    </td>
                    <td className="t-num">{t.endpoints.toLocaleString()}</td>
                    <td><RiskMeter value={t.risk} /></td>
                    <td><SevDots critical={t.critical} high={t.high} total={t.openIncidents} /></td>
                    <td>
                      <span className="t-num" style={{ color: t.patch < 80 ? "var(--high)" : "var(--ink-2)", fontWeight: 600 }}>{t.patch}%</span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Sparkline data={t.riskTrend} color={D.riskColor(t.risk)} w={70} h={24} fill={false} />
                        <span className={"delta " + (t.riskDelta > 0 ? "bad-up" : t.riskDelta < 0 ? "good-up" : "flat")} style={{ fontSize: 11.5 }}>
                          <Icon name={t.riskDelta > 0 ? "arrowUp" : t.riskDelta < 0 ? "arrowDown" : "pulse"} size={11} stroke={2.4} />{Math.abs(t.riskDelta)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* right column */}
        <div className="grid" style={{ gap: 16 }}>
          <div className="card">
            <div className="card-head"><h3>Incident Severity</h3><span className="ch-sub">open · all clients</span></div>
            <div className="card-body" style={{ display: "flex", gap: 18, alignItems: "center" }}>
              <Donut segments={segs} size={140} thickness={19} center={distTotal} centerSub="OPEN" />
              <div className="legend" style={{ flex: 1 }}>
                {segs.map(s => (
                  <div className="lg-row" key={s.label}>
                    <i style={{ background: s.color }} />
                    <span className="lg-label">{s.label}</span>
                    <span className="lg-val">{s.value}</span>
                    <span className="lg-pct">{distTotal ? Math.round((s.value / distTotal) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h3>Fleet Health</h3></div>
            <div className="card-body" style={{ paddingTop: 4 }}>
              <div className="posture-list">
                <PostureRow ic="pulse" col="var(--ok)" bg="var(--ok-tint)" title="Agents online" sub={a.online.toLocaleString() + " of " + a.endpoints.toLocaleString()} val={Math.round(a.online/a.endpoints*100) + "%"} valCol="var(--ok)" />
                <PostureRow ic="alert" col="var(--high)" bg="var(--high-tint)" title="At-risk endpoints" sub="degraded health score" val={a.atrisk} valCol="var(--high)" />
                <PostureRow ic="isolate" col="var(--ink-4)" bg="var(--surface-3)" title="Offline / no heartbeat" sub=">4h since last sync" val={a.offline} valCol="var(--ink-3)" />
                <PostureRow ic="shield" col="var(--primary)" bg="var(--primary-tint)" title="Policies deployed" sub="across all tenants" val={a.policiesDeployed} valCol="var(--primary)" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* live feed */}
      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-head">
          <h3>Priority Incident Feed</h3>
          <span className="ch-sub">critical & high · cross-tenant</span>
          <div className="ch-right"><button className="link-btn" onClick={() => onNav("incidents")}>View all<Icon name="chevronR" size={14} /></button></div>
        </div>
        <div className="card-body" style={{ paddingTop: 6 }}>
          <div className="feed">
            {feed.map(inc => {
              const t = D.tenants.find(x => x.id === inc.tenant);
              return (
                <div className="feed-item" key={inc.id} onClick={() => openIncident(inc.id)} style={{ cursor: "pointer" }}>
                  <div className="fi-rail">
                    <div className="fi-icon" style={{ background: inc.sev === "Critical" ? "var(--crit-tint)" : "var(--high-tint)", color: inc.sev === "Critical" ? "var(--crit)" : "var(--high)" }}>
                      <Icon name={inc.sev === "Critical" ? "fire" : "alert"} size={16} />
                    </div>
                  </div>
                  <div className="fi-body">
                    <div className="fi-title">{inc.title}</div>
                    <div className="fi-meta">
                      <span className="mono" style={{ color: "var(--ink-4)" }}>{inc.id}</span>
                      <span className="dotsep" />
                      <TenantTag tenant={t} />
                      <span className="dotsep" />
                      <span className="chip ttp">{inc.ttp[0]}</span>
                      <span className="dotsep" />
                      <Assignee name={inc.assignee} />
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <Sev level={inc.sev} />
                    <span className="fi-time">{inc.age} ago</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PostureRow({ ic, col, bg, title, sub, val, valCol }) {
  return (
    <div className="posture-row">
      <div className="pr-ic" style={{ background: bg, color: col }}><Icon name={ic} size={15} /></div>
      <div className="pr-body">
        <div className="pr-title">{title}</div>
        <div className="pr-sub">{sub}</div>
      </div>
      <div className="pr-val mono" style={{ color: valCol }}>{val}</div>
    </div>
  );
}

/* ============================================================
   PER-TENANT — security console
   ============================================================ */
function TenantOverview() {
  const { state, setNav, openIncident } = useStore();
  const D = window.DEX;
  const t = D.tenants.find(x => x.id === state.scope);
  const onNav = setNav;
  const tIncidents = state.incidents.filter(i => i.tenant === t.id);
  const openInc = tIncidents.filter(i => i.status !== "Closed" && i.status !== "Resolved");
  const dist = D.sevDist(openInc);
  const distTotal = Object.values(dist).reduce((s, v) => s + v, 0) || 1;
  const ehSegs = [
    { value: t.online, color: "#18935A", label: "Healthy" },
    { value: t.atrisk, color: "#EE7117", label: "At risk" },
    { value: t.offline, color: "#98A0AD", label: "Offline" },
  ];
  const topOpen = [...openInc].sort((x, y) => D.sevRank[x.sev] - D.sevRank[y.sev]).slice(0, 5);

  return (
    <div className="main-inner fade-in">
      <div className="page-head">
        <div className="ph-left">
          <h1 className="page-title">
            <span className="tt-av" style={{ background: t.color, width: 34, height: 34, borderRadius: 9, fontSize: 14 }}>{t.short}</span>
            {t.name}
          </h1>
          <p className="page-sub" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span>{t.industry} · {t.region}</span>
            <span className="dotsep" />
            <span>{t.tier}</span>
            <span className="dotsep" />
            <span>Managed since {t.since}</span>
            {t.compliance.map(c => <span key={c} className="chip compliance">{c}</span>)}
          </p>
        </div>
        <div className="ph-right">
          <div className="seg"><button>24h</button><button className="active">7d</button><button>30d</button></div>
          <button className="btn"><Icon name="scan" size={16} />Run scan</button>
          <button className="btn"><Icon name="export" size={16} />Report</button>
        </div>
      </div>

      {/* KPI row */}
      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
        <Kpi label="Endpoints" icon="monitor" iconColor="var(--primary)" iconBg="var(--primary-tint)"
          value={t.endpoints.toLocaleString()} foot={{ text: t.online + " online · " + t.offline + " offline" }} />
        <Kpi label="Open incidents" icon="alert" iconColor="var(--high)" iconBg="var(--high-tint)"
          value={t.openIncidents} delta={+4} deltaGood={false} foot={{ text: "last 7 days", pct: false }} spark={t.incTrend} sparkColor="#EE7117" />
        <Kpi label="Critical" icon="fire" iconColor="var(--crit)" iconBg="var(--crit-tint)"
          value={t.critical} foot={{ text: t.high + " high severity" }} />
        <Kpi label="Patch compliance" icon="patch" iconColor="var(--ok)" iconBg="var(--ok-tint)"
          value={t.patch} unit="%" delta={t.patch < 80 ? -2 : +1} deltaGood={true} foot={{ text: t.missingCritical + " critical missing", pct: false }} />
        <Kpi label="Agent coverage" icon="shield" iconColor="var(--teal)" iconBg="var(--teal-tint)"
          value={t.coverage} unit="%" foot={{ text: t.policiesDeployed + " policies active", pct: false }} />
      </div>

      {/* row 1: risk gauge + incident trend */}
      <div className="grid" style={{ gridTemplateColumns: "320px 1fr", alignItems: "stretch", marginBottom: 16 }}>
        <div className="card">
          <div className="card-head"><h3>Composite Risk</h3></div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, paddingTop: 8 }}>
            <RiskGauge value={t.risk} />
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
              <span className={"delta " + (t.riskDelta > 0 ? "bad-up" : "good-up")} style={{ fontWeight: 600 }}>
                <Icon name={t.riskDelta > 0 ? "arrowUp" : "arrowDown"} size={13} stroke={2.4} />{Math.abs(t.riskDelta)} pts
              </span>
              <span className="muted">vs. last week</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <h3>Incident Trend</h3><span className="ch-sub">14 days · all severities</span>
            <div className="ch-right">
              <span className="pill"><span className="risk-dot" style={{ background: "var(--high)" }} />Peak {Math.max(...t.incTrend)}/day</span>
            </div>
          </div>
          <div className="card-body" style={{ paddingTop: 10 }}>
            <AreaChart data={t.incTrend} color={t.color} labels={DAY_LABELS} h={196} />
          </div>
        </div>
      </div>

      {/* row 2: endpoint health donut + patch ring + posture */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 16 }}>
        <div className="card">
          <div className="card-head"><h3>Endpoint Health</h3></div>
          <div className="card-body" style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Donut segments={ehSegs} size={130} thickness={18} center={t.endpoints} centerSub="DEVICES" />
            <div className="legend" style={{ flex: 1 }}>
              {ehSegs.map(s => (
                <div className="lg-row" key={s.label}>
                  <i style={{ background: s.color }} /><span className="lg-label">{s.label}</span><span className="lg-val">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Patch Compliance</h3></div>
          <div className="card-body" style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Ring value={t.patch} label={t.patch + "%"} sub="COMPLIANT" color={t.patch < 80 ? "var(--high)" : "var(--ok)"} size={128} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div className="mono" style={{ fontSize: 22, fontWeight: 600, color: "var(--crit)" }}>{t.missingCritical}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-3)" }}>critical patches missing</div>
              </div>
              <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={() => onNav("patch")}>
                <Icon name="download" size={15} />Deploy updates
              </button>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>Policy Posture</h3><span className="ch-sub">NIST CSF aligned</span></div>
          <div className="card-body" style={{ paddingTop: 4 }}>
            <div className="posture-list">
              <PostureRow ic="lock" col="var(--ok)" bg="var(--ok-tint)" title="MFA enforcement" sub="login + privilege escalation" val="On" valCol="var(--ok)" />
              <PostureRow ic="shield" col="var(--ok)" bg="var(--ok-tint)" title="Behavioral detection" sub="MITRE ATT&CK rules" val="On" valCol="var(--ok)" />
              <PostureRow ic="globe" col={t.patch < 80 ? "var(--high)" : "var(--ok)"} bg={t.patch < 80 ? "var(--high-tint)" : "var(--ok-tint)"} title="DNS filtering" sub="sinkhole + DoH enforced" val={t.patch < 80 ? "Partial" : "On"} valCol={t.patch < 80 ? "var(--high)" : "var(--ok)"} />
              <PostureRow ic="cpu" col="var(--high)" bg="var(--high-tint)" title="USB device control" sub={t.atrisk + " unmanaged devices"} val="Review" valCol="var(--high)" />
            </div>
          </div>
        </div>
      </div>

      {/* top open incidents */}
      <div className="card">
        <div className="card-head">
          <h3>Top Open Incidents</h3><span className="ch-sub">{t.name}</span>
          <div className="ch-right"><button className="link-btn" onClick={() => onNav("incidents")}>Open queue<Icon name="chevronR" size={14} /></button></div>
        </div>
        <div className="card-body" style={{ padding: "8px 6px 6px" }}>
          <table className="tbl">
            <thead><tr><th>ID</th><th>Severity</th><th>Incident</th><th>Asset</th><th>TTP</th><th>Status</th><th>Age</th></tr></thead>
            <tbody>
              {topOpen.length === 0 && <tr><td colSpan="7" style={{ textAlign: "center", padding: 30, color: "var(--ink-4)" }}>No open incidents — all clear.</td></tr>}
              {topOpen.map(inc => (
                <tr key={inc.id} className="clickable" onClick={() => openIncident(inc.id)}>
                  <td className="t-num" style={{ color: "var(--ink-4)" }}>{inc.id}</td>
                  <td><Sev level={inc.sev} /></td>
                  <td className="td-strong" style={{ maxWidth: 320 }}>{inc.title}</td>
                  <td className="t-num">{inc.asset}</td>
                  <td><span className="chip ttp">{inc.ttp[0]}</span></td>
                  <td><StatusTag status={inc.status} /></td>
                  <td className="t-num muted">{inc.age}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { AllClientsOverview, TenantOverview, PostureRow, DAY_LABELS });
