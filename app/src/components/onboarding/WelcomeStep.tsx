"use client";

import { FileText, Shield, MessageCircle } from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "AI Document Intelligence",
    description: "Upload your documents and get instant summaries, field extraction, and deadline tracking",
  },
  {
    icon: Shield,
    title: "Closing Cost Clarity",
    description: "Compare loan estimates side-by-side and track your cash-to-close from offer to closing",
  },
  {
    icon: MessageCircle,
    title: "Homie, Your AI Assistant",
    description: "Ask questions about your transaction anytime and get answers grounded in your actual documents",
  },
];

export function WelcomeStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="max-w-lg mx-auto text-center space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Welcome to HomeBuyer Pro</h1>
        <p className="text-base text-muted-foreground mt-2">
          Your AI-powered workspace for understanding every step of your home purchase
        </p>
      </div>

      <div className="space-y-4 text-left">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="flex items-start gap-4 bg-card rounded-xl border border-border shadow-sm p-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">{f.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{f.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onContinue}
        className="bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 rounded-lg px-6 py-3 text-base font-medium transition-colors"
      >
        Get Started
      </button>
    </div>
  );
}
