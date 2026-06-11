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
import { DOCUMENT_LIST_COLUMNS } from "./queries";
import { generateInviteSlug } from "@/lib/invites";
import { normalizeEmail } from "@/lib/email/validate";
import type { Document, Phase, UserRole } from "@/lib/types";

const supabase = createClient();


// -- Profile --

export function useCreateProfile(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      displayName: string;
      role: UserRole;
      /** Resolved server-side from an invite slug (/api/join/resolve); buyers only. */
      referredByAgentId?: string | null;
    }) => {
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          user_id: userId,
          display_name: params.displayName,
          role: params.role,
          referred_by_agent_id:
            params.role === "buyer" ? params.referredByAgentId ?? null : null,
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

/**
 * Agent invite link: generate-and-claim a unique invite_slug for the agent's own profile.
 * Retries once on a unique-index collision with a fresh random suffix.
 */
export function useCreateInviteSlug(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (displayName: string) => {
      for (let attempt = 0; attempt < 2; attempt++) {
        const slug = generateInviteSlug(displayName);
        const { data, error } = await supabase
          .from("profiles")
          .update({ invite_slug: slug })
          .eq("user_id", userId)
          .select("invite_slug")
          .single();
        if (!error) return data.invite_slug as string;
        if (error.code !== "23505") throw error; // not a uniqueness collision
      }
      throw new Error("Could not generate a unique invite link. Please try again.");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: profileKeys.detail(userId) });
    },
  });
}

// -- Phase Guide --

export function useMarkPhaseGuideSeen(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (phase: Phase) => {
      // The RPC derives the target user from auth.uid() server-side (migration 015); it no longer
      // accepts a client-supplied user id, closing a cross-tenant write (L-1).
      const { error } = await supabase.rpc("append_seen_phase_guide", {
        p_phase: phase,
      });
      if (error) throw error;
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
        .insert({ ...home, user_id: userId, deal_id: transactionId || undefined })
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
      // State workflow engine fields
      state?: string;
      property_type?: string;
      loan_program?: string;
      property_in_hoa?: boolean;
      property_in_special_district?: boolean;
      special_district_annual_cost?: number;
    }) => {
      // Agent referral stamping: a buyer who signed up via an agent's /join link has
      // referred_by_agent_id on their profile — stamp it onto the transaction so the
      // agent gains visibility under the existing agent RLS policies. Explicit
      // agent_id (the agent-creates-client flow) always wins; failures are non-fatal.
      // Note: referred_by_agent_id is buyer-controlled (own-row RLS), but it only ever
      // widens access to the buyer's OWN transaction, so trusting it here is safe —
      // the resolve route's role='agent' filter is the honest-path guard, not a boundary.
      let agentId = transaction.agent_id;
      if (!agentId) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, referred_by_agent_id")
          .eq("user_id", userId)
          .maybeSingle();
        if (profile?.role === "buyer" && profile.referred_by_agent_id) {
          agentId = profile.referred_by_agent_id;
        }
      }

      const { data, error } = await supabase
        .from("transactions")
        .insert({
          ...transaction,
          agent_id: agentId,
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
      // State-specific offer fields
      option_period_days?: number;
      option_fee?: number;
      investigation_contingency_days?: number;
      contract_type?: string;
      seller_repair_cap_percent?: number;
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
        .select(DOCUMENT_LIST_COLUMNS)
        .single();
      if (insertError) throw insertError;
      const inserted = data as unknown as Document;

      // Trigger async processing (extraction + classification)
      fetch("/api/documents/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: inserted.id }),
      }).then(async (res) => {
        if (!res.ok) {
          console.error(`[upload] Document processing failed for ${inserted.id}: ${res.status}`);
        }
        // Always invalidate so the UI picks up status changes (including "failed")
        qc.invalidateQueries({ queryKey: documentKeys.list(transactionId) });
      }).catch((err) => {
        console.error(`[upload] Document processing request failed for ${inserted.id}:`, err);
        qc.invalidateQueries({ queryKey: documentKeys.list(transactionId) });
      });

      return inserted;
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
        .select(DOCUMENT_LIST_COLUMNS)
        .single();
      if (error) throw error;
      return data as unknown as Document;
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
          deal_id: transactionId || null,
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
      const email = normalizeEmail(params.recipientEmail);
      const { data, error } = await supabase
        .from("collaborator_links")
        .insert({
          deal_id: transactionId,
          link_token: crypto.randomUUID(),
          recipient_role: params.recipientRole,
          recipient_email: email,
          requested_documents: params.requestedDocuments ?? null,
        })
        .select()
        .single();
      if (error) throw error;

      // If a valid email was given, email the upload link (server-side; degrades to a no-op
      // when email isn't configured). Non-fatal: link creation already succeeded.
      let emailed = false;
      if (email) {
        try {
          const res = await fetch("/api/collaborator/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ linkId: data.id }),
          });
          const payload = await res.json().catch(() => ({}));
          emailed = res.ok && payload.skipped === false;
        } catch {
          emailed = false;
        }
      }
      return { ...data, _emailed: emailed };
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: collaboratorKeys.list(transactionId) });
      toast.success(data._emailed ? "Upload link created and emailed" : "Upload link created");
    },
  });
}

/**
 * Agent → buyer handoff: generate (or reuse) a claim link for a client transaction and
 * optionally email it to the stored client_email. Server enforces ownership + the
 * not-already-claimed guard (see /api/claim/invite).
 */
export function useInviteBuyer(agentId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { transactionId: string; sendEmail: boolean }) => {
      const res = await fetch("/api/claim/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "invite_failed");
      return body as { claimUrl: string; emailed: boolean };
    },
    onSuccess: () => {
      // The transaction now carries a claim_token → refresh so the "Invited" badge appears.
      qc.invalidateQueries({ queryKey: ["transactions", "agent", agentId] });
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
