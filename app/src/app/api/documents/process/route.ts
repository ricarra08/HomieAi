import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as pdfParse from "pdf-parse";
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parse = (pdfParse as any).default ?? pdfParse;
      const pdfData = await parse(buffer);
      extractedText = pdfData.text.trim();
    } catch {
      extractedText = "";
    }

    // Step 2: If text extraction failed or too short, try GPT-4o Vision
    if (extractedText.length < MIN_TEXT_LENGTH) {
      try {
        const base64 = buffer.toString("base64");
        const visionResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          max_tokens: 4096,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract all readable text from this document image. Return the text content only, no commentary.",
                },
                {
                  type: "image_url",
                  image_url: { url: `data:application/pdf;base64,${base64}` },
                },
              ],
            },
          ],
        });
        extractedText = visionResponse.choices[0]?.message?.content?.trim() ?? "";
      } catch {
        // Vision fallback failed — mark as needing manual review
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
              content: extractedText.slice(0, 3000),
            },
          ],
        });

        const parsed = JSON.parse(classifyResponse.choices[0]?.message?.content ?? "{}");
        docType = parsed.doc_type ?? "other";
        category = parsed.category ?? "other";
        stage = parsed.stage ?? "escrow";
      } catch {
        // Classification failed — keep defaults
      }
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
