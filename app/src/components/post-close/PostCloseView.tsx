"use client";

import { useState } from "react";
import { Download, FileText, Home, Wrench, TrendingUp, Loader2 } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTransaction, useDocuments, useLoanEstimates } from "@/lib/hooks/queries";
import { computeMonthlyPI, computeCashToClose } from "@/lib/computed";
import { formatCurrency } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

function formatDate(date: string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function DocumentArchiveRow({ doc }: { doc: { id: string; name: string; file_path: string; file_size: number | null; doc_type: string | null } }) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase.storage.from("deal-documents").createSignedUrl(doc.file_path, 300);
      if (data?.signedUrl) {
        const a = document.createElement("a");
        a.href = data.signedUrl;
        a.download = doc.name;
        a.click();
      }
    } finally {
      setDownloading(false);
    }
  }

  const size = doc.file_size ? (doc.file_size < 1024 * 1024 ? `${Math.round(doc.file_size / 1024)} KB` : `${(doc.file_size / (1024 * 1024)).toFixed(1)} MB`) : "";

  return (
    <div className="flex items-center gap-3 py-2.5">
      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
        <p className="text-xs text-muted-foreground">
          {doc.doc_type?.replace(/_/g, " ") ?? "Document"}{size ? ` · ${size}` : ""}
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={handleDownload} disabled={downloading} className="shrink-0">
        {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
      </Button>
    </div>
  );
}

export function PostCloseView({ transactionId }: { transactionId: string }) {
  const { data: transaction } = useTransaction(transactionId);
  const { data: documents } = useDocuments(transactionId);
  const { data: loanEstimates } = useLoanEstimates(transactionId);

  const chosenLE = (loanEstimates ?? []).find((le) => le.is_chosen) ?? null;
  const monthlyPI = chosenLE ? computeMonthlyPI(chosenLE.loan_amount, chosenLE.rate) : null;
  const cashToClose = computeCashToClose(chosenLE, { earnestMoney: transaction?.earnest_money_amount ?? 0 });
  const allDocs = documents ?? [];

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Congratulations!</h1>
        {transaction && (
          <p className="text-lg text-muted-foreground mt-2">
            You&apos;ve successfully closed on <span className="font-medium text-foreground">{transaction.property_address}</span>
          </p>
        )}
        {transaction?.closing_date && (
          <p className="text-sm text-muted-foreground mt-1">Closing Date: {formatDate(transaction.closing_date)}</p>
        )}
      </div>

      <CollapsibleCard title="Transaction Summary" subtitle={transaction ? formatCurrency(transaction.purchase_price) : ""}>
        <div className="space-y-2 text-sm">
          {transaction && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purchase Price</span>
              <span className="text-foreground font-medium">{formatCurrency(transaction.purchase_price)}</span>
            </div>
          )}
          {chosenLE && (
            <>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Down Payment</span>
                <span className="text-foreground">{formatCurrency(chosenLE.down_payment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Loan Amount</span>
                <span className="text-foreground">{formatCurrency(chosenLE.loan_amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate</span>
                <span className="text-foreground">{chosenLE.rate}%</span>
              </div>
              {monthlyPI != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly P&I</span>
                  <span className="text-foreground">{formatCurrency(Math.round(monthlyPI))}</span>
                </div>
              )}
            </>
          )}
          {cashToClose != null && (
            <div className="flex justify-between border-t border-border pt-2 mt-2">
              <span className="text-muted-foreground font-medium">Total Cash to Close</span>
              <span className="text-foreground font-semibold">{formatCurrency(cashToClose)}</span>
            </div>
          )}
        </div>
      </CollapsibleCard>

      <CollapsibleCard title="Document Archive" subtitle={`${allDocs.length} document${allDocs.length !== 1 ? "s" : ""}`}>
        <div className="divide-y divide-border">
          {allDocs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No documents in this transaction.</p>
          ) : (
            allDocs.map((doc) => <DocumentArchiveRow key={doc.id} doc={doc} />)
          )}
        </div>
      </CollapsibleCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 text-center space-y-3">
          <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-base font-medium text-foreground">Equity Tracking</h3>
          <p className="text-sm text-muted-foreground">Monitor your home&apos;s value and equity growth over time</p>
          <Badge className="bg-muted text-muted-foreground">Coming Soon</Badge>
        </div>
        <div className="bg-card rounded-xl border border-border shadow-sm p-6 text-center space-y-3">
          <Wrench className="w-8 h-8 text-muted-foreground mx-auto" />
          <h3 className="text-base font-medium text-foreground">Homeowner Tools</h3>
          <p className="text-sm text-muted-foreground">Maintenance tracking, warranty management, and more</p>
          <Badge className="bg-muted text-muted-foreground">Coming Soon</Badge>
        </div>
      </div>

      <div className="text-center py-6 border-t border-border">
        <p className="text-base font-medium text-foreground">Thank you for using HomeBuyer Pro</p>
        <p className="text-sm text-muted-foreground mt-1">We hope we helped make your homebuying journey clearer and less stressful.</p>
      </div>
    </div>
  );
}
