"use client";

import { useState, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { copilotKeys } from "./query-keys";
import type { Phase } from "@/lib/types";

interface UseStreamingChatReturn {
  sendMessage: (params: {
    message: string;
    dealId: string | null;
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

  const sendMessage = useCallback(
    async (params: {
      message: string;
      dealId: string | null;
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
          body: JSON.stringify(params),
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
          setStreamingContent(accumulated);
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          console.error("[streaming-chat] Error:", err);
        }
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        qc.invalidateQueries({ queryKey: copilotKeys.messages(params.dealId) });
      }
    },
    [qc]
  );

  return { sendMessage, streamingContent, isStreaming };
}
