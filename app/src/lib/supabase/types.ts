export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; email: string; full_name: string | null; role: 'admin' | 'analyst' | 'viewer'; avatar_url: string | null; created_at: string; updated_at: string }
        Insert: { id: string; email: string; full_name?: string | null; role?: 'admin' | 'analyst' | 'viewer'; avatar_url?: string | null }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      tenants: {
        Row: { id: string; name: string; industry: string | null; risk_score: number; status: 'active' | 'inactive' | 'suspended'; endpoints_total: number; endpoints_healthy: number; patch_compliance: number; created_at: string; updated_at: string }
        Insert: { id?: string; name: string; industry?: string | null; risk_score?: number; status?: 'active' | 'inactive' | 'suspended'; endpoints_total?: number; endpoints_healthy?: number; patch_compliance?: number }
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>
      }
      analysts: {
        Row: { id: string; profile_id: string | null; name: string; initials: string | null; role: string | null; on_call: boolean; workload: number; avatar_color: string; created_at: string }
        Insert: { id?: string; profile_id?: string | null; name: string; initials?: string | null; role?: string | null; on_call?: boolean; workload?: number; avatar_color?: string }
        Update: Partial<Database['public']['Tables']['analysts']['Insert']>
      }
      agents: {
        Row: { id: string; tenant_id: string | null; name: string; hostname: string | null; version: string; status: 'online' | 'offline' | 'degraded' | 'updating'; os: string | null; os_version: string | null; ip_address: string | null; last_seen: string | null; deployed_at: string; config: Json; created_at: string; updated_at: string }
        Insert: { id?: string; tenant_id?: string | null; name: string; hostname?: string | null; version?: string; status?: 'online' | 'offline' | 'degraded' | 'updating'; os?: string | null; os_version?: string | null; ip_address?: string | null; last_seen?: string | null; config?: Json }
        Update: Partial<Database['public']['Tables']['agents']['Insert']>
      }
      endpoints: {
        Row: { id: string; tenant_id: string | null; agent_id: string | null; hostname: string; ip_address: string | null; os: string | null; os_version: string | null; status: 'online' | 'offline' | 'isolated' | 'at_risk'; health_score: number; last_seen: string | null; department: string | null; owner: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; tenant_id?: string | null; agent_id?: string | null; hostname: string; ip_address?: string | null; os?: string | null; os_version?: string | null; status?: 'online' | 'offline' | 'isolated' | 'at_risk'; health_score?: number; last_seen?: string | null; department?: string | null; owner?: string | null }
        Update: Partial<Database['public']['Tables']['endpoints']['Insert']>
      }
      assets: {
        Row: { id: string; tenant_id: string | null; name: string; type: 'Server' | 'Workstation' | 'Network Device' | 'Cloud Resource' | 'IoT' | 'Mobile'; owner: string | null; department: string | null; status: 'active' | 'inactive' | 'decommissioned'; risk: 'critical' | 'high' | 'medium' | 'low'; ip_address: string | null; location: string | null; tags: string[]; created_at: string; updated_at: string }
        Insert: { id?: string; tenant_id?: string | null; name: string; type?: 'Server' | 'Workstation' | 'Network Device' | 'Cloud Resource' | 'IoT' | 'Mobile'; owner?: string | null; department?: string | null; status?: 'active' | 'inactive' | 'decommissioned'; risk?: 'critical' | 'high' | 'medium' | 'low'; ip_address?: string | null; location?: string | null; tags?: string[] }
        Update: Partial<Database['public']['Tables']['assets']['Insert']>
      }
      firewall_rules: {
        Row: { id: string; tenant_id: string | null; name: string; direction: 'Inbound' | 'Outbound' | 'Both'; action: 'Allow' | 'Block' | 'Log'; protocol: 'TCP' | 'UDP' | 'ICMP' | 'Any'; port: string | null; source: string | null; destination: string | null; enabled: boolean; priority: number; description: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; tenant_id?: string | null; name: string; direction?: 'Inbound' | 'Outbound' | 'Both'; action?: 'Allow' | 'Block' | 'Log'; protocol?: 'TCP' | 'UDP' | 'ICMP' | 'Any'; port?: string | null; source?: string | null; destination?: string | null; enabled?: boolean; priority?: number; description?: string | null }
        Update: Partial<Database['public']['Tables']['firewall_rules']['Insert']>
      }
      policies: {
        Row: { id: string; tenant_id: string | null; name: string; category: string; framework: string | null; status: 'draft' | 'deployed' | 'archived'; description: string | null; platforms: string[]; created_at: string; updated_at: string }
        Insert: { id?: string; tenant_id?: string | null; name: string; category: string; framework?: string | null; status?: 'draft' | 'deployed' | 'archived'; description?: string | null; platforms?: string[] }
        Update: Partial<Database['public']['Tables']['policies']['Insert']>
      }
      policy_rules: {
        Row: { id: string; policy_id: string; section: string; name: string; enabled: boolean; created_at: string }
        Insert: { id?: string; policy_id: string; section: string; name: string; enabled?: boolean }
        Update: Partial<Database['public']['Tables']['policy_rules']['Insert']>
      }
      policy_groups: {
        Row: { id: string; policy_id: string; group_name: string; endpoint_count: number; deployed_at: string }
        Insert: { id?: string; policy_id: string; group_name: string; endpoint_count?: number; deployed_at?: string }
        Update: Partial<Database['public']['Tables']['policy_groups']['Insert']>
      }
      patches: {
        Row: { id: string; tenant_id: string | null; cve_id: string | null; title: string; product: string; severity: 'critical' | 'high' | 'medium' | 'low'; status: 'pending' | 'scheduled' | 'deployed' | 'failed'; affected_count: number; deployed_count: number; scheduled_at: string | null; deployed_at: string | null; description: string | null; created_at: string; updated_at: string }
        Insert: { id?: string; tenant_id?: string | null; cve_id?: string | null; title: string; product: string; severity?: 'critical' | 'high' | 'medium' | 'low'; status?: 'pending' | 'scheduled' | 'deployed' | 'failed'; affected_count?: number; deployed_count?: number; scheduled_at?: string | null; deployed_at?: string | null; description?: string | null }
        Update: Partial<Database['public']['Tables']['patches']['Insert']>
      }
      incidents: {
        Row: { id: string; tenant_id: string | null; title: string; description: string | null; severity: 'critical' | 'high' | 'medium' | 'low'; status: 'new' | 'assigned' | 'investigating' | 'resolved'; ttp: string | null; cvss: number | null; affected_asset: string | null; analyst_id: string | null; detected_at: string; resolved_at: string | null; created_at: string; updated_at: string }
        Insert: { id: string; tenant_id?: string | null; title: string; description?: string | null; severity?: 'critical' | 'high' | 'medium' | 'low'; status?: 'new' | 'assigned' | 'investigating' | 'resolved'; ttp?: string | null; cvss?: number | null; affected_asset?: string | null; analyst_id?: string | null; detected_at?: string; resolved_at?: string | null }
        Update: Partial<Omit<Database['public']['Tables']['incidents']['Insert'], 'id'>>
      }
      incident_timeline: {
        Row: { id: string; incident_id: string; event: string; detail: string | null; occurred_at: string }
        Insert: { id?: string; incident_id: string; event: string; detail?: string | null; occurred_at?: string }
        Update: Partial<Database['public']['Tables']['incident_timeline']['Insert']>
      }
      incident_actions: {
        Row: { id: string; incident_id: string; label: string; completed: boolean; completed_at: string | null; completed_by: string | null; created_at: string }
        Insert: { id?: string; incident_id: string; label: string; completed?: boolean; completed_at?: string | null; completed_by?: string | null }
        Update: Partial<Database['public']['Tables']['incident_actions']['Insert']>
      }
    }
  }
}

// Convenience row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type Analyst = Database['public']['Tables']['analysts']['Row']
export type Agent = Database['public']['Tables']['agents']['Row']
export type Endpoint = Database['public']['Tables']['endpoints']['Row']
export type Asset = Database['public']['Tables']['assets']['Row']
export type FirewallRule = Database['public']['Tables']['firewall_rules']['Row']
export type Policy = Database['public']['Tables']['policies']['Row']
export type PolicyRule = Database['public']['Tables']['policy_rules']['Row']
export type PolicyGroup = Database['public']['Tables']['policy_groups']['Row']
export type Patch = Database['public']['Tables']['patches']['Row']
export type Incident = Database['public']['Tables']['incidents']['Row']
export type IncidentTimeline = Database['public']['Tables']['incident_timeline']['Row']
export type IncidentAction = Database['public']['Tables']['incident_actions']['Row']
