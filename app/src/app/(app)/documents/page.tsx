"use client";

import { useDocuments } from "@/lib/hooks/queries";
import { useUIStore } from "@/lib/store";
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { DocumentRow } from "@/components/documents/DocumentRow";

export default function DocumentsPage() {
  const activeDealId = useUIStore((s) => s.activeDealId);
  const { data: documents, isLoading } = useDocuments(activeDealId);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
          <p className="text-base text-muted-foreground mt-1">
            Upload, organize, and understand your deal documents
          </p>
        </div>
      </div>

      <DocumentUpload dealId={activeDealId} />

      {isLoading ? (
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border">
          {documents.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </div>
      ) : (
        <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10 text-center">
          No documents uploaded yet. Drag and drop PDFs above to get started.
        </div>
      )}
    </div>
  );
}
