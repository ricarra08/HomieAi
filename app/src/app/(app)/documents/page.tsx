"use client";

import { useState } from "react";
import { useDocuments } from "@/lib/hooks/queries";
import { useUIStore } from "@/lib/store";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { DocumentRow } from "@/components/documents/DocumentRow";
import { SmartTabs, type DocumentTabId } from "@/components/documents/SmartTabs";
import { StageEssentials } from "@/components/documents/StageEssentials";
import { DocumentDetailView } from "@/components/documents/SlideOverViewer";

function DocumentsContent({ dealId }: { dealId: string }) {
  const [activeTab, setActiveTab] = useState<DocumentTabId>("all");
  const { data: documents, isLoading } = useDocuments(dealId);
  const { viewerDocId, viewerOpen } = useUIStore();

  const tab: DocumentTabId =
    activeTab !== "all" && documents?.some((d) => d.category === activeTab)
      ? activeTab
      : "all";

  const filtered =
    !documents?.length ? [] : tab === "all" ? documents : documents.filter((d) => d.category === tab);

  const activeDoc = viewerOpen && viewerDocId
    ? documents?.find((d) => d.id === viewerDocId)
    : null;

  return (
    <>
    {activeDoc && <DocumentDetailView doc={activeDoc} />}
    <div className={activeDoc ? "hidden" : ""}>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
          <p className="text-base text-muted-foreground mt-1">
            Upload, organize, and understand your deal documents
          </p>
        </div>
      </div>

      <StageEssentials documents={documents ?? []} />

      <DocumentUpload dealId={dealId} />

      {documents && documents.length > 0 && (
        <SmartTabs
          documents={documents}
          activeTab={tab}
          onTabChange={setActiveTab}
        />
      )}

      {isLoading ? (
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
          {filtered.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10 text-center">
          {documents && documents.length > 0
            ? "No documents in this category."
            : "No documents uploaded yet. Drag and drop PDFs above to get started."}
        </div>
      )}
    </div>
    </div>
    </>
  );
}

export default function DocumentsPage() {
  const activeDealId = useUIStore((s) => s.activeDealId);

  if (!activeDealId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
          <p className="text-base text-muted-foreground mt-1">
            Upload, organize, and understand your deal documents
          </p>
        </div>
        <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10 text-center">
          Create a deal first to start uploading documents.
        </div>
      </div>
    );
  }

  return <DocumentsContent key={activeDealId} dealId={activeDealId} />;
}
