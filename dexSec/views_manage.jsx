/* ============================================================
   Dex Security Cloud — Assets, Patch, Reports
   ============================================================ */

/* ============================================================
   ASSET MANAGEMENT
   ============================================================ */
function AssetsView() {
  const { state, openEndpoint, openModal } = useStore();
  const D = window.DEX;
  const tenant = state.scope === "all" ? null : D.tenants.find(t => t.id === state.scope);
  const [q, setQ] = React.useState("");
  const [deptF, setDeptF] = React.useState("All");

  let rows = scopedEndpoints(state);
  const depts = [...new Set(rows.map(e => e.dept))].sort();
  let filtered = rows.filter(e => {
    if (deptF !== "All" && e.dept !== deptF) return false;
    if (q && !(e.host.toLowerCase().includes(q.toLowerCase()) || e.owner.toLowerCase().includes(q.toLowerCase()) || e.assetTag.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  });
  const warrantyPill = (w) => {
    if (w === "Active") return <span className="pill ok dot">Active</span>;
    if (w === "Expiring") return <span className="pill warn dot">Expiring</span>;
    return <span className="pill danger dot">Expired</span>;
  };

  return (
    <div className="main-inner fade-in">
      <div className="page-head">
        <div className="ph-left">
          <h1 className="page-title">Asset Management</h1>
          <p className="page-sub">{state.scope === "all" ? "All clients" : tenant.name} · {rows.length} registered assets · hardware, software &amp; ownership register</p>
        </div>
        <div className="ph-right">
          <div className="search-inline">
            <Icon name="search" size={15} />
            <input placeholder="Host, owner, tag…" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <button className="btn"><Icon name="export" size={16} />Export CSV</button>
          <button className="btn btn-primary"><Icon name="plus" size={16} />Register asset</button>
        </div>
      </div>

      <div className="filterbar">
        <button className={"fbtn" + (deptF === "All" ? " active" : "")} onClick={() => setDeptF("All")}>All depts<span className="cnt">{rows.length}</span></button>
        {depts.map(d => (
          <button key={d} className={"fbtn" + (deptF === d ? " active" : "")} onClick={() => setDeptF(d)}>{d}<span className="cnt">{rows.filter(e => e.dept === d).length}</span></button>
        ))}
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: "6px 6px" }}>
          <table className="tbl">
            <thead>
              <tr><th>Asset tag</th><th>Hostname</th><th>Owner</th><th>Department</th>{state.scope === "all" && <th>Client</th>}<th>Hardware</th><th>Warranty</th><th>Risk</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const t = D.tenants.find(x => x.id === e.tenant);
                return (
                  <tr key={e.id} className="clickable" onClick={() => openEndpoint(e.id)}>
                    <td className="t-num td-strong">{e.assetTag}</td>
                    <td className="mono" style={{ fontSize: 12.5 }}>{e.host}</td>
                    <td>{e.owner}</td>
                    <td><span className="chip">{e.dept}</span></td>
                    {state.scope === "all" && <td><span className="ttag"><span className="tt-av" style={{ background: t.color }}>{t.short}</span></span></td>}
                    <td className="muted" style={{ fontSize: 12.5 }}>{e.cpu} · {e.ram}</td>
                    <td>{warrantyPill(e.warranty)}</td>
                    <td><RiskMeter value={e.risk} /></td>
                    <td><button className="mini-btn" onClick={ev => { ev.stopPropagation(); openModal({ type: "editAsset", id: e.id }); }}><Icon name="gear" size={15} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------- Edit asset modal ---------- */
function EditAssetModal() {
  const { state, dispatch, closeModal, toast } = useStore();
  const D = window.DEX;
  const e = state.endpoints.find(x => x.id === state.ui.modal.id);
  const [form, setForm] = React.useState(e ? { owner: e.owner, dept: e.dept, location: e.location, group: e.group, warranty: e.warranty } : null);
  if (!e || !form) return null;
  function set(patch) { setForm(f => ({ ...f, ...patch })); }
  const depts = ["Finance", "Engineering", "Operations", "Clinical", "Legal", "HR", "Sales", "R&D", "IT", "Executive"];

  return (
    <Modal title="Edit Asset" sub={e.host + " · " + e.assetTag} icon="box" onClose={closeModal} width={540}
      footer={<><button className="btn" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={() => { dispatch({ type: "updateAsset", id: e.id, patch: form }); closeModal(); toast("Asset updated", "ok", e.host); }}><Icon name="check" size={16} />Save changes</button></>}>
      <Field label="Owner"><TextInput value={form.owner} onChange={v => set({ owner: v })} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Department"><Select value={form.dept} onChange={v => set({ dept: v })} options={depts.map(d => ({ value: d, label: d }))} /></Field>
        <Field label="Location"><TextInput value={form.location} onChange={v => set({ location: v })} /></Field>
        <Field label="Policy group"><Select value={form.group} onChange={v => set({ group: v })} options={D.groups.map(g => ({ value: g.id, label: g.name }))} /></Field>
        <Field label="Warranty"><Select value={form.warranty} onChange={v => set({ warranty: v })} options={["Active", "Expiring", "Expired"].map(w => ({ value: w, label: w }))} /></Field>
      </div>
    </Modal>
  );
}

/* ============================================================
   PATCH MANAGEMENT
   ============================================================ */
function PatchView() {
  const { state, toast } = useStore();
  const D = window.DEX;
  const tenant = state.scope === "all" ? null : D.tenants.find(t => t.id === state.scope);
  const eps = scopedEndpoints(state);
  const behind = eps.filter(e => e.patchStatus === "Behind");

  const cves = [
    { id: "CVE-2025-21298", cvss: 9.8, sev: "Critical", name: "Windows OLE Remote Code Execution", affected: behind.length, vendor: "Microsoft" },
    { id: "CVE-2025-0411", cvss: 7.0, sev: "High", name: "7-Zip Mark-of-the-Web Bypass", affected: Math.max(1, Math.floor(behind.length * 0.6)), vendor: "7-Zip" },
    { id: "CVE-2024-50623", cvss: 8.8, sev: "High", name: "OpenSSH Agent Forwarding Flaw", affected: Math.max(1, Math.floor(behind.length * 0.4)), vendor: "OpenSSH" },
    { id: "CVE-2025-24813", cvss: 6.4, sev: "Medium", name: "Apache Tomcat Path Traversal", affected: Math.max(1, Math.floor(behind.length * 0.3)), vendor: "Apache" },
  ];
  const compliance = state.scope === "all" ? D.agg().patch : tenant.patch;

  return (
    <div className="main-inner fade-in">
      <div className="page-head">
        <div className="ph-left">
          <h1 className="page-title">Patch Management</h1>
          <p className="page-sub">{state.scope === "all" ? "All clients" : tenant.name} · CVE exposure · staged rollout &amp; rollback</p>
        </div>
        <div className="ph-right">
          <button className="btn"><Icon name="scan" size={16} />Scan for updates</button>
          <button className="btn btn-primary" onClick={() => toast("Deploying patches", "info", behind.length + " endpoints scheduled")}><Icon name="download" size={16} />Deploy all critical</button>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "300px 1fr", alignItems: "start" }}>
        <div className="card">
          <div className="card-head"><h3>Compliance</h3></div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 8 }}>
            <Ring value={compliance} label={compliance + "%"} sub="COMPLIANT" color={compliance < 80 ? "var(--high)" : "var(--ok)"} size={150} thickness={15} />
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
              <PostureRow ic="monitor" col="var(--ok)" bg="var(--ok-tint)" title="Up to date" sub="all patches applied" val={eps.length - behind.length} valCol="var(--ok)" />
              <PostureRow ic="patch" col="var(--high)" bg="var(--high-tint)" title="Behind" sub="pending updates" val={behind.length} valCol="var(--high)" />
              <PostureRow ic="fire" col="var(--crit)" bg="var(--crit-tint)" title="Critical CVEs" sub="CVSS ≥ 9.0" val={cves.filter(c => c.sev === "Critical").length} valCol="var(--crit)" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><h3>CVE Exposure</h3><span className="ch-sub">ranked by severity</span></div>
          <div className="card-body" style={{ padding: "8px 6px 6px" }}>
            <table className="tbl">
              <thead><tr><th>CVE</th><th>Severity</th><th>CVSS</th><th>Vulnerability</th><th>Vendor</th><th>Affected</th><th></th></tr></thead>
              <tbody>
                {cves.map(c => (
                  <tr key={c.id}>
                    <td className="t-num td-strong">{c.id}</td>
                    <td><Sev level={c.sev} /></td>
                    <td className="t-num" style={{ color: c.cvss >= 9 ? "var(--crit)" : c.cvss >= 7 ? "var(--high)" : "var(--med)", fontWeight: 600 }}>{c.cvss}</td>
                    <td className="td-strong" style={{ maxWidth: 280 }}>{c.name}</td>
                    <td className="muted">{c.vendor}</td>
                    <td className="t-num">{c.affected} hosts</td>
                    <td><button className="btn" style={{ padding: "5px 10px", fontSize: 12 }} onClick={() => toast("Patch scheduled", "ok", c.id)}>Patch</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   REPORTS
   ============================================================ */
function ReportsView() {
  const { state, openModal } = useStore();
  const D = window.DEX;
  const tenant = state.scope === "all" ? null : D.tenants.find(t => t.id === state.scope);

  return (
    <div className="main-inner fade-in">
      <div className="page-head">
        <div className="ph-left">
          <h1 className="page-title">Reports</h1>
          <p className="page-sub">{state.scope === "all" ? "All clients" : tenant.name} · on-demand &amp; scheduled · PDF, CSV, JSON</p>
        </div>
        <div className="ph-right">
          <button className="btn btn-primary" onClick={() => openModal({ type: "newReport" })}><Icon name="plus" size={16} />Generate report</button>
        </div>
      </div>

      <h3 className="section-title">Report templates</h3>
      <div className="report-type-grid" style={{ marginBottom: 26 }}>
        {D.reportTypes.map(rt => (
          <button key={rt.id} className="report-type" onClick={() => openModal({ type: "newReport", preset: rt.id })}>
            <div className="rt-ic"><Icon name={rt.icon} size={18} /></div>
            <div className="rt-name">{rt.name}</div>
            <div className="rt-desc">{rt.desc}</div>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="card-head"><h3>Recent reports</h3><span className="ch-sub">{state.reports.length} generated</span></div>
        <div className="card-body" style={{ padding: "8px 6px 6px" }}>
          <table className="tbl">
            <thead><tr><th>Report ID</th><th>Name</th><th>Scope</th><th>Format</th><th>Generated</th><th>By</th><th></th></tr></thead>
            <tbody>
              {state.reports.map(r => {
                const scopeT = r.scope === "all" ? null : D.tenants.find(t => t.id === r.scope);
                return (
                  <tr key={r.id} className="clickable">
                    <td className="t-num" style={{ color: "var(--ink-4)" }}>{r.id}</td>
                    <td className="td-strong">{r.name}</td>
                    <td>{scopeT ? <TenantTag tenant={scopeT} /> : <span className="chip">All clients</span>}</td>
                    <td><span className="chip">{r.format}</span></td>
                    <td className="muted">{r.created}</td>
                    <td className="muted">{r.by}</td>
                    <td><button className="mini-btn"><Icon name="download" size={15} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------- Generate report modal ---------- */
function NewReportModal() {
  const { state, dispatch, closeModal, toast } = useStore();
  const D = window.DEX;
  const [type, setType] = React.useState(state.ui.modal.preset || "threat");
  const [scope, setScope] = React.useState(state.scope);
  const [format, setFormat] = React.useState("PDF");
  const [range, setRange] = React.useState("30d");
  const [generating, setGenerating] = React.useState(false);
  const [done, setDone] = React.useState(false);

  const rt = D.reportTypes.find(r => r.id === type);

  function generate() {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false); setDone(true);
      const report = {
        id: "RPT-" + (43 + state.reports.length).toString().padStart(4, "0"),
        type, name: rt.name, scope, format, created: "just now", by: "A. Okonkwo",
      };
      dispatch({ type: "addReport", report });
      toast("Report generated", "ok", report.name + " · " + format);
      setTimeout(() => closeModal(), 900);
    }, 1300);
  }

  return (
    <Modal title="Generate Report" sub="Configure scope, format, and time range." icon="report" onClose={closeModal} width={560}
      footer={done ? <button className="btn btn-primary" onClick={closeModal}><Icon name="check" size={16} />Done</button>
        : <><button className="btn" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={generate} disabled={generating}>{generating ? <><span className="spinner" />Generating…</> : <><Icon name="report" size={16} />Generate</>}</button></>}>
      {done ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--ok-tint)", color: "var(--ok)", display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Icon name="check" size={28} stroke={2.5} /></div>
          <h3 style={{ fontSize: 16, margin: "0 0 6px", color: "var(--ink)" }}>{rt.name} ready</h3>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>{format} · added to recent reports</p>
        </div>
      ) : (
        <>
          <Field label="Report type">
            <div className="report-type-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {D.reportTypes.map(r => (
                <button key={r.id} type="button" className="report-type" style={type === r.id ? { borderColor: "var(--primary)", background: "var(--primary-tint)" } : {}} onClick={() => setType(r.id)}>
                  <div className="rt-ic"><Icon name={r.icon} size={16} /></div>
                  <div className="rt-name" style={{ fontSize: 12.5 }}>{r.name}</div>
                </button>
              ))}
            </div>
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <Field label="Scope"><Select value={scope} onChange={setScope} options={[{ value: "all", label: "All clients" }, ...D.tenants.map(t => ({ value: t.id, label: t.name }))]} /></Field>
            <Field label="Format"><Select value={format} onChange={setFormat} options={["PDF", "CSV", "JSON"].map(f => ({ value: f, label: f }))} /></Field>
            <Field label="Range"><Select value={range} onChange={setRange} options={[{ value: "7d", label: "Last 7 days" }, { value: "30d", label: "Last 30 days" }, { value: "90d", label: "Last quarter" }]} /></Field>
          </div>
        </>
      )}
    </Modal>
  );
}

Object.assign(window, { AssetsView, EditAssetModal, PatchView, ReportsView, NewReportModal });
