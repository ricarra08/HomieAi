"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, CheckCircle2, AlertTriangle } from "lucide-react";
import { DEMO_EXTRACTED_FIELDS, DEMO_AI_SUMMARY } from "./data";
import { useTypingEffect } from "./hooks";

function ExtractedFieldRow({
  label,
  value,
  delay,
  started,
  flag,
}: {
  label: string;
  value: string;
  delay: number;
  started: boolean;
  flag?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setVisible(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay, started]);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center justify-between py-1.5 border-b border-border/50 last:border-0 ${
        flag ? "bg-destructive/5 -mx-2 px-2 rounded" : ""
      }`}
    >
      <span
        className={`text-sm ${
          flag ? "text-destructive font-medium" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        {flag ? (
          <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
        )}
        <span
          className={`text-sm font-medium ${
            flag ? "text-destructive" : "text-foreground"
          }`}
        >
          {value}
        </span>
      </div>
    </motion.div>
  );
}

export function ExtractionPanel({ started }: { started: boolean }) {
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setShowSummary(true), 5000);
    return () => clearTimeout(t);
  }, [started]);

  const { displayed: summaryText } = useTypingEffect(
    DEMO_AI_SUMMARY,
    12,
    0,
    showSummary
  );

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 pb-2.5 border-b border-border">
        <Sparkles className="w-4 h-4 text-accent" />
        <span className="text-sm font-semibold text-foreground">AI Extraction</span>
        {started && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`ml-auto text-xs font-medium ${
              showSummary ? "text-primary" : "text-accent"
            }`}
          >
            {showSummary ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Complete
              </span>
            ) : (
              "Analyzing..."
            )}
          </motion.span>
        )}
      </div>
      <div className="space-y-0 mb-4 flex-shrink-0">
        {DEMO_EXTRACTED_FIELDS.map((field) => (
          <ExtractedFieldRow
            key={field.label}
            label={field.label}
            value={field.value}
            delay={field.delay}
            started={started}
            flag={"flag" in field && field.flag === true}
          />
        ))}
      </div>
      {showSummary && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 min-h-0"
        >
          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-semibold text-accent">AI Summary</span>
          </div>
          <div className="bg-muted/50 rounded-lg p-3 border border-border/50">
            <p className="text-sm text-foreground leading-relaxed">
              {summaryText}
              {summaryText.length < DEMO_AI_SUMMARY.length && (
                <span className="inline-block w-0.5 h-4 bg-accent ml-0.5 animate-pulse align-middle" />
              )}
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
