"use client";

import { useEffect } from "react";
import { ErrorCard } from "@/components/ui/error-card";

export default function DocumentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[documents-error]", error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Documents</h1>
        <p className="text-base text-muted-foreground mt-1">
          Upload, organize, and understand your deal documents
        </p>
      </div>
      <ErrorCard
        title="Failed to load documents"
        message="We couldn't load your documents. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
