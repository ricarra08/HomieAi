"use client";

import { useState } from "react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store";
import { useCreateDeal } from "@/lib/hooks/mutations";
import { Upload, FileText, Check } from "lucide-react";

interface OfferViewProps {
  userId: string;
}

export function OfferView({ userId }: OfferViewProps) {
  const { setCurrentPhase, setActiveDealId } = useUIStore();
  const createDeal = useCreateDeal(userId);

  const [offerPrice, setOfferPrice] = useState("425000");
  const [earnestMoney, setEarnestMoney] = useState("5000");
  const [downPaymentPct, setDownPaymentPct] = useState("20");
  const [closingTimeline, setClosingTimeline] = useState("30");

  const [inspectionDays, setInspectionDays] = useState("10");
  const [inspectionEnabled, setInspectionEnabled] = useState(true);
  const [loanDays, setLoanDays] = useState("21");
  const [loanEnabled, setLoanEnabled] = useState(true);
  const [appraisalDays, setAppraisalDays] = useState("17");
  const [appraisalEnabled, setAppraisalEnabled] = useState(true);
  const [saleContingency, setSaleContingency] = useState(false);

  const [preApprovalUploaded, setPreApprovalUploaded] = useState(false);
  const [proofOfFundsUploaded, setProofOfFundsUploaded] = useState(false);

  const checklist = {
    "Pre-approval letter attached": preApprovalUploaded,
    "Proof of funds uploaded": proofOfFundsUploaded,
    "Earnest money amount set": Number(earnestMoney) > 0,
    "Contingencies defined": inspectionEnabled || loanEnabled || appraisalEnabled,
    "Offer expiration date set": false,
  };
  const checklistComplete = Object.values(checklist).filter(Boolean).length;
  const checklistTotal = Object.keys(checklist).length;

  function handleAcceptOffer() {
    createDeal.mutate(
      {
        property_address: "742 Evergreen Terrace, Springfield, IL",
        purchase_price: Number(offerPrice),
        current_phase: "escrow",
        earnest_money_amount: Number(earnestMoney),
      },
      {
        onSuccess: (data) => {
          setActiveDealId(data.id);
          setCurrentPhase("escrow");
        },
      }
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Offer Workspace</h2>
          <p className="text-base text-muted-foreground mt-1">Structure and prepare your offer</p>
        </div>
        <Badge className="bg-accent/15 text-accent border-accent/30 text-sm px-3 py-1">
          Offer in Progress
        </Badge>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">742 Evergreen Terrace</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Springfield, IL &middot; 3 bed, 2 bath, 1,850 sqft
            </p>
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground">List Price</span>
            <p className="text-xl font-semibold">$425,000</p>
          </div>
        </div>
      </div>

      <Button
        onClick={handleAcceptOffer}
        disabled={createDeal.isPending}
        className="w-full bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 text-base py-6 font-medium"
      >
        {createDeal.isPending ? "Creating workspace..." : "Offer Accepted — Start Escrow"}
      </Button>

      <CollapsibleCard title="Offer Details" subtitle="Key terms and pricing">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Offer Price</span>
            <Input
              type="number"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              className="text-base"
            />
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Earnest Money Deposit</span>
            <Input
              type="number"
              value={earnestMoney}
              onChange={(e) => setEarnestMoney(e.target.value)}
              className="text-base"
            />
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Down Payment %</span>
            <Input
              type="number"
              value={downPaymentPct}
              onChange={(e) => setDownPaymentPct(e.target.value)}
              className="text-base"
            />
          </div>
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Closing Timeline</span>
            <Input
              value={closingTimeline}
              onChange={(e) => setClosingTimeline(e.target.value)}
              placeholder="30 days"
              className="text-base"
            />
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Contingencies" subtitle="Protect your earnest money">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={inspectionEnabled}
                onCheckedChange={(v) => setInspectionEnabled(v === true)}
              />
              <span className="text-base text-foreground">Inspection Contingency</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={inspectionDays}
                onChange={(e) => setInspectionDays(e.target.value)}
                className="w-16 text-base text-center"
                disabled={!inspectionEnabled}
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={loanEnabled}
                onCheckedChange={(v) => setLoanEnabled(v === true)}
              />
              <span className="text-base text-foreground">Loan Contingency</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={loanDays}
                onChange={(e) => setLoanDays(e.target.value)}
                className="w-16 text-base text-center"
                disabled={!loanEnabled}
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={appraisalEnabled}
                onCheckedChange={(v) => setAppraisalEnabled(v === true)}
              />
              <span className="text-base text-foreground">Appraisal Contingency</span>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={appraisalDays}
                onChange={(e) => setAppraisalDays(e.target.value)}
                className="w-16 text-base text-center"
                disabled={!appraisalEnabled}
              />
              <span className="text-sm text-muted-foreground">days</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Checkbox
              checked={saleContingency}
              onCheckedChange={(v) => setSaleContingency(v === true)}
            />
            <span className="text-base text-foreground">Sale of Current Home</span>
          </div>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Supporting Documents" subtitle="Pre-approval and proof of funds">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-base font-medium text-foreground">Pre-Approval Letter</p>
              {preApprovalUploaded ? (
                <p className="text-sm text-muted-foreground">pre-approval-letter.pdf &middot; 245 KB</p>
              ) : (
                <p className="text-sm text-muted-foreground">Not uploaded yet</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreApprovalUploaded(true)}
              className="gap-2"
            >
              {preApprovalUploaded ? <Check className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              {preApprovalUploaded ? "Uploaded" : "Upload"}
            </Button>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border">
            <div>
              <p className="text-base font-medium text-foreground">Proof of Funds</p>
              {proofOfFundsUploaded ? (
                <p className="text-sm text-muted-foreground">bank-statement-proof.pdf &middot; 512 KB</p>
              ) : (
                <p className="text-sm text-muted-foreground">Not uploaded yet</p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProofOfFundsUploaded(true)}
              className="gap-2"
            >
              {proofOfFundsUploaded ? <Check className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              {proofOfFundsUploaded ? "Uploaded" : "Upload"}
            </Button>
          </div>
          <button className="w-full py-3 border border-dashed border-border rounded-lg text-base text-muted-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
            <FileText className="w-4 h-4" />
            Upload Additional Document
          </button>
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Offer Readiness" subtitle="Complete before submission">
        <div className="space-y-3">
          {Object.entries(checklist).map(([label, done]) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  done
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground"
                }`}
              >
                {done && <Check className="w-3 h-3" />}
              </div>
              <span className={`text-base ${done ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
          ))}
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {checklistComplete} of {checklistTotal} complete
            </span>
            <span className="text-sm font-medium text-foreground">
              {Math.round((checklistComplete / checklistTotal) * 100)}%
            </span>
          </div>
        </div>
      </CollapsibleCard>

      <Button
        className="w-full bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 text-base py-6 font-medium"
      >
        Review &amp; Submit Offer
      </Button>
    </div>
  );
}
