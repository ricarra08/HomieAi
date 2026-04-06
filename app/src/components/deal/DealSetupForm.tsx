"use client";

import { useState } from "react";
import { useCreateDeal } from "@/lib/hooks/mutations";
import { useUIStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface DealSetupFormProps {
  userId: string;
  onComplete?: () => void;
}

export function DealSetupForm({ userId, onComplete }: DealSetupFormProps) {
  const createDeal = useCreateDeal(userId);
  const { setCurrentPhase, setActiveDealId } = useUIStore();

  const [address, setAddress] = useState("");
  const [acceptanceDate, setAcceptanceDate] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [earnestMoney, setEarnestMoney] = useState("");
  const [inspectionDays, setInspectionDays] = useState("17");
  const [appraisalDays, setAppraisalDays] = useState("17");
  const [loanDays, setLoanDays] = useState("21");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createDeal.mutate(
      {
        property_address: address,
        purchase_price: Number(purchasePrice),
        current_phase: "escrow",
        contract_acceptance_date: acceptanceDate || undefined,
        closing_date: closingDate || undefined,
        earnest_money_amount: earnestMoney ? Number(earnestMoney) : undefined,
      },
      {
        onSuccess: (data) => {
          setActiveDealId(data.id);
          setCurrentPhase("escrow");
          onComplete?.();
        },
      }
    );
  }

  return (
    <div className="max-w-[768px] mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🏠</span>
        </div>
        <h2 className="text-3xl font-semibold tracking-tight">
          Welcome to Your Transaction Workspace
        </h2>
        <p className="text-base text-muted-foreground mt-2 max-w-[576px] mx-auto">
          Let&apos;s set up your escrow and closing dashboard. You can update these details anytime.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border shadow-sm p-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="address">Property Address</Label>
          <Input
            id="address"
            placeholder="123 Main Street, San Francisco, CA 94102"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            className="text-base"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="acceptance">Offer Acceptance Date</Label>
            <Input
              id="acceptance"
              type="date"
              value={acceptanceDate}
              onChange={(e) => setAcceptanceDate(e.target.value)}
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="closing">Scheduled Closing Date</Label>
            <Input
              id="closing"
              type="date"
              value={closingDate}
              onChange={(e) => setClosingDate(e.target.value)}
              className="text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Purchase Price</Label>
            <Input
              id="price"
              type="number"
              placeholder="900000"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              required
              className="text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emd">Earnest Money Deposit</Label>
            <Input
              id="emd"
              type="number"
              placeholder="18000"
              value={earnestMoney}
              onChange={(e) => setEarnestMoney(e.target.value)}
              className="text-base"
            />
          </div>
        </div>

        <div>
          <h3 className="text-base font-semibold mb-3">Contingency Periods (Days)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="inspection">Inspection</Label>
              <Input
                id="inspection"
                type="number"
                value={inspectionDays}
                onChange={(e) => setInspectionDays(e.target.value)}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appraisal">Appraisal</Label>
              <Input
                id="appraisal"
                type="number"
                value={appraisalDays}
                onChange={(e) => setAppraisalDays(e.target.value)}
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loan">Loan</Label>
              <Input
                id="loan"
                type="number"
                value={loanDays}
                onChange={(e) => setLoanDays(e.target.value)}
                className="text-base"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={createDeal.isPending || !address || !purchasePrice}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm text-base py-6 font-medium"
        >
          {createDeal.isPending ? "Creating..." : "Start Transaction Workspace"}
        </Button>

        <p className="text-sm text-muted-foreground text-center">
          You can update these details anytime from your dashboard
        </p>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        🔒 Your data is encrypted and secure
      </p>
    </div>
  );
}
