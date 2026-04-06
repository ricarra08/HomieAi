import { create } from "zustand";

export type Phase = "shopping" | "offer" | "escrow" | "closing" | "post-close";

interface UIState {
  // Layout & navigation
  currentPhase: Phase;
  setCurrentPhase: (phase: Phase) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  copilotOpen: boolean;
  toggleCopilot: () => void;
  setCopilotOpen: (open: boolean) => void;
  activeSidebarItem: "dashboard" | "documents" | "financing";
  setActiveSidebarItem: (item: UIState["activeSidebarItem"]) => void;

  // Active deal context
  activeDealId: string | null;
  setActiveDealId: (id: string | null) => void;

  // LE comparison selections (Financing view — max 3)
  selectedLEIds: string[];
  toggleLESelection: (id: string) => void;
  clearLESelections: () => void;

  // Document viewer (Documents view)
  viewerDocId: string | null;
  viewerOpen: boolean;
  openViewer: (docId: string) => void;
  closeViewer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Layout & navigation
  currentPhase: "shopping",
  setCurrentPhase: (phase) => set({ currentPhase: phase }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  copilotOpen: false,
  toggleCopilot: () => set((s) => ({ copilotOpen: !s.copilotOpen })),
  setCopilotOpen: (open) => set({ copilotOpen: open }),
  activeSidebarItem: "dashboard",
  setActiveSidebarItem: (item) => set({ activeSidebarItem: item }),

  // Active deal context
  activeDealId: null,
  setActiveDealId: (id) => set({ activeDealId: id }),

  // LE comparison selections
  selectedLEIds: [],
  toggleLESelection: (id) =>
    set((s) => {
      if (s.selectedLEIds.includes(id)) {
        return { selectedLEIds: s.selectedLEIds.filter((x) => x !== id) };
      }
      if (s.selectedLEIds.length >= 3) return s;
      return { selectedLEIds: [...s.selectedLEIds, id] };
    }),
  clearLESelections: () => set({ selectedLEIds: [] }),

  // Document viewer
  viewerDocId: null,
  viewerOpen: false,
  openViewer: (docId) => set({ viewerDocId: docId, viewerOpen: true }),
  closeViewer: () => set({ viewerDocId: null, viewerOpen: false }),
}));
