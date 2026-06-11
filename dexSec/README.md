# Handoff: Dex Security Cloud — MSSP Multi-Tenant Security Console

## Overview
Dex Security Cloud is a **multi-tenant MSSP (Managed Security Service Provider) console**. One provider team manages security operations across many client organizations ("tenants"). The primary user is an **MSSP admin / SOC analyst** who switches between a portfolio-wide view and per-client consoles to triage incidents, manage endpoints, deploy security & firewall policies, track patch compliance, manage assets, and generate reports.

The bundle in this folder is an **interactive HTML/React prototype** that demonstrates the full intended look, layout, and behavior. It is a **design reference, not production code**.

---

## About the Design Files
The files here are **design references created in HTML + in-browser React (Babel)**. They show the intended UI and interactions. **Do not ship them directly.** The task is to **recreate these designs in a real production stack** using proper tooling, a real backend, real authentication, and real data — following the architecture guidance below.

All application state in the prototype is **in-memory mock data** (`data.js`, `data_extra.js`) held in a React reducer (`store.jsx`). It resets on reload. In production this is replaced by a real API + database.

---

## Fidelity
**High-fidelity.** Colors, typography, spacing, component styling, and interactions are final and intentional. Recreate the UI faithfully, but map the styling onto your production component library / design-token system rather than copying CSS verbatim.

---

## Recommended Production Architecture

> This is the most important section for taking the prototype to a real product.

### Suggested stack
- **Frontend:** Next.js (App Router) + TypeScript + React. Component library: shadcn/ui or your own. State/data: TanStack Query for server state, Zustand or React Context for UI state (the prototype's reducer maps cleanly to this).
- **Styling:** Tailwind CSS with the design tokens below encoded as theme variables, OR CSS variables exactly as in `styles.css`.
- **Charts:** The prototype hand-rolls SVG charts (`charts.jsx`). In production use **Recharts** or **visx** — the shapes needed are: donut, radial gauge, progress ring, smoothed area chart, sparkline, horizontal bar.
- **Backend:** A typed API — NestJS, or Next.js Route Handlers/tRPC, or Go/Python (FastAPI) if you prefer a separate service. GraphQL is reasonable given the nested tenant→endpoint→incident relationships.
- **Database:** PostgreSQL. **Row-Level Security (RLS) is the heart of a multi-tenant product** — every table carries a `tenant_id` and RLS policies enforce isolation so one client's data can never leak into another's. Consider schema-per-tenant only if clients demand hard isolation.
- **Auth:** OIDC/SAML (Auth0, WorkOS, Okta, or Keycloak). MSSP admins need a provider-level identity that can assume scoped access into each tenant. Support SSO since enterprise clients will require it.
- **Authorization (RBAC):** Roles like `Provider Admin`, `Tier 1 / Tier 2 Analyst`, `IR Lead`, `Client Read-Only`. Enforce on the API, not just the UI.
- **Real-time:** WebSockets/SSE for the live incident feed, SOC board, and toast notifications.

### Multi-tenancy model (this is the core)
The prototype's tenant switcher (`scope = "all" | tenantId`) is the UX surface of a deeper model:
1. **Data layer** — every query is tenant-scoped. The "All Clients" view is an *aggregate across tenants the user is entitled to*, not a bypass of isolation.
2. **Identity layer** — a provider user has a membership list of tenants + a role per tenant.
3. **API layer** — a `tenantId` (or `*` for portfolio) travels with every request and is validated against entitlements server-side. Never trust the client's scope selection.
4. **Audit layer** — every cross-tenant action is logged (the prototype stubs this as "Audit Log").

### Real security-product integrations (replace the mock data)
The prototype references real vendors by name. In production these become connectors:
- **EDR/XDR telemetry & response:** CrowdStrike Falcon, Palo Alto Cortex XDR, SentinelOne, Microsoft Defender, Bitdefender GravityZone (incidents, endpoints, isolate/scan actions).
- **Vulnerability/patch:** Tenable, Qualys, or WSUS/Intune feeds → the CVE & patch-compliance views.
- **SIEM/SOAR:** Splunk, Microsoft Sentinel, Google Chronicle → incident correlation; XSOAR/Splunk SOAR → playbook execution.
- **Ticketing/notify:** Jira, ServiceNow, PagerDuty, Slack, Teams → the Integrations page + incident assignment.
- **Frameworks:** MITRE ATT&CK TTP mapping, NIST SP 800-61r2 IR workflow, CIS Controls v8 — these are referenced throughout and should map to real rule/playbook engines.

---

## Screens / Views

The app shell is a fixed 3-zone grid: **brand cell (top-left) + top bar (top) + sidebar (left) + scrolling main**.

### 1. Top bar (persistent)
- **Brand cell** (232px wide): shield logo mark + "Dex / SECURITY CLOUD" wordmark.
- **Tenant switcher**: dropdown trigger showing current scope (avatar + name + meta). Opens a searchable menu: "All Clients" (portfolio) pinned at top, then the client list with per-tenant endpoint count + a risk-color dot. Selecting re-scopes the entire app.
- **Global search** button → opens **Command Palette** (⌘K).
- **"Ask ARIA"** button (AI assistant entry point — stubbed).
- Notification bell (with unread dot) + user avatar.

### 2. Sidebar nav (persistent)
Grouped: **Operations** (Overview, Incidents, SOC Workspace, Endpoints) · **Defense** (Policies, Firewall, Patch) · **Manage** (Assets, Reports, Integrations, Audit Log) · Settings pinned bottom. Active item highlights in primary tint. Incidents shows a live open-count badge. A "coverage healthy" status card sits above Settings.

### 3. Portfolio Overview ("All Clients" scope)
- 5 KPI tiles: Endpoints, Open incidents, Critical, Avg risk score, Patch compliance — each with an icon chip, mono value, delta indicator, and sparkline.
- **Client Risk Posture table**: each client row → avatar, name, industry, endpoints, inline risk meter (0–100, color-coded), severity-dot incident cluster, patch %, 14-day risk sparkline + delta. Row click drills into that tenant.
- **Incident Severity donut** (open incidents by Critical/High/Medium/Low) + legend with counts and %.
- **Fleet Health** posture list (agents online, at-risk, offline, policies deployed).
- **Priority Incident Feed**: critical & high incidents cross-tenant; row click opens the incident drawer.

### 4. Per-Tenant Overview (a client is selected)
- Header: tenant avatar + name + industry/region/tier/since + compliance chips (HIPAA, PCI-DSS, etc.).
- 5 KPI tiles scoped to the client.
- **Composite Risk radial gauge** (0–100 with risk label) + week-over-week delta.
- **Incident Trend** smoothed area chart (14 days).
- **Endpoint Health donut** (healthy/at-risk/offline).
- **Patch Compliance ring** + missing-critical count + "Deploy updates" CTA.
- **Policy Posture** list (MFA, behavioral detection, DNS filtering, USB control) with On/Partial/Review states.
- **Top Open Incidents** table; row click opens drawer.

### 5. Incident Queue
- Filter bar: severity (All/Critical/High/Medium/Low with counts) + status (Open/Resolved/All) + free-text filter.
- Table: ID, severity badge, title, client (in portfolio scope), asset, MITRE TTP chip, status tag, assignee, age. Row click → drawer.

### 6. Incident Detail Drawer (right slide-over, ~560px)
- Header: severity, ID, status tag, title, tenant tag, CVSS pill, TTP chips.
- **Assign** dropdown (on-call vs available analyst roster) and **Status** dropdown — both mutate state live with toast confirmation.
- **Affected Asset** key-value block.
- **Timeline** (detection → correlation → enrichment → assignment).
- **Correlated IOCs** rows.
- **Recommended Actions** grouped Immediate / Short-term / Long-term, each a checkable item. Link to the matching **Playbook**.
- Footer actions: **Isolate asset**, **Resolve**, **Playbook**.

### 7. Playbook Drawer
NIST-aligned phases (Detection→Containment→Eradication→Recovery→Post-Incident) with per-step role (Tier 1 / Tier 2 / IR Lead) and decision branches. Sources referenced (CrowdStrike, Splunk SOAR, Palo Alto XSOAR).

### 8. SOC Workspace
- 4 KPIs: triage queue size, critical open, analysts on-call, avg response (MTTR).
- **Triage board**: 4 columns (Triage queue / Assigned / Investigating / Resolved) of incident cards; "advance" button moves a card to the next status; cards open the incident drawer.
- **Auto-route queue** distributes unassigned incidents across on-call analysts.
- **Analyst Workload** panel: per-analyst open count, on-call badge, workload bar, critical indicator.
- **Response Playbooks** quick-access cards.

### 9. Endpoints
- Filters: status (online/at-risk/offline/isolated) + group + free-text.
- Table: hostname, OS (icon), IP, user, client, group, health meter, status pill, last seen. Row click → device drawer.

### 10. Endpoint / Device Drawer (4 tabs)
- **Overview**: owner, user, dept, location, IP, hardware specs, **policy-group picker** (moving re-applies policies), open incidents for the host.
- **Software**: patch status + deploy CTA, installed software chips, running processes.
- **Network**: IP, connections, firewall profile, open ports (CIS-flagged ports highlighted), link to firewall config.
- **Actions**: isolate/release, scan, deploy patches, view policies, remote shell, reboot + move-to-group.

### 11. Policies
- Grid of policy cards (vendor framework, category, Deployed/Draft status, active-rule count, group count). Card click → **Policy Editor** drawer.
- **Policy Editor**: deployed-to group chips; rule sections with per-rule toggles; **Deploy to groups** (opens a modal showing affected endpoint count); **Clone**.
- **New Policy** modal: name + framework + category + initial group deployment.

### 12. Firewall
- 4 KPIs (total/inbound/outbound/block rules) + direction filter.
- Rule table: direction, action (Allow/Block), protocol, port, source/scope, application, description, enable toggle, edit + delete row actions.
- **Add/Edit Rule** modal (all fields). **Assign to groups** modal (shows affected endpoints).

### 13. Patch Management
- Compliance ring + up-to-date / behind / critical-CVE breakdown.
- **CVE Exposure** table (CVE id, severity, CVSS, vulnerability, vendor, affected hosts, per-row Patch action). "Deploy all critical" CTA.

### 14. Asset Management
- Department filter + search. Table: asset tag, hostname, owner, dept, client, hardware, warranty pill, risk meter, edit action.
- **Edit Asset** modal: owner, department, location, policy group, warranty.

### 15. Reports
- Report-template grid (Threat Summary, Patch Compliance, Policy Compliance, Incident History, Asset Inventory, Executive Risk Dashboard).
- **Recent reports** table.
- **Generate Report** modal: type + scope + format (PDF/CSV/JSON) + range, with a generating→done flow that appends to history.

### 16. Integrations / Audit Log / Settings
Lighter stubs. Integrations shows connector cards (connected vs connect). Audit Log and Settings are placeholders to be designed out.

### 17. Command Palette (⌘K)
Fuzzy search across clients, incidents, assets, policies, and navigation. Arrow-key navigation, Enter to open. Each result routes to the right scope + view + drawer.

---

## Interactions & Behavior
- **Tenant scope** is global; changing it re-scopes every view and clears open drawers.
- **Drawers** slide in from the right with a scrim; Esc closes; clicking the scrim closes.
- **Modals** center with a scrim; Esc closes.
- **Toasts** appear bottom-right, auto-dismiss ~3.6s, click to dismiss; used for every state mutation (assign, deploy, isolate, etc.).
- **Live mutations**: assigning an analyst sets status New→Assigned; isolating sets In Progress; advancing on the SOC board steps through statuses; toggling rules/firewall updates immediately.
- **Entrance animation**: `.fade-in` translates content up slightly; gated on `prefers-reduced-motion`. (Note: never animate opacity from 0 as the base state — keep content visible for print/PDF/reduced-motion.)

## State Management
Prototype uses one reducer (`store.jsx`) with: `scope`, `nav`, `incidents[]`, `policies[]`, `firewall[]`, `endpoints[]`, `reports[]`, and `ui` (open drawer/modal/palette ids), plus a `toasts[]` queue. In production:
- **Server state** (incidents, endpoints, policies, etc.) → TanStack Query with tenant-scoped query keys, invalidated on mutation; real-time pushes via WS.
- **UI state** (open drawer, palette, current scope/nav) → Zustand/Context, mirror current shape.

## Design Tokens

### Color
| Token | Hex | Use |
|---|---|---|
| bg | `#F4F6F9` | app background |
| surface | `#FFFFFF` | cards |
| surface-2 | `#FAFBFC` | subtle fills |
| surface-3 | `#F2F4F7` | chips, tracks |
| border | `#E7EAF0` | card borders |
| border-strong | `#D8DDE6` | inputs |
| ink | `#11151D` | primary text |
| ink-2 | `#39414F` | body text |
| ink-3 | `#6A7280` | secondary text |
| ink-4 | `#98A0AD` | muted/labels |
| primary | `#3052E6` | brand / actions |
| primary-hover | `#2742C4` | |
| primary-tint | `#ECF0FE` | active nav, fills |
| critical | `#E5484D` / tint `#FDECEC` | severity |
| high | `#EE7117` / tint `#FDF0E5` | severity |
| medium | `#C99400` / tint `#FAF2D8` | severity |
| low | `#5C6B82` / tint `#EEF1F5` | severity |
| ok | `#18935A` / tint `#E6F5ED` | healthy/allow |
| violet | `#6B4FE0` / tint `#EFEBFD` | assigned/XDR |
| teal | `#0E9389` / tint `#E2F4F2` | inbound/coverage |

Risk-score color scale: ≥67 critical red, ≥50 elevated orange, ≥34 moderate amber, else low green.

### Typography
- **UI:** "Hanken Grotesk" (400/500/600/700).
- **Numbers, IDs, code:** "JetBrains Mono" (400/500/600), tabular figures.
- Page title 23px/700/-.02em · card title 14.5px/600 · body 13–14px · labels 10–12px (uppercase labels: 700, letter-spacing .1em). Slide/screen minimums respected.

### Geometry
- Radius: sm 7 · base 10 · md 13 · lg 18 (px).
- Shadows: sm `0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.05)` → up to pop `0 12px 32px rgba(16,24,40,.16)`.
- Topbar height 60px · sidebar width 232px.

## Assets
- **Fonts:** Hanken Grotesk + JetBrains Mono via Google Fonts.
- **Icons:** custom inline-SVG stroke set in `components.jsx` (`ICONS` map). In production swap for **Lucide** (the set is lucide-style) to save maintenance.
- No raster images; the logo is an inline SVG shield.

## Files (in this bundle)
- `Dex Security Cloud.html` — entry point; loads everything in order.
- `styles.css` — all design tokens + component styles.
- `data.js`, `data_extra.js` — mock tenants, incidents, endpoints, policies, firewall, playbooks, roster. **Replace with API.**
- `store.jsx` — reducer + selectors (the production state shape).
- `charts.jsx` — SVG chart components (replace with Recharts/visx).
- `components.jsx` — icons, top bar, tenant switcher, sidebar, KPI, badges.
- `ui_kit.jsx` — modal, toast, form controls, command palette.
- `views_overview.jsx`, `views_incidents.jsx`, `views_endpoints.jsx`, `views_defense.jsx`, `views_manage.jsx`, `views_soc.jsx`, `views_other.jsx` — the screens.
- `app.jsx` — shell, routing switch, drawer/modal/palette mounting.

---

## Suggested build order for Claude Code
1. Scaffold the production app (Next.js + TS + Tailwind + your component lib) and encode the **design tokens** above as theme variables.
2. Build the **app shell**: top bar, tenant switcher, sidebar, routing. Stub data.
3. Stand up the **backend + Postgres with tenant_id + RLS**, auth (OIDC/SSO), and RBAC. Seed with the mock data shapes from `data.js`/`data_extra.js`.
4. Wire **TanStack Query** + the tenant-scope context; make "All Clients" an entitled aggregate.
5. Implement screens in this order: Portfolio Overview → Per-Tenant Overview → Incidents + drawer → SOC board → Endpoints + drawer → Policies → Firewall → Patch → Assets → Reports.
6. Replace SVG charts with Recharts/visx; swap icons for Lucide.
7. Add **real connectors** (start with one EDR, e.g. CrowdStrike) behind a normalized internal schema so the UI stays vendor-agnostic.
8. Layer in real-time (WS/SSE), audit logging, and report generation.
9. Harden: tenant-isolation tests, RBAC tests, rate limiting, observability.
