"use client";

import { useEffect } from "react";
import { ErrorCard } from "@/components/ui/error-card";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <ErrorCard
        title="Something went wrong"
        message="We hit an unexpected error. Your data is safe — try refreshing or click below."
        onRetry={reset}
      />
    </div>
  );
}
