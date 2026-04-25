"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useUIStore, type Phase } from "@/lib/store";
import { useCopilotMessages } from "@/lib/hooks/queries";
import { useSendCopilotMessage } from "@/lib/hooks/mutations";
import { useStreamingChat } from "@/lib/hooks/use-streaming-chat";
import { createClient } from "@/lib/supabase/client";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PHASE_QUICK_ACTIONS: Record<Phase, string[]> = {
  shopping: [
    "What should I look for in a home?",
    "Explain pre-approval",
    "How much can I afford?",
  ],
  offer: [
    "Explain contingencies",
    "What is earnest money?",
    "Offer strategy tips",
  ],
  escrow: [
    "Explain this document",
    "What are my deadlines?",
    "Calculate closing costs",
  ],
  closing: [
    "Explain my Closing Disclosure",
    "What changed from my Loan Estimate?",
    "Walk me through the wire process",
    "What should I bring to signing?",
  ],
  "post-close": [
    "Summarize my deal",
    "What should new homeowners do first?",
    "Explain my mortgage terms",
  ],
};

const PAGE_QUICK_ACTIONS: Record<string, string[]> = {
  "/financing": [
    "Compare my loan estimates",
    "Explain APR vs interest rate",
    "Is my rate competitive?",
    "What fees can I negotiate?",
  ],
  "/documents": [
    "Explain this document",
    "What are my deadlines?",
    "Summarize my uploaded docs",
  ],
  "/dashboard": [
    "What are my upcoming deadlines?",
    "Summarize my inspection findings",
    "Is my earnest money confirmed?",
    "What documents am I missing?",
  ],
};

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
        em: ({ children }) => <em>{children}</em>,
        ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
        li: ({ children }) => <li>{children}</li>,
        h1: ({ children }) => <p className="font-semibold text-base mb-1">{children}</p>,
        h2: ({ children }) => <p className="font-semibold text-base mb-1">{children}</p>,
        h3: ({ children }) => <p className="font-semibold text-sm mb-1">{children}</p>,
        code: ({ children }) => (
          <code className="bg-foreground/5 px-1 py-0.5 rounded text-sm">{children}</code>
        ),
        a: ({ href, children }) => (
          <a href={href} className="text-accent underline" target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function AICopilotButton() {
  const { copilotOpen, toggleCopilot } = useUIStore();

  if (copilotOpen) return null;

  return (
    <button
      onClick={toggleCopilot}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-accent-foreground flex items-center justify-center transition-shadow hover:shadow-xl"
      style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.07), 0 10px 15px rgba(0,0,0,0.1)" }}
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}

export function AICopilotPanel() {
  const { copilotOpen, setCopilotOpen, activeDealId, currentPhase } = useUIStore();
  const pathname = usePathname();
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: messages } = useCopilotMessages(activeDealId);
  const sendUserMsg = useSendCopilotMessage(userId ?? "", activeDealId, currentPhase);
  const { sendMessage, streamingContent, isStreaming } = useStreamingChat();

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, []);

  const scrollToBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const viewport = el.querySelector("[data-slot='scroll-area-viewport']");
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  const handleSendRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    handleSendRef.current = (text: string) => {
      const content = text.trim();
      if (!content || !userId || isStreaming) return;
      setInput("");
      sendUserMsg.mutate(content);
      const history = (messages ?? []).slice(-20).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));
      sendMessage({ message: content, dealId: activeDealId, userId, phase: currentPhase, history });
    };
  }, [userId, isStreaming, messages, activeDealId, currentPhase, sendUserMsg, sendMessage]);

  useEffect(() => {
    function handlePrefill(e: Event) {
      const text = (e as CustomEvent<string>).detail;
      if (text) handleSendRef.current(text);
    }
    window.addEventListener("copilot:prefill", handlePrefill);

    // Flush any prefill that arrived before the panel mounted
    const pending = (window as unknown as Record<string, string>).__pendingCopilotPrefill;
    if (pending) {
      handleSendRef.current(pending);
      delete (window as unknown as Record<string, string>).__pendingCopilotPrefill;
    }

    return () => window.removeEventListener("copilot:prefill", handlePrefill);
  }, []);

  if (!copilotOpen) return null;

  const pageActions = Object.entries(PAGE_QUICK_ACTIONS).find(([path]) => pathname?.startsWith(path));
  const quickActions = pageActions?.[1] ?? PHASE_QUICK_ACTIONS[currentPhase] ?? PHASE_QUICK_ACTIONS.escrow;

  function handleSend(text?: string) {
    handleSendRef.current((text ?? input).trim() ? (text ?? input) : "");
  }

  return (
    <div className="w-80 xl:w-96 bg-card border-l border-border flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <h2 className="text-xl font-semibold">Homie</h2>
        <button
          onClick={() => setCopilotOpen(false)}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-hidden">
        <div
          className="h-full overflow-y-auto"
          data-slot="scroll-area-viewport"
        >
          <div className="p-4 space-y-4">
            {/* Welcome message if no history */}
            {(!messages || messages.length === 0) && !streamingContent && (
              <div className="bg-muted rounded-xl p-4 text-base text-foreground leading-relaxed">
                <p>
                  Hi there! I&apos;m Homie, your AI homebuying assistant. I can help you
                  understand documents, explain the process, or answer questions about
                  your deal. What would you like to know?
                </p>
                <span className="text-sm text-muted-foreground mt-2 block">Just now</span>
              </div>
            )}

            {/* Message history */}
            {messages?.map((msg) => (
              <div
                key={msg.id}
                className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={`max-w-[85%] rounded-xl p-3.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent/10 text-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <MarkdownContent content={msg.content} />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  <span className="text-xs text-muted-foreground mt-1.5 block">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              </div>
            ))}

            {/* Streaming response */}
            {streamingContent && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-xl p-3.5 text-sm leading-relaxed bg-muted text-foreground">
                  <MarkdownContent content={streamingContent} />
                  <span className="inline-block w-1.5 h-4 bg-accent/60 animate-pulse ml-0.5 rounded-sm" />
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isStreaming && !streamingContent && (
              <div className="flex justify-start">
                <div className="rounded-xl p-3.5 bg-muted">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border space-y-3">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Homie anything..."
            disabled={isStreaming || !userId}
            className="flex-1 text-base px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:opacity-50"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isStreaming || !input.trim() || !userId}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 shadow-sm disabled:opacity-50"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => handleSend(action)}
              disabled={isStreaming || !userId}
              className="text-sm px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
