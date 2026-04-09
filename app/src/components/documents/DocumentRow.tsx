"use client";

import { useState } from "react";
import { FileText, MoreHorizontal, Check, RefreshCw, Eye, Tags, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUIStore } from "@/lib/store";
import { useUpdateDocument, useDeleteDocument } from "@/lib/hooks/mutations";
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

const DOC_TYPE_TAXONOMY: { value: string; label: string; category: string }[] = [
  { value: "purchase_contract", label: "Purchase Contract", category: "offer" },
  { value: "loan_estimate", label: "Loan Estimate", category: "financing" },
  { value: "closing_disclosure", label: "Closing Disclosure", category: "closing" },
  { value: "inspection_report", label: "Inspection Report", category: "inspections" },
  { value: "appraisal", label: "Appraisal", category: "appraisal" },
  { value: "title_report", label: "Title Report", category: "escrow_title" },
  { value: "disclosure", label: "Disclosure", category: "disclosures" },
  { value: "insurance_binder", label: "Insurance Binder", category: "insurance" },
  { value: "pre_approval", label: "Pre-Approval", category: "offer" },
  { value: "proof_of_funds", label: "Proof of Funds", category: "offer" },
  { value: "other", label: "Other", category: "other" },
];

export function DocumentRow({ doc }: { doc: Document }) {
  const openViewer = useUIStore((s) => s.openViewer);
  const updateDoc = useUpdateDocument(doc.deal_id);
  const deleteDoc = useDeleteDocument(doc.deal_id);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleRetry(e: React.MouseEvent) {
    e.stopPropagation();
    fetch("/api/documents/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: doc.id }),
    });
  }

  function handleReclassify(docType: string, category: string) {
    updateDoc.mutate({ documentId: doc.id, updates: { doc_type: docType, category } });
  }

  function handleDelete() {
    deleteDoc.mutate({ documentId: doc.id, filePath: doc.file_path });
    setConfirmDelete(false);
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

      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
        >
          <MoreHorizontal className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onClick={() => openViewer(doc.id)}>
            <Eye className="w-4 h-4 mr-2" />
            View
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Tags className="w-4 h-4 mr-2" />
              Reclassify
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {DOC_TYPE_TAXONOMY.map((t) => (
                <DropdownMenuItem
                  key={t.value}
                  onClick={() => handleReclassify(t.value, t.category)}
                  className={doc.doc_type === t.value ? "bg-accent/10 text-accent" : ""}
                >
                  {t.label}
                  {doc.doc_type === t.value && <Check className="w-3 h-3 ml-auto" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          {confirmDelete ? (
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Confirm Delete
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={(e) => { e.preventDefault(); setConfirmDelete(true); }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
