"use client";

import { FileText, MoreHorizontal, Check, RefreshCw } from "lucide-react";
import { useUIStore } from "@/lib/store";
import { useQueryClient } from "@tanstack/react-query";
import { documentKeys } from "@/lib/hooks/query-keys";
import type { Document } from "@/lib/types";

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STEPS = ["Uploaded", "Analyzing", "Ready"] as const;

function stepIndex(status: string): number {
  if (status === "uploaded") return 0;
  if (status === "processing") return 1;
  if (status === "processed" || status === "signed" || status === "acknowledged" || status === "final") return 2;
  return -1;
}

function ProcessingStepper({ status }: { status: string }) {
  const current = stepIndex(status);

  if (current < 0) return null;

  return (
    <div className="flex items-center gap-1 shrink-0">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const isLast = i === STEPS.length - 1;

        return (
          <div key={label} className="flex items-center gap-1">
            {/* Step dot/icon */}
            <div className="flex items-center gap-1.5">
              {done ? (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />
                </div>
              ) : active && current < 2 ? (
                <div className="w-4 h-4 rounded-full border-2 border-accent relative">
                  <div className="absolute inset-0.5 rounded-full bg-accent animate-pulse" />
                </div>
              ) : active && current === 2 ? (
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-primary-foreground" strokeWidth={3} />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-border" />
              )}
              <span
                className={`text-xs font-medium ${
                  done || (active && current === 2)
                    ? "text-primary-foreground"
                    : active
                      ? "text-accent"
                      : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {/* Connector line */}
            {!isLast && (
              <div
                className={`w-4 h-0.5 rounded-full ${
                  done ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function DocumentRow({ doc }: { doc: Document }) {
  const openViewer = useUIStore((s) => s.openViewer);
  const qc = useQueryClient();

  function handleRetry(e: React.MouseEvent) {
    e.stopPropagation();
    fetch("/api/documents/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: doc.id }),
    }).then(() => {
      qc.invalidateQueries({ queryKey: documentKeys.list(doc.deal_id) });
    });
  }

  const showStepper = ["uploaded", "processing", "processed", "signed", "acknowledged", "final"].includes(doc.status);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openViewer(doc.id)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openViewer(doc.id); } }}
      className="w-full flex items-center gap-4 py-3 px-4 rounded-lg hover:bg-muted/50 transition-colors text-left cursor-pointer"
    >
      <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-base font-medium text-foreground truncate">{doc.name}</p>
        <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
          {doc.doc_type && doc.doc_type !== "other" && <span>{doc.doc_type.replace(/_/g, " ")}</span>}
          {doc.doc_type && doc.doc_type !== "other" && <span>&middot;</span>}
          <span>{formatDate(doc.created_at)}</span>
          <span>&middot;</span>
          <span>{formatFileSize(doc.file_size)}</span>
        </div>
      </div>
      {doc.status === "failed" ? (
        <button
          onClick={handleRetry}
          className="text-sm text-destructive font-medium shrink-0 flex items-center gap-1.5 hover:underline"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      ) : showStepper ? (
        <ProcessingStepper status={doc.status} />
      ) : null}
      <button
        onClick={(e) => e.stopPropagation()}
        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}
