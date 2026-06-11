/* ============================================================
   Dex Security Cloud — mock MSSP data
   Deterministic, attached to window.DEX
   ============================================================ */
(function () {
  // seeded RNG for reproducible sparkline/trend data
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function trend(seed, n, base, spread, drift) {
    const r = mulberry32(seed); const out = [];
    let v = base;
    for (let i = 0; i < n; i++) {
      v += (r() - 0.5) * spread + drift;
      out.push(Math.max(0, Math.round(v)));
    }
    return out;
  }

  const tenants = [
    {
      id: "northwind", name: "Northwind Health", short: "NH", industry: "Healthcare",
      color: "#E5484D", region: "US-East", since: "Mar 2023",
      endpoints: 842, online: 791, atrisk: 38, offline: 51,
      risk: 74, riskDelta: +6, openIncidents: 19, critical: 3, high: 6,
      patch: 81, missingCritical: 12, policiesDeployed: 14, coverage: 96,
      compliance: ["HIPAA", "HITRUST"], tier: "Managed Detection + Response",
      seed: 11,
    },
    {
      id: "meridian", name: "Meridian Financial", short: "MF", industry: "Financial Services",
      color: "#3052E6", region: "US-East", since: "Jan 2022",
      endpoints: 1126, online: 1098, atrisk: 14, offline: 14,
      risk: 41, riskDelta: -3, openIncidents: 11, critical: 1, high: 3,
      patch: 94, missingCritical: 4, policiesDeployed: 18, coverage: 99,
      compliance: ["PCI-DSS", "SOX", "GLBA"], tier: "Managed Detection + Response",
      seed: 22,
    },
    {
      id: "voltaic", name: "Voltaic Energy", short: "VE", industry: "Energy / Utilities",
      color: "#EE7117", region: "US-Central", since: "Sep 2023",
      endpoints: 614, online: 559, atrisk: 27, offline: 28,
      risk: 68, riskDelta: +11, openIncidents: 16, critical: 2, high: 7,
      patch: 73, missingCritical: 18, policiesDeployed: 12, coverage: 91,
      compliance: ["NERC CIP", "ISO 27001"], tier: "MDR + OT Monitoring",
      seed: 33,
    },
    {
      id: "cobalt", name: "Cobalt Logistics", short: "CL", industry: "Transportation",
      color: "#0E9389", region: "US-West", since: "Jun 2024",
      endpoints: 388, online: 366, atrisk: 11, offline: 11,
      risk: 52, riskDelta: +2, openIncidents: 8, critical: 0, high: 3,
      patch: 88, missingCritical: 6, policiesDeployed: 11, coverage: 97,
      compliance: ["ISO 27001"], tier: "Managed Detection",
      seed: 44,
    },
    {
      id: "helix", name: "Helix Biotech", short: "HX", industry: "Pharmaceutical",
      color: "#6B4FE0", region: "EU-West", since: "Nov 2023",
      endpoints: 503, online: 487, atrisk: 9, offline: 7,
      risk: 58, riskDelta: -4, openIncidents: 10, critical: 1, high: 2,
      patch: 90, missingCritical: 5, policiesDeployed: 15, coverage: 98,
      compliance: ["GDPR", "GxP", "ISO 27001"], tier: "MDR + IP Protection",
      seed: 55,
    },
    {
      id: "brightpath", name: "Brightpath Education", short: "BP", industry: "Education",
      color: "#C99400", region: "US-Central", since: "Aug 2024",
      endpoints: 297, online: 268, atrisk: 18, offline: 11,
      risk: 63, riskDelta: +8, openIncidents: 13, critical: 1, high: 4,
      patch: 70, missingCritical: 14, policiesDeployed: 9, coverage: 88,
      compliance: ["FERPA"], tier: "Managed Detection",
      seed: 66,
    },
    {
      id: "atlas", name: "Atlas Manufacturing", short: "AM", industry: "Industrial",
      color: "#5C6B82", region: "US-West", since: "Feb 2024",
      endpoints: 271, online: 252, atrisk: 12, offline: 7,
      risk: 49, riskDelta: -1, openIncidents: 7, critical: 0, high: 2,
      patch: 85, missingCritical: 7, policiesDeployed: 10, coverage: 95,
      compliance: ["ISO 27001", "NIST CSF"], tier: "Managed Detection",
      seed: 77,
    },
    {
      id: "lumen", name: "Lumen Retail Group", short: "LR", industry: "Retail",
      color: "#0EA5E9", region: "US-East", since: "May 2023",
      endpoints: 141, online: 131, atrisk: 6, offline: 4,
      risk: 45, riskDelta: +1, openIncidents: 6, critical: 0, high: 1,
      patch: 92, missingCritical: 3, policiesDeployed: 13, coverage: 98,
      compliance: ["PCI-DSS"], tier: "Managed Detection",
      seed: 88,
    },
  ];

  // 14-day incident trend per tenant (stacked-ish: total)
  tenants.forEach(t => {
    t.riskTrend = trend(t.seed, 14, t.risk - 8, 6, t.riskDelta / 14 + 0.4);
    t.incTrend = trend(t.seed + 1, 14, Math.max(1, t.openIncidents - 4), 3, 0.15);
  });

  function riskColor(r) {
    if (r >= 67) return "#E5484D";
    if (r >= 50) return "#EE7117";
    if (r >= 34) return "#C99400";
    return "#18935A";
  }
  function riskLabel(r) {
    if (r >= 67) return "Critical";
    if (r >= 50) return "Elevated";
    if (r >= 34) return "Moderate";
    return "Low";
  }

  // ---- incidents ----
  const sevRank = { Critical: 0, High: 1, Medium: 2, Low: 3, Info: 4 };
  const incidents = [
    { id: "INC-4821", tenant: "northwind", sev: "Critical", title: "Ransomware pre-encryption behavior on clinical workstation", asset: "NH-CLIN-204", assetIp: "10.18.4.204", ttp: ["T1486", "T1490"], ttpName: "Data Encrypted for Impact", status: "In Progress", assignee: "K. Okafor", age: "38m", detected: "Behavioral analytics", cvss: 9.6 },
    { id: "INC-4820", tenant: "voltaic", sev: "Critical", title: "Suspicious OT protocol traffic to external IP", asset: "VE-SCADA-07", assetIp: "172.20.9.7", ttp: ["T0885", "T1071"], ttpName: "Commonly Used Port (ICS)", status: "Assigned", assignee: "M. Reyes", age: "1h 12m", detected: "Network anomaly", cvss: 9.1 },
    { id: "INC-4817", tenant: "northwind", sev: "Critical", title: "Credential dumping via LSASS access", asset: "NH-DC-01", assetIp: "10.18.1.10", ttp: ["T1003.001"], ttpName: "OS Credential Dumping: LSASS", status: "New", assignee: null, age: "2h 04m", detected: "EDR signature", cvss: 8.8 },
    { id: "INC-4814", tenant: "meridian", sev: "Critical", title: "Privilege escalation through unquoted service path", asset: "MF-APP-118", assetIp: "10.4.7.118", ttp: ["T1543.003", "T1068"], ttpName: "Create or Modify System Process", status: "In Progress", assignee: "D. Cho", age: "3h 41m", detected: "Behavioral analytics", cvss: 8.2 },
    { id: "INC-4811", tenant: "helix", sev: "Critical", title: "Exfiltration of research data to unsanctioned cloud", asset: "HX-RND-44", assetIp: "10.51.6.44", ttp: ["T1567.002"], ttpName: "Exfiltration to Cloud Storage", status: "Assigned", assignee: "S. Ahmadi", age: "5h 22m", detected: "DLP + anomaly", cvss: 8.0 },

    { id: "INC-4809", tenant: "voltaic", sev: "High", title: "Brute-force authentication on VPN gateway", asset: "VE-VPN-02", assetIp: "172.20.1.2", ttp: ["T1110.001"], ttpName: "Password Guessing", status: "New", assignee: null, age: "44m", detected: "Auth telemetry", cvss: 7.5 },
    { id: "INC-4806", tenant: "brightpath", sev: "High", title: "Phishing payload executed — macro-enabled document", asset: "BP-LAB-77", assetIp: "10.62.3.77", ttp: ["T1566.001", "T1204.002"], ttpName: "Spearphishing Attachment", status: "Assigned", assignee: "L. Tran", age: "1h 30m", detected: "EDR + email gw", cvss: 7.3 },
    { id: "INC-4803", tenant: "northwind", sev: "High", title: "Lateral movement via SMB to multiple hosts", asset: "NH-WS-119", assetIp: "10.18.4.119", ttp: ["T1021.002"], ttpName: "SMB/Windows Admin Shares", status: "In Progress", assignee: "K. Okafor", age: "2h 50m", detected: "Network analytics", cvss: 7.1 },
    { id: "INC-4801", tenant: "meridian", sev: "High", title: "Anomalous data access — off-hours bulk DB query", asset: "MF-DB-09", assetIp: "10.4.2.9", ttp: ["T1530"], ttpName: "Data from Cloud Storage Object", status: "Assigned", assignee: "D. Cho", age: "4h 15m", detected: "UEBA", cvss: 6.9 },
    { id: "INC-4798", tenant: "helix", sev: "High", title: "Unsigned driver load attempt blocked", asset: "HX-WS-12", assetIp: "10.51.2.12", ttp: ["T1543.003"], ttpName: "Windows Service", status: "Resolved", assignee: "S. Ahmadi", age: "6h 02m", detected: "EDR signature", cvss: 6.7 },
    { id: "INC-4795", tenant: "cobalt", sev: "High", title: "Suspicious PowerShell with encoded command", asset: "CL-OPS-31", assetIp: "10.33.5.31", ttp: ["T1059.001"], ttpName: "PowerShell", status: "New", assignee: null, age: "7h 18m", detected: "Behavioral analytics", cvss: 6.5 },

    { id: "INC-4790", tenant: "voltaic", sev: "Medium", title: "Outdated TLS cipher negotiated on internal service", asset: "VE-SRV-14", assetIp: "172.20.4.14", ttp: ["T1040"], ttpName: "Network Sniffing", status: "Assigned", assignee: "M. Reyes", age: "9h", detected: "Vuln scan", cvss: 5.4 },
    { id: "INC-4788", tenant: "brightpath", sev: "Medium", title: "Unauthorized USB mass-storage device connected", asset: "BP-ADM-05", assetIp: "10.62.1.5", ttp: ["T1091"], ttpName: "Replication Through Removable Media", status: "In Progress", assignee: "L. Tran", age: "11h", detected: "Device control", cvss: 5.1 },
    { id: "INC-4785", tenant: "atlas", sev: "Medium", title: "Misconfigured firewall rule allows inbound RDP", asset: "AM-FW-01", assetIp: "10.71.1.1", ttp: ["T1133"], ttpName: "External Remote Services", status: "Assigned", assignee: "R. Nilsson", age: "13h", detected: "Policy compliance", cvss: 5.0 },
    { id: "INC-4782", tenant: "meridian", sev: "Medium", title: "Beaconing pattern to low-reputation domain", asset: "MF-WS-241", assetIp: "10.4.8.241", ttp: ["T1071.001"], ttpName: "Web Protocols (C2)", status: "Resolved", assignee: "D. Cho", age: "15h", detected: "DNS analytics", cvss: 4.8 },
    { id: "INC-4779", tenant: "lumen", sev: "Medium", title: "Expired endpoint certificate on POS terminal", asset: "LR-POS-18", assetIp: "10.88.2.18", ttp: ["T1556"], ttpName: "Modify Authentication Process", status: "New", assignee: null, age: "18h", detected: "Asset telemetry", cvss: 4.4 },

    { id: "INC-4774", tenant: "northwind", sev: "Low", title: "Endpoint agent heartbeat missed (>4h)", asset: "NH-WS-302", assetIp: "10.18.4.302", ttp: ["T1562.001"], ttpName: "Disable or Modify Tools", status: "Resolved", assignee: "K. Okafor", age: "1d", detected: "Agent telemetry", cvss: 3.1 },
    { id: "INC-4770", tenant: "cobalt", sev: "Low", title: "Software inventory drift — unapproved app installed", asset: "CL-OPS-09", assetIp: "10.33.5.9", ttp: ["T1072"], ttpName: "Software Deployment Tools", status: "Closed", assignee: "J. Park", age: "1d", detected: "Inventory scan", cvss: 2.8 },
    { id: "INC-4765", tenant: "atlas", sev: "Low", title: "User added to local administrators group", asset: "AM-WS-44", assetIp: "10.71.3.44", ttp: ["T1098"], ttpName: "Account Manipulation", status: "Resolved", assignee: "R. Nilsson", age: "2d", detected: "Audit log", cvss: 2.5 },
    { id: "INC-4760", tenant: "lumen", sev: "Low", title: "Geo-anomalous login — new country", asset: "LR-WS-03", assetIp: "10.88.1.3", ttp: ["T1078"], ttpName: "Valid Accounts", status: "Closed", assignee: "J. Park", age: "2d", detected: "UEBA", cvss: 2.2 },
  ];

  function incTimeline(inc) {
    return [
      { kind: "detect", title: "Detection — " + inc.detected, time: inc.age + " ago", desc: "Initial signal raised on " + inc.asset + " (" + inc.assetIp + "). Severity scored " + inc.cvss + " (CVSS v3.1)." },
      { kind: "correlate", title: "Correlation engine matched " + inc.ttp.length + " TTP(s)", time: "—", desc: "Mapped to MITRE ATT&CK " + inc.ttp.join(", ") + " — " + inc.ttpName + "." },
      { kind: "enrich", title: "Threat-intel enrichment", time: "—", desc: "IOCs cross-referenced against feeds. Asset risk score recalculated for tenant." },
      inc.status === "New"
        ? { kind: "queue", title: "Awaiting triage", time: "now", desc: "Incident placed in prioritized queue. No analyst assigned." }
        : { kind: "assign", title: "Assigned to " + (inc.assignee || "SOC pool"), time: "—", desc: "Routed per on-call schedule and tenant SLA." },
    ];
  }
  function incIOCs(inc) {
    return [
      { type: "asset", val: inc.asset + " · " + inc.assetIp },
      { type: "hash", val: "a3f5" + inc.id.slice(-3) + "9c1d...e7b2 (SHA-256)" },
      { type: "domain", val: "cdn-" + inc.id.slice(-4).toLowerCase() + ".sync-delivery[.]net" },
      { type: "ttp", val: inc.ttp.join(", ") },
    ];
  }
  function incActions(inc) {
    const r = inc.sev;
    const now = [
      "Isolate " + inc.asset + " from the network (quarantine) to contain spread.",
      "Capture volatile memory and process tree for forensic chain of evidence.",
    ];
    const short = [
      "Reset credentials for affected user and revoke active sessions.",
      "Push targeted scan to policy group; verify no lateral persistence.",
    ];
    const long = [
      "Tune behavioral rule to reduce dwell time for " + inc.ttpName + ".",
      "Review " + inc.tenant + " policy posture for control gap (NIST SP 800-61r2: Post-Incident).",
    ];
    return { now, short, long };
  }

  // ---- endpoints (sample pool) ----
  const osList = ["Windows", "macOS", "Linux"];
  function endpointsFor(tid) {
    const t = tenants.find(x => x.id === tid);
    const r = mulberry32(t.seed + 100);
    const n = 9;
    const users = ["a.morgan", "p.silva", "r.kaur", "t.nguyen", "s.cohen", "m.adebayo", "l.rossi", "j.kim", "e.novak", "c.diaz", "f.haddad", "w.zhang"];
    const out = [];
    for (let i = 0; i < n; i++) {
      const os = osList[Math.floor(r() * 3)];
      const stat = r() > 0.86 ? "offline" : (r() > 0.78 ? "atrisk" : "online");
      const health = stat === "offline" ? "—" : stat === "atrisk" ? 40 + Math.floor(r() * 25) : 78 + Math.floor(r() * 21);
      out.push({
        host: t.short + "-WS-" + (100 + Math.floor(r() * 280)),
        os, osVer: os === "Windows" ? "11 23H2" : os === "macOS" ? "14.5" : "Ubuntu 22.04",
        ip: "10." + (t.seed) + "." + (1 + Math.floor(r() * 9)) + "." + (2 + Math.floor(r() * 250)),
        user: users[Math.floor(r() * users.length)],
        status: stat,
        health,
        group: ["Workstations", "Servers", "Executives", "Clinical", "Lab", "Field"][Math.floor(r() * 6)],
        risk: stat === "offline" ? 50 + Math.floor(r() * 30) : Math.floor(r() * 70),
        lastSeen: stat === "offline" ? (1 + Math.floor(r() * 6)) + "d ago" : (Math.floor(r() * 40)) + "m ago",
      });
    }
    return out;
  }

  // ---- aggregates ----
  function agg() {
    const a = { endpoints: 0, online: 0, atrisk: 0, offline: 0, open: 0, critical: 0, high: 0, missingCritical: 0 };
    tenants.forEach(t => {
      a.endpoints += t.endpoints; a.online += t.online; a.atrisk += t.atrisk; a.offline += t.offline;
      a.open += t.openIncidents; a.critical += t.critical; a.high += t.high; a.missingCritical += t.missingCritical;
    });
    a.avgRisk = Math.round(tenants.reduce((s, t) => s + t.risk, 0) / tenants.length);
    a.patch = Math.round(tenants.reduce((s, t) => s + t.patch * t.endpoints, 0) / a.endpoints);
    a.coverage = Math.round(tenants.reduce((s, t) => s + t.coverage * t.endpoints, 0) / a.endpoints);
    a.policiesDeployed = tenants.reduce((s, t) => s + t.policiesDeployed, 0);
    return a;
  }

  // severity distribution across (filtered) incidents
  function sevDist(list) {
    const d = { Critical: 0, High: 0, Medium: 0, Low: 0, Info: 0 };
    list.forEach(i => d[i.sev]++);
    return d;
  }

  // aggregate 14-day incident trend
  function aggIncTrend() {
    const out = new Array(14).fill(0);
    tenants.forEach(t => t.incTrend.forEach((v, i) => out[i] += v));
    return out;
  }

  window.DEX = {
    tenants, incidents, sevRank,
    riskColor, riskLabel,
    incTimeline, incIOCs, incActions,
    endpointsFor, agg, sevDist, aggIncTrend,
    sevColor: { Critical: "#E5484D", High: "#EE7117", Medium: "#C99400", Low: "#5C6B82", Info: "#8A93A3" },
    analysts: ["K. Okafor", "M. Reyes", "D. Cho", "S. Ahmadi", "L. Tran", "R. Nilsson", "J. Park"],
  };
})();
