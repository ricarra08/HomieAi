"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "./button";

interface ErrorCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorCard({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry,
}: ErrorCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-10 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6 text-destructive" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}
