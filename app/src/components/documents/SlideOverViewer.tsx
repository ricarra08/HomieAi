"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Download, FileText, Sparkles, Lightbulb, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/lib/store";
import { useQueryClient } from "@tanstack/react-query";
import { documentKeys } from "@/lib/hooks/query-keys";
import { createClient } from "@/lib/supabase/client";
import type { Document } from "@/lib/types";

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDocType(docType: string | null): string {
  if (!docType) return "Unknown";
  return docType
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatFieldKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const CURRENCY_FIELDS = new Set([
  "purchase_price", "earnest_money", "loan_amount", "cash_to_close",
  "final_cash_to_close", "estimated_total_closing", "lender_fees",
  "third_party_fees", "pmi_monthly", "monthly_pi", "prorations",
  "seller_credits", "recording_fees", "transfer_taxes", "prepaid_items",
  "initial_escrow", "estimated_cost", "agreed_cost", "annual_premium",
  "coverage_dwelling", "deductible",
]);

function formatFieldValue(value: unknown, fieldKey?: string): string {
  if (value == null) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (fieldKey && CURRENCY_FIELDS.has(fieldKey)) return `$${value.toLocaleString()}`;
    return value.toLocaleString();
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    if (typeof value[0] === "string") return value.join(", ");
    return `${value.length} items`;
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground font-medium text-right max-w-[60%]">{value}</span>
    </div>
  );
}

const DISPLAY_FIELDS: Record<string, string[]> = {
  purchase_contract: ["property_address", "purchase_price", "buyer_names", "seller_names", "contract_date", "closing_date", "earnest_money", "inspection_period_days", "financing_contingency_days"],
  loan_estimate: ["lender_name", "loan_product", "loan_amount", "interest_rate", "apr", "monthly_pi", "cash_to_close", "down_payment_pct", "lock_status"],
  closing_disclosure: ["lender_name", "loan_amount", "interest_rate", "final_cash_to_close", "lender_fees", "third_party_fees", "prorations", "seller_credits"],
  inspection_report: ["inspector_name", "inspection_date", "inspection_type", "overall_condition", "major_findings", "minor_findings", "recommended_actions"],
};

function ExtractedFieldsPanel({ doc }: { doc: Document }) {
  const fields = doc.extracted_fields as Record<string, { value: unknown; confidence?: string }> | null;
  if (!fields) return null;

  const displayKeys = DISPLAY_FIELDS[doc.doc_type ?? ""] ?? Object.keys(fields).slice(0, 10);

  const visibleFields = displayKeys
    .filter((key) => fields[key]?.value != null && fields[key].value !== "" && fields[key].value !== null)
    .map((key) => ({
      key,
      label: formatFieldKey(key),
      value: formatFieldValue(fields[key].value, key),
      confidence: fields[key].confidence as string | undefined,
    }));

  if (!visibleFields.length) return null;

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-2">Extracted Data</h4>
      {visibleFields.map((f) => (
        <div key={f.key} className="flex items-start justify-between py-1.5 border-b border-border last:border-0">
          <span className="text-sm text-muted-foreground">{f.label}</span>
          <span className="text-sm text-foreground font-medium text-right max-w-[60%] flex items-center gap-1.5">
            {f.value}
            {f.confidence === "low" && (
              <span className="inline-block w-2 h-2 rounded-full bg-warning shrink-0" title="Low confidence — verify this value" />
            )}
          </span>
        </div>
      ))}
    </div>
  );
}

interface DraftQuestion {
  text: string;
  recipient: string;
}

function DraftQuestionPanel({ doc }: { doc: Document }) {
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const { setCopilotOpen } = useUIStore();

  async function handleDraft() {
    setLoading(true);
    try {
      const res = await fetch("/api/copilot/draft-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: doc.id }),
      });
      if (!res.ok) throw new Error(`Draft question failed: ${res.status}`);
      const data = await res.json();
      setQuestions(data.questions ?? []);
      setFetched(true);
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSendToCopilot(question: string) {
    setCopilotOpen(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("copilot:prefill", { detail: question }));
    }, 150);
  }

  if (!doc.ai_summary && !doc.extracted_fields) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-accent" />
        <h4 className="text-sm font-semibold text-foreground">Smart Questions</h4>
      </div>
      {!fetched ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDraft}
          disabled={loading}
          className="w-full text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Lightbulb className="w-3.5 h-3.5 mr-1.5" />
              Draft questions about this document
            </>
          )}
        </Button>
      ) : questions.length > 0 ? (
        <div className="space-y-2">
          {questions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSendToCopilot(q.text)}
              className="w-full text-left p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <p className="text-sm text-foreground leading-snug">{q.text}</p>
              <span className="text-xs text-muted-foreground mt-1 block">
                Ask your {q.recipient}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          No questions generated for this document.
        </p>
      )}
    </div>
  );
}

export function DocumentDetailView({ doc }: { doc: Document }) {
  const closeViewer = useUIStore((s) => s.closeViewer);
  const qc = useQueryClient();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    createClient().storage
      .from("deal-documents")
      .createSignedUrl(doc.file_path, 3600)
      .then(({ data }) => {
        if (!cancelled && data?.signedUrl) setSignedUrl(data.signedUrl);
      });
    return () => { cancelled = true; };
  }, [doc.file_path]);

  async function handleDownload() {
    const sb = createClient();
    const { data, error } = await sb.storage
      .from("deal-documents")
      .download(doc.file_path);
    if (error || !data) return;
    const url = URL.createObjectURL(data);
    const a = window.document.createElement("a");
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={closeViewer}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <h2 className="text-xl font-semibold text-foreground truncate">{doc.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge className="bg-blue-50 text-blue-700 text-xs">
                {formatDocType(doc.doc_type)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatFileSize(doc.file_size)}
              </span>
            </div>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleDownload}
          className="text-sm shrink-0"
        >
          <Download className="w-4 h-4 mr-1.5" />
          Download
        </Button>
      </div>

      {/* Body: PDF left, sidebar right */}
      <div className="flex-1 flex gap-0 rounded-xl border border-border shadow-sm overflow-hidden bg-card">
        {/* PDF Preview */}
        <div className="flex-1 bg-muted/30 min-w-0">
          {signedUrl ? (
            <iframe
              src={`${signedUrl}#toolbar=0`}
              className="w-full h-full border-0"
              title={doc.name}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Loading preview...
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="w-[320px] shrink-0 border-l border-border overflow-y-auto">
          <div className="p-5 space-y-4">
            {/* Document Metadata */}
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Details</h4>
              <MetaRow label="Type" value={formatDocType(doc.doc_type)} />
              <MetaRow label="Category" value={doc.category ?? "—"} />
              <MetaRow label="Stage" value={doc.stage ?? "—"} />
              <MetaRow label="Status" value={doc.status} />
              {doc.confidence_score !== null && (
                <MetaRow
                  label="Confidence"
                  value={`${Math.round(doc.confidence_score * 100)}%`}
                />
              )}
              <MetaRow
                label="Uploaded"
                value={new Date(doc.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              />
            </div>

            {/* AI Summary */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <h4 className="text-sm font-semibold text-foreground">AI Summary</h4>
              </div>
              {doc.status === "processing" ? (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="h-3 bg-muted rounded animate-pulse w-full" />
                  <div className="h-3 bg-muted rounded animate-pulse w-5/6" />
                  <div className="h-3 bg-muted rounded animate-pulse w-4/6" />
                  <p className="text-xs text-muted-foreground mt-3 text-center">Analyzing document...</p>
                </div>
              ) : doc.status === "failed" ? (
                <div className="bg-destructive/5 rounded-lg p-4 text-center">
                  <p className="text-sm text-destructive font-medium">Analysis failed</p>
                  <button
                    onClick={() => {
                      qc.invalidateQueries({ queryKey: documentKeys.list(doc.deal_id) });
                      fetch("/api/documents/process", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ documentId: doc.id }),
                      }).then(() => {
                        qc.invalidateQueries({ queryKey: documentKeys.list(doc.deal_id) });
                      });
                    }}
                    className="text-sm text-accent hover:underline mt-1"
                  >
                    Retry analysis
                  </button>
                </div>
              ) : doc.ai_summary ? (
                <div className="text-sm text-foreground leading-relaxed">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
                      li: ({ children }) => <li>{children}</li>,
                      h1: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
                      h2: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
                      h3: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
                    }}
                  >
                    {doc.ai_summary}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    No summary available for this document.
                  </p>
                </div>
              )}
            </div>

            {/* Extracted Fields */}
            <ExtractedFieldsPanel doc={doc} />

            {/* Draft Questions */}
            <DraftQuestionPanel doc={doc} />
          </div>
        </div>
      </div>
    </div>
  );
}
