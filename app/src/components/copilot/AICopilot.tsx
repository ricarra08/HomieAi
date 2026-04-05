"use client";

import { useState } from "react";
import { useUIStore } from "@/lib/store";
import { MessageCircle, X, Maximize2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const quickActions = [
  "Explain this document",
  "Calculate closing costs",
  "Market analysis",
];

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
  const { copilotOpen, setCopilotOpen } = useUIStore();
  const [message, setMessage] = useState("");

  if (!copilotOpen) return null;

  return (
    <div className="w-80 xl:w-96 bg-card border-l border-border flex flex-col h-full shrink-0">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <h2 className="text-xl font-semibold">Homie</h2>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded hover:bg-muted text-muted-foreground">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCopilotOpen(false)}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="bg-muted rounded-xl p-4 text-base text-foreground leading-relaxed">
          <p>
            Hi there! I&apos;m Homie, your AI homebuying assistant. I can help you
            understand documents, explain the process, or run scenarios. What
            would you like to know?
          </p>
          <span className="text-sm text-muted-foreground mt-2 block">
            Just now
          </span>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border space-y-3">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask Homie anything..."
            className="flex-1 text-base"
          />
          <Button size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 shadow-sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickActions.map((action) => (
            <button
              key={action}
              className="text-sm px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:bg-muted transition-colors"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
