import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  savedHomeKeys,
  dealKeys,
  offerKeys,
  documentKeys,
  deadlineKeys,
  loanEstimateKeys,
  repairItemKeys,
  insuranceKeys,
  copilotKeys,
} from "./query-keys";
import type { Phase } from "@/lib/types";

const supabase = createClient();

// -- Saved Homes (Shopping) --

export function useCreateSavedHome(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (home: {
      address: string;
      price?: number;
      beds?: number;
      baths?: number;
      sqft?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("saved_homes")
        .insert({ ...home, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: savedHomeKeys.all(userId) });
    },
  });
}

export function useDeleteSavedHome(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (homeId: string) => {
      const { error } = await supabase
        .from("saved_homes")
        .update({ status: "removed" })
        .eq("id", homeId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: savedHomeKeys.all(userId) });
    },
  });
}

// -- Deal --

export function useCreateDeal(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (deal: {
      property_address: string;
      purchase_price: number;
      current_phase?: Phase;
      saved_home_id?: string;
      contract_acceptance_date?: string;
      closing_date?: string;
      agent_name?: string;
      agent_contact?: string;
      earnest_money_amount?: number;
    }) => {
      const { data, error } = await supabase
        .from("deals")
        .insert({
          ...deal,
          user_id: userId,
          current_phase: deal.current_phase ?? "offer",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dealKeys.all(userId) });
    },
  });
}

export function useUpdateDeal(dealId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from("deals")
        .update(updates)
        .eq("id", dealId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dealKeys.detail(dealId) });
      qc.invalidateQueries({ queryKey: dealKeys.all(userId) });
    },
  });
}

// -- Phase Transition --

export function useTransitionPhase(dealId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (newPhase: Phase) => {
      const { data, error } = await supabase
        .from("deals")
        .update({ current_phase: newPhase })
        .eq("id", dealId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, newPhase) => {
      qc.invalidateQueries({ queryKey: dealKeys.detail(dealId) });
      qc.invalidateQueries({ queryKey: dealKeys.all(userId) });
      if (newPhase === "escrow") {
        qc.invalidateQueries({ queryKey: offerKeys.detail(dealId) });
        qc.invalidateQueries({ queryKey: deadlineKeys.list(dealId) });
      }
    },
  });
}

// -- Offer Details --

export function useCreateOfferDetails(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (offer: {
      offer_price: number;
      earnest_money: number;
      closing_date?: string;
      contingency_inspection_days?: number;
      contingency_appraisal_days?: number;
      contingency_financing_days?: number;
      contingency_disclosure_days?: number;
    }) => {
      const { data, error } = await supabase
        .from("offer_details")
        .insert({ ...offer, deal_id: dealId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: offerKeys.detail(dealId) });
    },
  });
}

export function useUpdateOfferDetails(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from("offer_details")
        .update(updates)
        .eq("deal_id", dealId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: offerKeys.detail(dealId) });
    },
  });
}

// -- Documents --

export function useUploadDocument(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      file: File;
      sourceType?: string;
      docType?: string;
      category?: string;
      stage?: string;
      inspectionSubtype?: string;
    }) => {
      const { file, sourceType = "buyer-upload", docType, category, stage, inspectionSubtype } = params;
      const filePath = `${dealId}/${crypto.randomUUID()}/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("deal-documents")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const row: Record<string, unknown> = {
        deal_id: dealId,
        name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        status: "uploaded",
        source_type: sourceType,
      };
      if (docType) row.doc_type = docType;
      if (category) row.category = category;
      if (stage) row.stage = stage;
      if (inspectionSubtype) {
        row.extracted_fields = { _inspection_slot: inspectionSubtype };
      }

      const { data, error: insertError } = await supabase
        .from("documents")
        .insert(row)
        .select()
        .single();
      if (insertError) throw insertError;

      // Trigger async processing (extraction + classification)
      fetch("/api/documents/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: data.id }),
      }).then(() => {
        qc.invalidateQueries({ queryKey: documentKeys.list(dealId) });
      });

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.list(dealId) });
    },
  });
}

export function useUpdateDocument(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { documentId: string; updates: Record<string, unknown> }) => {
      const { data, error } = await supabase
        .from("documents")
        .update(params.updates)
        .eq("id", params.documentId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.list(dealId) });
    },
  });
}

export function useDeleteDocument(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { documentId: string; filePath: string }) => {
      await supabase.storage.from("deal-documents").remove([params.filePath]);
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", params.documentId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.list(dealId) });
    },
  });
}

// -- Deadlines --

export function useUpdateDeadlineStatus(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { deadlineId: string; status: string }) => {
      const { data, error } = await supabase
        .from("deadlines")
        .update({ status: params.status })
        .eq("id", params.deadlineId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deadlineKeys.list(dealId) });
    },
  });
}

export function useCreateDeadlines(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      deadlines: {
        name: string;
        type: string;
        due_date: string;
      }[]
    ) => {
      const rows = deadlines.map((d) => ({ ...d, deal_id: dealId }));
      const { data, error } = await supabase
        .from("deadlines")
        .insert(rows)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deadlineKeys.list(dealId) });
    },
  });
}

// -- Loan Estimates --

export function useCreateLoanEstimate(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (le: {
      lender: string;
      product: string;
      loan_amount: number;
      rate: number;
      apr?: number;
      down_payment?: number;
      points?: number;
      lender_fees?: number;
      third_party_fees?: number;
      pmi_monthly?: number;
      impounds?: boolean;
      cash_to_close?: number;
      lock_status?: string;
      lock_expires?: string;
      prepay_penalty?: boolean;
      pdf_document_id?: string;
    }) => {
      const { data, error } = await supabase
        .from("loan_estimates")
        .insert({ ...le, deal_id: dealId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: loanEstimateKeys.list(dealId) });
    },
  });
}

export function useUpdateLoanEstimate(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { leId: string; updates: Record<string, unknown> }) => {
      const { data, error } = await supabase
        .from("loan_estimates")
        .update(params.updates)
        .eq("id", params.leId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: loanEstimateKeys.list(dealId) });
    },
  });
}

export function useSetChosenLE(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (leId: string) => {
      await supabase
        .from("loan_estimates")
        .update({ is_chosen: false })
        .eq("deal_id", dealId);

      const { data, error } = await supabase
        .from("loan_estimates")
        .update({ is_chosen: true })
        .eq("id", leId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: loanEstimateKeys.list(dealId) });
    },
  });
}

// -- Repair Items --

export function useCreateRepairItem(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: {
      description: string;
      category?: string;
      estimated_cost?: number;
      severity?: string;
      source_document_id?: string;
    }) => {
      const { data, error } = await supabase
        .from("repair_items")
        .insert({ ...item, deal_id: dealId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: repairItemKeys.list(dealId) });
    },
  });
}

export function useUpdateRepairItem(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      itemId: string;
      updates: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from("repair_items")
        .update(params.updates)
        .eq("id", params.itemId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: repairItemKeys.list(dealId) });
    },
  });
}

// -- Copilot Messages --

export function useSendCopilotMessage(
  userId: string,
  dealId: string | null,
  phase: Phase
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from("copilot_messages")
        .insert({
          user_id: userId,
          deal_id: dealId,
          role: "user",
          content,
          phase,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: copilotKeys.messages(dealId) });
    },
  });
}

// -- Insurance --

export function useCreateInsuranceInfo(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (info: {
      carrier: string;
      policy_type?: string;
      annual_premium?: number;
      coverage_dwelling?: number;
      deductible?: number;
      effective_date?: string;
      mortgagee_clause?: string;
      binder_status?: string;
      binder_document_id?: string;
    }) => {
      const { data, error } = await supabase
        .from("insurance_info")
        .insert({ ...info, deal_id: dealId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: insuranceKeys.list(dealId) });
    },
  });
}

export function useUpdateInsuranceInfo(dealId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { infoId: string; updates: Record<string, unknown> }) => {
      const { data, error } = await supabase
        .from("insurance_info")
        .update(params.updates)
        .eq("id", params.infoId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: insuranceKeys.list(dealId) });
    },
  });
}
