"use client";

import { Badge } from "@/components/ui/badge";
import type { Document } from "@/lib/types";

export const DOCUMENT_TAB_IDS = [
  "all",
  "offer",
  "financing",
  "disclosures",
  "inspections",
  "escrow_title",
  "closing",
  "other",
] as const;

export type DocumentTabId = (typeof DOCUMENT_TAB_IDS)[number];

const TAB_LABELS: Record<Exclude<DocumentTabId, "all">, string> = {
  offer: "Offer",
  financing: "Financing",
  disclosures: "Disclosures",
  inspections: "Inspections",
  escrow_title: "Escrow / Title",
  closing: "Closing",
  other: "Other",
};

interface SmartTabsProps {
  documents: Document[];
  activeTab: DocumentTabId;
  onTabChange: (tab: DocumentTabId) => void;
}

export function SmartTabs({ documents, activeTab, onTabChange }: SmartTabsProps) {
  function getCounts(tabId: DocumentTabId): number {
    if (tabId === "all") return documents.length;
    return documents.filter((d) => d.category === tabId).length;
  }

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      <button
        type="button"
        onClick={() => onTabChange("all")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
          activeTab === "all"
            ? "bg-accent text-accent-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        }`}
      >
        All
        <Badge
          className={`text-xs px-1.5 py-0 min-w-[20px] text-center ${
            activeTab === "all"
              ? "bg-accent-foreground/20 text-accent-foreground"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {getCounts("all")}
        </Badge>
      </button>

      {(Object.keys(TAB_LABELS) as Exclude<DocumentTabId, "all">[]).map((tabId) => {
        const count = getCounts(tabId);
        if (count === 0) return null;

        const isActive = activeTab === tabId;
        return (
          <button
            key={tabId}
            type="button"
            onClick={() => onTabChange(tabId)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              isActive
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {TAB_LABELS[tabId]}
            <Badge
              className={`text-xs px-1.5 py-0 min-w-[20px] text-center ${
                isActive
                  ? "bg-accent-foreground/20 text-accent-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {count}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
