import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const DOC_TYPE_CONTEXT: Record<string, string> = {
  purchase_contract: "This is a Purchase Contract. Generate questions the buyer might want to ask their agent about contingency timelines, special terms, or negotiation points.",
  loan_estimate: "This is a Loan Estimate. Generate questions the buyer might want to ask their lender about rates, fees, lock status, or comparison with other offers.",
  closing_disclosure: "This is a Closing Disclosure. Generate questions about fee changes from the original estimate, tolerance violations, or items to verify before signing.",
  inspection_report: "This is an Inspection Report. Generate questions about repair negotiations, severity of findings, specialist referrals, and cost estimates.",
  appraisal: "This is an Appraisal. Generate questions about the appraised value, comparable sales, and what to do if there's an appraisal gap.",
  title_report: "This is a Title Report. Generate questions about liens, easements, exceptions, and title insurance coverage.",
  disclosure: "This is a Seller Disclosure. Generate questions about disclosed defects, maintenance history, and items to investigate further.",
  insurance_binder: "This is an Insurance Binder. Generate questions about coverage amounts, deductibles, and whether the policy meets lender requirements.",
};

export async function POST(request: NextRequest) {
  try {
    // Auth + ownership via RLS-bound client. Previously this route used the service-role admin
    // client with no auth check, exposing any document's AI summary/extracted fields to anyone
    // who could guess (or harvest) a documentId.
    const supabase = await createSupabaseServer();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    const openai = getOpenAI();

    const { data: doc, error } = await supabase
      .from("documents")
      .select("name, doc_type, ai_summary, extracted_fields")
      .eq("id", documentId)
      .maybeSingle();

    if (error || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const typeContext = DOC_TYPE_CONTEXT[doc.doc_type] ?? "This is a real estate document. Generate helpful questions the buyer might want to ask their agent, lender, or escrow officer.";

    let docContext = `Document: ${doc.name}\nType: ${doc.doc_type ?? "unknown"}`;
    if (doc.ai_summary) {
      docContext += `\n\nSummary:\n${doc.ai_summary.slice(0, 2000)}`;
    }
    if (doc.extracted_fields) {
      const fields = doc.extracted_fields as Record<string, { value: unknown }>;
      const keyFields = Object.entries(fields)
        .filter(([, v]) => v?.value != null && v.value !== "")
        .slice(0, 10)
        .map(([k, v]) => `${k}: ${v.value}`)
        .join(", ");
      if (keyFields) docContext += `\n\nExtracted fields: ${keyFields}`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a homebuying assistant helping a buyer draft smart questions about a document.

${typeContext}

Return a JSON object with a "questions" array. Each item has:
- "text": the question (1-2 sentences, specific to this document)
- "recipient": who to ask ("agent", "lender", "escrow officer", "inspector", or "title company")

Generate exactly 3 questions. Make them specific to the document content, not generic.`,
        },
        { role: "user", content: docContext },
      ],
    });

    const raw = response.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw);

    return NextResponse.json({
      questions: parsed.questions ?? [],
    });
  } catch (error) {
    console.error("[draft-question] Error:", error);
    return NextResponse.json({ error: "Failed to generate questions" }, { status: 500 });
  }
}
