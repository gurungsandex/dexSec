/* ============================================================
   Dex Security Cloud — extended seed data (defense, assets, SOC)
   Augments window.DEX
   ============================================================ */
(function () {
  const D = window.DEX;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---- Policy groups (assignable scopes) ---- */
  D.groups = [
    { id: "g-ws", name: "Workstations", desc: "Standard employee endpoints" },
    { id: "g-srv", name: "Servers", desc: "Domain controllers, app & DB servers" },
    { id: "g-exec", name: "Executives", desc: "C-suite & high-value targets" },
    { id: "g-clin", name: "Clinical / OT", desc: "Medical & operational tech devices" },
    { id: "g-lab", name: "Lab & R&D", desc: "Research and engineering hosts" },
    { id: "g-field", name: "Field / Remote", desc: "Roaming and VPN endpoints" },
    { id: "g-pos", name: "POS Terminals", desc: "Point-of-sale & payment devices" },
  ];

  /* ---- Policy templates / baselines ---- */
  function rule(name, desc, enabled) { return { name, desc, enabled }; }
  D.policyTemplates = [
    {
      id: "pol-falcon", name: "CrowdStrike Falcon — Detect & Prevent", framework: "CrowdStrike Falcon",
      category: "Endpoint Detection & Response", severity: "High", deployedTo: ["g-ws", "g-srv"], status: "Deployed",
      sections: [
        { title: "Behavioral Detection (MITRE ATT&CK)", rules: [
          rule("Credential dumping prevention", "Block LSASS access — T1003", true),
          rule("Process injection blocking", "Detect & terminate — T1055", true),
          rule("Ransomware canary files", "Pre-encryption behavior — T1486", true),
          rule("Living-off-the-land monitoring", "PowerShell / WMI abuse — T1059", true),
        ]},
        { title: "Real-time Response", rules: [
          rule("Auto-quarantine on critical", "Isolate host on CVSS ≥ 9.0", true),
          rule("Kill malicious process tree", "Terminate parent + children", true),
          rule("Network containment", "Sever non-console connectivity", false),
        ]},
        { title: "Sensor & Telemetry", rules: [
          rule("Full event capture", "Process, network, file, registry", true),
          rule("Memory scanning", "Periodic in-memory threat scan", true),
        ]},
      ],
    },
    {
      id: "pol-cortex", name: "Palo Alto Cortex XDR — Behavioral", framework: "Cortex XDR",
      category: "Extended Detection & Response", severity: "High", deployedTo: ["g-srv", "g-exec"], status: "Deployed",
      sections: [
        { title: "Network Attack Prevention", rules: [
          rule("Exploit prevention", "Block memory corruption exploits", true),
          rule("Lateral movement detection", "SMB / RDP anomaly — T1021", true),
          rule("C2 beaconing analytics", "Periodic callback detection — T1071", true),
        ]},
        { title: "DNS Attack Mitigation", rules: [
          rule("DNS sinkholing", "Redirect known-malicious domains", true),
          rule("DoH enforcement", "Force DNS-over-HTTPS to trusted resolvers", true),
          rule("DGA detection", "Domain-generation-algorithm heuristics", false),
        ]},
        { title: "Anomaly Heuristics", rules: [
          rule("UEBA baselining", "Per-user behavioral profile", true),
          rule("Off-hours access alerting", "Flag activity outside business hours", true),
        ]},
      ],
    },
    {
      id: "pol-gravity", name: "Bitdefender GravityZone — Endpoint", framework: "Bitdefender GravityZone",
      category: "Endpoint Protection", severity: "Medium", deployedTo: ["g-ws"], status: "Deployed",
      sections: [
        { title: "Threat Prevention", rules: [
          rule("Signature + ML scanning", "Hybrid local & cloud detection", true),
          rule("Web attack prevention", "Block phishing & exploit kits", true),
          rule("Fileless attack protection", "Script & macro inspection", true),
        ]},
        { title: "Real-time Response", rules: [
          rule("Automatic remediation", "Clean / quarantine on detection", true),
          rule("Rollback on ransomware", "Restore tampered files", false),
        ]},
      ],
    },
    {
      id: "pol-mwb", name: "Malwarebytes EDR — Anti-Ransomware", framework: "Malwarebytes EDR",
      category: "Anti-Ransomware", severity: "Medium", deployedTo: [], status: "Draft",
      sections: [
        { title: "Ransomware Defense", rules: [
          rule("Behavioral ransomware blocking", "Encryption-pattern detection — T1486", true),
          rule("Shadow-copy protection", "Prevent vssadmin deletion — T1490", true),
        ]},
        { title: "Anomaly Heuristics", rules: [
          rule("Mass-file-modification alert", "Threshold-based trigger", true),
        ]},
      ],
    },
    {
      id: "pol-cis", name: "CIS / NIST Hardening Baseline", framework: "CIS Controls v8 · NIST CSF",
      category: "Configuration Hardening", severity: "Medium", deployedTo: ["g-ws", "g-srv", "g-exec"], status: "Deployed",
      sections: [
        { title: "Geolocation Access Control", rules: [
          rule("Geo-fencing", "Block logins from non-sanctioned regions", true),
          rule("Impossible-travel detection", "Flag geo-anomalous sessions — T1078", true),
        ]},
        { title: "Port Configuration", rules: [
          rule("Close unused listening ports", "Enforce least-exposure baseline", true),
          rule("RDP restriction", "Deny inbound 3389 from untrusted", true),
        ]},
        { title: "Behavioral Detection", rules: [
          rule("Privilege escalation alerts", "Local admin changes — T1098", true),
          rule("Persistence monitoring", "Service / scheduled-task creation — T1543", true),
        ]},
      ],
    },
  ];

  /* ---- Firewall baseline rules ---- */
  function fw(dir, action, proto, port, source, app, note, enabled) {
    return { id: "fw-" + Math.random().toString(36).slice(2, 7), dir, action, proto, port, source, app, note, enabled };
  }
  D.firewallBaseline = [
    fw("Inbound", "Allow", "TCP", "443", "Any", "HTTPS", "Web management & API", true),
    fw("Inbound", "Block", "TCP", "3389", "Any", "RDP", "Deny remote desktop from internet", true),
    fw("Inbound", "Block", "TCP", "445", "External", "SMB", "Block SMB lateral movement — T1021.002", true),
    fw("Inbound", "Allow", "TCP", "22", "10.0.0.0/8", "SSH", "Admin subnet only", true),
    fw("Outbound", "Block", "Any", "Any", "—", "IP reputation", "Block low-reputation destinations", true),
    fw("Outbound", "Allow", "UDP", "443", "Any", "DoH", "DNS-over-HTTPS to trusted resolvers", true),
    fw("Outbound", "Block", "TCP", "23", "Any", "Telnet", "Deny cleartext protocols", true),
    fw("Inbound", "Block", "Any", "Any", "Geo: RU,KP,IR", "Geo-block", "Country-level access control", true),
  ];

  /* ---- Report types ---- */
  D.reportTypes = [
    { id: "threat", name: "Threat Summary", icon: "fire", desc: "Detections, severity breakdown, top TTPs" },
    { id: "patch", name: "Patch Compliance", icon: "patch", desc: "Missing patches & CVE exposure by host" },
    { id: "policy", name: "Policy Compliance", icon: "shield", desc: "Control coverage vs. framework baselines" },
    { id: "incident", name: "Incident History", icon: "alert", desc: "Timeline, MTTR, resolution status" },
    { id: "asset", name: "Asset Inventory", icon: "box", desc: "Hardware, software & ownership register" },
    { id: "exec", name: "Executive Risk Dashboard", icon: "report", desc: "Board-level posture & trend summary" },
  ];

  /* ---- Playbooks ---- */
  D.playbooks = [
    { id: "pb-ransom", name: "Ransomware Response", source: "NIST SP 800-61r2 · CrowdStrike",
      phases: ["Detection & Analysis", "Containment", "Eradication", "Recovery", "Post-Incident"],
      steps: [
        { role: "Tier 1", text: "Confirm detection; capture host, user, and process tree.", phase: "Detection & Analysis" },
        { role: "Tier 1", text: "Isolate affected endpoint(s) from the network immediately.", phase: "Containment" },
        { role: "Tier 2", text: "Identify encryption scope & lateral movement (SMB, RDP).", phase: "Containment", decision: "Spread confirmed? → escalate to IR Lead" },
        { role: "IR Lead", text: "Disable compromised accounts; rotate credentials.", phase: "Eradication" },
        { role: "Tier 2", text: "Remove persistence; validate clean state before rejoin.", phase: "Eradication" },
        { role: "Tier 2", text: "Restore from known-good backups; verify integrity.", phase: "Recovery" },
        { role: "IR Lead", text: "Document timeline, tune detection rules, brief stakeholders.", phase: "Post-Incident" },
      ],
    },
    { id: "pb-phish", name: "Phishing & Credential Theft", source: "Splunk SOAR · Cisco IR",
      phases: ["Detection & Analysis", "Containment", "Eradication", "Recovery", "Post-Incident"],
      steps: [
        { role: "Tier 1", text: "Validate report; pull email headers & payload hash.", phase: "Detection & Analysis" },
        { role: "Tier 1", text: "Quarantine message fleet-wide; block sender & URLs.", phase: "Containment" },
        { role: "Tier 2", text: "Reset affected credentials; revoke active sessions.", phase: "Eradication", decision: "MFA bypassed? → escalate" },
        { role: "Tier 2", text: "Hunt for inbox rules & OAuth grants.", phase: "Recovery" },
        { role: "IR Lead", text: "User-awareness follow-up; update email-gw rules.", phase: "Post-Incident" },
      ],
    },
    { id: "pb-exfil", name: "Data Exfiltration", source: "Palo Alto XSOAR · NIST",
      phases: ["Detection & Analysis", "Containment", "Eradication", "Recovery", "Post-Incident"],
      steps: [
        { role: "Tier 2", text: "Correlate DLP + network anomaly; quantify data moved.", phase: "Detection & Analysis" },
        { role: "Tier 2", text: "Block destination; isolate source host.", phase: "Containment" },
        { role: "IR Lead", text: "Assess regulatory exposure (HIPAA/GDPR/PCI).", phase: "Eradication", decision: "PII/PHI involved? → notify compliance" },
        { role: "IR Lead", text: "Coordinate disclosure & evidence preservation.", phase: "Post-Incident" },
      ],
    },
  ];

  /* ---- Analyst roster ---- */
  D.roster = [
    { name: "K. Okafor", tier: "Tier 2", oncall: true },
    { name: "M. Reyes", tier: "Tier 2", oncall: true },
    { name: "D. Cho", tier: "Tier 2", oncall: false },
    { name: "S. Ahmadi", tier: "IR Lead", oncall: true },
    { name: "L. Tran", tier: "Tier 1", oncall: false },
    { name: "R. Nilsson", tier: "Tier 1", oncall: true },
    { name: "J. Park", tier: "Tier 1", oncall: false },
  ];

  /* ---- Rich endpoint / asset records (mutable seed) ---- */
  const FIRST = ["Alex", "Priya", "Ravi", "Tara", "Sam", "Mara", "Lia", "Jin", "Eli", "Cleo", "Fadi", "Wen", "Noor", "Ivan", "Gabe", "Hana"];
  const LAST = ["Morgan", "Silva", "Kaur", "Nguyen", "Cohen", "Adebayo", "Rossi", "Kim", "Novak", "Diaz", "Haddad", "Zhang", "Park", "Ito", "Bauer", "Costa"];
  const DEPTS = ["Finance", "Engineering", "Operations", "Clinical", "Legal", "HR", "Sales", "R&D", "IT", "Executive"];
  const SOFTWARE = ["Microsoft 365", "Chrome", "Zoom", "Slack", "Adobe Acrobat", "Java Runtime", "OpenSSL", "Python 3.11", "Node.js", "7-Zip", "Notepad++", "VLC"];
  const PROCS = ["explorer.exe", "svchost.exe", "chrome.exe", "MsMpEng.exe", "lsass.exe", "powershell.exe", "Teams.exe", "outlook.exe"];

  D.allEndpoints = (function () {
    const out = [];
    D.tenants.forEach(t => {
      const r = mulberry32(t.seed + 500);
      const n = 9;
      for (let i = 0; i < n; i++) {
        const os = ["Windows", "macOS", "Linux"][Math.floor(r() * 3)];
        const stat = r() > 0.86 ? "offline" : (r() > 0.78 ? "atrisk" : "online");
        const health = stat === "offline" ? null : stat === "atrisk" ? 40 + Math.floor(r() * 25) : 78 + Math.floor(r() * 21);
        const grp = D.groups[Math.floor(r() * D.groups.length)];
        const fn = FIRST[Math.floor(r() * FIRST.length)], ln = LAST[Math.floor(r() * LAST.length)];
        const num = 100 + Math.floor(r() * 280);
        out.push({
          id: t.id + "-" + i,
          host: t.short + "-" + (["WS", "SRV", "LT"][Math.floor(r() * 3)]) + "-" + num,
          tenant: t.id,
          os, osVer: os === "Windows" ? "11 23H2" : os === "macOS" ? "Sonoma 14.5" : "Ubuntu 22.04 LTS",
          ip: "10." + t.seed + "." + (1 + Math.floor(r() * 9)) + "." + (2 + Math.floor(r() * 250)),
          user: (fn[0] + "." + ln).toLowerCase(),
          owner: fn + " " + ln,
          dept: DEPTS[Math.floor(r() * DEPTS.length)],
          location: t.region,
          status: stat,
          health,
          group: grp.id,
          risk: stat === "offline" ? 50 + Math.floor(r() * 30) : Math.floor(r() * 70),
          lastSeen: stat === "offline" ? (1 + Math.floor(r() * 6)) + "d ago" : Math.floor(r() * 40) + "m ago",
          assetTag: t.short + "-" + (10000 + Math.floor(r() * 89999)),
          warranty: ["Active", "Active", "Active", "Expiring", "Expired"][Math.floor(r() * 5)],
          cpu: ["Intel i7-1365U", "Apple M3 Pro", "AMD Ryzen 7 7840U", "Intel Xeon E-2388G"][Math.floor(r() * 4)],
          ram: [8, 16, 16, 32, 64][Math.floor(r() * 5)] + " GB",
          disk: [256, 512, 512, 1024][Math.floor(r() * 4)] + " GB SSD",
          software: SOFTWARE.slice(0, 5 + Math.floor(r() * 7)),
          ports: [22, 80, 135, 443, 445, 3389, 5353, 8080].filter(() => r() > 0.5),
          procs: PROCS.slice(0, 4 + Math.floor(r() * 4)),
          connections: 3 + Math.floor(r() * 40),
          patchStatus: r() > 0.7 ? "Behind" : "Current",
          firewall: "Baseline NGFW",
        });
      }
    });
    return out;
  })();

  D.groupCount = function (endpoints, gid) {
    return endpoints.filter(e => e.group === gid).length;
  };
})();
