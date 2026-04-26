"use client";

import { Users, Plus } from "lucide-react";
import { useUIStore } from "@/lib/store";
import { useAgentTransactions } from "@/lib/hooks/queries";
import { AddClientDialog } from "./AddClientDialog";
import { useState } from "react";
import type { Transaction } from "@/lib/types";

const PHASE_BADGES: Record<string, { label: string; className: string }> = {
  shopping: { label: "Shopping", className: "bg-muted text-muted-foreground" },
  offer: { label: "Offer", className: "bg-accent/15 text-accent" },
  escrow: { label: "Escrow", className: "bg-warning/10 text-warning" },
  closing: { label: "Closing", className: "bg-primary/20 text-primary-foreground" },
  "post-close": { label: "Closed", className: "bg-primary/20 text-primary-foreground" },
};

function ClientCard({ transaction, onClick }: { transaction: Transaction; onClick: () => void }) {
  const badge = PHASE_BADGES[transaction.current_phase] ?? PHASE_BADGES.shopping;

  return (
    <button
      onClick={onClick}
      className="bg-card rounded-xl border border-border shadow-sm p-6 text-left hover:border-accent/40 hover:shadow-md transition-all w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {transaction.client_name || "Unnamed Client"}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {transaction.property_address || "No property yet"}
          </p>
        </div>
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${badge.className}`}>
          {badge.label}
        </span>
      </div>
      {transaction.purchase_price > 0 && (
        <p className="text-sm text-muted-foreground">
          ${transaction.purchase_price.toLocaleString()}
        </p>
      )}
      <p className="text-xs text-muted-foreground mt-2">
        Updated {new Date(transaction.updated_at).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </p>
    </button>
  );
}

interface AgentDashboardProps {
  userId: string;
}

export function AgentDashboard({ userId }: AgentDashboardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: transactions, isLoading } = useAgentTransactions(userId);
  const { setActiveTransactionId, setCurrentPhase } = useUIStore();

  function handleClientClick(transaction: Transaction) {
    setActiveTransactionId(transaction.id);
    setCurrentPhase(transaction.current_phase);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Your Clients</h2>
          <p className="text-base text-muted-foreground mt-1">
            {transactions?.length
              ? `${transactions.length} active transaction${transactions.length === 1 ? "" : "s"}`
              : "Manage transactions for your clients"}
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="bg-accent text-accent-foreground shadow-sm rounded-lg px-5 py-2.5 text-base font-medium hover:bg-accent/90 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card rounded-xl border border-border shadow-sm p-6 space-y-3 animate-pulse">
              <div className="h-5 w-32 bg-muted rounded" />
              <div className="h-4 w-48 bg-muted rounded" />
              <div className="h-3 w-20 bg-muted rounded" />
            </div>
          ))}
        </div>
      ) : transactions && transactions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {transactions.map((t) => (
            <ClientCard
              key={t.id}
              transaction={t}
              onClick={() => handleClientClick(t)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8 text-accent" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">No clients yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first client to start managing their transaction
            </p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="bg-accent text-accent-foreground shadow-sm rounded-lg px-5 py-2.5 text-base font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        </div>
      )}

      <AddClientDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        userId={userId}
      />
    </div>
  );
}
