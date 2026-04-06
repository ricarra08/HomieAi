"use client";

import { useState } from "react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { ViewEditCard } from "@/components/ui/view-edit-card";
import { ContingencyRow } from "./ContingencyRow";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store";
import { useSavedHomes } from "@/lib/hooks/queries";
import { useCreateDeal } from "@/lib/hooks/mutations";
import { TermTooltip } from "@/components/ui/term-tooltip";
import { Upload, FileText, Check, DollarSign, Sparkles } from "lucide-react";
import type { SavedHome } from "@/lib/types";

function formatPrice(price: number | null): string {
  if (!price) return "—";
  return `$${price.toLocaleString()}`;
}

interface OfferViewProps {
  userId: string;
}

export function OfferView({ userId }: OfferViewProps) {
  const { setCurrentPhase, setActiveDealId, selectedHomeId, ownsCurrentHome } = useUIStore();
  const createDeal = useCreateDeal(userId);
  const { data: homes } = useSavedHomes(userId);

  const selectedHome: SavedHome | null =
    homes?.find((h) => h.id === selectedHomeId) ?? null;

  const [offerPrice, setOfferPrice] = useState(
    selectedHome?.price?.toString() ?? ""
  );
  const [earnestMoney, setEarnestMoney] = useState("");
  const [downPaymentPct, setDownPaymentPct] = useState("20");
  const [closingDays, setClosingDays] = useState("30");
  const [acceptanceDate, setAcceptanceDate] = useState("");

  // Contingency confirmed states
  const [confirmedContingencies, setConfirmedContingencies] = useState<
    Record<string, { enabled: boolean; days: number | null }>
  >({});

  function handleContingencyConfirm(key: string, enabled: boolean, days: number | null) {
    setConfirmedContingencies((prev) => ({
      ...prev,
      [key]: { enabled, days },
    }));
  }

  const hasAnyConfirmedContingency = Object.values(confirmedContingencies).some((c) => c.enabled);

  const [offerDetailsSaved, setOfferDetailsSaved] = useState(false);

  const [preApprovalUploaded, setPreApprovalUploaded] = useState(false);
  const [proofOfFundsUploaded, setProofOfFundsUploaded] = useState(false);
  const [earnestMoneyConfirmed, setEarnestMoneyConfirmed] = useState(false);

  const checklist = {
    "Pre-approval letter attached": preApprovalUploaded,
    "Proof of funds uploaded": proofOfFundsUploaded,
    "Earnest money confirmed": earnestMoneyConfirmed,
    "Contingencies defined": hasAnyConfirmedContingency,
    "Offer expiration date set": false,
  };
  const checklistComplete = Object.values(checklist).filter(Boolean).length;
  const checklistTotal = Object.keys(checklist).length;

  const propertyAddress = selectedHome?.address ?? "No property selected";
  const propertyDetails = selectedHome
    ? `${selectedHome.beds ?? "—"} bed, ${selectedHome.baths ?? "—"} bath${selectedHome.sqft ? `, ${selectedHome.sqft} sqft` : ""}`
    : "Go back to Shopping to select a property";

  function handleAcceptOffer() {
    createDeal.mutate(
      {
        property_address: propertyAddress,
        purchase_price: Number(offerPrice),
        current_phase: "escrow",
        earnest_money_amount: Number(earnestMoney) || undefined,
        saved_home_id: selectedHomeId ?? undefined,
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
            <h3 className="text-xl font-semibold">{propertyAddress}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{propertyDetails}</p>
          </div>
          {selectedHome?.price && (
            <div className="text-right">
              <span className="text-sm text-muted-foreground">List Price</span>
              <p className="text-xl font-semibold">{formatPrice(selectedHome.price)}</p>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={handleAcceptOffer}
        disabled={createDeal.isPending || !offerPrice || !selectedHome}
        className="w-full bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 text-base py-6 font-medium"
      >
        {createDeal.isPending ? "Creating workspace..." : "Offer Accepted — Start Escrow"}
      </Button>

      <ViewEditCard
        title="Offer Details"
        subtitle="Key terms and pricing"
        saved={offerDetailsSaved}
        onSave={() => setOfferDetailsSaved(true)}
        saveLabel="Save Details"
        renderView={() => (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <span className="text-sm text-muted-foreground">Offer Price</span>
              <p className="text-base font-medium text-foreground">
                {offerPrice ? `$${Number(offerPrice).toLocaleString()}` : "Not set"}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Earnest Money Deposit</span>
              <p className="text-base font-medium text-foreground">
                {earnestMoney ? `$${Number(earnestMoney).toLocaleString()}` : "Not set"}
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Down Payment</span>
              <p className="text-base font-medium text-foreground">{downPaymentPct}%</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Closing Timeline</span>
              <p className="text-base font-medium text-foreground">{closingDays} days</p>
            </div>
            {acceptanceDate && (
              <div>
                <span className="text-sm text-muted-foreground">Acceptance Date</span>
                <p className="text-base font-medium text-foreground">
                  {new Date(acceptanceDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            )}
          </div>
        )}
        renderEdit={() => (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Offer Price</span>
              <Input type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} placeholder={selectedHome?.price?.toString() ?? "0"} className="text-base" />
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                <TermTooltip term="Earnest Money Deposit" definition="A good-faith deposit showing you're serious about buying. Typically 1–3% of the purchase price. Held in escrow and applied to your closing costs." />
              </span>
              <Input type="number" value={earnestMoney} onChange={(e) => setEarnestMoney(e.target.value)} placeholder="5000" className="text-base" />
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Down Payment %</span>
              <Input type="number" value={downPaymentPct} onChange={(e) => setDownPaymentPct(e.target.value)} className="text-base" />
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                <TermTooltip term="Closing Timeline (days)" definition="The number of days from offer acceptance to closing. Typically 30–45 days. Your lender, title company, and inspection schedule all need to fit within this window." />
              </span>
              <Input type="number" value={closingDays} onChange={(e) => setClosingDays(e.target.value)} placeholder="30" className="text-base" />
            </div>
            <div className="space-y-1 col-span-2">
              <span className="text-sm text-muted-foreground">Offer Acceptance Date (used to compute deadlines)</span>
              <Input type="date" value={acceptanceDate} onChange={(e) => setAcceptanceDate(e.target.value)} className="text-base" />
            </div>
          </div>
        )}
      />

      <CollapsibleCard
        title={<TermTooltip term="Contingencies" definition="Conditions that must be met for the sale to go through. If a contingency isn't satisfied, you can back out and keep your earnest money." />}
        subtitle="Protect your earnest money"
      >
        <div>
          <ContingencyRow
            label="Inspection Contingency"
            defaultDays="10"
            typicalRange="7–14 days"
            acceptanceDate={acceptanceDate}
            onConfirm={(enabled, days) => handleContingencyConfirm("inspection", enabled, days)}
          />
          <ContingencyRow
            label="Loan Contingency"
            defaultDays="21"
            typicalRange="21–30 days"
            acceptanceDate={acceptanceDate}
            onConfirm={(enabled, days) => handleContingencyConfirm("loan", enabled, days)}
          />
          <ContingencyRow
            label="Appraisal Contingency"
            defaultDays="17"
            typicalRange="14–21 days"
            acceptanceDate={acceptanceDate}
            onConfirm={(enabled, days) => handleContingencyConfirm("appraisal", enabled, days)}
          />
          {ownsCurrentHome && (
            <ContingencyRow
              label="Sale of Current Home"
              hasDays={false}
              onConfirm={(enabled) => handleContingencyConfirm("sale", enabled, null)}
            />
          )}
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
          {Object.entries(checklist).map(([label, done]) => {
            if (label === "Earnest money confirmed") {
              return (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
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
                  {!earnestMoneyConfirmed && Number(earnestMoney) > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEarnestMoneyConfirmed(true)}
                      className="gap-2 text-sm"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Confirm ${Number(earnestMoney).toLocaleString()} EMD
                    </Button>
                  )}
                  {!earnestMoneyConfirmed && !Number(earnestMoney) && (
                    <span className="text-sm text-muted-foreground">Set amount in Offer Details first</span>
                  )}
                </div>
              );
            }
            return (
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
            );
          })}
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

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">What&apos;s Ahead</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              When your offer is accepted, your workspace unlocks: document review with AI summaries, closing cost tracking with LE vs CD comparison, deadline alerts for every contingency, and Homie — your AI deal assistant.
            </p>
          </div>
        </div>
      </div>

      <Button
        className="w-full bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 text-base py-6 font-medium"
      >
        Review &amp; Submit Offer
      </Button>
    </div>
  );
}
