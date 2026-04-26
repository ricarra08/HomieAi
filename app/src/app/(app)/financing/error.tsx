"use client";

import { useEffect } from "react";
import { ErrorCard } from "@/components/ui/error-card";

export default function FinancingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[financing-error]", error);
  }, [error]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Financing</h1>
        <p className="text-base text-muted-foreground mt-1">
          Compare loan estimates and track your costs
        </p>
      </div>
      <ErrorCard
        title="Failed to load financing data"
        message="We couldn't load your loan estimates. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
