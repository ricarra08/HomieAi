import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { timingSafeEqual } from "node:crypto";
import { extractText } from "unpdf";
import OpenAI from "openai";
import { isTier1, EXTRACTION_SCHEMAS, type Tier1DocType } from "@/lib/ai/extraction-schemas";
import { getExtractionSystemPrompt, getSummarizationSystemPrompt, TEXT_LIMITS } from "@/lib/ai/prompts";
import { mapExtractedToLE } from "@/lib/ai/le-auto-populate";
import { isInspectionSubtype } from "@/lib/documents/inspection-subtype";
import { isDocTypeInScope, shouldAutoPopulateFinancials } from "@/lib/documents/collaborator-scope";
import { rateLimit } from "@/lib/rate-limit";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";

/**
 * Constant-time comparison of two strings. Returns false if either is empty or lengths differ.
 * Used to authenticate server-to-server callers (e.g., /api/collaborator/upload) that don't have
 * an end-user session.
 */
function safeEqual(a: string, b: string): boolean {
  if (!a || !b) return false;
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

async function authorize(request: NextRequest, documentId: string): Promise<
  | { ok: true; mode: "user" | "internal" }
  | { ok: false; status: number; error: string }
> {
  // Internal trigger path: collaborator-upload route invokes us server-to-server because the
  // collaborator is unauthenticated. Gate that path on a shared secret.
  const internalSecret = request.headers.get("x-internal-secret");
  const expectedSecret = process.env.INTERNAL_API_SECRET;
  if (internalSecret && expectedSecret && safeEqual(internalSecret, expectedSecret)) {
    return { ok: true, mode: "internal" };
  }

  // End-user path: verify session, then prove ownership through the RLS-bound client.
  const supabase = await createSupabaseServer();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return { ok: false, status: 401, error: "unauthenticated" };
  }
  const { data: doc, error } = await supabase
    .from("documents")
    .select("id")
    .eq("id", documentId)
    .maybeSingle();
  if (error || !doc) {
    return { ok: false, status: 404, error: "Document not found" };
  }
  return { ok: true, mode: "user" };
}

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const CLASSIFICATION_TAXONOMY = [
  "purchase_contract",
  "loan_estimate",
  "closing_disclosure",
  "inspection_report",
  "appraisal",
  "title_report",
  "disclosure",
  "insurance_binder",
  "pre_approval",
  "proof_of_funds",
  "other",
] as const;

const MIN_TEXT_LENGTH = 50;

async function extractFields(
  openai: OpenAI,
  docType: Tier1DocType,
  text: string
): Promise<Record<string, unknown>> {
  const schema = EXTRACTION_SCHEMAS[docType];
  const systemPrompt = getExtractionSystemPrompt(docType);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    temperature: 0,
    response_format: { type: "json_schema", json_schema: schema },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text.slice(0, TEXT_LIMITS.extraction) },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(raw);
}

async function summarizeDocument(
  openai: OpenAI,
  docType: string,
  text: string
): Promise<string> {
  const systemPrompt = getSummarizationSystemPrompt(docType);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.3,
    max_tokens: 1500,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text.slice(0, TEXT_LIMITS.summarization) },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}

export async function POST(request: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();
  let documentId: string | undefined;

  try {
    const body = await request.json();
    documentId = body.documentId;

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    // Previously this route was unauthenticated. Anyone who knew (or guessed) a documentId
    // could trigger reprocessing of any document and force OpenAI calls. Gate it here.
    const authResult = await authorize(request, documentId);
    if (!authResult.ok) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Rate limit by documentId to prevent reprocess spam
    const { limited } = rateLimit(`doc-process:${documentId}`, 3, 60_000);
    if (limited) {
      return NextResponse.json(
        { error: "Too many processing requests. Please wait." },
        { status: 429 }
      );
    }

    const openai = getOpenAI();

    // --- Fetch document metadata ---
    const { data: doc, error: docError } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // --- Download PDF ---
    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from("deal-documents")
      .download(doc.file_path);

    if (fileError || !fileData) {
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());

    // --- Step 1: Extract text ---
    let extractedText = "";
    try {
      const uint8 = new Uint8Array(buffer);
      const { text } = await extractText(uint8);
      extractedText = (Array.isArray(text) ? text.join("\n") : text).trim();
    } catch (e) {
      console.log("[doc-process] text extraction failed:", e);
    }

    console.log(`[doc-process] extracted ${extractedText.length} chars`);

    // --- Step 2: GPT-4o vision fallback for watermarked/scanned/image PDFs ---
    if (extractedText.length < MIN_TEXT_LENGTH) {
      console.log("[doc-process] Text too short, trying GPT-4o vision extraction...");
      try {
        const base64Pdf = buffer.toString("base64");
        const reconstructResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          max_tokens: 4096,
          messages: [
            {
              role: "system",
              content:
                "You are a document text extractor. The user will provide a PDF file. " +
                "Extract ALL readable text from every page, ignoring any watermarks or stamps. " +
                "Preserve the document structure (sections, tables, line items). " +
                "If the document is completely unreadable, say UNREADABLE.",
            },
            {
              role: "user",
              content: [
                {
                  type: "file",
                  file: {
                    filename: doc.name,
                    file_data: `data:application/pdf;base64,${base64Pdf}`,
                  },
                },
                {
                  type: "text",
                  text: "Extract all text from this real estate document. Ignore any watermarks.",
                },
              ],
            },
          ],
        });
        const result = reconstructResponse.choices[0]?.message?.content?.trim() ?? "";
        if (result && !result.toUpperCase().startsWith("UNREADABLE")) {
          extractedText = result;
        }
        console.log(`[doc-process] Vision extraction produced ${extractedText.length} chars`);
      } catch (e) {
        console.log("[doc-process] Vision extraction failed:", e);
      }
    }

    // --- Step 3: Classify document ---
    let docType = "other";
    let category = "other";
    let stage = "escrow";

    const preClassified = doc.doc_type && doc.doc_type !== "other";
    if (preClassified) {
      docType = doc.doc_type;
      category = doc.category ?? "other";
      stage = doc.stage ?? "escrow";
      console.log(`[doc-process] Pre-classified as ${docType}/${category}, skipping AI classification`);
    } else if (extractedText.length >= MIN_TEXT_LENGTH) {
      try {
        const classifyResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          temperature: 0,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: `You are a document classifier for real estate transactions. Given the text of a document, classify it into exactly one type. Return JSON with: { "doc_type": string, "category": string, "stage": string }

Valid doc_type values: ${CLASSIFICATION_TAXONOMY.join(", ")}

Category mapping:
- purchase_contract, pre_approval, proof_of_funds → "offer"
- loan_estimate → "financing"
- closing_disclosure → "closing"
- inspection_report → "inspections"
- appraisal → "appraisal"
- title_report → "escrow_title"
- disclosure → "disclosures"
- insurance_binder → "insurance"
- other → "other"

Stage mapping:
- pre_approval, proof_of_funds → "offer"
- purchase_contract, disclosure → "escrow"
- loan_estimate, inspection_report, appraisal, title_report, insurance_binder → "escrow"
- closing_disclosure → "closing"
- other → "escrow"`,
            },
            {
              role: "user",
              content: extractedText.slice(0, TEXT_LIMITS.classification),
            },
          ],
        });

        const raw = classifyResponse.choices[0]?.message?.content ?? "{}";
        console.log("[doc-process] Classification:", raw);
        const parsed = JSON.parse(raw);
        docType = parsed.doc_type ?? "other";
        category = parsed.category ?? "other";
        stage = parsed.stage ?? "escrow";
      } catch (e) {
        console.log("[doc-process] Classification failed:", e);
      }
    } else {
      console.log("[doc-process] Skipping classification — insufficient text");
    }

    // --- Step 4: Staged save — classification results + status: processing ---
    const confidenceScore = extractedText.length >= MIN_TEXT_LENGTH ? 0.8 : 0.3;

    const { error: classifyUpdateError } = await supabaseAdmin
      .from("documents")
      .update({
        extracted_text: extractedText || null,
        doc_type: docType,
        category,
        stage,
        confidence_score: confidenceScore,
        status: "processing",
      })
      .eq("id", documentId);

    if (classifyUpdateError) {
      console.error("[doc-process] Classification save failed:", classifyUpdateError);
      return NextResponse.json({ error: "Failed to save classification" }, { status: 500 });
    }

    // --- Step 5: Field extraction (Tier 1) + Summarization in parallel ---
    let extractedFields: Record<string, unknown> | null = null;
    let aiSummary: string | null = null;
    let finalStatus: "processed" | "failed" = "failed";

    if (extractedText.length >= MIN_TEXT_LENGTH) {
      const tier1 = isTier1(docType);

      const jobs: Promise<{ type: "extraction" | "summary"; result: unknown }>[] = [];

      if (tier1) {
        jobs.push(
          extractFields(openai, docType as Tier1DocType, extractedText)
            .then((r) => ({ type: "extraction" as const, result: r }))
        );
      }

      jobs.push(
        summarizeDocument(openai, docType, extractedText)
          .then((r) => ({ type: "summary" as const, result: r }))
      );

      const results = await Promise.allSettled(jobs);

      for (const settled of results) {
        if (settled.status === "fulfilled") {
          if (settled.value.type === "extraction") {
            extractedFields = settled.value.result as Record<string, unknown>;
            console.log("[doc-process] Extraction complete");
          } else {
            aiSummary = settled.value.result as string;
            console.log(`[doc-process] Summary: ${(aiSummary ?? "").length} chars`);
          }
        } else {
          console.log(`[doc-process] ${settled.reason}`);
        }
      }

      const anySucceeded = extractedFields !== null || (aiSummary && aiSummary.length > 0);
      finalStatus = anySucceeded ? "processed" : "failed";
    } else {
      finalStatus = "processed";
    }

    // --- Step 5.5: Enforce collaborator link scope (M-2) ---
    // Collaborator uploads are unauthenticated (token-only). Flag for owner review any document
    // whose classified type falls outside the originating link's role/requested scope — e.g. an
    // "inspector" link that yields a "loan_estimate". Advisory (recorded in extracted_fields), so
    // it never blocks a legitimate-but-misclassified upload; the financial-write gate below is the
    // hard control.
    let scopeFlagged = false;
    if (doc.source_type === "collaborator-upload" && doc.collaborator_link_id) {
      const { data: link } = await supabaseAdmin
        .from("collaborator_links")
        .select("recipient_role, requested_documents")
        .eq("id", doc.collaborator_link_id)
        .maybeSingle();
      if (link && !isDocTypeInScope(link.recipient_role, link.requested_documents, docType)) {
        scopeFlagged = true;
        console.warn(
          `[doc-process] Out-of-scope collaborator upload: role=${link.recipient_role} classified=${docType} doc=${documentId}`,
        );
      }
    }

    // --- Step 6: Final save (merge prior extracted_fields with AI output) ---
    const priorFields = (doc.extracted_fields && typeof doc.extracted_fields === "object" && !Array.isArray(doc.extracted_fields))
      ? (doc.extracted_fields as Record<string, unknown>)
      : {};
    const aiFields = (extractedFields && typeof extractedFields === "object")
      ? extractedFields
      : {};
    const mergedFields: Record<string, unknown> = { ...priorFields, ...aiFields };

    if (docType === "inspection_report") {
      const slot = mergedFields._inspection_slot;
      if (typeof slot === "string" && isInspectionSubtype(slot)) {
        mergedFields.inspection_type = { value: slot, confidence: 1 };
      }
    }

    // Metadata-only key (no `.value`), so it is excluded from LLM context/prompt assembly and from
    // LE field mapping; the UI can surface it to warn the owner this upload was outside link scope.
    if (scopeFlagged) {
      mergedFields._scope_warning = { classified: docType, in_scope: false };
    }

    const finalFields = Object.keys(mergedFields).length > 0 ? mergedFields : null;

    const { error: updateError } = await supabaseAdmin
      .from("documents")
      .update({
        extracted_fields: finalFields,
        ai_summary: aiSummary,
        status: finalStatus,
      })
      .eq("id", documentId);

    if (updateError) {
      console.error("[doc-process] Final update failed:", updateError);
      return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
    }

    // --- Step 7: Auto-populate loan_estimates if LE extracted ---
    // Hard control (M-2): NEVER auto-populate the authoritative loan_estimates table from a
    // collaborator-sourced upload — those are unauthenticated and could carry attacker-chosen
    // lender/rate/fee values. The owner reviews the classified doc and adds the LE manually.
    let leAutoCreated = false;
    let leAutoSkippedForReview = false;
    if (docType === "loan_estimate" && extractedFields && doc.deal_id && !shouldAutoPopulateFinancials(doc.source_type)) {
      leAutoSkippedForReview = true;
      console.log("[doc-process] Skipping LE auto-populate for collaborator upload — owner review required");
    } else if (docType === "loan_estimate" && extractedFields && doc.deal_id) {
      try {
        const leRow = mapExtractedToLE(extractedFields, documentId!, doc.deal_id);

        const { data: existingLE } = await supabaseAdmin
          .from("loan_estimates")
          .select("id")
          .eq("pdf_document_id", documentId!)
          .maybeSingle();

        if (existingLE) {
          const { error: updateErr } = await supabaseAdmin
            .from("loan_estimates")
            .update(leRow)
            .eq("id", existingLE.id);
          if (updateErr) {
            console.error("[doc-process] Auto-update LE failed:", updateErr);
          } else {
            leAutoCreated = true;
            console.log("[doc-process] Updated existing loan_estimates row");
          }
        } else {
          const { error: insertErr } = await supabaseAdmin
            .from("loan_estimates")
            .insert(leRow);
          if (insertErr) {
            console.error("[doc-process] Auto-populate LE failed:", insertErr);
          } else {
            leAutoCreated = true;
            console.log("[doc-process] Auto-populated loan_estimates row");
          }
        }
      } catch (e) {
        console.error("[doc-process] Auto-populate LE error:", e);
      }
    }

    return NextResponse.json({
      success: true,
      documentId,
      docType,
      category,
      stage,
      textLength: extractedText.length,
      confidenceScore,
      fieldsExtracted: extractedFields !== null,
      summarized: aiSummary !== null && aiSummary.length > 0,
      leAutoCreated,
      leAutoSkippedForReview,
      scopeFlagged,
      status: finalStatus,
    });
  } catch (error) {
    console.error("[doc-process] Unhandled error:", error);

    if (documentId) {
      try {
        await supabaseAdmin
          .from("documents")
          .update({ status: "failed" })
          .eq("id", documentId);
      } catch {
        // best-effort status update
      }
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
