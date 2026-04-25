"use client";

import { useMemo } from "react";
import { useDocuments, useDeadlines, useLoanEstimates, useRepairItems, useDeal, useInsuranceInfo } from "./queries";
import type { Deal, Document, Deadline, LoanEstimate, RepairItem, InsuranceInfo, ClosingMetadata } from "@/lib/types";
import { DEFAULT_CLOSING_METADATA } from "@/lib/types";

export interface ClosingData {
  deal: Deal | null;
  meta: ClosingMetadata;
  documents: Document[];
  cdDocument: Document | null;
  titleReport: Document | null;
  insuranceBinder: Document | null;
  insuranceInfo: InsuranceInfo | null;
  chosenLE: LoanEstimate | null;
  loanEstimates: LoanEstimate[];
  closingDeadline: Deadline | null;
  deadlines: Deadline[];
  repairItems: RepairItem[];
  isLoading: boolean;
}

export function useClosingData(dealId: string): ClosingData {
  const { data: deal, isLoading: dealLoading } = useDeal(dealId);
  const { data: documents, isLoading: docsLoading } = useDocuments(dealId);
  const { data: deadlines, isLoading: deadlinesLoading } = useDeadlines(dealId);
  const { data: loanEstimates, isLoading: lesLoading } = useLoanEstimates(dealId);
  const { data: repairItems, isLoading: repairsLoading } = useRepairItems(dealId);
  const { data: insuranceList, isLoading: insuranceLoading } = useInsuranceInfo(dealId);

  const allDocs = useMemo(() => documents ?? [], [documents]);

  const cdDocument = useMemo(
    () => allDocs.find((d) => d.doc_type === "closing_disclosure" && d.status === "processed" && d.extracted_fields) ?? null,
    [allDocs]
  );

  const titleReport = useMemo(
    () => allDocs.find((d) => d.doc_type === "title_report") ?? null,
    [allDocs]
  );

  const insuranceBinder = useMemo(
    () => allDocs.find((d) => d.doc_type === "insurance_binder") ?? null,
    [allDocs]
  );

  const chosenLE = useMemo(
    () => (loanEstimates ?? []).find((le) => le.is_chosen) ?? null,
    [loanEstimates]
  );

  const closingDeadline = useMemo(
    () => (deadlines ?? []).find((d) => d.type === "closing") ?? null,
    [deadlines]
  );

  const insuranceInfo = useMemo(
    () => (insuranceList ?? []).find((i) => i.is_chosen) ?? (insuranceList ?? [])[0] ?? null,
    [insuranceList]
  );

  const meta: ClosingMetadata = useMemo(() => {
    if (deal?.closing_metadata && typeof deal.closing_metadata === "object") {
      return { ...DEFAULT_CLOSING_METADATA, ...deal.closing_metadata };
    }
    return DEFAULT_CLOSING_METADATA;
  }, [deal]);

  const isLoading = dealLoading || docsLoading || deadlinesLoading || lesLoading || repairsLoading || insuranceLoading;

  return {
    deal: deal ?? null,
    meta,
    documents: allDocs,
    cdDocument,
    titleReport,
    insuranceBinder,
    insuranceInfo,
    chosenLE,
    loanEstimates: loanEstimates ?? [],
    closingDeadline,
    deadlines: deadlines ?? [],
    repairItems: repairItems ?? [],
    isLoading,
  };
}
