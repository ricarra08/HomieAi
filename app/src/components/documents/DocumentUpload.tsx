"use client";

import { useCallback, useState } from "react";
import { useUploadDocument } from "@/lib/hooks/mutations";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DocumentUploadProps {
  dealId: string;
}

export function DocumentUpload({ dealId }: DocumentUploadProps) {
  const upload = useUploadDocument(dealId);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files) return;
      Array.from(files).forEach((file) => {
        if (file.type !== "application/pdf") {
          toast.error(`${file.name} is not a PDF. Only PDF files are supported.`);
          return;
        }
        if (file.size > 25 * 1024 * 1024) {
          toast.error(`${file.name} is too large. Maximum file size is 25MB.`);
          return;
        }
        upload.mutate(
          { file },
          {
            onSuccess: () => toast.success(`${file.name} uploaded successfully`),
            onError: () => toast.error(`Failed to upload ${file.name}`),
          }
        );
      });
    },
    [upload]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        dragOver
          ? "border-accent bg-accent/5"
          : "border-border hover:border-accent/50"
      }`}
    >
      {upload.isPending ? (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-base text-foreground font-medium">Uploading...</p>
        </div>
      ) : (
        <label className="flex flex-col items-center gap-3 cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-base text-foreground font-medium">
              Drag &amp; drop PDFs here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports PDF files up to 25MB
            </p>
          </div>
          <input
            type="file"
            accept=".pdf,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      )}
    </div>
  );
}
