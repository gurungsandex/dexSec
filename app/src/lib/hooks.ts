import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ─── helpers ────────────────────────────────────────────────────────────────

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function patch<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function del(url: string): Promise<void> {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

function tenantParam(scope: string) {
  return scope !== "all" ? `?tenant_id=${scope}` : "";
}

// ─── Tenants ────────────────────────────────────────────────────────────────

export function useTenants() {
  return useQuery({ queryKey: ["tenants"], queryFn: () => get("/api/tenants") });
}

export function useTenant(id: string) {
  return useQuery({ queryKey: ["tenants", id], queryFn: () => get(`/api/tenants/${id}`), enabled: !!id && id !== "all" });
}

export function useCreateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => post("/api/tenants", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tenants"] }),
  });
}

export function useUpdateTenant() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) => patch(`/api/tenants/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tenants"] }),
  });
}

// ─── Agents ─────────────────────────────────────────────────────────────────

export function useAgents(scope = "all") {
  return useQuery({ queryKey: ["agents", scope], queryFn: () => get(`/api/agents${tenantParam(scope)}`) });
}

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => post("/api/agents", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agents"] }),
  });
}

export function useUpdateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) => patch(`/api/agents/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agents"] }),
  });
}

export function useDeleteAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/api/agents/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agents"] }),
  });
}

// ─── Endpoints ──────────────────────────────────────────────────────────────

export function useEndpoints(scope = "all") {
  return useQuery({ queryKey: ["endpoints", scope], queryFn: () => get(`/api/endpoints${tenantParam(scope)}`) });
}

export function useUpdateEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) => patch(`/api/endpoints/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["endpoints"] }),
  });
}

// ─── Assets ─────────────────────────────────────────────────────────────────

export function useAssets(scope = "all") {
  return useQuery({ queryKey: ["assets", scope], queryFn: () => get(`/api/assets${tenantParam(scope)}`) });
}

export function useCreateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => post("/api/assets", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useUpdateAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) => patch(`/api/assets/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

export function useDeleteAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/api/assets/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["assets"] }),
  });
}

// ─── Firewall Rules ──────────────────────────────────────────────────────────

export function useFirewallRules(scope = "all") {
  return useQuery({ queryKey: ["firewall-rules", scope], queryFn: () => get(`/api/firewall-rules${tenantParam(scope)}`) });
}

export function useCreateFirewallRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => post("/api/firewall-rules", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["firewall-rules"] }),
  });
}

export function useUpdateFirewallRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) => patch(`/api/firewall-rules/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["firewall-rules"] }),
  });
}

export function useDeleteFirewallRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => del(`/api/firewall-rules/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["firewall-rules"] }),
  });
}

// ─── Policies ────────────────────────────────────────────────────────────────

export function usePolicies(scope = "all") {
  return useQuery({ queryKey: ["policies", scope], queryFn: () => get(`/api/policies${tenantParam(scope)}`) });
}

export function useCreatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => post("/api/policies", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policies"] }),
  });
}

export function useUpdatePolicy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) => patch(`/api/policies/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policies"] }),
  });
}

export function useUpdatePolicyRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) => patch(`/api/policy-rules/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["policies"] }),
  });
}

// ─── Patches ─────────────────────────────────────────────────────────────────

export function usePatches(scope = "all") {
  return useQuery({ queryKey: ["patches", scope], queryFn: () => get(`/api/patches${tenantParam(scope)}`) });
}

export function useCreatePatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => post("/api/patches", body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patches"] }),
  });
}

export function useUpdatePatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) => patch(`/api/patches/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patches"] }),
  });
}

// ─── Incidents ───────────────────────────────────────────────────────────────

export function useIncidents(scope = "all") {
  return useQuery({ queryKey: ["incidents", scope], queryFn: () => get(`/api/incidents${tenantParam(scope)}`) });
}

export function useIncident(id: string | null) {
  return useQuery({ queryKey: ["incidents", id], queryFn: () => get(`/api/incidents/${id}`), enabled: !!id });
}

export function useUpdateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string; [k: string]: unknown }) => patch(`/api/incidents/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incidents"] }),
  });
}

export function useUpdateIncidentAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; incidentId: string; [k: string]: unknown }) => {
      const { id, incidentId, ...body } = vars;
      void incidentId;
      return patch(`/api/incident-actions/${id}`, body);
    },
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: ["incidents", vars.incidentId] }),
  });
}

// ─── Analysts ────────────────────────────────────────────────────────────────

export function useAnalysts() {
  return useQuery({ queryKey: ["analysts"], queryFn: () => get("/api/analysts") });
}
