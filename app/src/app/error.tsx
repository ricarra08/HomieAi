"use client";

import { useEffect } from "react";
import { ErrorCard } from "@/components/ui/error-card";

// Root error boundary: covers the public surfaces ((public), (auth), landing, /try)
// that lack their own segment boundary. Without this, a render crash shows Next's
// unbranded "Application error" white screen — to lenders and invited buyers.
export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[root-error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <ErrorCard
          title="Something went wrong"
          message="We hit an unexpected error. Your data is safe — try again or refresh the page."
          onRetry={reset}
        />
      </div>
    </div>
  );
}
