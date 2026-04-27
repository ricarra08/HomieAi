import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  profileKeys,
  savedHomeKeys,
  transactionKeys,
  offerKeys,
  documentKeys,
  deadlineKeys,
  loanEstimateKeys,
  repairItemKeys,
  insuranceKeys,
  collaboratorKeys,
  copilotKeys,
} from "./query-keys";
import type { Phase, UserRole } from "@/lib/types";

const supabase = createClient();

function handleMutationError(error: Error, context?: string) {
  console.error(`[mutation${context ? `:${context}` : ""}]`, error);
  toast.error(context ? `Failed to ${context}` : "Something went wrong. Please try again.");
}

// -- Profile --

export function useCreateProfile(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { displayName: string; role: UserRole }) => {
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          user_id: userId,
          display_name: params.displayName,
          role: params.role,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.detail(userId) });
    },
  });
}

// -- Saved Homes (Shopping) --

export function useCreateSavedHome(userId: string, transactionId: string) {
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
        .insert({ ...home, user_id: userId, deal_id: transactionId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: savedHomeKeys.all(transactionId) });
    },
  });
}

export function useDeleteSavedHome(transactionId: string) {
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
      qc.invalidateQueries({ queryKey: savedHomeKeys.all(transactionId) });
    },
  });
}

// -- Transaction --

export function useCreateTransaction(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (transaction: {
      property_address: string;
      purchase_price: number;
      current_phase?: Phase;
      saved_home_id?: string;
      contract_acceptance_date?: string;
      closing_date?: string;
      agent_name?: string;
      agent_contact?: string;
      earnest_money_amount?: number;
      agent_id?: string;
      client_name?: string;
      client_email?: string;
    }) => {
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          ...transaction,
          user_id: userId,
          current_phase: transaction.current_phase ?? "offer",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transactionKeys.all(userId) });
      qc.invalidateQueries({ queryKey: ["transactions", "agent", userId] });
    },
  });
}

export function useUpdateTransaction(transactionId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", transactionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
      qc.invalidateQueries({ queryKey: transactionKeys.all(userId) });
      qc.invalidateQueries({ queryKey: ["transactions", "agent", userId] });
    },
  });
}

export function useDeleteTransaction(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transactionId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transactionKeys.all(userId) });
      qc.invalidateQueries({ queryKey: ["transactions", "agent", userId] });
    },
  });
}

// -- Phase Transition --

export function useTransitionPhase(transactionId: string, userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (newPhase: Phase) => {
      const { data, error } = await supabase
        .from("transactions")
        .update({ current_phase: newPhase })
        .eq("id", transactionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, newPhase) => {
      qc.invalidateQueries({ queryKey: transactionKeys.detail(transactionId) });
      qc.invalidateQueries({ queryKey: transactionKeys.all(userId) });
      qc.invalidateQueries({ queryKey: ["transactions", "agent", userId] });
      if (newPhase === "escrow") {
        qc.invalidateQueries({ queryKey: offerKeys.detail(transactionId) });
        qc.invalidateQueries({ queryKey: deadlineKeys.list(transactionId) });
      }
      if (newPhase === "closing" || newPhase === "post-close") {
        qc.invalidateQueries({ queryKey: documentKeys.list(transactionId) });
        qc.invalidateQueries({ queryKey: insuranceKeys.list(transactionId) });
        qc.invalidateQueries({ queryKey: loanEstimateKeys.list(transactionId) });
        qc.invalidateQueries({ queryKey: deadlineKeys.list(transactionId) });
      }
      const phaseLabels: Record<Phase, string> = {
        shopping: "Shopping", offer: "Offer", escrow: "Escrow",
        closing: "Closing", "post-close": "Post-Close",
      };
      toast.success(`Moved to ${phaseLabels[newPhase]}`);
    },
  });
}

// -- Offer Details --

export function useCreateOfferDetails(transactionId: string) {
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
        .insert({ ...offer, deal_id: transactionId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: offerKeys.detail(transactionId) });
    },
  });
}

export function useUpdateOfferDetails(transactionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from("offer_details")
        .update(updates)
        .eq("deal_id", transactionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: offerKeys.detail(transactionId) });
    },
  });
}

// -- Documents --

export function useUploadDocument(transactionId: string) {
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
      const filePath = `${transactionId}/${crypto.randomUUID()}/${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("deal-documents")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const row: Record<string, unknown> = {
        deal_id: transactionId,
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
      }).then(async (res) => {
        if (!res.ok) {
          console.error(`[upload] Document processing failed for ${data.id}: ${res.status}`);
        }
        // Always invalidate so the UI picks up status changes (including "failed")
        qc.invalidateQueries({ queryKey: documentKeys.list(transactionId) });
      }).catch((err) => {
        console.error(`[upload] Document processing request failed for ${data.id}:`, err);
        qc.invalidateQueries({ queryKey: documentKeys.list(transactionId) });
      });

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: documentKeys.list(transactionId) });
    },
  });
}

export function useUpdateDocument(transactionId: string) {
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
      qc.invalidateQueries({ queryKey: documentKeys.list(transactionId) });
    },
  });
}

export function useDeleteDocument(transactionId: string) {
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
      qc.invalidateQueries({ queryKey: documentKeys.list(transactionId) });
    },
  });
}

// -- Deadlines --

export function useUpdateDeadlineStatus(transactionId: string) {
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
      qc.invalidateQueries({ queryKey: deadlineKeys.list(transactionId) });
    },
  });
}

export function useCreateDeadlines(transactionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      deadlines: {
        name: string;
        type: string;
        due_date: string;
      }[]
    ) => {
      const rows = deadlines.map((d) => ({ ...d, deal_id: transactionId }));
      const { data, error } = await supabase
        .from("deadlines")
        .insert(rows)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: deadlineKeys.list(transactionId) });
    },
  });
}

// -- Loan Estimates --

export function useCreateLoanEstimate(transactionId: string) {
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
        .insert({ ...le, deal_id: transactionId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: loanEstimateKeys.list(transactionId) });
      toast.success("Loan estimate saved");
    },
  });
}

export function useUpdateLoanEstimate(transactionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { leId: string; updates: Record<string, unknown> }) => {
      if (!params.leId) throw new Error("leId is required for update");
      const { data, error } = await supabase
        .from("loan_estimates")
        .update(params.updates)
        .eq("id", params.leId)
        .eq("deal_id", transactionId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: loanEstimateKeys.list(transactionId) });
    },
  });
}

export function useSetChosenLE(transactionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (leId: string) => {
      await supabase
        .from("loan_estimates")
        .update({ is_chosen: false })
        .eq("deal_id", transactionId);

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
      qc.invalidateQueries({ queryKey: loanEstimateKeys.list(transactionId) });
    },
  });
}

// -- Repair Items --

export function useCreateRepairItem(transactionId: string) {
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
        .insert({ ...item, deal_id: transactionId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: repairItemKeys.list(transactionId) });
    },
  });
}

export function useUpdateRepairItem(transactionId: string) {
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
      qc.invalidateQueries({ queryKey: repairItemKeys.list(transactionId) });
    },
  });
}

// -- Copilot Messages --

export function useSendCopilotMessage(
  userId: string,
  transactionId: string | null,
  phase: Phase
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from("copilot_messages")
        .insert({
          user_id: userId,
          deal_id: transactionId,
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
      qc.invalidateQueries({ queryKey: copilotKeys.messages(transactionId) });
    },
  });
}

// -- Insurance --

export function useCreateInsuranceInfo(transactionId: string) {
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
        .insert({ ...info, deal_id: transactionId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: insuranceKeys.list(transactionId) });
    },
  });
}

export function useUpdateInsuranceInfo(transactionId: string) {
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
      qc.invalidateQueries({ queryKey: insuranceKeys.list(transactionId) });
    },
  });
}

// -- Collaborator Links --

export function useCreateCollaboratorLink(transactionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      recipientRole: "agent" | "lender" | "escrow" | "title" | "inspector" | "other";
      recipientEmail?: string;
      requestedDocuments?: string[];
    }) => {
      const { data, error } = await supabase
        .from("collaborator_links")
        .insert({
          deal_id: transactionId,
          link_token: crypto.randomUUID(),
          recipient_role: params.recipientRole,
          recipient_email: params.recipientEmail ?? null,
          requested_documents: params.requestedDocuments ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collaboratorKeys.list(transactionId) });
      toast.success("Upload link created");
    },
  });
}

export function useRevokeCollaboratorLink(transactionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from("collaborator_links")
        .update({ status: "revoked" })
        .eq("id", linkId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: collaboratorKeys.list(transactionId) });
    },
  });
}
