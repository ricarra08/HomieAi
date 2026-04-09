"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store";
import { useLoanEstimates, useDocuments, useDeal } from "@/lib/hooks/queries";
import { LECard } from "@/components/financing/LECard";
import { LEFormModal } from "@/components/financing/LEFormModal";
import { LEComparisonTable } from "@/components/financing/LEComparisonTable";
import { LEvsCD } from "@/components/financing/LEvsCD";
import { CashToClose, CashToCloseFooter } from "@/components/financing/CashToClose";
import { DocumentDetailView } from "@/components/documents/SlideOverViewer";
import type { LoanEstimate } from "@/lib/types";

export default function FinancingPage() {
  const activeDealId = useUIStore((s) => s.activeDealId);
  const selectedLEIds = useUIStore((s) => s.selectedLEIds);
  const { viewerDocId, viewerOpen } = useUIStore();

  const { data: estimates, isLoading } = useLoanEstimates(activeDealId);
  const { data: documents } = useDocuments(activeDealId);
  const { data: deal } = useDeal(activeDealId);

  const [formOpen, setFormOpen] = useState(false);
  const [editingLE, setEditingLE] = useState<LoanEstimate | null>(null);

  const activeDoc = viewerOpen && viewerDocId
    ? documents?.find((d) => d.id === viewerDocId)
    : null;

  if (!activeDealId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Financing</h1>
          <p className="text-base text-muted-foreground mt-1">
            Compare loan estimates and track your financing
          </p>
        </div>
        <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10 text-center">
          Create a deal first to start comparing loan estimates.
        </div>
      </div>
    );
  }

  function handleEdit(le: LoanEstimate) {
    setEditingLE(le);
    setFormOpen(true);
  }

  function handleCloseForm() {
    setFormOpen(false);
    setEditingLE(null);
  }

  const chosenLE = estimates?.find((le) => le.is_chosen) ?? null;
  const cdDocument = documents?.find(
    (d) => d.doc_type === "closing_disclosure" && d.status === "processed" && d.extracted_fields
  ) ?? null;
  const cdFields = cdDocument?.extracted_fields as Record<string, unknown> | null;

  function cdVal(key: string): number | null {
    if (!cdFields) return null;
    const raw = cdFields[key];
    if (typeof raw === "number") return raw;
    if (raw && typeof raw === "object" && "value" in raw) {
      const v = (raw as { value: unknown }).value;
      return typeof v === "number" ? v : null;
    }
    return null;
  }

  const cdCashToClose = cdVal("final_cash_to_close") ?? cdVal("cash_to_close");
  const selectedCount = selectedLEIds.length;

  return (
    <>
      {activeDoc && <DocumentDetailView doc={activeDoc} />}
      <div className={`space-y-6 pb-16 ${activeDoc ? "hidden" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Financing</h1>
            <p className="text-base text-muted-foreground mt-1">
              Compare loan estimates and track your financing
            </p>
          </div>
          <Button
            onClick={() => { setEditingLE(null); setFormOpen(true); }}
            className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Loan Estimate
          </Button>
        </div>

        {/* LE Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border shadow-sm p-6 h-80 animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-3" />
                <div className="h-3 bg-muted rounded w-1/3 mb-6" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-3 bg-muted rounded w-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : estimates && estimates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {estimates.map((le) => (
              <LECard
                key={le.id}
                le={le}
                dealId={activeDealId}
                isSelected={selectedLEIds.includes(le.id)}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-base text-muted-foreground bg-card rounded-xl border border-border shadow-sm p-10 text-center">
            No loan estimates yet. Add one manually or upload a Loan Estimate PDF in Documents.
          </div>
        )}

        {/* Comparison table */}
        {selectedCount >= 2 && estimates && (
          <LEComparisonTable
            estimates={estimates.filter((le) => selectedLEIds.includes(le.id))}
            dealId={activeDealId}
          />
        )}

        {/* Cash to Close */}
        {chosenLE && deal && (
          <CashToClose
            chosenLE={chosenLE}
            deal={deal}
            cdFields={cdFields}
          />
        )}

        {/* LE vs CD Variance */}
        {chosenLE && cdDocument && (
          <LEvsCD chosenLE={chosenLE} cdDocument={cdDocument} />
        )}
      </div>

      {/* Sticky footer */}
      {chosenLE && !activeDoc && (
        <CashToCloseFooter chosenLE={chosenLE} cdCashToClose={cdCashToClose} />
      )}

      {!activeDoc && (
        <LEFormModal
          dealId={activeDealId}
          open={formOpen}
          onClose={handleCloseForm}
          editingLE={editingLE}
        />
      )}
    </>
  );
}
