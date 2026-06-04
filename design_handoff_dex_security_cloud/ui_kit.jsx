/* ============================================================
   Dex Security Cloud — UI kit (modals, toasts, forms, palette)
   ============================================================ */

/* ---------- Modal ---------- */
function Modal({ title, sub, onClose, children, footer, width = 520, icon }) {
  React.useEffect(() => {
    function k(e) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, []);
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" style={{ width }} onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          {icon && <div className="modal-icon"><Icon name={icon} size={18} /></div>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>{title}</h2>
            {sub && <p>{sub}</p>}
          </div>
          <button className="icon-btn" onClick={onClose}><Icon name="plus" size={20} style={{ transform: "rotate(45deg)" }} /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Toggle ---------- */
function Toggle({ checked, onChange, size = "md" }) {
  return (
    <button type="button" className={"toggle" + (checked ? " on" : "") + (size === "sm" ? " sm" : "")} onClick={() => onChange(!checked)} role="switch" aria-checked={checked}>
      <span className="toggle-knob" />
    </button>
  );
}

/* ---------- Field wrapper ---------- */
function Field({ label, hint, children }) {
  return (
    <label className="field">
      {label && <span className="field-label">{label}</span>}
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, mono }) {
  return <input className={"input" + (mono ? " mono" : "")} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />;
}
function Select({ value, onChange, options }) {
  return (
    <div className="select-wrap">
      <select className="select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <Icon name="chevron" size={15} className="select-chev" />
    </div>
  );
}

/* ---------- Group multi-picker ---------- */
function GroupPicker({ selected, onChange }) {
  const D = window.DEX;
  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  }
  return (
    <div className="group-picker">
      {D.groups.map(g => {
        const on = selected.includes(g.id);
        return (
          <button type="button" key={g.id} className={"group-chip" + (on ? " on" : "")} onClick={() => toggle(g.id)}>
            <span className="gc-check">{on && <Icon name="check" size={12} stroke={3} />}</span>
            <span>{g.name}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Toast host ---------- */
function ToastHost() {
  const { state, dispatch } = useStore();
  const iconFor = { ok: "check", info: "pulse", warn: "alert", danger: "fire", isolate: "isolate" };
  return (
    <div className="toast-host">
      {state.toasts.map(t => (
        <div key={t.id} className={"toast " + t.kind} onClick={() => dispatch({ type: "dismissToast", id: t.id })}>
          <span className="toast-ic"><Icon name={iconFor[t.kind] || "check"} size={15} stroke={2.4} /></span>
          <div className="toast-body">
            <div className="toast-msg">{t.msg}</div>
            {t.sub && <div className="toast-sub">{t.sub}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Command palette (⌘K) ---------- */
function CommandPalette() {
  const { state, closePalette, setScope, setNav, openIncident, openEndpoint, openPolicy } = useStore();
  const D = window.DEX;
  const [q, setQ] = React.useState("");
  const [idx, setIdx] = React.useState(0);

  React.useEffect(() => { setQ(""); setIdx(0); }, [state.ui.paletteOpen]);

  const results = React.useMemo(() => {
    const ql = q.trim().toLowerCase();
    const out = [];
    // tenants
    D.tenants.forEach(t => {
      if (!ql || t.name.toLowerCase().includes(ql) || t.industry.toLowerCase().includes(ql))
        out.push({ kind: "Client", icon: "grid", label: t.name, sub: t.industry, color: t.color, run: () => { setScope(t.id); setNav("overview"); } });
    });
    // incidents
    state.incidents.forEach(i => {
      if (!ql || i.id.toLowerCase().includes(ql) || i.title.toLowerCase().includes(ql) || i.asset.toLowerCase().includes(ql) || i.ttp.join(" ").toLowerCase().includes(ql))
        out.push({ kind: "Incident", icon: "alert", label: i.title, sub: i.id + " · " + i.asset, sev: i.sev, run: () => { openIncident(i.id); } });
    });
    // endpoints
    state.endpoints.forEach(e => {
      if (ql && (e.host.toLowerCase().includes(ql) || e.ip.includes(ql) || e.user.toLowerCase().includes(ql) || e.owner.toLowerCase().includes(ql)))
        out.push({ kind: "Asset", icon: "monitor", label: e.host, sub: e.ip + " · " + e.owner, run: () => { setScope(e.tenant); setNav("endpoints"); openEndpoint(e.id); } });
    });
    // policies
    state.policies.forEach(p => {
      if (ql && (p.name.toLowerCase().includes(ql) || p.framework.toLowerCase().includes(ql)))
        out.push({ kind: "Policy", icon: "shield", label: p.name, sub: p.framework, run: () => { setNav("policies"); openPolicy(p.id); } });
    });
    // nav
    const navs = [["overview", "Overview", "grid"], ["incidents", "Incidents", "alert"], ["soc", "SOC Workspace", "users"], ["endpoints", "Endpoints", "monitor"], ["policies", "Policies", "shield"], ["firewall", "Firewall", "lock"], ["patch", "Patch", "patch"], ["assets", "Assets", "box"], ["reports", "Reports", "report"]];
    navs.forEach(([id, label, icon]) => {
      if (ql && label.toLowerCase().includes(ql)) out.push({ kind: "Go to", icon, label, sub: "Navigate", run: () => setNav(id) });
    });
    return out.slice(0, 14);
  }, [q, state.incidents, state.endpoints, state.policies]);

  React.useEffect(() => {
    function k(e) {
      if (e.key === "ArrowDown") { e.preventDefault(); setIdx(i => Math.min(i + 1, results.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setIdx(i => Math.max(i - 1, 0)); }
      else if (e.key === "Enter") { e.preventDefault(); const r = results[idx]; if (r) { r.run(); closePalette(); } }
      else if (e.key === "Escape") { closePalette(); }
    }
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [results, idx]);

  let lastKind = null;
  return (
    <div className="palette-scrim" onClick={closePalette}>
      <div className="palette" onClick={e => e.stopPropagation()}>
        <div className="palette-search">
          <Icon name="search" size={18} style={{ color: "var(--ink-4)" }} />
          <input autoFocus placeholder="Search clients, incidents, assets, policies…" value={q} onChange={e => { setQ(e.target.value); setIdx(0); }} />
          <span className="kbd">ESC</span>
        </div>
        <div className="palette-results">
          {results.length === 0 && <div className="palette-empty">No matches{q ? " for \u201c" + q + "\u201d" : ""}.</div>}
          {results.map((r, i) => {
            const head = r.kind !== lastKind ? <div className="palette-group" key={"g" + i}>{r.kind}</div> : null;
            lastKind = r.kind;
            return (
              <React.Fragment key={i}>
                {head}
                <button className={"palette-item" + (i === idx ? " active" : "")} onMouseEnter={() => setIdx(i)} onClick={() => { r.run(); closePalette(); }}>
                  <span className="pi-ic" style={r.color ? { background: r.color, color: "#fff" } : {}}><Icon name={r.icon} size={15} /></span>
                  <span className="pi-body">
                    <span className="pi-label">{r.label}</span>
                    <span className="pi-sub">{r.sub}</span>
                  </span>
                  {r.sev && <Sev level={r.sev} />}
                  <Icon name="chevronR" size={15} className="pi-go" />
                </button>
              </React.Fragment>
            );
          })}
        </div>
        <div className="palette-foot">
          <span><span className="kbd">↑↓</span> navigate</span>
          <span><span className="kbd">↵</span> open</span>
          <span><span className="kbd">esc</span> close</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Modal, Toggle, Field, TextInput, Select, GroupPicker, ToastHost, CommandPalette });
