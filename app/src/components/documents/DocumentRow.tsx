"use client";

import { FileText, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/lib/store";
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

const statusConfig: Record<string, { label: string; className: string }> = {
  required: { label: "Required", className: "bg-destructive/10 text-destructive" },
  missing: { label: "Missing", className: "bg-destructive/10 text-destructive" },
  uploaded: { label: "Uploaded", className: "bg-blue-50 text-blue-700" },
  signed: { label: "Signed", className: "bg-primary/20 text-primary-foreground" },
  acknowledged: { label: "Acknowledged", className: "bg-primary/20 text-primary-foreground" },
  final: { label: "Final", className: "bg-primary/20 text-primary-foreground" },
  "read-only": { label: "Read Only", className: "bg-muted text-muted-foreground" },
};

export function DocumentRow({ doc }: { doc: Document }) {
  const openViewer = useUIStore((s) => s.openViewer);
  const status = statusConfig[doc.status] ?? statusConfig["uploaded"];

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
          {doc.doc_type && <span>{doc.doc_type}</span>}
          {doc.doc_type && <span>&middot;</span>}
          <span>{formatDate(doc.created_at)}</span>
          <span>&middot;</span>
          <span>{formatFileSize(doc.file_size)}</span>
        </div>
      </div>
      <Badge className={`${status.className} text-xs shrink-0`}>{status.label}</Badge>
      <button
        onClick={(e) => e.stopPropagation()}
        className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}
