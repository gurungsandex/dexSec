# Dex Security Cloud — MSSP Multi-Tenant Security Console

A **multi-tenant Managed Security Service Provider (MSSP) console** enabling a single provider team to manage security operations across multiple client organizations ("tenants").

---

## Project Overview

Dex Security Cloud is a unified security operations platform designed for:
- **MSP/MSSP Teams** managing endpoints, incidents, and security policies across multiple clients
- **Enterprise SOCs** requiring multi-tenant isolation and role-based access control
- **Security analysts** performing triage, incident response, and threat correlation
- **Compliance teams** tracking policies, patch management, and audit logs

### Key Features
- **Multi-tenant isolation** — clients are logically and physically isolated
- **Incident management** — detection, correlation, assignment, and response workflows
- **Endpoint management** — EDR/XDR integration, device health, policy deployment
- **Threat intelligence** — MITRE ATT&CK mapping, CVE/patch tracking
- **Security policies** — firewall rules, patch compliance, security controls
- **Real-time operations** — live incident feeds, SOC board, analyst workload tracking
- **Audit & compliance** — cross-tenant logging, RBAC, report generation

---

## Tech Stack

### Frontend
- **Framework:** Next.js 16+ (App Router) + TypeScript + React 19
- **UI Library:** shadcn/ui or custom components
- **Styling:** Tailwind CSS v4 + design tokens
- **State:** TanStack Query (server state) + Zustand/Context (UI state)
- **Icons:** Lucide React
- **Charts:** Recharts or visx

### Backend
- **API:** NestJS, Next.js Route Handlers, FastAPI, or Go (typed/strongly-checked)
- **Real-time:** WebSockets or Server-Sent Events (SSE)
- **Database:** PostgreSQL with Row-Level Security (RLS) for tenant isolation
- **Auth:** OIDC/SAML (Auth0, WorkOS, Okta, Keycloak)

### Architecture Highlights
- **Multi-tenancy model:** Tenant scoping at API, data, and identity layers
- **RBAC:** Provider Admin, Tier 1/2 Analyst, IR Lead, Client Read-Only roles
- **Vendor integrations:** CrowdStrike, Palo Alto Cortex XDR, Tenable, Splunk, ServiceNow, etc.
- **Frameworks:** NIST SP 800-61r2, MITRE ATT&CK, CIS Controls v8

---

## Project Structure

```
dexSec/
├── src/
│   ├── app/                    # Next.js app router pages
│   ├── components/             # Reusable React components
│   │   ├── layout/
│   │   ├── incidents/
│   │   ├── endpoints/
│   │   ├── policies/
│   │   └── ...
│   ├── lib/                    # Utilities, hooks, API clients
│   ├── styles/                 # Global CSS + design tokens
│   └── types/                  # TypeScript types
├── public/                     # Static assets
├── design-reference/           # High-fidelity design prototype
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+ (or latest LTS)
- npm, yarn, pnpm, or bun
- PostgreSQL 14+ (for backend development)

### Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

### Build & Deploy

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

### Linting

```bash
npm run lint
```

---

## Core Screens & Workflows

### 1. Portfolio Overview (All Clients)
- **5 KPI tiles:** Endpoints, Open incidents, Critical, Avg risk score, Patch compliance
- **Client Risk Posture table:** Risk meter, incident clusters, patch %, sparklines
- **Incident Severity donut** + legends
- **Fleet Health posture** + priority incident feed

### 2. Per-Tenant Overview
- **Tenant header:** Avatar, name, industry, compliance badges (HIPAA, PCI-DSS, etc.)
- **Composite Risk radial gauge** (0–100)
- **Incident Trend area chart** (14 days)
- **Endpoint Health, Patch Compliance, Policy Posture** visualizations
- **Top Open Incidents** table

### 3. Incident Queue & Detail
- **Incident Queue:** Filter by severity/status, table view, row click → drawer
- **Incident Drawer:** Severity, ID, status, assignment, affected asset, timeline, correlated IOCs, recommended actions, playbook link

### 4. SOC Workspace
- **Triage board:** 4 columns (queue → assigned → investigating → resolved)
- **Analyst workload panel** + on-call roster
- **Response playbooks** quick access
- **Auto-route queue** for unassigned incidents

### 5. Endpoints
- **Filters:** Status (online/at-risk/offline/isolated), group, search
- **Device Drawer (4 tabs):** Overview, Software, Network, Actions

### 6. Policies & Firewall
- **Policy cards:** Status, rule count, group count
- **Policy Editor:** Rule toggles, deployment, cloning
- **Firewall rules:** Inbound/outbound, direction, action, assignment to groups

### 7. Patch Management
- **Compliance ring** + breakdown (up-to-date/behind/critical)
- **CVE Exposure table:** Severity, CVSS, vendor, affected hosts
- **Deploy actions**

### 8. Reports
- **Report templates:** Threat Summary, Patch Compliance, Policy Compliance, Incident History, Asset Inventory, Executive Risk Dashboard
- **Generate Report:** Scope, format (PDF/CSV/JSON), date range

### 9. Command Palette (⌘K)
- Fuzzy search across clients, incidents, assets, policies
- Arrow keys to navigate, Enter to open

---

## Design System

### Color Palette
| Token | Hex | Use |
|---|---|---|
| bg | #F4F6F9 | App background |
| surface | #FFFFFF | Cards, panels |
| primary | #3052E6 | Brand, actions |
| critical | #E5484D | Severity (red) |
| high | #EE7117 | Severity (orange) |
| medium | #C99400 | Severity (amber) |
| low | #5C6B82 | Severity (gray) |
| ok | #18935A | Healthy, allow |

### Typography
- **Font:** "Hanken Grotesk" (400/500/600/700)
- **Monospace:** "JetBrains Mono" (400/500/600, tabular figures)
- **Page title:** 23px/700
- **Card title:** 14.5px/600
- **Body:** 13–14px

### Geometry
- **Radius:** sm 7px · base 10px · md 13px · lg 18px
- **Shadows:** sm → pop, via CSS variables
- **Topbar height:** 60px
- **Sidebar width:** 232px

---

## Multi-Tenancy & Security

### Tenant Isolation
1. **Data Layer:** Every query is tenant-scoped via `tenant_id` + Row-Level Security
2. **Identity Layer:** Provider user has tenant membership list + per-tenant role
3. **API Layer:** `tenantId` travels with every request, validated server-side (never client-trusted)
4. **Audit Layer:** All cross-tenant actions are logged

### Role-Based Access Control (RBAC)
- **Provider Admin** — Full provider-level access, tenant management
- **Tier 1 Analyst** — Triage, basic incident response
- **Tier 2 Analyst** — Advanced analysis, playbook execution
- **IR Lead** — Incident command, executive escalation
- **Client Read-Only** — Limited view of own tenant data

### Authentication & Authorization
- OIDC/SAML SSO (Auth0, Okta, Keycloak, WorkOS)
- Provider-level identity + tenant-scoped role assignment
- Enterprise MFA + IP restrictions

---

## Vendor Integrations (Roadmap)

### EDR/XDR & Endpoint Security
- CrowdStrike Falcon
- Palo Alto Cortex XDR
- SentinelOne
- Microsoft Defender
- Bitdefender GravityZone

### Vulnerability & Patch Management
- Tenable Nessus / Nessus.io
- Qualys
- WSUS / Microsoft Intune

### SIEM & SOAR
- Splunk Enterprise Security
- Microsoft Sentinel
- Google Chronicle
- Splunk SOAR / XSOAR

### Ticketing & Notifications
- Jira
- ServiceNow
- PagerDuty
- Slack
- Microsoft Teams

### Frameworks & Standards
- MITRE ATT&CK (TTP mapping & detection)
- NIST SP 800-61r2 (IR workflow)
- CIS Controls v8 (baseline compliance)

---

## Development Roadmap

### Phase 1: MVP (Core Platform)
- [ ] App shell (topbar, sidebar, routing)
- [ ] Multi-tenant backend + RLS + RBAC
- [ ] Authentication (OIDC/SSO)
- [ ] Portfolio Overview + Per-Tenant Overview screens
- [ ] Incident Queue + Detail drawer
- [ ] Endpoints screen + device drawer
- [ ] API integration (replace mock data)

### Phase 2: Operations
- [ ] SOC Workspace (triage board, auto-route)
- [ ] Playbook engine (NIST-aligned phases)
- [ ] Real-time updates (WebSockets/SSE)
- [ ] First vendor connector (e.g., CrowdStrike)

### Phase 3: Defense & Management
- [ ] Policies (CRUD, deployment)
- [ ] Firewall rules (inline rule editor)
- [ ] Patch management (CVE exposure, deploy)
- [ ] Assets (inventory, lifecycle)

### Phase 4: Insights & Compliance
- [ ] Reports (generate, export, history)
- [ ] Audit logging (comprehensive cross-tenant)
- [ ] Compliance dashboards (HIPAA, PCI-DSS, SOC 2)
- [ ] Integrations page (connector management)

### Phase 5: Intelligence & Scale
- [ ] Command Palette (fuzzy search)
- [ ] Real-time threat intel feeds
- [ ] Advanced correlation rules
- [ ] Performance optimization (query caching, pagination)
- [ ] Multi-region support

---

## Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dexsec
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here
OIDC_CLIENT_ID=your_client_id
OIDC_CLIENT_SECRET=your_client_secret
OIDC_ISSUER=https://your-auth-provider.com

# Vendor APIs (optional)
CROWDSTRIKE_API_KEY=your_key
SPLUNK_API_KEY=your_key
```

---

## Performance & Security Checklist

- [ ] RLS policies enabled on all tenant-scoped tables
- [ ] API rate limiting in place (per user, per tenant)
- [ ] Query timeouts configured (prevent long-running queries)
- [ ] Audit logging for all mutations (who, what, when)
- [ ] Input validation on all endpoints
- [ ] CSRF protection on forms
- [ ] Secrets stored in environment variables
- [ ] Sensitive data encrypted at rest
- [ ] TLS enforced (HTTPS only)
- [ ] Test coverage: >80% on core flows

---

## Contributing

This is an internal project. For questions or contributions, contact the security team.

---

## Design Reference

A high-fidelity **HTML/React prototype** is included in `design-reference/` documenting the full intended look, layout, and behavior. Refer to this while building the production application.

---

**Last updated:** June 2026  
**Status:** Active Development
