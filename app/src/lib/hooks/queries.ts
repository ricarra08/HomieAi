import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
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
  valuationKeys,
  marketKeys,
} from "./query-keys";
import type {
  Profile,
  SavedHome,
  Transaction,
  OfferDetails,
  Document,
  Deadline,
  LoanEstimate,
  RepairItem,
  InsuranceInfo,
  CollaboratorLink,
  CopilotMessage,
  HomeValueProjection,
  MarketSnapshot,
} from "@/lib/types";

const supabase = createClient();

// -- Profile --

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: profileKeys.detail(userId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId!)
        .single();
      if (error) {
        if (error.code === "PGRST116") return null; // no rows
        throw error;
      }
      return data as Profile;
    },
    enabled: !!userId,
  });
}

// -- Shopping phase --

export function useSavedHomes(transactionId: string | null) {
  return useQuery({
    queryKey: savedHomeKeys.all(transactionId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_homes")
        .select("*")
        .eq("deal_id", transactionId!)
        .neq("status", "removed")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as SavedHome[];
    },
    enabled: !!transactionId,
  });
}

// -- Transaction --

export function useTransactions(userId: string | undefined) {
  return useQuery({
    queryKey: transactionKeys.all(userId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId!)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!userId,
  });
}

export function useAgentTransactions(agentId: string | undefined) {
  return useQuery({
    queryKey: ["transactions", "agent", agentId ?? ""] as const,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("agent_id", agentId!)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!agentId,
  });
}

export function useTransaction(transactionId: string | null) {
  return useQuery({
    queryKey: transactionKeys.detail(transactionId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId!)
        .single();
      if (error) throw error;
      return data as Transaction;
    },
    enabled: !!transactionId,
  });
}

// -- Offer phase --

export function useOfferDetails(transactionId: string | null) {
  return useQuery({
    queryKey: offerKeys.detail(transactionId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offer_details")
        .select("*")
        .eq("deal_id", transactionId!)
        .single();
      if (error) throw error;
      return data as OfferDetails;
    },
    enabled: !!transactionId,
  });
}

// -- Documents --

/**
 * Every documents column EXCEPT extracted_text (H3): the raw document text can carry
 * sensitive identifiers and nothing in the browser renders it — only server-side prompt
 * assembly reads it. Keep this list in sync with the documents schema.
 */
export const DOCUMENT_LIST_COLUMNS =
  "id, deal_id, name, file_path, file_size, mime_type, doc_type, category, stage, " +
  "status, version, extracted_fields, ai_summary, confidence_score, source_type, " +
  "collaborator_link_id, created_at, updated_at";

export function useDocuments(transactionId: string | null) {
  return useQuery({
    queryKey: documentKeys.list(transactionId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select(DOCUMENT_LIST_COLUMNS)
        .eq("deal_id", transactionId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Document[];
    },
    enabled: !!transactionId,
  });
}

// -- Deadlines --

export function useDeadlines(transactionId: string | null) {
  return useQuery({
    queryKey: deadlineKeys.list(transactionId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("deadlines")
        .select("*")
        .eq("deal_id", transactionId!)
        .order("due_date", { ascending: true });
      if (error) throw error;
      return data as Deadline[];
    },
    enabled: !!transactionId,
  });
}

// -- Loan Estimates --

export function useLoanEstimates(transactionId: string | null) {
  return useQuery({
    queryKey: loanEstimateKeys.list(transactionId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("loan_estimates")
        .select("*")
        .eq("deal_id", transactionId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as LoanEstimate[];
    },
    enabled: !!transactionId,
  });
}

// -- Repair Items --

export function useRepairItems(transactionId: string | null) {
  return useQuery({
    queryKey: repairItemKeys.list(transactionId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("repair_items")
        .select("*")
        .eq("deal_id", transactionId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as RepairItem[];
    },
    enabled: !!transactionId,
  });
}

// -- Insurance --

export function useInsuranceInfo(transactionId: string | null) {
  return useQuery({
    queryKey: insuranceKeys.list(transactionId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insurance_info")
        .select("*")
        .eq("deal_id", transactionId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as InsuranceInfo[];
    },
    enabled: !!transactionId,
  });
}

// -- Collaborator Links --

export function useCollaboratorLinks(transactionId: string | null) {
  return useQuery({
    queryKey: collaboratorKeys.list(transactionId ?? ""),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collaborator_links")
        .select("*")
        .eq("deal_id", transactionId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CollaboratorLink[];
    },
    enabled: !!transactionId,
  });
}

// -- Copilot Messages --

export function useCopilotMessages(transactionId: string | null) {
  return useQuery({
    queryKey: copilotKeys.messages(transactionId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("copilot_messages")
        .select("*")
        .eq("deal_id", transactionId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as CopilotMessage[];
    },
    enabled: !!transactionId,
  });
}

// -- Home Value Projection --

export class HomeValuationError extends Error {
  status: number;
  retryAfterSeconds: number | null;
  constructor(message: string, status: number, retryAfterSeconds: number | null) {
    super(message);
    this.status = status;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function useHomeValuation(savedHomeId: string | null) {
  return useQuery<HomeValueProjection, HomeValuationError>({
    queryKey: valuationKeys.byHome(savedHomeId),
    queryFn: async () => {
      const res = await fetch("/api/valuation/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedHomeId }),
      });
      if (!res.ok) {
        const retryAfter = res.headers.get("Retry-After");
        let message = `Couldn't generate scenarios (${res.status})`;
        try {
          const body = await res.json();
          if (body?.error) message = body.error;
        } catch {
          // ignore
        }
        throw new HomeValuationError(
          message,
          res.status,
          retryAfter ? parseInt(retryAfter, 10) : null,
        );
      }
      return (await res.json()) as HomeValueProjection;
    },
    enabled: !!savedHomeId,
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}

// -- Market Snapshot --

export function useMarketSnapshot(savedHomeId: string | null) {
  return useQuery<MarketSnapshot, HomeValuationError>({
    queryKey: marketKeys.byHome(savedHomeId),
    queryFn: async () => {
      const res = await fetch("/api/market/snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ savedHomeId }),
      });
      if (!res.ok) {
        const retryAfter = res.headers.get("Retry-After");
        let message = `Market data failed (${res.status})`;
        try {
          const body = await res.json();
          if (body?.error) message = body.error;
        } catch {
          // ignore
        }
        throw new HomeValuationError(
          message,
          res.status,
          retryAfter ? parseInt(retryAfter, 10) : null,
        );
      }
      return (await res.json()) as MarketSnapshot;
    },
    enabled: !!savedHomeId,
    staleTime: 60 * 60 * 1000,
    retry: false,
  });
}
