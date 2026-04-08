"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useUploadDocument } from "@/lib/hooks/mutations";
import { useUIStore } from "@/lib/store";
import type { Document } from "@/lib/types";

interface InlineDocUploadProps {
  dealId: string;
  existingDoc?: Document | null;
  label: string;
  acceptTypes?: string;
}

export function InlineDocUpload({ dealId, existingDoc, label, acceptTypes = ".pdf" }: InlineDocUploadProps) {
  const upload = useUploadDocument(dealId);
  const openViewer = useUIStore((s) => s.openViewer);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) upload.mutate({ file });
  }, [upload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload.mutate({ file });
  }, [upload]);

  if (existingDoc) {
    const isProcessing = existingDoc.status === "processing";
    const isProcessed = existingDoc.status === "processed";

    return (
      <div className="space-y-3">
        {/* Document chip */}
        <button
          onClick={() => openViewer(existingDoc.id)}
          className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left"
        >
          <FileText className="w-4 h-4 text-accent shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{existingDoc.name}</p>
            <p className="text-xs text-muted-foreground">
              {isProcessing ? "Analyzing document..." : isProcessed ? "Tap to view details" : existingDoc.status === "failed" ? "Analysis failed — tap to retry" : "Processing..."}
            </p>
          </div>
          {(isProcessing || existingDoc.status === "uploaded") && <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />}
          {existingDoc.status === "failed" && <span className="text-xs text-destructive font-medium shrink-0">Failed</span>}
        </button>

        {/* Inline AI summary when processed */}
        {isProcessed && existingDoc.ai_summary && (
          <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-medium text-accent">AI Summary</span>
            </div>
            <div className="text-xs text-foreground leading-relaxed line-clamp-4">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
                  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  ul: ({ children }) => <ul className="list-disc pl-3 mb-1">{children}</ul>,
                  li: ({ children }) => <li>{children}</li>,
                }}
              >
                {existingDoc.ai_summary.slice(0, 500)}
              </ReactMarkdown>
            </div>
            <button
              onClick={() => openViewer(existingDoc.id)}
              className="text-xs text-accent hover:underline mt-1 font-medium"
            >
              Read full summary →
            </button>
          </div>
        )}
      </div>
    );
  }

  if (upload.isPending) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/30">
        <Loader2 className="w-4 h-4 animate-spin text-accent" />
        <span className="text-sm text-muted-foreground">Uploading...</span>
      </div>
    );
  }

  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`flex items-center gap-3 p-3 rounded-lg border border-dashed cursor-pointer transition-colors ${
        dragging ? "border-accent bg-accent/5" : "border-border hover:border-accent/40 hover:bg-muted/30"
      }`}
    >
      <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
      <span className="text-sm text-muted-foreground">{label}</span>
      <input type="file" accept={acceptTypes} onChange={handleFileSelect} className="hidden" />
    </label>
  );
}
