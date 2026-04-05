import { create } from "zustand";

export type Phase = "shopping" | "offer" | "escrow" | "closing" | "post-close";

interface UIState {
  currentPhase: Phase;
  setCurrentPhase: (phase: Phase) => void;

  copilotOpen: boolean;
  toggleCopilot: () => void;
  setCopilotOpen: (open: boolean) => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  activeSidebarItem: "dashboard" | "documents" | "financing";
  setActiveSidebarItem: (item: UIState["activeSidebarItem"]) => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentPhase: "shopping",
  setCurrentPhase: (phase) => set({ currentPhase: phase }),

  copilotOpen: false,
  toggleCopilot: () => set((s) => ({ copilotOpen: !s.copilotOpen })),
  setCopilotOpen: (open) => set({ copilotOpen: open }),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  activeSidebarItem: "dashboard",
  setActiveSidebarItem: (item) => set({ activeSidebarItem: item }),
}));
