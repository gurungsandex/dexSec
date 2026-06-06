"use client";
import { create } from "zustand";

export type NavItem =
  | "overview"
  | "incidents"
  | "soc"
  | "endpoints"
  | "policies"
  | "firewall"
  | "patch"
  | "agents"
  | "assets"
  | "reports"
  | "download-center"
  | "telemetry"
  | "integrations"
  | "audit"
  | "settings";

export interface Toast {
  id: string;
  message: string;
  variant?: "default" | "success" | "error";
}

export interface AriaContext {
  incidentId?: string;
  incidentTitle?: string;
  incidentSeverity?: string;
  incidentTtp?: string;
  tenantName?: string;
  affectedAsset?: string;
  prefillMessage?: string;
}

interface UIStore {
  scope: string;
  setScope: (scope: string) => void;

  nav: NavItem;
  setNav: (nav: NavItem) => void;

  incidentDrawerId: string | null;
  openIncidentDrawer: (id: string) => void;
  closeIncidentDrawer: () => void;

  endpointDrawerId: string | null;
  openEndpointDrawer: (id: string) => void;
  closeEndpointDrawer: () => void;

  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  ariaOpen: boolean;
  ariaContext: AriaContext | null;
  openAria: (context?: AriaContext) => void;
  closeAria: () => void;

  toasts: Toast[];
  addToast: (message: string, variant?: Toast["variant"]) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  scope: "all",
  setScope: (scope) => set({ scope, incidentDrawerId: null, endpointDrawerId: null }),

  nav: "overview",
  setNav: (nav) => set({ nav, incidentDrawerId: null, endpointDrawerId: null }),

  incidentDrawerId: null,
  openIncidentDrawer: (id) => set({ incidentDrawerId: id }),
  closeIncidentDrawer: () => set({ incidentDrawerId: null }),

  endpointDrawerId: null,
  openEndpointDrawer: (id) => set({ endpointDrawerId: id }),
  closeEndpointDrawer: () => set({ endpointDrawerId: null }),

  commandPaletteOpen: false,
  openCommandPalette: () => set({ commandPaletteOpen: true }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),

  ariaOpen: false,
  ariaContext: null,
  openAria: (context) => set({ ariaOpen: true, ariaContext: context ?? null }),
  closeAria: () => set({ ariaOpen: false, ariaContext: null }),

  toasts: [],
  addToast: (message, variant = "default") => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3600);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
