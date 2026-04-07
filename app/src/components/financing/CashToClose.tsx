"use client";

import { DollarSign } from "lucide-react";
import { computeMonthlyPI } from "@/lib/computed";
import { formatCurrency } from "@/lib/utils";
import type { LoanEstimate, Deal } from "@/lib/types";

function cdVal(cdFields: Record<string, unknown> | null | undefined, key: string): number | null {
  if (!cdFields) return null;
  const raw = cdFields[key];
  if (typeof raw === "number") return raw;
  if (raw && typeof raw === "object" && "value" in raw) {
    const v = (raw as { value: unknown }).value;
    return typeof v === "number" ? v : null;
  }
  return null;
}

function CostRow({ label, amount, variant }: {
  label: string;
  amount: number | null | undefined;
  variant?: "add" | "subtract" | "total";
}) {
  const isTotal = variant === "total";
  const isSubtract = variant === "subtract";

  if (amount == null || (amount === 0 && !isTotal)) return null;

  return (
    <div className={`flex justify-between items-baseline py-2 ${isTotal ? "border-t-2 border-foreground pt-3 mt-1" : ""}`}>
      <span className={`text-sm ${isTotal ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
        {isSubtract ? "Less: " : ""}{label}
      </span>
      <span className={`${isTotal ? "text-2xl font-semibold text-foreground" : "text-sm font-medium text-foreground"}`}>
        {isSubtract ? `(${formatCurrency(amount)})` : formatCurrency(amount)}
      </span>
    </div>
  );
}

interface CashToCloseProps {
  chosenLE: LoanEstimate;
  deal: Deal;
  cdFields?: Record<string, unknown> | null;
}

export function CashToClose({ chosenLE, deal, cdFields }: CashToCloseProps) {
  const monthlyPI = computeMonthlyPI(chosenLE.loan_amount, chosenLE.rate);
  const totalMonthly = monthlyPI + (chosenLE.pmi_monthly ?? 0);

  const downPayment = chosenLE.down_payment ?? 0;
  const lenderFees = chosenLE.lender_fees ?? 0;
  const thirdPartyFees = chosenLE.third_party_fees ?? 0;
  const pointsDollars = (chosenLE.points ?? 0) > 0
    ? (chosenLE.points! / 100) * chosenLE.loan_amount
    : 0;
  const earnestMoney = deal.earnest_money_amount ?? 0;

  const totalCosts = downPayment + lenderFees + thirdPartyFees + pointsDollars;
  const leCashToClose = totalCosts - earnestMoney;

  const hasCd = cdFields != null;
  const cdCashToClose = cdVal(cdFields, "final_cash_to_close") ?? cdVal(cdFields, "cash_to_close");
  const cdSellerCredits = cdVal(cdFields, "seller_credits");
  const cdProrations = cdVal(cdFields, "prorations");
  const cdPrepaidItems = cdVal(cdFields, "prepaid_items");
  const cdInitialEscrow = cdVal(cdFields, "initial_escrow");
  const cdRecordingFees = cdVal(cdFields, "recording_fees");
  const cdTransferTaxes = cdVal(cdFields, "transfer_taxes");

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-4">
      <div className="flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-accent" />
        <h3 className="text-base font-semibold text-foreground">Cash to Close</h3>
        {hasCd && (
          <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Updated from CD</span>
        )}
      </div>

      {/* LE-based breakdown */}
      <div>
        <CostRow label="Down Payment" amount={downPayment} />
        <CostRow label="Lender Fees" amount={lenderFees} />
        <CostRow label="Third-Party Fees" amount={thirdPartyFees} />
        <CostRow label="Points" amount={pointsDollars} />
        <CostRow label="Earnest Money Deposit" amount={earnestMoney} variant="subtract" />

        {!hasCd && (
          <CostRow label="Estimated Cash to Close" amount={leCashToClose} variant="total" />
        )}
      </div>

      {/* CD line items */}
      {hasCd && (
        <div className="pt-3 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">From Closing Disclosure</p>
          <CostRow label="Prepaid Items" amount={cdPrepaidItems} />
          <CostRow label="Initial Escrow Deposit" amount={cdInitialEscrow} />
          <CostRow label="Recording Fees" amount={cdRecordingFees} />
          <CostRow label="Transfer Taxes" amount={cdTransferTaxes} />
          <CostRow label="Prorations" amount={cdProrations} />
          <CostRow label="Seller Credits" amount={cdSellerCredits} variant="subtract" />

          {cdCashToClose != null && (
            <>
              <CostRow label="Final Cash to Close" amount={cdCashToClose} variant="total" />
              {cdCashToClose !== leCashToClose && (
                <div className="flex justify-between items-baseline py-1">
                  <span className="text-xs text-muted-foreground">Change from LE estimate ({formatCurrency(leCashToClose)})</span>
                  <span className={`text-sm font-medium ${(cdCashToClose - leCashToClose) > 0 ? "text-destructive" : "text-primary"}`}>
                    {(cdCashToClose - leCashToClose) > 0 ? "+" : ""}{formatCurrency(cdCashToClose - leCashToClose)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Monthly payment summary */}
      <div className="pt-4 border-t border-border">
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-muted-foreground">Monthly P&I</span>
          <span className="text-sm font-medium text-foreground">{formatCurrency(monthlyPI)}</span>
        </div>
        {(chosenLE.pmi_monthly ?? 0) > 0 && (
          <div className="flex justify-between items-baseline mt-1">
            <span className="text-sm text-muted-foreground">+ PMI</span>
            <span className="text-sm text-muted-foreground">{formatCurrency(chosenLE.pmi_monthly)}/mo</span>
          </div>
        )}
        <div className="flex justify-between items-baseline mt-2 pt-2 border-t border-border">
          <span className="text-sm font-semibold text-foreground">Est. Total Monthly</span>
          <span className="text-lg font-semibold text-foreground">{formatCurrency(totalMonthly)}</span>
        </div>
      </div>
    </div>
  );
}

export function CashToCloseFooter({ chosenLE, cdCashToClose }: { chosenLE: LoanEstimate; cdCashToClose?: number | null }) {
  const display = cdCashToClose ?? chosenLE.cash_to_close;
  if (display == null) return null;

  return (
    <div className="fixed bottom-[52px] left-0 right-0 z-30 bg-card border-t border-border shadow-lg px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-accent" />
        <span className="text-sm font-medium text-foreground">Cash to Close</span>
      </div>
      <span className="text-lg font-semibold text-foreground">{formatCurrency(display)}</span>
    </div>
  );
}
