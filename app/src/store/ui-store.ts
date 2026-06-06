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
  | "assets"
  | "reports"
  | "integrations"
  | "audit"
  | "settings";

export interface Toast {
  id: string;
  message: string;
  variant?: "default" | "success" | "error";
}

interface UIStore {
  // tenant scope: "all" or a tenantId
  scope: string;
  setScope: (scope: string) => void;

  nav: NavItem;
  setNav: (nav: NavItem) => void;

  // drawers/modals
  incidentDrawerId: string | null;
  openIncidentDrawer: (id: string) => void;
  closeIncidentDrawer: () => void;

  endpointDrawerId: string | null;
  openEndpointDrawer: (id: string) => void;
  closeEndpointDrawer: () => void;

  commandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  // toasts
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

  toasts: [],
  addToast: (message, variant = "default") => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, variant }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3600);
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
