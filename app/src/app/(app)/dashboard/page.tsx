"use client";

import { PhaseDashboard } from "@/components/transaction/PhaseDashboard";
import { DocumentDetailView } from "@/components/documents/SlideOverViewer";
import { useUIStore } from "@/lib/store";
import { useDocuments } from "@/lib/hooks/queries";

export default function DashboardPage() {
  const { viewerDocId, viewerOpen, activeTransactionId } = useUIStore();
  const { data: documents } = useDocuments(activeTransactionId);

  const activeDoc = viewerOpen && viewerDocId
    ? documents?.find((d) => d.id === viewerDocId)
    : null;

  return (
    <>
      {activeDoc && <DocumentDetailView doc={activeDoc} />}
      <div className={activeDoc ? "hidden" : ""}>
        <PhaseDashboard />
      </div>
    </>
  );
}
