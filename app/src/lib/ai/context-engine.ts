import { createClient } from "@supabase/supabase-js";
import { computeDeadlineUrgency, computeDaysRemaining } from "@/lib/computed";
import type { Phase, Transaction, Document, Deadline, LoanEstimate, RepairItem, SavedHome } from "@/lib/types";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const MAX_CONTEXT_CHARS = 50_000;
const MAX_RAW_TEXT_PER_DOC = 15_000;

function formatCurrency(n: number | null | undefined): string {
  if (n == null) return "N/A";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

function buildTransactionSummary(transaction: Transaction): string {
  const daysLeft = computeDaysRemaining(transaction.closing_date);
  const lines = [
    `Property: ${transaction.property_address}`,
    `Purchase price: ${formatCurrency(transaction.purchase_price)}`,
    `Phase: ${transaction.current_phase}`,
  ];
  if (transaction.closing_date) lines.push(`Closing date: ${transaction.closing_date}${daysLeft !== null ? ` (${daysLeft} days remaining)` : ""}`);
  if (transaction.contract_acceptance_date) lines.push(`Contract acceptance: ${transaction.contract_acceptance_date}`);
  if (transaction.agent_name) lines.push(`Agent: ${transaction.agent_name}${transaction.agent_contact ? ` (${transaction.agent_contact})` : ""}`);
  if (transaction.escrow_company) lines.push(`Escrow: ${transaction.escrow_company}`);
  if (transaction.earnest_money_amount) lines.push(`Earnest money: ${formatCurrency(transaction.earnest_money_amount)} — status: ${transaction.earnest_money_status ?? "unknown"}`);
  return `## Transaction Summary\n${lines.join("\n")}`;
}

function buildDeadlinesBlock(deadlines: Deadline[]): string {
  if (!deadlines.length) return "";
  const sorted = [...deadlines].sort((a, b) => {
    const urgencyOrder = { overdue: 0, "due-soon": 1, upcoming: 2, completed: 3, waived: 4 };
    return (urgencyOrder[computeDeadlineUrgency(a)] ?? 5) - (urgencyOrder[computeDeadlineUrgency(b)] ?? 5);
  });
  const lines = sorted.map((d) => {
    const urgency = computeDeadlineUrgency(d);
    const days = computeDaysRemaining(d.due_date);
    const flag = urgency === "overdue" ? " [OVERDUE]" : urgency === "due-soon" ? " [DUE SOON]" : "";
    return `- ${d.name}: ${d.due_date} (${days !== null ? `${days}d` : "?"})${flag} — ${d.status}`;
  });
  return `## Deadlines\n${lines.join("\n")}`;
}

function buildDocumentsBlock(documents: Document[]): string {
  if (!documents.length) return "";
  const sections: string[] = [];

  for (const doc of documents) {
    const header = `### ${doc.name} (${doc.doc_type ?? "unclassified"})`;
    const parts: string[] = [header];

    if (doc.ai_summary) {
      parts.push(`**AI Summary:**\n${doc.ai_summary}`);
    }

    if (doc.extracted_fields) {
      const fields = doc.extracted_fields as Record<string, { value: unknown; confidence?: string }>;
      const fieldLines = Object.entries(fields)
        .filter(([, v]) => v?.value != null && v.value !== "")
        .map(([k, v]) => {
          const val = v.value;
          const display = Array.isArray(val) ? JSON.stringify(val) : String(val);
          return `- ${k}: ${display}`;
        });
      if (fieldLines.length) {
        parts.push(`**Extracted Fields:**\n${fieldLines.join("\n")}`);
      }
    }

    if (doc.extracted_text) {
      const rawText = doc.extracted_text.length > MAX_RAW_TEXT_PER_DOC
        ? doc.extracted_text.slice(0, MAX_RAW_TEXT_PER_DOC) + "\n...(document text truncated)"
        : doc.extracted_text;
      parts.push(`**Full Document Text:**\n${rawText}`);
    }

    sections.push(parts.join("\n\n"));
  }

  return `## Documents (${documents.length} uploaded)\n\n${sections.join("\n\n---\n\n")}`;
}

function buildLoanEstimatesBlock(estimates: LoanEstimate[]): string {
  if (!estimates.length) return "";
  const lines = estimates.map((le) => {
    const chosen = le.is_chosen ? " [CHOSEN]" : "";
    return `- ${le.lender} — ${le.product}: ${le.rate}% rate, ${formatCurrency(le.loan_amount)} loan, ${formatCurrency(le.cash_to_close)} cash to close, ${le.lock_status ?? "unknown lock"}${chosen}`;
  });
  return `## Loan Estimates\n${lines.join("\n")}`;
}

function buildRepairsBlock(repairs: RepairItem[]): string {
  if (!repairs.length) return "";
  const lines = repairs.map((r) => {
    const cost = r.estimated_cost ? ` (~${formatCurrency(r.estimated_cost)})` : "";
    return `- ${r.description}${cost} — ${r.severity ?? "unknown"} severity, ${r.status}`;
  });
  return `## Repair Items\n${lines.join("\n")}`;
}

function buildSavedHomesBlock(homes: SavedHome[]): string {
  if (!homes.length) return "";
  const lines = homes.map((h) => {
    const parts = [`- ${h.address}`];
    if (h.price) parts.push(`${formatCurrency(h.price)}`);
    const details: string[] = [];
    if (h.beds) details.push(`${h.beds} bed`);
    if (h.baths) details.push(`${h.baths} bath`);
    if (h.sqft) details.push(`${h.sqft} sqft`);
    if (details.length) parts.push(`(${details.join(", ")})`);
    parts.push(`— ${h.status}`);
    return parts.join(" ");
  });

  const prices = homes.map((h) => h.price).filter((p): p is number => p !== null);
  let summary = "";
  if (prices.length >= 2) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    summary = `\nPrice range of saved homes: ${formatCurrency(min)} – ${formatCurrency(max)}`;
  } else if (prices.length === 1) {
    summary = `\nTarget price: ${formatCurrency(prices[0])}`;
  }

  return `## Saved Homes (${homes.length})\n${lines.join("\n")}${summary}`;
}

function truncateContext(blocks: string[]): string {
  let total = "";
  for (const block of blocks) {
    if ((total + block).length > MAX_CONTEXT_CHARS) {
      const remaining = MAX_CONTEXT_CHARS - total.length;
      if (remaining > 500) {
        total += "\n\n" + block.slice(0, remaining) + "\n...(truncated)";
      }
      break;
    }
    total += (total ? "\n\n" : "") + block;
  }
  return total;
}

export async function assembleContext(dealId: string | null, phase: Phase, userId?: string): Promise<string> {
  const supabase = getSupabaseAdmin();

  if (phase === "shopping") {
    if (!userId) return "";
    const blocks: string[] = [];

    const { data: homes } = await supabase
      .from("saved_homes")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "removed")
      .order("created_at", { ascending: false });

    const savedHomes = (homes ?? []) as SavedHome[];
    if (savedHomes.length) blocks.push(buildSavedHomesBlock(savedHomes));

    if (dealId) {
      const { data: transaction } = await supabase.from("transactions").select("*").eq("id", dealId).single();
      if (transaction) blocks.push(buildTransactionSummary(transaction as Transaction));
    }

    return truncateContext(blocks);
  }

  if (!dealId) return "";

  const [dealRes, docsRes, deadlinesRes, lesRes, repairsRes] = await Promise.all([
    supabase.from("transactions").select("*").eq("id", dealId).single(),
    supabase.from("documents").select("*").eq("deal_id", dealId).order("created_at", { ascending: false }),
    supabase.from("deadlines").select("*").eq("deal_id", dealId).order("due_date", { ascending: true }),
    supabase.from("loan_estimates").select("*").eq("deal_id", dealId).order("created_at", { ascending: false }),
    supabase.from("repair_items").select("*").eq("deal_id", dealId).order("created_at", { ascending: false }),
  ]);

  if (dealRes.error) console.error("[context-engine] Failed to fetch transaction:", dealRes.error);
  if (docsRes.error) console.error("[context-engine] Failed to fetch documents:", docsRes.error);
  if (deadlinesRes.error) console.error("[context-engine] Failed to fetch deadlines:", deadlinesRes.error);
  if (lesRes.error) console.error("[context-engine] Failed to fetch loan estimates:", lesRes.error);
  if (repairsRes.error) console.error("[context-engine] Failed to fetch repairs:", repairsRes.error);

  const transaction = dealRes.data as Transaction | null;
  if (!transaction) return "";

  const blocks: string[] = [];

  blocks.push(buildTransactionSummary(transaction));

  if (phase === "offer") {
    return truncateContext(blocks);
  }

  const documents = (docsRes.data ?? []) as Document[];
  const estimates = (lesRes.data ?? []) as LoanEstimate[];

  if (phase === "post-close") {
    if (estimates.length) blocks.push(buildLoanEstimatesBlock(estimates));
    if (documents.length) {
      const docList = documents.map((d) => `- ${d.name} (${d.doc_type ?? "unclassified"})`).join("\n");
      blocks.push(`## Document Archive (${documents.length})\n${docList}`);
    }
    return truncateContext(blocks);
  }

  const deadlines = (deadlinesRes.data ?? []) as Deadline[];
  if (deadlines.length) blocks.push(buildDeadlinesBlock(deadlines));

  if (documents.length) blocks.push(buildDocumentsBlock(documents));

  if (estimates.length) blocks.push(buildLoanEstimatesBlock(estimates));

  const repairs = (repairsRes.data ?? []) as RepairItem[];
  if (repairs.length) blocks.push(buildRepairsBlock(repairs));

  return truncateContext(blocks);
}
