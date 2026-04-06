import { useQuery } from "@tanstack/react-query";
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
  collaboratorKeys,
  copilotKeys,
} from "./query-keys";
import type {
  SavedHome,
  Deal,
  OfferDetails,
  Document,
  Deadline,
  LoanEstimate,
  RepairItem,
  InsuranceInfo,
  CollaboratorLink,
  CopilotMessage,
} from "@/lib/types";

const supabase = createClient();

// -- Shopping phase --

export function useSavedHomes(userId: string | undefined) {
  return useQuery({
    queryKey: savedHomeKeys.all(userId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_homes")
        .select("*")
        .eq("user_id", userId!)
        .neq("status", "removed")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SavedHome[];
    },
    enabled: !!userId,
  });
}

// -- Deal --

export function useDeals(userId: string | undefined) {
  return useQuery({
    queryKey: dealKeys.all(userId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("user_id", userId!)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Deal[];
    },
    enabled: !!userId,
  });
}

export function useDeal(dealId: string | null) {
  return useQuery({
    queryKey: dealKeys.detail(dealId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deals")
        .select("*")
        .eq("id", dealId!)
        .single();
      if (error) throw error;
      return data as Deal;
    },
    enabled: !!dealId,
  });
}

// -- Offer phase --

export function useOfferDetails(dealId: string | null) {
  return useQuery({
    queryKey: offerKeys.detail(dealId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offer_details")
        .select("*")
        .eq("deal_id", dealId!)
        .single();
      if (error) throw error;
      return data as OfferDetails;
    },
    enabled: !!dealId,
  });
}

// -- Documents --

export function useDocuments(dealId: string | null) {
  return useQuery({
    queryKey: documentKeys.list(dealId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("deal_id", dealId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Document[];
    },
    enabled: !!dealId,
  });
}

// -- Deadlines --

export function useDeadlines(dealId: string | null) {
  return useQuery({
    queryKey: deadlineKeys.list(dealId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deadlines")
        .select("*")
        .eq("deal_id", dealId!)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data as Deadline[];
    },
    enabled: !!dealId,
  });
}

// -- Loan Estimates --

export function useLoanEstimates(dealId: string | null) {
  return useQuery({
    queryKey: loanEstimateKeys.list(dealId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loan_estimates")
        .select("*")
        .eq("deal_id", dealId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LoanEstimate[];
    },
    enabled: !!dealId,
  });
}

// -- Repair Items --

export function useRepairItems(dealId: string | null) {
  return useQuery({
    queryKey: repairItemKeys.list(dealId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repair_items")
        .select("*")
        .eq("deal_id", dealId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RepairItem[];
    },
    enabled: !!dealId,
  });
}

// -- Insurance --

export function useInsuranceInfo(dealId: string | null) {
  return useQuery({
    queryKey: insuranceKeys.list(dealId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insurance_info")
        .select("*")
        .eq("deal_id", dealId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as InsuranceInfo[];
    },
    enabled: !!dealId,
  });
}

// -- Collaborator Links --

export function useCollaboratorLinks(dealId: string | null) {
  return useQuery({
    queryKey: collaboratorKeys.list(dealId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collaborator_links")
        .select("*")
        .eq("deal_id", dealId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CollaboratorLink[];
    },
    enabled: !!dealId,
  });
}

// -- Copilot Messages --

export function useCopilotMessages(dealId: string | null) {
  return useQuery({
    queryKey: copilotKeys.messages(dealId),
    queryFn: async () => {
      const query = supabase
        .from("copilot_messages")
        .select("*")
        .order("created_at", { ascending: true });

      if (dealId) {
        query.eq("deal_id", dealId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CopilotMessage[];
    },
    enabled: true,
  });
}
