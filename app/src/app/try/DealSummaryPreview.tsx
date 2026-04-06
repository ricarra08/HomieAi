"use client";

import { Badge } from "@/components/ui/badge";
import { computeDaysRemaining } from "@/lib/computed";
import { Calendar, DollarSign, Clock, MapPin } from "lucide-react";

interface DealData {
  address: string;
  acceptanceDate: string;
  closingDate: string;
  purchasePrice: string;
  earnestMoney: string;
  inspectionDays: string;
  appraisalDays: string;
  loanDays: string;
}

function formatPrice(price: string): string {
  const n = Number(price);
  if (!n) return "—";
  return `$${n.toLocaleString()}`;
}

function formatDate(date: string): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function addDays(date: string, days: string): string {
  if (!date || !days) return "—";
  const d = new Date(date);
  d.setDate(d.getDate() + Number(days));
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function DealSummaryPreview({ dealData }: { dealData: DealData }) {
  const daysRemaining = computeDaysRemaining(dealData.closingDate || null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight">Escrow &amp; Due Diligence</h2>
        <p className="text-base text-muted-foreground mt-1">Preview of your transaction workspace</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold">{dealData.address || "Your Property"}</h3>
            </div>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              {dealData.closingDate && <span>Closing: {formatDate(dealData.closingDate)}</span>}
              <span>&middot;</span>
              <span>Purchase Price: {formatPrice(dealData.purchasePrice)}</span>
            </div>
          </div>
          {daysRemaining !== null && (
            <Badge
              className={`text-sm px-3 py-1 ${
                daysRemaining <= 7
                  ? "bg-destructive/10 text-destructive"
                  : daysRemaining <= 14
                    ? "bg-warning/10 text-warning"
                    : "bg-primary/20 text-primary-foreground"
              }`}
            >
              {daysRemaining > 0 ? `${daysRemaining} days to close` : "Closing soon"}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-accent" />
            <h3 className="text-base font-semibold">Earnest Money Deposit</h3>
          </div>
          <div>
            <p className="text-2xl font-semibold">{formatPrice(dealData.earnestMoney)}</p>
            <p className="text-sm text-muted-foreground mt-1">Due within 3 business days of acceptance</p>
          </div>
          <Badge className="bg-warning/10 text-warning text-sm">Pending</Badge>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            <h3 className="text-base font-semibold">Contingency Countdown</h3>
          </div>
          <div className="space-y-2">
            {Number(dealData.inspectionDays) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">Inspection</span>
                <span className="text-muted-foreground">Due {addDays(dealData.acceptanceDate, dealData.inspectionDays)}</span>
              </div>
            )}
            {Number(dealData.appraisalDays) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">Appraisal</span>
                <span className="text-muted-foreground">Due {addDays(dealData.acceptanceDate, dealData.appraisalDays)}</span>
              </div>
            )}
            {Number(dealData.loanDays) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-foreground">Loan</span>
                <span className="text-muted-foreground">Due {addDays(dealData.acceptanceDate, dealData.loanDays)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 opacity-60">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground">Appraisal Status</h3>
          </div>
          <p className="text-sm text-muted-foreground">Sign up to track</p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 opacity-60">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground">Inspection Checklist</h3>
          </div>
          <p className="text-sm text-muted-foreground">Sign up to track</p>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 opacity-60">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-muted-foreground">Cash to Close</h3>
          </div>
          <p className="text-sm text-muted-foreground">Sign up to calculate</p>
        </div>
      </div>
    </div>
  );
}
