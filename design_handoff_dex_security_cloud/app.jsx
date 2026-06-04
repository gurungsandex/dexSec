/* ============================================================
   Dex Security Cloud — App
   ============================================================ */

function Shell() {
  const { state, setScope, setNav, openPalette, closeModal } = useStore();
  const D = window.DEX;
  const { scope, nav } = state;

  const tenant = scope === "all" ? null : D.tenants.find(t => t.id === scope);
  const openIncidents = scope === "all"
    ? scopedIncidents(state).filter(i => i.status !== "Closed" && i.status !== "Resolved").length
    : scopedIncidents(state).filter(i => i.status !== "Closed" && i.status !== "Resolved").length;
  const scopeLabel = scope === "all" ? "All clients" : tenant.name;

  // ⌘K palette + ARIA
  React.useEffect(() => {
    function k(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); }
    }
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, []);

  let view;
  switch (nav) {
    case "overview": view = scope === "all" ? <AllClientsOverview /> : <TenantOverview />; break;
    case "incidents": view = <IncidentsView />; break;
    case "soc": view = <SOCView />; break;
    case "endpoints": view = <EndpointsView />; break;
    case "policies": view = <PoliciesView />; break;
    case "firewall": view = <FirewallView />; break;
    case "patch": view = <PatchView />; break;
    case "assets": view = <AssetsView />; break;
    case "reports": view = <ReportsView />; break;
    default: view = <Placeholder />;
  }

  const modal = state.ui.modal;

  return (
    <div className="app">
      <TopBar tenants={D.tenants} current={scope} onSelect={setScope} onPalette={openPalette} onAria={openPalette} />
      <Sidebar active={nav} onNav={setNav} openIncidents={openIncidents} scopeLabel={scopeLabel} />
      <main className="main" key={scope + nav}>{view}</main>

      {/* drawers */}
      {state.ui.incidentId && <IncidentDrawer />}
      {state.ui.endpointId && <EndpointDrawer />}
      {state.ui.policyId && <PolicyEditor />}
      {state.ui.playbookId && <PlaybookDrawer />}

      {/* palette */}
      {state.ui.paletteOpen && <CommandPalette />}

      {/* modals */}
      {modal && modal.type === "newPolicy" && <NewPolicyModal />}
      {modal && modal.type === "deployPolicy" && <DeployPolicyModal />}
      {modal && (modal.type === "newFw" || modal.type === "editFw") && <FirewallRuleModal />}
      {modal && modal.type === "assignFw" && <AssignFwModal />}
      {modal && modal.type === "editAsset" && <EditAssetModal />}
      {modal && modal.type === "newReport" && <NewReportModal />}

      {/* toasts */}
      <ToastHost />
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
