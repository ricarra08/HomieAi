"use client";

import { useState, useEffect } from "react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { ViewEditCard } from "@/components/ui/view-edit-card";
import { ContingencyRow } from "./ContingencyRow";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store";
import { useSavedHomes, useTransaction } from "@/lib/hooks/queries";
import { useUpdateTransaction } from "@/lib/hooks/mutations";
import { TermTooltip } from "@/components/ui/term-tooltip";
import { toast } from "sonner";
import { Upload, FileText, Check, DollarSign, Sparkles, ArrowRight } from "lucide-react";
import type { SavedHome } from "@/lib/types";

function formatPrice(price: number | null): string {
  if (!price) return "—";
  return `$${price.toLocaleString()}`;
}

interface OfferViewProps {
  userId: string;
}

export function OfferView({ userId }: OfferViewProps) {
  const { setCurrentPhase, setActiveTransactionId, selectedHomeId, ownsCurrentHome, activeTransactionId } = useUIStore();
  const updateTransaction = useUpdateTransaction(activeTransactionId ?? "", userId);
  const { data: transaction } = useTransaction(activeTransactionId);
  const { data: homes } = useSavedHomes(activeTransactionId);

  // Use ephemeral selectedHomeId first (optimistic), fall back to DB saved_home_id (re-entry)
  const resolvedHomeId = selectedHomeId ?? transaction?.saved_home_id ?? null;
  const selectedHome: SavedHome | null =
    homes?.find((h) => h.id === resolvedHomeId) ?? null;

  // Initialize offer price from selected home — update when home resolves
  const [offerPrice, setOfferPrice] = useState("");
  const [priceInitialized, setPriceInitialized] = useState(false);
  useEffect(() => {
    if (selectedHome?.price && !priceInitialized) {
      setOfferPrice(selectedHome.price.toString());
      setPriceInitialized(true);
    }
  }, [selectedHome, priceInitialized]);
  const [earnestMoney, setEarnestMoney] = useState("");
  const [downPaymentPct, setDownPaymentPct] = useState("20");
  const [closingDays, setClosingDays] = useState("30");
  const [acceptanceDate, setAcceptanceDate] = useState("");
  const [offerExpiration, setOfferExpiration] = useState("");

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
    "Offer expiration date set": !!offerExpiration,
  };
  const checklistComplete = Object.values(checklist).filter(Boolean).length;
  const checklistTotal = Object.keys(checklist).length;

  const propertyAddress = selectedHome?.address ?? "No property selected";
  const propertyDetails = selectedHome
    ? `${selectedHome.beds ?? "—"} bed, ${selectedHome.baths ?? "—"} bath${selectedHome.sqft ? `, ${selectedHome.sqft} sqft` : ""}`
    : "Go back to Shopping to select a property";

  function handleAcceptOffer() {
    if (!activeTransactionId) return;

    updateTransaction.mutate(
      {
        property_address: propertyAddress,
        purchase_price: Number(offerPrice),
        current_phase: "escrow",
        earnest_money_amount: Number(earnestMoney) || undefined,
        saved_home_id: selectedHomeId ?? undefined,
        contract_acceptance_date: acceptanceDate || undefined,
        closing_date: closingDays && acceptanceDate
          ? (() => { const d = new Date(acceptanceDate); d.setDate(d.getDate() + Number(closingDays)); return d.toISOString().split("T")[0]; })()
          : undefined,
      },
      {
        onSuccess: async () => {
          setCurrentPhase("escrow");
          toast.success("Transaction updated");

          const base = acceptanceDate ? new Date(acceptanceDate) : null;
          if (base) {
            function addDays(d: Date, days: number): string {
              const r = new Date(d);
              r.setDate(r.getDate() + days);
              return r.toISOString().split("T")[0];
            }

            const c = confirmedContingencies;
            const inspDays = c.inspection?.enabled === false ? null : (c.inspection?.days ?? 10);
            const apprDays = c.appraisal?.enabled === false ? null : (c.appraisal?.days ?? 17);
            const loanDays = c.loan?.enabled === false ? null : (c.loan?.days ?? 21);

            const deadlines: { deal_id: string; name: string; type: string; due_date: string }[] = [];
            if (inspDays) deadlines.push({ deal_id: activeTransactionId, name: "Inspection Contingency", type: "inspection", due_date: addDays(base, inspDays) });
            if (apprDays) deadlines.push({ deal_id: activeTransactionId, name: "Appraisal Contingency", type: "appraisal", due_date: addDays(base, apprDays) });
            if (loanDays) deadlines.push({ deal_id: activeTransactionId, name: "Financing Contingency", type: "financing", due_date: addDays(base, loanDays) });
            if (closingDays) deadlines.push({ deal_id: activeTransactionId, name: "Closing Date", type: "closing", due_date: addDays(base, Number(closingDays)) });
            if (deadlines.length > 0) {
              const { createClient } = await import("@/lib/supabase/client");
              await createClient().from("deadlines").insert(deadlines);
            }
          }
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
        <div className="flex items-center gap-3">
          <Button
            onClick={handleAcceptOffer}
            disabled={updateTransaction.isPending || !offerPrice || !selectedHome}
            className="bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 text-sm font-medium gap-2"
          >
            {updateTransaction.isPending ? "Updating transaction..." : "Offer Accepted — Start Escrow"}
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Badge className="bg-accent/15 text-accent border-accent/30 text-sm px-3 py-1">
            Offer in Progress
          </Badge>
        </div>
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
            {offerExpiration && (
              <div>
                <span className="text-sm text-muted-foreground">Offer Expiration</span>
                <p className="text-base font-medium text-foreground">
                  {new Date(offerExpiration).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            )}
          </div>
        )}
        renderEdit={() => (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Offer Price</span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">$</span>
                <Input type="number" value={offerPrice} onChange={(e) => setOfferPrice(e.target.value)} placeholder={selectedHome?.price?.toString() ?? "0"} className="text-base pl-7" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                <TermTooltip term="Earnest Money Deposit" definition="A good-faith deposit showing you're serious about buying. Typically 1–3% of the purchase price. Held in escrow and applied to your closing costs." />
              </span>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">$</span>
                <Input type="number" value={earnestMoney} onChange={(e) => setEarnestMoney(e.target.value)} placeholder="5000" className="text-base pl-7" />
              </div>
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
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Offer Acceptance Date</span>
              <Input type="date" value={acceptanceDate} onChange={(e) => setAcceptanceDate(e.target.value)} className="text-base" />
            </div>
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">
                <TermTooltip term="Offer Expiration Date" definition="The date your offer expires if the seller hasn't responded. Typically 24–72 hours after submission. After this date, you're no longer bound by the offer terms." />
              </span>
              <Input type="date" value={offerExpiration} onChange={(e) => setOfferExpiration(e.target.value)} className="text-base" />
            </div>
          </div>
        )}
      />

      <CollapsibleCard
        title="Contingencies"
        subtitle="Conditions that protect your earnest money"
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
              When your offer is accepted, your workspace unlocks: document review with AI summaries, closing cost tracking with LE vs CD comparison, deadline alerts for every contingency, and Homie — your AI homebuying assistant.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
