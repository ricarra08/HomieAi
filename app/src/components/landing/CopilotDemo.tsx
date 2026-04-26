"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight } from "lucide-react";
import { DEMO_COPILOT_QA } from "./data";
import { useTypingEffect } from "./hooks";
import { MarkdownLite } from "./MarkdownLite";

export function CopilotDemo() {
  const [selectedQ, setSelectedQ] = useState<number | null>(null);
  const [showResponse, setShowResponse] = useState(false);
  const [responseKey, setResponseKey] = useState(0);

  const activeQA = selectedQ !== null ? DEMO_COPILOT_QA[selectedQ] : null;

  const { displayed: typedResponse, done: typingDone } = useTypingEffect(
    activeQA?.answer ?? "",
    10,
    600,
    showResponse
  );

  function handleChipClick(index: number) {
    setSelectedQ(index);
    setShowResponse(true);
    setResponseKey((k) => k + 1);
  }

  function handleReset() {
    setSelectedQ(null);
    setShowResponse(false);
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden max-w-2xl mx-auto">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <Sparkles className="w-4 h-4 text-accent" />
        <h3 className="text-xl font-semibold">Homie</h3>
        <span className="text-sm text-muted-foreground ml-1">AI Homebuying Assistant</span>
      </div>
      <div className="p-5 space-y-4 min-h-[280px]" key={responseKey}>
        <div className="flex justify-start">
          <div className="max-w-[85%] rounded-xl p-3.5 text-sm leading-relaxed bg-muted text-foreground">
            <p>
              I just analyzed your Loan Estimate from Ficus Bank. I found a few
              things worth discussing — including a prepayment penalty that could
              cost you $3,240. What would you like to know?
            </p>
            <span className="text-xs text-muted-foreground mt-1.5 block">
              Just now
            </span>
          </div>
        </div>
        {activeQA && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-end"
          >
            <div className="max-w-[85%] rounded-xl p-3.5 text-sm leading-relaxed bg-accent/10 text-foreground">
              <p>{activeQA.question}</p>
              <span className="text-xs text-muted-foreground mt-1.5 block">
                Just now
              </span>
            </div>
          </motion.div>
        )}
        {showResponse && typedResponse && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex justify-start"
          >
            <div className="max-w-[85%] rounded-xl p-3.5 text-sm leading-relaxed bg-muted text-foreground">
              <MarkdownLite text={typedResponse} />
              {!typingDone && (
                <span className="inline-block w-0.5 h-4 bg-accent/60 animate-pulse ml-0.5 rounded-sm align-middle" />
              )}
              {typingDone && (
                <span className="text-xs text-muted-foreground mt-1.5 block">
                  Just now
                </span>
              )}
            </div>
          </motion.div>
        )}
        {typingDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <button
              onClick={handleReset}
              className="text-sm text-accent hover:underline font-medium"
            >
              Try another question
            </button>
          </motion.div>
        )}
      </div>
      {selectedQ === null && (
        <div className="px-5 pb-5 pt-1">
          <div className="flex flex-wrap gap-1.5">
            {DEMO_COPILOT_QA.map((qa, i) => (
              <motion.button
                key={qa.question}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                onClick={() => handleChipClick(i)}
                className="text-sm px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                {qa.question}
              </motion.button>
            ))}
          </div>
        </div>
      )}
      <div className="px-5 pb-4 pt-2 border-t border-border">
        <div className="flex gap-2">
          <div className="flex-1 text-base px-3 py-2 rounded-lg border border-border bg-background text-muted-foreground">
            Ask Homie anything...
          </div>
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shrink-0 shadow-sm">
            <ArrowRight className="w-4 h-4 text-primary-foreground" />
          </div>
        </div>
      </div>
    </div>
  );
}
