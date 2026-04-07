import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { assembleContext } from "@/lib/ai/context-engine";
import { getCopilotSystemPrompt } from "@/lib/ai/system-prompts";
import type { Phase } from "@/lib/types";

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
    const { dealId, userId, phase, message, history } = (await request.json()) as {
      dealId: string | null;
      userId: string;
      phase: Phase;
      message: string;
      history: { role: "user" | "assistant"; content: string }[];
    };

    if (!message || !userId) {
      return new Response(JSON.stringify({ error: "message and userId required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const openai = getOpenAI();
    const supabaseAdmin = getSupabaseAdmin();
    const model = selectModel(phase);

    const contextBlock = await assembleContext(dealId, phase, userId);
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
              deal_id: dealId,
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
