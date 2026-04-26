"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ProgressStepper } from "@/components/layout/ProgressStepper";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { TransactionSetupForm, type TransactionFormData } from "@/components/transaction/TransactionSetupForm";
import { TransactionSummaryPreview } from "./TransactionSummaryPreview";

export default function TryPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "preview">("form");
  const [transactionData, setTransactionData] = useState<TransactionFormData | null>(null);

  function handleGuestSubmit(data: TransactionFormData) {
    setTransactionData(data);
    setStep("preview");
  }

  if (step === "preview" && transactionData) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <ProgressStepper />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 lg:p-8 xl:p-10">
            <div className="max-w-[1152px] mx-auto space-y-6">
              <TransactionSummaryPreview transactionData={transactionData} />

              <div className="bg-card rounded-xl border border-border shadow-sm p-8 text-center space-y-4">
                <h3 className="text-xl font-semibold">Ready to track your transaction?</h3>
                <p className="text-base text-muted-foreground max-w-md mx-auto">
                  Sign up to save your workspace, upload documents, track deadlines, and get AI-powered transaction intelligence.
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => router.push("/signup")}
                    className="bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 text-base px-6 py-2.5"
                  >
                    Create Account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/login")}
                    className="text-base px-6 py-2.5"
                  >
                    Sign In
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-xl border border-border shadow-sm p-6 opacity-60">
                  <h3 className="text-base font-semibold mb-2">Document Upload</h3>
                  <p className="text-sm text-muted-foreground">Upload your Loan Estimate, contract, and disclosures. AI classifies and summarizes each document.</p>
                  <div className="mt-4 border-2 border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
                    Sign up to upload documents
                  </div>
                </div>
                <div className="bg-card rounded-xl border border-border shadow-sm p-6 opacity-60">
                  <h3 className="text-base font-semibold mb-2">AI Homebuying Assistant</h3>
                  <p className="text-sm text-muted-foreground">Ask Homie anything about your transaction — documents, deadlines, financing, or next steps.</p>
                  <div className="mt-4 border-2 border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
                    Sign up to chat with Homie
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <GlobalFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full">
        <TransactionSetupForm
          mode="guest"
          onGuestSubmit={handleGuestSubmit}
          title="See Your Transaction Workspace"
          subtitle="Enter your transaction details to preview your personalized escrow and closing dashboard. No account required."
        />
        <div className="flex justify-center mt-4">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/login" className="text-accent font-medium hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
