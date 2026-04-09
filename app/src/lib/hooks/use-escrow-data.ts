"use client";

import { useMemo } from "react";
import { useDocuments, useDeadlines, useLoanEstimates, useRepairItems, useDeal } from "./queries";
import type { Deal, Document, Deadline, LoanEstimate, RepairItem } from "@/lib/types";

export interface EscrowData {
  deal: Deal | null;
  documents: Document[];
  inspectionDocs: Document[];
  appraisalDoc: Document | null;
  disclosureDocs: Document[];
  contractDoc: Document | null;
  cdDocument: Document | null;
  deadlines: Deadline[];
  loanEstimates: LoanEstimate[];
  chosenLE: LoanEstimate | null;
  repairItems: RepairItem[];
  isLoading: boolean;
}

export function useEscrowData(dealId: string): EscrowData {
  const { data: deal, isLoading: dealLoading } = useDeal(dealId);
  const { data: documents, isLoading: docsLoading } = useDocuments(dealId);
  const { data: deadlines, isLoading: deadlinesLoading } = useDeadlines(dealId);
  const { data: loanEstimates, isLoading: lesLoading } = useLoanEstimates(dealId);
  const { data: repairItems, isLoading: repairsLoading } = useRepairItems(dealId);

  const allDocs = documents ?? [];

  const inspectionDocs = useMemo(
    () => allDocs.filter((d) => d.doc_type === "inspection_report"),
    [allDocs]
  );

  const appraisalDoc = useMemo(
    () => allDocs.find((d) => d.doc_type === "appraisal") ?? null,
    [allDocs]
  );

  const disclosureDocs = useMemo(
    () => allDocs.filter((d) => d.category === "disclosures" || d.doc_type === "disclosure"),
    [allDocs]
  );

  const contractDoc = useMemo(
    () => allDocs.find((d) => d.doc_type === "purchase_contract") ?? null,
    [allDocs]
  );

  const cdDocument = useMemo(
    () => allDocs.find((d) => d.doc_type === "closing_disclosure" && d.status === "processed" && d.extracted_fields) ?? null,
    [allDocs]
  );

  const chosenLE = useMemo(
    () => (loanEstimates ?? []).find((le) => le.is_chosen) ?? null,
    [loanEstimates]
  );

  const isLoading = dealLoading || docsLoading || deadlinesLoading || lesLoading || repairsLoading;

  return {
    deal: deal ?? null,
    documents: allDocs,
    inspectionDocs,
    appraisalDoc,
    disclosureDocs,
    contractDoc,
    cdDocument,
    deadlines: deadlines ?? [],
    loanEstimates: loanEstimates ?? [],
    chosenLE,
    repairItems: repairItems ?? [],
    isLoading,
  };
}
