/* ============================================================
   Dex Security Cloud — Policies + Firewall (live)
   ============================================================ */

const POL_ICONS = {
  "Endpoint Detection & Response": { ic: "shield", c: "var(--primary)", bg: "var(--primary-tint)" },
  "Extended Detection & Response": { ic: "target", c: "var(--violet)", bg: "var(--violet-tint)" },
  "Endpoint Protection": { ic: "monitor", c: "var(--teal)", bg: "var(--teal-tint)" },
  "Anti-Ransomware": { ic: "fire", c: "var(--crit)", bg: "var(--crit-tint)" },
  "Configuration Hardening": { ic: "lock", c: "var(--high)", bg: "var(--high-tint)" },
};

function PoliciesView() {
  const { state, openPolicy, openModal } = useStore();
  const D = window.DEX;
  const tenant = state.scope === "all" ? null : D.tenants.find(t => t.id === state.scope);

  return (
    <div className="main-inner fade-in">
      <div className="page-head">
        <div className="ph-left">
          <h1 className="page-title">Security Policies</h1>
          <p className="page-sub">{state.scope === "all" ? "All clients" : tenant.name} · detection &amp; prevention baselines aligned to MITRE ATT&amp;CK and CIS Controls v8</p>
        </div>
        <div className="ph-right">
          <button className="btn"><Icon name="external" size={16} />Import baseline</button>
          <button className="btn btn-primary" onClick={() => openModal({ type: "newPolicy" })}><Icon name="plus" size={16} />New policy</button>
        </div>
      </div>

      <div className="pol-grid">
        {state.policies.map(p => {
          const m = POL_ICONS[p.category] || POL_ICONS["Endpoint Detection & Response"];
          const ruleCount = p.sections.reduce((s, sec) => s + sec.rules.length, 0);
          const activeCount = p.sections.reduce((s, sec) => s + sec.rules.filter(r => r.enabled).length, 0);
          return (
            <div className="pol-card" key={p.id} onClick={() => openPolicy(p.id)}>
              <div className="pc-top">
                <div className="pc-ic" style={{ background: m.bg, color: m.c }}><Icon name={m.ic} size={20} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="pc-name">{p.name}</div>
                  <div className="pc-fw">{p.framework}</div>
                </div>
              </div>
              <div className="pc-meta">
                <span className={"pill " + (p.status === "Deployed" ? "ok" : "")}>{p.status === "Deployed" ? <span className="risk-dot" style={{ background: "var(--ok)" }} /> : <span className="risk-dot" style={{ background: "var(--ink-4)" }} />}{p.status}</span>
                <span className="chip">{p.category}</span>
              </div>
              <div className="pc-foot">
                <span className="pc-rules"><b style={{ color: "var(--ink)" }}>{activeCount}</b>/{ruleCount} rules active</span>
                <span className="pc-rules">{p.deployedTo.length} group{p.deployedTo.length !== 1 ? "s" : ""}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Policy editor drawer ---------- */
function PolicyEditor() {
  const { state, dispatch, ui, toast } = useStore();
  const D = window.DEX;
  const p = state.policies.find(x => x.id === state.ui.policyId);
  React.useEffect(() => {
    function onKey(e) { if (e.key === "Escape") ui({ policyId: null }); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  if (!p) return null;
  const m = POL_ICONS[p.category] || POL_ICONS["Endpoint Detection & Response"];

  function deploy() {
    ui({ policyId: null });
    setTimeout(() => ui({ modal: { type: "deployPolicy", policyId: p.id } }), 60);
  }

  return (
    <>
      <div className="drawer-scrim" onClick={() => ui({ policyId: null })} />
      <div className="drawer" style={{ width: 620 }}>
        <div className="drawer-head">
          <div className="dh-top">
            <div className="pc-ic" style={{ width: 34, height: 34, borderRadius: 9, background: m.bg, color: m.c }}><Icon name={m.ic} size={18} /></div>
            <span className={"pill " + (p.status === "Deployed" ? "ok" : "")} style={{ marginLeft: 4 }}>{p.status}</span>
            <button className="icon-btn" style={{ marginLeft: "auto" }} onClick={() => ui({ policyId: null })}>
              <Icon name="plus" size={20} style={{ transform: "rotate(45deg)" }} />
            </button>
          </div>
          <h2>{p.name}</h2>
          <div className="dh-meta">
            <span className="muted" style={{ fontSize: 12.5 }}>{p.framework}</span>
            <span className="dotsep" />
            <span className="chip">{p.category}</span>
          </div>
        </div>

        <div className="drawer-body">
          <div className="d-section">
            <h4>Deployed to · {p.deployedTo.length} group{p.deployedTo.length !== 1 ? "s" : ""}</h4>
            {p.deployedTo.length === 0
              ? <div className="muted" style={{ fontSize: 13 }}>Not yet deployed. This policy is a draft.</div>
              : <div className="tag-list">{p.deployedTo.map(gid => { const g = D.groups.find(x => x.id === gid); return <span key={gid} className="chip" style={{ background: "var(--primary-tint)", color: "var(--primary)" }}>{g ? g.name : gid}</span>; })}</div>}
          </div>

          <div className="d-section">
            <h4>Rules — toggle to configure</h4>
            {p.sections.map((sec, si) => (
              <div className="rule-section" key={si}>
                <h5>{sec.title}</h5>
                {sec.rules.map((r, ri) => (
                  <div className="rule-row" key={ri}>
                    <div className="rr-body">
                      <div className="rr-name">{r.name}</div>
                      <div className="rr-desc">{r.desc}</div>
                    </div>
                    <Toggle checked={r.enabled} onChange={() => dispatch({ type: "toggleRule", id: p.id, si, ri })} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="drawer-foot">
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={deploy}><Icon name="shield" size={16} />Deploy to groups</button>
          <button className="btn" onClick={() => { toast("Policy cloned", "ok", p.name + " (Copy)"); ui({ policyId: null }); dispatch({ type: "addPolicy", policy: { ...JSON.parse(JSON.stringify(p)), id: "pol-" + Date.now(), name: p.name + " (Copy)", status: "Draft", deployedTo: [] } }); }}><Icon name="box" size={16} />Clone</button>
        </div>
      </div>
    </>
  );
}

/* ---------- New policy modal ---------- */
function NewPolicyModal() {
  const { dispatch, closeModal, toast, openPolicy } = useStore();
  const D = window.DEX;
  const [name, setName] = React.useState("");
  const [framework, setFramework] = React.useState("CrowdStrike Falcon");
  const [category, setCategory] = React.useState("Endpoint Detection & Response");
  const [groups, setGroups] = React.useState([]);

  const frameworks = ["CrowdStrike Falcon", "Cortex XDR", "Bitdefender GravityZone", "Malwarebytes EDR", "Microsoft Defender", "SentinelOne", "CIS Controls v8 · NIST CSF"];
  const categories = Object.keys(POL_ICONS);

  function create() {
    const policy = {
      id: "pol-" + Date.now(), name: name || "Untitled Policy", framework, category,
      severity: "Medium", deployedTo: groups, status: groups.length ? "Deployed" : "Draft",
      sections: [
        { title: "Behavioral Detection", rules: [
          { name: "Process injection blocking", desc: "Detect & terminate — T1055", enabled: true },
          { name: "Credential access alerts", desc: "LSASS / dumping — T1003", enabled: true },
        ]},
        { title: "Real-time Response", rules: [
          { name: "Auto-quarantine on critical", desc: "Isolate host on CVSS ≥ 9.0", enabled: true },
          { name: "Network containment", desc: "Sever non-console connectivity", enabled: false },
        ]},
      ],
    };
    dispatch({ type: "addPolicy", policy });
    closeModal();
    toast("Policy created", "ok", policy.name + (groups.length ? " · deployed to " + groups.length + " group(s)" : " · saved as draft"));
    setTimeout(() => openPolicy(policy.id), 80);
  }

  return (
    <Modal title="New Security Policy" sub="Build from a vendor framework, then deploy to policy groups." icon="shield" onClose={closeModal} width={560}
      footer={<><button className="btn" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={create}><Icon name="check" size={16} />Create policy</button></>}>
      <Field label="Policy name"><TextInput value={name} onChange={setName} placeholder="e.g. Endpoint Hardening — Executives" /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Framework"><Select value={framework} onChange={setFramework} options={frameworks.map(f => ({ value: f, label: f }))} /></Field>
        <Field label="Category"><Select value={category} onChange={setCategory} options={categories.map(c => ({ value: c, label: c }))} /></Field>
      </div>
      <Field label="Deploy to policy groups" hint="Leave empty to save as a draft."><GroupPicker selected={groups} onChange={setGroups} /></Field>
    </Modal>
  );
}

/* ---------- Deploy policy modal ---------- */
function DeployPolicyModal() {
  const { state, dispatch, closeModal, toast } = useStore();
  const D = window.DEX;
  const p = state.policies.find(x => x.id === state.ui.modal.policyId);
  const [groups, setGroups] = React.useState(p ? p.deployedTo : []);
  if (!p) return null;
  const epCount = state.endpoints.filter(e => groups.includes(e.group)).length;

  function deploy() {
    dispatch({ type: "deployPolicy", id: p.id, groups });
    closeModal();
    toast(groups.length ? "Deployed to " + groups.length + " group(s)" : "Policy undeployed", "ok", p.name + " · " + epCount + " endpoints affected");
  }

  return (
    <Modal title="Deploy Policy" sub={p.name} icon="shield" onClose={closeModal} width={520}
      footer={<><button className="btn" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={deploy}><Icon name="check" size={16} />Apply to {epCount} endpoints</button></>}>
      <Field label="Target policy groups"><GroupPicker selected={groups} onChange={setGroups} /></Field>
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", background: "var(--primary-tint)", borderRadius: 10 }}>
        <Icon name="monitor" size={18} style={{ color: "var(--primary)" }} />
        <span style={{ fontSize: 13, color: "var(--ink)" }}><b className="mono">{epCount}</b> endpoints across <b>{groups.length}</b> group{groups.length !== 1 ? "s" : ""} will inherit this policy.</span>
      </div>
    </Modal>
  );
}

/* ============================================================
   FIREWALL
   ============================================================ */
function FirewallView() {
  const { state, dispatch, openModal, toast } = useStore();
  const D = window.DEX;
  const tenant = state.scope === "all" ? null : D.tenants.find(t => t.id === state.scope);
  const [dirF, setDirF] = React.useState("All");
  let rules = state.firewall.filter(r => dirF === "All" || r.dir === dirF);
  const inbound = state.firewall.filter(r => r.dir === "Inbound").length;
  const outbound = state.firewall.filter(r => r.dir === "Outbound").length;
  const blocks = state.firewall.filter(r => r.action === "Block").length;

  return (
    <div className="main-inner fade-in">
      <div className="page-head">
        <div className="ph-left">
          <h1 className="page-title">Firewall Policy</h1>
          <p className="page-sub">{state.scope === "all" ? "All clients · global baseline" : tenant.name} · NGFW rules · L7 application control · geo-fencing</p>
        </div>
        <div className="ph-right">
          <button className="btn" onClick={() => openModal({ type: "assignFw" })}><Icon name="users" size={16} />Assign to groups</button>
          <button className="btn btn-primary" onClick={() => openModal({ type: "newFw" })}><Icon name="plus" size={16} />Add rule</button>
        </div>
      </div>

      <div className="kpi-row" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        <Kpi label="Total rules" icon="lock" iconColor="var(--primary)" iconBg="var(--primary-tint)" value={state.firewall.length} foot={{ text: "active baseline" }} />
        <Kpi label="Inbound" icon="arrowDown" iconColor="var(--teal)" iconBg="var(--teal-tint)" value={inbound} foot={{ text: "ingress rules" }} />
        <Kpi label="Outbound" icon="arrowUp" iconColor="var(--violet)" iconBg="var(--violet-tint)" value={outbound} foot={{ text: "egress rules" }} />
        <Kpi label="Block rules" icon="isolate" iconColor="var(--crit)" iconBg="var(--crit-tint)" value={blocks} foot={{ text: "deny actions" }} />
      </div>

      <div className="filterbar">
        {["All", "Inbound", "Outbound"].map(d => (
          <button key={d} className={"fbtn" + (dirF === d ? " active" : "")} onClick={() => setDirF(d)}>{d}</button>
        ))}
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: "6px 6px" }}>
          <table className="tbl">
            <thead>
              <tr><th>Direction</th><th>Action</th><th>Protocol</th><th>Port</th><th>Source / Scope</th><th>Application</th><th>Description</th><th>Enabled</th><th></th></tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id}>
                  <td><span className={"fw-dir " + (r.dir === "Inbound" ? "in" : "out")}><Icon name={r.dir === "Inbound" ? "arrowDown" : "arrowUp"} size={13} stroke={2.4} />{r.dir}</span></td>
                  <td><span className={"fw-action " + r.action.toLowerCase()}><Icon name={r.action === "Allow" ? "check" : "isolate"} size={13} stroke={2.4} />{r.action}</span></td>
                  <td className="t-num">{r.proto}</td>
                  <td className="t-num td-strong">{r.port}</td>
                  <td className="t-num">{r.source}</td>
                  <td><span className="chip">{r.app}</span></td>
                  <td className="muted" style={{ maxWidth: 220, fontSize: 12.5 }}>{r.note}</td>
                  <td><Toggle checked={r.enabled} size="sm" onChange={() => dispatch({ type: "toggleFw", id: r.id })} /></td>
                  <td>
                    <div className="row-actions">
                      <button className="mini-btn" onClick={() => openModal({ type: "editFw", id: r.id })}><Icon name="gear" size={15} /></button>
                      <button className="mini-btn danger" onClick={() => { dispatch({ type: "deleteFw", id: r.id }); toast("Rule deleted", "warn"); }}><Icon name="plus" size={15} style={{ transform: "rotate(45deg)" }} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------- Firewall rule modal (add / edit) ---------- */
function FirewallRuleModal() {
  const { state, dispatch, closeModal, toast } = useStore();
  const editId = state.ui.modal.type === "editFw" ? state.ui.modal.id : null;
  const existing = editId ? state.firewall.find(r => r.id === editId) : null;
  const [rule, setRule] = React.useState(existing || { dir: "Inbound", action: "Allow", proto: "TCP", port: "", source: "Any", app: "", note: "", enabled: true });
  function set(patch) { setRule(r => ({ ...r, ...patch })); }

  function save() {
    if (editId) { dispatch({ type: "updateFw", id: editId, patch: rule }); toast("Rule updated", "ok"); }
    else { dispatch({ type: "addFw", rule }); toast("Rule added", "ok", rule.action + " " + rule.proto + "/" + rule.port); }
    closeModal();
  }

  return (
    <Modal title={editId ? "Edit Firewall Rule" : "Add Firewall Rule"} sub="Configure an NGFW ingress/egress rule." icon="lock" onClose={closeModal} width={560}
      footer={<><button className="btn" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={save}><Icon name="check" size={16} />{editId ? "Save changes" : "Add rule"}</button></>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Direction"><Select value={rule.dir} onChange={v => set({ dir: v })} options={[{ value: "Inbound", label: "Inbound" }, { value: "Outbound", label: "Outbound" }]} /></Field>
        <Field label="Action"><Select value={rule.action} onChange={v => set({ action: v })} options={[{ value: "Allow", label: "Allow" }, { value: "Block", label: "Block" }]} /></Field>
        <Field label="Protocol"><Select value={rule.proto} onChange={v => set({ proto: v })} options={["TCP", "UDP", "ICMP", "Any"].map(x => ({ value: x, label: x }))} /></Field>
        <Field label="Port"><TextInput value={rule.port} onChange={v => set({ port: v })} placeholder="443, Any, 1024-2048" mono /></Field>
      </div>
      <Field label="Source / Scope"><TextInput value={rule.source} onChange={v => set({ source: v })} placeholder="Any, 10.0.0.0/8, Geo: RU,KP" mono /></Field>
      <Field label="Application"><TextInput value={rule.app} onChange={v => set({ app: v })} placeholder="HTTPS, SSH, RDP…" /></Field>
      <Field label="Description"><TextInput value={rule.note} onChange={v => set({ note: v })} placeholder="What this rule does and why" /></Field>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Toggle checked={rule.enabled} onChange={v => set({ enabled: v })} />
        <span style={{ fontSize: 13, color: "var(--ink-2)" }}>Rule enabled on save</span>
      </div>
    </Modal>
  );
}

/* ---------- Assign firewall to groups ---------- */
function AssignFwModal() {
  const { state, closeModal, toast } = useStore();
  const [groups, setGroups] = React.useState(["g-ws", "g-srv"]);
  const epCount = state.endpoints.filter(e => groups.includes(e.group)).length;
  return (
    <Modal title="Assign Firewall Baseline" sub="Push the current ruleset to selected policy groups." icon="lock" onClose={closeModal} width={520}
      footer={<><button className="btn" onClick={closeModal}>Cancel</button><button className="btn btn-primary" onClick={() => { closeModal(); toast("Firewall assigned", "ok", epCount + " endpoints in " + groups.length + " group(s)"); }}><Icon name="check" size={16} />Apply to {epCount} endpoints</button></>}>
      <Field label="Target policy groups"><GroupPicker selected={groups} onChange={setGroups} /></Field>
      <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "12px 14px", background: "var(--primary-tint)", borderRadius: 10 }}>
        <Icon name="monitor" size={18} style={{ color: "var(--primary)" }} />
        <span style={{ fontSize: 13, color: "var(--ink)" }}><b className="mono">{epCount}</b> endpoints will receive {state.firewall.length} firewall rules.</span>
      </div>
    </Modal>
  );
}

Object.assign(window, { PoliciesView, PolicyEditor, NewPolicyModal, DeployPolicyModal, FirewallView, FirewallRuleModal, AssignFwModal });
