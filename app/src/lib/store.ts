import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  activeSidebarItem: "dashboard" | "documents" | "financing" | "archived";
  setActiveSidebarItem: (item: UIState["activeSidebarItem"]) => void;

  // Active transaction context
  activeTransactionId: string | null;
  setActiveTransactionId: (id: string | null) => void;

  // Clear all transaction-scoped state (used by "Back to clients", logout, etc.)
  clearTransactionContext: () => void;

  // Selected home (Shopping → Offer handoff)
  selectedHomeId: string | null;
  setSelectedHomeId: (id: string | null) => void;

  // Buyer context
  ownsCurrentHome: boolean | null;
  setOwnsCurrentHome: (owns: boolean) => void;

  // Direct entry mode (shows TransactionSetupForm instead of phase dashboard)
  showDirectSetup: boolean;
  setShowDirectSetup: (show: boolean) => void;

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

export const useUIStore = create<UIState>()(persist((set) => ({
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

  // Active transaction context
  activeTransactionId: null,
  setActiveTransactionId: (id) => set({ activeTransactionId: id }),

  // Clear all transaction-scoped state
  clearTransactionContext: () => set({
    activeTransactionId: null,
    currentPhase: "shopping",
    selectedHomeId: null,
    showDirectSetup: false,
    selectedLEIds: [],
    viewerDocId: null,
    viewerOpen: false,
    copilotOpen: false,
  }),

  // Selected home
  selectedHomeId: null,
  setSelectedHomeId: (id) => set({ selectedHomeId: id }),

  // Buyer context
  ownsCurrentHome: null,
  setOwnsCurrentHome: (owns) => set({ ownsCurrentHome: owns }),

  // Direct entry mode
  showDirectSetup: false,
  setShowDirectSetup: (show) => set({ showDirectSetup: show }),

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
}), {
  name: "homieai-ui",
  version: 2,
  migrate: (persistedState: unknown, version: number) => {
    const state = persistedState as Record<string, unknown>;
    if (version === 0 && "activeDealId" in state) {
      state.activeTransactionId = state.activeDealId;
      delete state.activeDealId;
    }
    // v1→v2: remove currentPhase from persistence (DB is source of truth now)
    if (version <= 1) {
      delete state.currentPhase;
    }
    return state as unknown as UIState;
  },
  partialize: (state) => ({
    activeTransactionId: state.activeTransactionId,
  }),
}));
