// Mock data — mirrors data.js + data_extra.js shapes.
// In production replace with TanStack Query fetching real API.

export interface Tenant {
  id: string;
  name: string;
  short: string;
  industry: string;
  color: string;
  region: string;
  since: string;
  endpoints: number;
  online: number;
  atrisk: number;
  offline: number;
  risk: number;
  riskDelta: number;
  openIncidents: number;
  critical: number;
  high: number;
  patch: number;
  missingCritical: number;
  policiesDeployed: number;
  coverage: number;
  compliance: string[];
  tier: string;
  seed: number;
}

export const TENANTS: Tenant[] = [
  {
    id: "northwind", name: "Northwind Health", short: "NH", industry: "Healthcare",
    color: "#E5484D", region: "US-East", since: "Mar 2023",
    endpoints: 842, online: 791, atrisk: 38, offline: 51,
    risk: 74, riskDelta: +6, openIncidents: 19, critical: 3, high: 6,
    patch: 81, missingCritical: 12, policiesDeployed: 14, coverage: 96,
    compliance: ["HIPAA", "HITRUST"], tier: "Managed Detection + Response", seed: 11,
  },
  {
    id: "meridian", name: "Meridian Financial", short: "MF", industry: "Financial Services",
    color: "#3052E6", region: "US-East", since: "Jan 2022",
    endpoints: 1126, online: 1098, atrisk: 14, offline: 14,
    risk: 41, riskDelta: -3, openIncidents: 11, critical: 1, high: 3,
    patch: 94, missingCritical: 4, policiesDeployed: 18, coverage: 99,
    compliance: ["PCI-DSS", "SOX", "GLBA"], tier: "Managed Detection + Response", seed: 22,
  },
  {
    id: "voltaic", name: "Voltaic Energy", short: "VE", industry: "Energy / Utilities",
    color: "#EE7117", region: "US-Central", since: "Sep 2023",
    endpoints: 614, online: 559, atrisk: 27, offline: 28,
    risk: 68, riskDelta: +11, openIncidents: 16, critical: 2, high: 7,
    patch: 73, missingCritical: 18, policiesDeployed: 12, coverage: 91,
    compliance: ["NERC CIP", "ISO 27001"], tier: "MDR + OT Monitoring", seed: 33,
  },
  {
    id: "cobalt", name: "Cobalt Logistics", short: "CL", industry: "Transportation",
    color: "#0E9389", region: "US-West", since: "Jun 2024",
    endpoints: 388, online: 366, atrisk: 11, offline: 11,
    risk: 52, riskDelta: +2, openIncidents: 8, critical: 0, high: 3,
    patch: 88, missingCritical: 6, policiesDeployed: 11, coverage: 97,
    compliance: ["ISO 27001"], tier: "Managed Detection", seed: 44,
  },
  {
    id: "helix", name: "Helix Biotech", short: "HX", industry: "Pharmaceutical",
    color: "#6B4FE0", region: "EU-West", since: "Nov 2023",
    endpoints: 503, online: 487, atrisk: 9, offline: 7,
    risk: 58, riskDelta: -4, openIncidents: 10, critical: 1, high: 2,
    patch: 90, missingCritical: 5, policiesDeployed: 15, coverage: 98,
    compliance: ["GDPR", "GxP", "ISO 27001"], tier: "MDR + IP Protection", seed: 55,
  },
  {
    id: "brightpath", name: "Brightpath Education", short: "BP", industry: "Education",
    color: "#C99400", region: "US-Central", since: "Aug 2024",
    endpoints: 297, online: 268, atrisk: 18, offline: 11,
    risk: 63, riskDelta: +8, openIncidents: 13, critical: 1, high: 4,
    patch: 70, missingCritical: 14, policiesDeployed: 9, coverage: 88,
    compliance: ["FERPA"], tier: "Managed Detection", seed: 66,
  },
  {
    id: "atlas", name: "Atlas Manufacturing", short: "AM", industry: "Industrial",
    color: "#5C6B82", region: "US-West", since: "Feb 2024",
    endpoints: 271, online: 252, atrisk: 12, offline: 7,
    risk: 49, riskDelta: -1, openIncidents: 7, critical: 0, high: 2,
    patch: 85, missingCritical: 7, policiesDeployed: 10, coverage: 95,
    compliance: ["ISO 27001", "NIST CSF"], tier: "Managed Detection", seed: 77,
  },
  {
    id: "lumen", name: "Lumen Retail Group", short: "LR", industry: "Retail",
    color: "#0EA5E9", region: "US-East", since: "May 2023",
    endpoints: 141, online: 131, atrisk: 6, offline: 4,
    risk: 45, riskDelta: +1, openIncidents: 6, critical: 0, high: 1,
    patch: 92, missingCritical: 3, policiesDeployed: 13, coverage: 98,
    compliance: ["PCI-DSS"], tier: "Managed Detection", seed: 88,
  },
];

export type Severity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "new" | "assigned" | "investigating" | "resolved";

export interface Incident {
  id: string;
  tenantId: string;
  severity: Severity;
  title: string;
  asset: string;
  ttp: string;
  status: IncidentStatus;
  assignee: string | null;
  ageHours: number;
  cvss: number;
  description: string;
}

export const INCIDENTS: Incident[] = [
  { id: "INC-4421", tenantId: "northwind", severity: "critical", title: "Ransomware staging detected on NWDC-04", asset: "NWDC-04", ttp: "T1486", status: "investigating", assignee: "A. Chen", ageHours: 2, cvss: 9.8, description: "CrowdStrike Falcon detected ransomware staging behavior. Lateral movement via SMB confirmed." },
  { id: "INC-4420", tenantId: "northwind", severity: "high", title: "Credential stuffing – patient portal", asset: "portal.northwind.health", ttp: "T1110.004", status: "assigned", assignee: "B. Park", ageHours: 4, cvss: 7.5, description: "High-volume credential stuffing from 14 distinct IPs detected against patient portal." },
  { id: "INC-4419", tenantId: "voltaic", severity: "critical", title: "OT network lateral movement attempt", asset: "SCADA-GW-01", ttp: "T1021.002", status: "new", assignee: null, ageHours: 1, cvss: 9.1, description: "Unauthorized SMB enumeration from IT network into OT segment. NERC CIP reportable event." },
  { id: "INC-4418", tenantId: "meridian", severity: "high", title: "Suspicious PowerShell exfiltration", asset: "MF-WKSTN-221", ttp: "T1059.001", status: "assigned", assignee: "S. Okafor", ageHours: 6, cvss: 8.1, description: "Encoded PowerShell invoking outbound connections to known C2 infrastructure." },
  { id: "INC-4417", tenantId: "helix", severity: "high", title: "Privilege escalation — R&D host", asset: "HX-RD-14", ttp: "T1068", status: "investigating", assignee: "A. Chen", ageHours: 10, cvss: 7.8, description: "Local privilege escalation exploit detected on research workstation." },
  { id: "INC-4416", tenantId: "brightpath", severity: "critical", title: "Data exfiltration via cloud storage", asset: "BP-STAFF-07", ttp: "T1567.002", status: "new", assignee: null, ageHours: 3, cvss: 8.6, description: "Large upload to personal cloud storage account. Student PII potentially exposed." },
  { id: "INC-4415", tenantId: "cobalt", severity: "medium", title: "Anomalous login from new geography", asset: "CL-VPN-02", ttp: "T1078", status: "resolved", assignee: "B. Park", ageHours: 28, cvss: 5.4, description: "VPN login from EU IP for US-based account. User confirmed travel." },
  { id: "INC-4414", tenantId: "northwind", severity: "high", title: "Unpatched CVE exploited — web server", asset: "NW-WEB-03", ttp: "T1190", status: "assigned", assignee: "S. Okafor", ageHours: 14, cvss: 8.0, description: "Exploitation of CVE-2024-21413 on unpatched Exchange server." },
  { id: "INC-4413", tenantId: "atlas", severity: "medium", title: "USB mass storage policy violation", asset: "AM-FLOOR-12", ttp: "T1091", status: "resolved", assignee: "A. Chen", ageHours: 36, cvss: 4.9, description: "USB mass storage device connected in breach of CIS control." },
  { id: "INC-4412", tenantId: "lumen", severity: "low", title: "Failed patch deployment — POS cluster", asset: "POS-CLUSTER-A", ttp: "T1072", status: "resolved", assignee: "B. Park", ageHours: 48, cvss: 3.1, description: "Patch deployment failed on POS cluster. Vendor coordinating rescheduled window." },
];

export interface Endpoint {
  id: string;
  tenantId: string;
  hostname: string;
  os: "windows" | "linux" | "macos";
  ip: string;
  user: string;
  group: string;
  health: number;
  status: "online" | "atrisk" | "offline" | "isolated";
  lastSeen: string;
}

export const ENDPOINTS: Endpoint[] = [
  { id: "ep-001", tenantId: "northwind", hostname: "NWDC-04", os: "windows", ip: "10.1.4.22", user: "svc-backup", group: "Domain Controllers", health: 18, status: "atrisk", lastSeen: "2 min ago" },
  { id: "ep-002", tenantId: "northwind", hostname: "NW-WEB-03", os: "windows", ip: "10.1.8.14", user: "iis_apppool", group: "Web Servers", health: 42, status: "atrisk", lastSeen: "5 min ago" },
  { id: "ep-003", tenantId: "meridian", hostname: "MF-WKSTN-221", os: "windows", ip: "172.16.3.45", user: "j.harris", group: "Finance", health: 55, status: "online", lastSeen: "1 min ago" },
  { id: "ep-004", tenantId: "voltaic", hostname: "SCADA-GW-01", os: "linux", ip: "192.168.10.1", user: "root", group: "OT Gateway", health: 12, status: "isolated", lastSeen: "3 min ago" },
  { id: "ep-005", tenantId: "helix", hostname: "HX-RD-14", os: "macos", ip: "10.20.4.88", user: "r.patel", group: "R&D", health: 61, status: "atrisk", lastSeen: "8 min ago" },
  { id: "ep-006", tenantId: "cobalt", hostname: "CL-VPN-02", os: "linux", ip: "10.30.1.5", user: "vpn-daemon", group: "Network", health: 88, status: "online", lastSeen: "30 sec ago" },
  { id: "ep-007", tenantId: "brightpath", hostname: "BP-STAFF-07", os: "windows", ip: "192.168.5.77", user: "t.nguyen", group: "Staff", health: 30, status: "atrisk", lastSeen: "10 min ago" },
  { id: "ep-008", tenantId: "atlas", hostname: "AM-FLOOR-12", os: "windows", ip: "10.50.2.12", user: "operator", group: "Production Floor", health: 72, status: "online", lastSeen: "2 min ago" },
  { id: "ep-009", tenantId: "lumen", hostname: "POS-CLUSTER-A", os: "windows", ip: "10.60.1.100", user: "pos-svc", group: "POS Systems", health: 79, status: "online", lastSeen: "1 min ago" },
  { id: "ep-010", tenantId: "northwind", hostname: "NW-NURSE-08", os: "windows", ip: "10.1.6.18", user: "n.adams", group: "Clinical", health: 91, status: "online", lastSeen: "45 sec ago" },
];

export interface Analyst {
  id: string;
  name: string;
  avatar: string;
  role: string;
  onCall: boolean;
  openCount: number;
}

export const ANALYSTS: Analyst[] = [
  { id: "analyst-1", name: "A. Chen", avatar: "AC", role: "IR Lead", onCall: true, openCount: 4 },
  { id: "analyst-2", name: "B. Park", avatar: "BP", role: "Tier 2", onCall: true, openCount: 3 },
  { id: "analyst-3", name: "S. Okafor", avatar: "SO", role: "Tier 1", onCall: false, openCount: 2 },
  { id: "analyst-4", name: "M. Torres", avatar: "MT", role: "Tier 1", onCall: false, openCount: 0 },
];

// Aggregate portfolio stats
export function getPortfolioStats(tenants: Tenant[]) {
  return {
    totalEndpoints: tenants.reduce((s, t) => s + t.endpoints, 0),
    openIncidents:  tenants.reduce((s, t) => s + t.openIncidents, 0),
    critical:       tenants.reduce((s, t) => s + t.critical, 0),
    avgRisk:        Math.round(tenants.reduce((s, t) => s + t.risk, 0) / tenants.length),
    avgPatch:       Math.round(tenants.reduce((s, t) => s + t.patch, 0) / tenants.length),
  };
}

export function riskColor(score: number): string {
  if (score >= 67) return "var(--crit)";
  if (score >= 50) return "var(--high)";
  if (score >= 34) return "var(--med)";
  return "var(--ok)";
}

export function severityColor(sev: Severity) {
  const map: Record<Severity, { fg: string; bg: string }> = {
    critical: { fg: "var(--crit)", bg: "var(--crit-tint)" },
    high:     { fg: "var(--high)", bg: "var(--high-tint)" },
    medium:   { fg: "var(--med)",  bg: "var(--med-tint)"  },
    low:      { fg: "var(--low)",  bg: "var(--low-tint)"  },
  };
  return map[sev];
}
