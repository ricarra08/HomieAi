"use client";

import { useEffect } from "react";
import { X, Download, FileText, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store";
import { useDocuments } from "@/lib/hooks/queries";
import { createClient } from "@/lib/supabase/client";
import type { Document } from "@/lib/types";

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDocType(docType: string | null): string {
  if (!docType) return "Unknown";
  return docType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export function SlideOverViewer() {
  const { viewerOpen, viewerDocId, closeViewer } = useUIStore();
  const activeDealId = useUIStore((s) => s.activeDealId);
  const { data: documents } = useDocuments(activeDealId);

  const doc: Document | undefined = documents?.find((d) => d.id === viewerDocId);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") closeViewer();
    }
    if (viewerOpen) {
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [viewerOpen, closeViewer]);

  if (!viewerOpen || !doc) return null;

  const supabase = createClient();
  const { data: urlData } = supabase.storage
    .from("deal-documents")
    .getPublicUrl(doc.file_path);

  async function handleDownload() {
    if (!doc) return;
    const sb = createClient();
    const { data, error } = await sb.storage
      .from("deal-documents")
      .download(doc.file_path);
    if (error || !data) return;
    const url = URL.createObjectURL(data);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={closeViewer}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-[600px] bg-card border-l border-border shadow-lg z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-foreground truncate">{doc.name}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className="bg-blue-50 text-blue-700 text-xs">
                  {formatDocType(doc.doc_type)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatFileSize(doc.file_size)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleDownload}
              className="text-sm"
            >
              <Download className="w-4 h-4 mr-1.5" />
              Download
            </Button>
            <button
              onClick={closeViewer}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Preview */}
        <div className="flex-1 overflow-hidden bg-muted/30">
          {urlData?.publicUrl ? (
            <iframe
              src={`${urlData.publicUrl}#toolbar=0`}
              className="w-full h-full border-0"
              title={doc.name}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              PDF preview not available
            </div>
          )}
        </div>

        {/* Metadata + AI Summary */}
        <div className="shrink-0 border-t border-border max-h-[40%] overflow-y-auto">
          <div className="p-5 space-y-4">
            {/* Document Metadata */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Details</h4>
              <MetaRow label="Type" value={formatDocType(doc.doc_type)} />
              <MetaRow label="Category" value={doc.category ?? "—"} />
              <MetaRow label="Stage" value={doc.stage ?? "—"} />
              <MetaRow label="Status" value={doc.status} />
              {doc.confidence_score !== null && (
                <MetaRow
                  label="Confidence"
                  value={`${Math.round(doc.confidence_score * 100)}%`}
                />
              )}
              <MetaRow
                label="Uploaded"
                value={new Date(doc.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              />
            </div>

            {/* AI Summary */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <h4 className="text-sm font-semibold text-foreground">AI Summary</h4>
              </div>
              {doc.ai_summary ? (
                <p className="text-sm text-foreground leading-relaxed">{doc.ai_summary}</p>
              ) : (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    AI summary will appear here once document analysis is complete.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Coming in Phase 2
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
