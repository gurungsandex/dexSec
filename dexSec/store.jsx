/* ============================================================
   Dex Security Cloud — shared state store
   ============================================================ */
const { createContext, useContext, useReducer, useCallback } = React;

const StoreCtx = createContext(null);

function clone(x) { return JSON.parse(JSON.stringify(x)); }

function initState() {
  const D = window.DEX;
  return {
    scope: "all",
    nav: "overview",
    incidents: clone(D.incidents),
    policies: clone(D.policyTemplates),
    firewall: clone(D.firewallBaseline),
    endpoints: clone(D.allEndpoints),
    reports: [
      { id: "RPT-0042", type: "exec", name: "Executive Risk Dashboard", scope: "all", format: "PDF", created: "2 days ago", by: "A. Okonkwo" },
      { id: "RPT-0041", type: "patch", name: "Patch Compliance", scope: "northwind", format: "CSV", created: "4 days ago", by: "Auto-schedule" },
    ],
    ui: { incidentId: null, endpointId: null, policyId: null, playbookId: null, paletteOpen: false, modal: null },
    toasts: [],
  };
}

let _tid = 0;
function reducer(s, a) {
  switch (a.type) {
    case "scope": return { ...s, scope: a.scope, ui: { ...s.ui, incidentId: null, endpointId: null } };
    case "nav": return { ...s, nav: a.nav };
    case "ui": return { ...s, ui: { ...s.ui, ...a.patch } };

    case "assign": {
      const incidents = s.incidents.map(i => i.id === a.id ? { ...i, assignee: a.assignee, status: i.status === "New" ? "Assigned" : i.status } : i);
      return { ...s, incidents };
    }
    case "incStatus": {
      const incidents = s.incidents.map(i => i.id === a.id ? { ...i, status: a.status } : i);
      return { ...s, incidents };
    }

    case "endpointGroup": {
      const endpoints = s.endpoints.map(e => e.id === a.id ? { ...e, group: a.group } : e);
      return { ...s, endpoints };
    }
    case "endpointStatus": {
      const endpoints = s.endpoints.map(e => e.id === a.id ? { ...e, status: a.status } : e);
      return { ...s, endpoints };
    }
    case "updateAsset": {
      const endpoints = s.endpoints.map(e => e.id === a.id ? { ...e, ...a.patch } : e);
      return { ...s, endpoints };
    }

    case "addPolicy": return { ...s, policies: [a.policy, ...s.policies] };
    case "updatePolicy": {
      const policies = s.policies.map(p => p.id === a.id ? { ...p, ...a.patch } : p);
      return { ...s, policies };
    }
    case "toggleRule": {
      const policies = s.policies.map(p => {
        if (p.id !== a.id) return p;
        const sections = p.sections.map((sec, si) => si !== a.si ? sec : {
          ...sec, rules: sec.rules.map((r, ri) => ri !== a.ri ? r : { ...r, enabled: !r.enabled })
        });
        return { ...p, sections };
      });
      return { ...s, policies };
    }
    case "deployPolicy": {
      const policies = s.policies.map(p => p.id === a.id ? { ...p, deployedTo: a.groups, status: a.groups.length ? "Deployed" : "Draft" } : p);
      return { ...s, policies };
    }

    case "addFw": return { ...s, firewall: [{ ...a.rule, id: "fw-" + (++_tid) }, ...s.firewall] };
    case "updateFw": return { ...s, firewall: s.firewall.map(r => r.id === a.id ? { ...r, ...a.patch } : r) };
    case "deleteFw": return { ...s, firewall: s.firewall.filter(r => r.id !== a.id) };
    case "toggleFw": return { ...s, firewall: s.firewall.map(r => r.id === a.id ? { ...r, enabled: !r.enabled } : r) };

    case "addReport": return { ...s, reports: [a.report, ...s.reports] };

    case "toast": return { ...s, toasts: [...s.toasts, { id: ++_tid, ...a.toast }] };
    case "dismissToast": return { ...s, toasts: s.toasts.filter(t => t.id !== a.id) };

    default: return s;
  }
}

function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);

  const toast = useCallback((msg, kind = "ok", sub) => {
    const id = ++_tid;
    dispatch({ type: "toast", toast: { msg, kind, sub, id } });
    setTimeout(() => dispatch({ type: "dismissToast", id }), 3600);
  }, []);

  const api = {
    state, dispatch, toast,
    setScope: (scope) => dispatch({ type: "scope", scope }),
    setNav: (nav) => dispatch({ type: "nav", nav }),
    ui: (patch) => dispatch({ type: "ui", patch }),
    openIncident: (id) => dispatch({ type: "ui", patch: { incidentId: id } }),
    openEndpoint: (id) => dispatch({ type: "ui", patch: { endpointId: id } }),
    openPolicy: (id) => dispatch({ type: "ui", patch: { policyId: id } }),
    openPlaybook: (id) => dispatch({ type: "ui", patch: { playbookId: id } }),
    openModal: (modal) => dispatch({ type: "ui", patch: { modal } }),
    closeModal: () => dispatch({ type: "ui", patch: { modal: null } }),
    openPalette: () => dispatch({ type: "ui", patch: { paletteOpen: true } }),
    closePalette: () => dispatch({ type: "ui", patch: { paletteOpen: false } }),
  };

  return React.createElement(StoreCtx.Provider, { value: api }, children);
}

function useStore() { return useContext(StoreCtx); }

/* selectors */
function scopedIncidents(state) {
  return state.scope === "all" ? state.incidents : state.incidents.filter(i => i.tenant === state.scope);
}
function scopedEndpoints(state) {
  return state.scope === "all" ? state.endpoints : state.endpoints.filter(e => e.tenant === state.scope);
}

Object.assign(window, { StoreProvider, useStore, StoreCtx, scopedIncidents, scopedEndpoints });
