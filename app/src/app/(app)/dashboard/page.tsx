"use client";

import { PhaseDashboard } from "@/components/deal/PhaseDashboard";
import { DocumentDetailView } from "@/components/documents/SlideOverViewer";
import { useUIStore } from "@/lib/store";
import { useDocuments } from "@/lib/hooks/queries";

export default function DashboardPage() {
  const { viewerDocId, viewerOpen, activeDealId } = useUIStore();
  const { data: documents } = useDocuments(activeDealId);

  const activeDoc = viewerOpen && viewerDocId
    ? documents?.find((d) => d.id === viewerDocId)
    : null;

  if (activeDoc) {
    return <DocumentDetailView doc={activeDoc} />;
  }

  return <PhaseDashboard />;
}
