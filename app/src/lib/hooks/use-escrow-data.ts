"use client";

import { useMemo } from "react";
import { useDocuments, useDeadlines, useLoanEstimates, useRepairItems, useTransaction } from "./queries";
import type { Transaction, Document, Deadline, LoanEstimate, RepairItem } from "@/lib/types";

export interface EscrowData {
  transaction: Transaction | null;
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

export function useEscrowData(transactionId: string): EscrowData {
  const { data: transaction, isLoading: transactionLoading } = useTransaction(transactionId);
  const { data: documents, isLoading: docsLoading } = useDocuments(transactionId);
  const { data: deadlines, isLoading: deadlinesLoading } = useDeadlines(transactionId);
  const { data: loanEstimates, isLoading: lesLoading } = useLoanEstimates(transactionId);
  const { data: repairItems, isLoading: repairsLoading } = useRepairItems(transactionId);

  const allDocs = useMemo(() => documents ?? [], [documents]);

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

  const isLoading = transactionLoading || docsLoading || deadlinesLoading || lesLoading || repairsLoading;

  return {
    transaction: transaction ?? null,
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
