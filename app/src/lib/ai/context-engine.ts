import { createClient } from "@supabase/supabase-js";
import { computeDeadlineUrgency, computeDaysRemaining } from "@/lib/computed";
import { isValidStateCode, getStateConfig } from "@/lib/state-configs";
import { fenceUntrustedContent, sanitizeFilename, makePromptNonce } from "@/lib/valuation/prompt-safety";
import { redactPiiText } from "@/lib/security/pii-redaction";
import type { StateConfig } from "@/lib/state-configs";
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

function buildDocumentsBlock(documents: Document[], nonce: string): string {
  if (!documents.length) return "";
  const sections: string[] = [];

  for (const doc of documents) {
    // Filename is attacker-controlled on collaborator uploads — sanitize before it reaches the model.
    const header = `### ${sanitizeFilename(doc.name)} (${doc.doc_type ?? "unclassified"})`;

    // Everything below is derived from the uploaded file (third-party / collaborator controlled).
    // Collect it, then wrap the whole block in a nonce fence so the model treats it as data, not
    // instructions (defends against indirect prompt injection via document text / OCR).
    const untrusted: string[] = [];

    if (doc.ai_summary) {
      untrusted.push(`**AI Summary:**\n${doc.ai_summary}`);
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
        untrusted.push(`**Extracted Fields:**\n${fieldLines.join("\n")}`);
      }
    }

    if (doc.extracted_text) {
      const rawText = doc.extracted_text.length > MAX_RAW_TEXT_PER_DOC
        ? doc.extracted_text.slice(0, MAX_RAW_TEXT_PER_DOC) + "\n...(document text truncated)"
        : doc.extracted_text;
      untrusted.push(`**Full Document Text:**\n${rawText}`);
    }

    // Redact-then-fence (H3 defense in depth): the choke point in /api/documents/process
    // already redacts new uploads, but this covers rows written before redaction existed.
    // Order is safe — the fence only strips control chars/nonce echoes, never adds digits.
    const section = untrusted.length
      ? `${header}\n\n${fenceUntrustedContent(redactPiiText(untrusted.join("\n\n")), nonce)}`
      : header;
    sections.push(section);
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

function buildStateContextBlock(config: StateConfig, transaction: Transaction): string {
  const lines: string[] = [
    `State: ${config.state_name} (${config.state_code})`,
    `Closing type: ${config.closing.type.replace("_", " ")} — ${config.closing.style} closing`,
    `Buyer protection: ${config.buyer_protection.label} — ${config.buyer_protection.description}`,
  ];

  if (config.option_period.enabled) {
    lines.push(`Option period: ${config.option_period.default_days} days typical. Non-refundable option fee ($${config.option_period.fee_typical_range?.[0]}-$${config.option_period.fee_typical_range?.[1]}) paid directly to seller.`);
  }

  if (config.contingency_removal.active_removal_required) {
    lines.push(`IMPORTANT: ${config.state_name} requires ACTIVE contingency removal. Buyer must submit a CR form — contingencies do NOT expire automatically.`);
    if (config.contingency_removal.nbp_mechanism) {
      lines.push(`Seller can issue a Notice to Buyer to Perform (NBP) — buyer then has ${config.contingency_removal.nbp_response_hours} hours to respond.`);
    }
  }

  // Insurance alerts
  const stateInsurance = config.insurance_types.filter((i) => i.state_specific);
  if (stateInsurance.length > 0) {
    const insuranceNotes = stateInsurance.map((i) => `${i.label}: ${i.notes ?? ""}`).join("; ");
    lines.push(`State insurance considerations: ${insuranceNotes}`);
  }

  // Tax notes
  if (config.taxes.mortgage_tax.exists) {
    lines.push(`Mortgage tax: $${config.taxes.mortgage_tax.rate_per_thousand}/K on mortgage amount (${config.state_name}-specific).`);
  }
  if (config.taxes.supplemental_tax) {
    lines.push(`HEADS UP: ${config.state_name} has supplemental property tax — buyer will receive an additional tax bill 6-12 months after closing.`);
  }
  const specialDistricts = config.taxes.special_districts.filter((d) => d.exists);
  if (specialDistricts.length > 0 && transaction.property_in_special_district) {
    const districtInfo = specialDistricts.map((d) => `${d.label} ($${d.typical_annual_range?.[0]}-$${d.typical_annual_range?.[1]}/yr)`).join(", ");
    lines.push(`Special tax district: ${districtInfo}`);
  }

  // Unique features summary
  if (config.unique_features.length > 0) {
    const features = config.unique_features.map((f) => f.feature).join(", ");
    lines.push(`Key ${config.state_name} features: ${features}`);
  }

  return `## State Context (${config.state_name})\n${lines.join("\n")}`;
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
  // One nonce per assembled context; tags every untrusted document-content fence.
  const nonce = makePromptNonce();

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

  // Inject state context when available
  if (transaction.state && isValidStateCode(transaction.state)) {
    const stateConfig = getStateConfig(transaction.state);
    blocks.push(buildStateContextBlock(stateConfig, transaction));
  }

  if (phase === "offer") {
    return truncateContext(blocks);
  }

  const documents = (docsRes.data ?? []) as Document[];
  const estimates = (lesRes.data ?? []) as LoanEstimate[];

  if (phase === "post-close") {
    if (estimates.length) blocks.push(buildLoanEstimatesBlock(estimates));
    if (documents.length) {
      const docList = documents.map((d) => `- ${sanitizeFilename(d.name)} (${d.doc_type ?? "unclassified"})`).join("\n");
      blocks.push(`## Document Archive (${documents.length})\n${docList}`);
    }
    return truncateContext(blocks);
  }

  const deadlines = (deadlinesRes.data ?? []) as Deadline[];
  if (deadlines.length) blocks.push(buildDeadlinesBlock(deadlines));

  if (documents.length) blocks.push(buildDocumentsBlock(documents, nonce));

  if (estimates.length) blocks.push(buildLoanEstimatesBlock(estimates));

  const repairs = (repairsRes.data ?? []) as RepairItem[];
  if (repairs.length) blocks.push(buildRepairsBlock(repairs));

  return truncateContext(blocks);
}
