import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { extractText } from "unpdf";
import OpenAI from "openai";

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

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const openai = getOpenAI();

    const { data: doc, error: docError } = await supabaseAdmin
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const { data: fileData, error: fileError } = await supabaseAdmin.storage
      .from("deal-documents")
      .download(doc.file_path);

    if (fileError || !fileData) {
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());

    // Step 1: Extract text
    let extractedText = "";
    try {
      const uint8 = new Uint8Array(buffer);
      const { text } = await extractText(uint8);
      extractedText = (Array.isArray(text) ? text.join("\n") : text).trim();
    } catch (e) {
      console.log("[doc-process] text extraction failed:", e);
      extractedText = "";
    }

    console.log(`[doc-process] pdf-parse extracted ${extractedText.length} chars`);

    // Step 2: If text extraction failed or too short, try GPT-4o text reconstruction
    if (extractedText.length < MIN_TEXT_LENGTH) {
      console.log("[doc-process] Text too short, trying GPT-4o text reconstruction...");
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
        if (result && result !== "UNREADABLE") {
          extractedText = result;
        }
        console.log(`[doc-process] Reconstruction produced ${extractedText.length} chars`);
      } catch (e) {
        console.log("[doc-process] Text reconstruction failed:", e);
      }
    }

    // Step 3: Classify document
    let docType = "other";
    let category = "other";
    let stage = "escrow";

    if (extractedText.length >= MIN_TEXT_LENGTH) {
      try {
        const classifyResponse = await openai.chat.completions.create({
          model: "gpt-4o",
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
              content: extractedText.slice(0, 6000),
            },
          ],
        });

        const raw = classifyResponse.choices[0]?.message?.content ?? "{}";
        console.log("[doc-process] Classification response:", raw);
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

    // Step 4: Update document with extraction results
    const confidenceScore = extractedText.length >= MIN_TEXT_LENGTH ? 0.8 : 0.3;

    const { error: updateError } = await supabaseAdmin
      .from("documents")
      .update({
        extracted_text: extractedText || null,
        doc_type: docType,
        category,
        stage,
        confidence_score: confidenceScore,
        status: extractedText.length >= MIN_TEXT_LENGTH ? "uploaded" : "uploaded",
      })
      .eq("id", documentId);

    if (updateError) {
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
    });
  } catch (error) {
    console.error("Document processing error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
