"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { copilotKeys } from "./query-keys";
import type { Phase } from "@/lib/types";

interface UseStreamingChatReturn {
  sendMessage: (params: {
    message: string;
    transactionId: string | null;
    userId: string;
    phase: Phase;
    history: { role: "user" | "assistant"; content: string }[];
  }) => Promise<void>;
  streamingContent: string;
  isStreaming: boolean;
}

export function useStreamingChat(): UseStreamingChatReturn {
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const qc = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const sendMessage = useCallback(
    async (params: {
      message: string;
      transactionId: string | null;
      userId: string;
      phase: Phase;
      history: { role: "user" | "assistant"; content: string }[];
    }) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsStreaming(true);
      setStreamingContent("");

      try {
        const res = await fetch("/api/copilot/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionId: params.transactionId,
            userId: params.userId,
            phase: params.phase,
            message: params.message,
            history: params.history,
          }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error(`Chat request failed: ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          accumulated += text;
          if (mountedRef.current) setStreamingContent(accumulated);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("[streaming-chat] Error:", err);
        }
      } finally {
        if (mountedRef.current) {
          setIsStreaming(false);
        }
        // Refetch persisted messages first, then clear streaming text
        // to prevent a flash of empty content between stream end and refetch
        await qc.invalidateQueries({ queryKey: copilotKeys.messages(params.transactionId) });
        // Small delay so the refetched messages render before we clear the stream
        await new Promise((r) => setTimeout(r, 100));
        if (mountedRef.current) {
          setStreamingContent("");
        }
      }
    },
    [qc]
  );

  return { sendMessage, streamingContent, isStreaming };
}
