import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { assembleContext } from "@/lib/ai/context-engine";
import { getCopilotSystemPrompt } from "@/lib/ai/system-prompts";
import { rateLimit } from "@/lib/rate-limit";
import { createClient as createSupabaseServer } from "@/lib/supabase/server";
import type { Phase } from "@/lib/types";

const MAX_MESSAGE_LENGTH = 2000;

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

function selectModel(phase: Phase): string {
  return phase === "escrow" || phase === "closing" ? "gpt-4o" : "gpt-4o-mini";
}

function parseCitations(content: string): { documentName: string; page?: number; section?: string }[] {
  const citations: { documentName: string; page?: number; section?: string }[] = [];
  const regex = /\[([^\]]+?)(?:,\s*p\.?\s*(\d+))?(?:,\s*(.+?))?\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const name = match[1].trim();
    if (name.length > 2 && !name.startsWith("http")) {
      citations.push({
        documentName: name,
        page: match[2] ? parseInt(match[2]) : undefined,
        section: match[3]?.trim(),
      });
    }
  }
  return citations;
}

export async function POST(request: NextRequest) {
  try {
    // Auth: trust the session, never the body. Previously `userId` came from the JSON body,
    // which let any caller impersonate any user and exfiltrate their context through the LLM.
    const supabaseUser = await createSupabaseServer();
    const { data: authData, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: "unauthenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const userId = authData.user.id;

    const { transactionId, phase, message, history } = (await request.json()) as {
      transactionId: string | null;
      phase: Phase;
      message: string;
      history: { role: "user" | "assistant"; content: string }[];
    };

    if (!message) {
      return new Response(JSON.stringify({ error: "message required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const trimmed = message.trim();
    if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Message must be 1-${MAX_MESSAGE_LENGTH} characters` }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // If a transactionId is supplied, verify the user owns it (or is its agent) through the
    // RLS-bound client before assembleContext promotes to the admin client.
    if (transactionId) {
      const { data: txn, error: txnError } = await supabaseUser
        .from("transactions")
        .select("id")
        .eq("id", transactionId)
        .maybeSingle();
      if (txnError || !txn) {
        return new Response(JSON.stringify({ error: "transaction_not_found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const { limited } = rateLimit(`copilot:${userId}`, 30, 60_000);
    if (limited) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait a moment." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const openai = getOpenAI();
    const supabaseAdmin = getSupabaseAdmin();
    const model = selectModel(phase);

    const contextBlock = await assembleContext(transactionId, phase, userId);
    const systemPrompt = getCopilotSystemPrompt(phase, contextBlock);

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.slice(-20).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const stream = await openai.chat.completions.create({
      model,
      temperature: 0.4,
      max_tokens: 2000,
      stream: true,
      messages,
    });

    let fullContent = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              controller.enqueue(encoder.encode(delta));
            }
          }

          if (fullContent) {
            const citations = parseCitations(fullContent);
            const { error: insertError } = await supabaseAdmin.from("copilot_messages").insert({
              user_id: userId,
              deal_id: transactionId,
              role: "assistant",
              content: fullContent,
              citations: citations.length > 0 ? citations : null,
              phase,
            });
            if (insertError) {
              console.error("[copilot] Failed to save assistant message:", insertError);
            }
          }
        } catch (err) {
          console.error("[copilot] Stream error:", err);
          const errMsg = err instanceof Error ? err.message : "Unknown error";
          controller.enqueue(encoder.encode(`\n\n---\n⚠️ Sorry, something went wrong while generating a response. Please try again. (${errMsg})`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("[copilot] Unhandled error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
