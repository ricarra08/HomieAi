"use client";

import { useState } from "react";
import { useDocuments } from "@/lib/hooks/queries";
import { useUIStore } from "@/lib/store";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { DocumentRow } from "@/components/documents/DocumentRow";
import { SmartTabs, type DocumentTabId } from "@/components/documents/SmartTabs";
import { StageEssentials } from "@/components/documents/StageEssentials";
import { DocumentDetailView } from "@/components/documents/SlideOverViewer";
import { CollaboratorLinkDialog } from "@/components/documents/CollaboratorLinkDialog";
import { FileText } from "lucide-react";

function DocumentsContent({ transactionId }: { transactionId: string }) {
  const [activeTab, setActiveTab] = useState<DocumentTabId>("all");
  const { data: documents, isLoading } = useDocuments(transactionId);
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
            Upload, organize, and understand your documents
          </p>
        </div>
        <CollaboratorLinkDialog transactionId={transactionId} />
      </div>

      <StageEssentials documents={documents ?? []} />

      <DocumentUpload transactionId={transactionId} />

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
        <div className="bg-card rounded-xl border border-border shadow-sm p-10 text-center space-y-3">
          {documents && documents.length > 0 ? (
            <p className="text-base text-muted-foreground">No documents in this category.</p>
          ) : (
            <>
              <FileText className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-base text-muted-foreground">No documents uploaded yet</p>
              <p className="text-sm text-muted-foreground">Drag and drop PDFs into the upload zone above to get started.</p>
            </>
          )}
        </div>
      )}
    </div>
    </div>
    </>
  );
}

export default function DocumentsPage() {
  const activeTransactionId = useUIStore((s) => s.activeTransactionId);

  if (!activeTransactionId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
          <p className="text-base text-muted-foreground mt-1">
            Upload, organize, and understand your documents
          </p>
        </div>
        <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10 text-center">
          Create a transaction first to start uploading documents.
        </div>
      </div>
    );
  }

  return <DocumentsContent key={activeTransactionId} transactionId={activeTransactionId} />;
}
