import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractText } from "unpdf";
import OpenAI from "openai";
import { isTier1, EXTRACTION_SCHEMAS, type Tier1DocType } from "@/lib/ai/extraction-schemas";
import { getExtractionSystemPrompt, getSummarizationSystemPrompt, TEXT_LIMITS } from "@/lib/ai/prompts";

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

    // --- Step 2: GPT-4o reconstruction fallback for scanned/image PDFs ---
    if (extractedText.length < MIN_TEXT_LENGTH) {
      console.log("[doc-process] Text too short, trying GPT-4o reconstruction...");
      try {
        const partialText = extractedText || "(no text could be extracted from this PDF)";
        const reconstructResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          max_tokens: 4096,
          messages: [
            {
              role: "system",
              content: "You are a document text extractor. The user will provide partial or garbled text extracted from a real estate PDF document. Reconstruct and return the readable text content. If the text is empty or unusable, say UNREADABLE.",
            },
            {
              role: "user",
              content: `Partial text from PDF (${buffer.length} bytes, filename: ${doc.name}):\n\n${partialText}`,
            },
          ],
        });
        const result = reconstructResponse.choices[0]?.message?.content?.trim() ?? "";
        if (result && !result.toUpperCase().startsWith("UNREADABLE")) {
          extractedText = result;
        }
        console.log(`[doc-process] Reconstruction produced ${extractedText.length} chars`);
      } catch (e) {
        console.log("[doc-process] Reconstruction failed:", e);
      }
    }

    // --- Step 3: Classify document ---
    let docType = "other";
    let category = "other";
    let stage = "escrow";

    if (extractedText.length >= MIN_TEXT_LENGTH) {
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
- appraisal → "inspections"
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

    // --- Step 6: Final save ---
    const { error: updateError } = await supabaseAdmin
      .from("documents")
      .update({
        extracted_fields: extractedFields,
        ai_summary: aiSummary,
        status: finalStatus,
      })
      .eq("id", documentId);

    if (updateError) {
      console.error("[doc-process] Final update failed:", updateError);
      return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
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
