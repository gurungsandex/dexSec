"use client";
import { LogoMark, Wordmark } from "@/components/shell/logo";
import { TopBar } from "@/components/shell/topbar";
import { Sidebar } from "@/components/shell/sidebar";
import { CommandPalette } from "@/components/shell/command-palette";
import { IncidentDrawer } from "@/components/shell/incident-drawer";
import { EndpointDrawer } from "@/components/shell/endpoint-drawer";
import { AriaPanel } from "@/components/shell/aria-panel";
import { ToastRegion } from "@/components/ui/toast";
import { useUIStore } from "@/store/ui-store";
import { PortfolioOverview } from "@/views/portfolio-overview";
import { TenantOverview } from "@/views/tenant-overview";
import { Incidents } from "@/views/incidents";
import { SocWorkspace } from "@/views/soc";
import { Endpoints } from "@/views/endpoints";
import { Policies } from "@/views/policies";
import { Firewall } from "@/views/firewall";
import { Patch } from "@/views/patch";
import { Assets } from "@/views/assets";
import { Reports } from "@/views/reports";
import { Agents } from "@/views/agents";
import { DownloadCenter } from "@/views/download-center";
import { TelemetryStream } from "@/views/telemetry";
import { StubView } from "@/views/stub";

const STUB_LABELS: Record<string, string> = {
  integrations: "Integrations",
  audit: "Audit Log",
  settings: "Settings",
};

function MainContent() {
  const { nav, scope } = useUIStore();

  if (nav === "overview")        return scope === "all" ? <PortfolioOverview /> : <TenantOverview />;
  if (nav === "incidents")       return <Incidents />;
  if (nav === "soc")             return <SocWorkspace />;
  if (nav === "endpoints")       return <Endpoints />;
  if (nav === "telemetry")       return <TelemetryStream />;
  if (nav === "policies")        return <Policies />;
  if (nav === "firewall")        return <Firewall />;
  if (nav === "patch")           return <Patch />;
  if (nav === "agents")          return <Agents />;
  if (nav === "assets")          return <Assets />;
  if (nav === "download-center") return <DownloadCenter />;
  if (nav === "reports")         return <Reports />;

  return <StubView title={STUB_LABELS[nav] ?? nav} />;
}

export default function Page() {
  return (
    <div
      className="h-full"
      style={{
        display: "grid",
        gridTemplateColumns: "var(--sidebar-w) 1fr",
        gridTemplateRows: "var(--topbar-h) 1fr",
        gridTemplateAreas: '"brand topbar" "sidebar main"',
      }}
    >
      {/* Brand cell */}
      <div
        className="flex items-center gap-2.5 px-[18px] border-b border-r"
        style={{ gridArea: "brand", background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <LogoMark />
        <Wordmark />
      </div>

      {/* Top bar */}
      <TopBar />

      {/* Sidebar */}
      <Sidebar />

      {/* Main scrolling content */}
      <main
        className="overflow-y-auto"
        style={{ gridArea: "main", background: "var(--bg)" }}
      >
        <MainContent />
      </main>

      {/* Global overlays */}
      <CommandPalette />
      <IncidentDrawer />
      <EndpointDrawer />
      <AriaPanel />
      <ToastRegion />
    </div>
  );
}
