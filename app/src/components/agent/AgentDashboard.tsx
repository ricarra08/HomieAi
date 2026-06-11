"use client";

import { Users, Plus, MoreHorizontal, Archive, Trash2, RotateCcw, Link2, Copy, Check, Send } from "lucide-react";
import { useUIStore } from "@/lib/store";
import { useAgentTransactions, useProfile } from "@/lib/hooks/queries";
import { useDeleteTransaction, useCreateInviteSlug } from "@/lib/hooks/mutations";
import { AddClientDialog } from "./AddClientDialog";
import { InviteBuyerDialog } from "./InviteBuyerDialog";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { isValidStateCode, STATE_LABELS } from "@/lib/state-configs";
import type { StateCode } from "@/lib/state-configs";
import type { Transaction } from "@/lib/types";

const PHASE_BADGES: Record<string, { label: string; className: string }> = {
  shopping: { label: "Shopping", className: "bg-muted text-muted-foreground" },
  offer: { label: "Offer", className: "bg-accent/15 text-accent" },
  escrow: { label: "Escrow", className: "bg-warning/10 text-warning" },
  closing: { label: "Closing", className: "bg-primary/20 text-primary-foreground" },
  "post-close": { label: "Closed", className: "bg-primary/20 text-primary-foreground" },
};

function ClientCard({
  transaction,
  onClick,
  onArchive,
  onRestore,
  onDelete,
  onInvite,
}: {
  transaction: Transaction;
  onClick: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
  onInvite: () => void;
}) {
  const badge = PHASE_BADGES[transaction.current_phase] ?? PHASE_BADGES.shopping;
  const isArchived = transaction.archived;
  // A shell the agent owns (user_id === agent_id) hasn't been handed off yet; once the buyer
  // claims it, user_id diverges. claim_token present = invite outstanding.
  const isClaimed = transaction.user_id !== transaction.agent_id;
  const isInvited = !isClaimed && !!transaction.claim_token;

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 text-left hover:border-accent/40 hover:shadow-md transition-all w-full relative">
      <button onClick={onClick} className="w-full text-left">
        <div className="flex items-start justify-between mb-3 pr-8">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {transaction.client_name || "Unnamed Client"}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {transaction.property_address === "TBD"
                ? "No property yet"
                : transaction.property_address}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isClaimed ? (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-primary/20 text-primary-foreground">
                Joined
              </span>
            ) : isInvited ? (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-accent/15 text-accent">
                Invited
              </span>
            ) : null}
            {transaction.state && isValidStateCode(transaction.state) && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-secondary text-muted-foreground border border-border">
                {STATE_LABELS[transaction.state as StateCode]}
              </span>
            )}
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${badge.className}`}>
              {badge.label}
            </span>
          </div>
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

      <div className="absolute bottom-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" sideOffset={4}>
            {!isArchived && !isClaimed && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onInvite();
                }}
              >
                <Send className="w-4 h-4" />
                {isInvited ? "Resend / copy invite" : "Invite buyer"}
              </DropdownMenuItem>
            )}
            {isArchived ? (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore();
                }}
              >
                <RotateCcw className="w-4 h-4" />
                Restore
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive();
                }}
              >
                <Archive className="w-4 h-4" />
                Archive
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

/**
 * Agent invite link card (Strategy A): every buyer who signs up through
 * phazr.co/join/<slug> is automatically connected to this agent's client list
 * when they create their transaction.
 */
function InviteLinkCard({ userId }: { userId: string }) {
  const { data: profile } = useProfile(userId);
  const createSlug = useCreateInviteSlug(userId);
  const [copied, setCopied] = useState(false);

  if (!profile) return null;

  const inviteUrl = profile.invite_slug
    ? `${window.location.origin}/join/${profile.invite_slug}`
    : null;

  async function handleCopy() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Invite link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select and copy the link manually.");
    }
  }

  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
        <Link2 className="w-5 h-5 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-foreground">Your invite link</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          {inviteUrl
            ? "Share this with buyers — when they sign up, their workspace connects to you automatically."
            : "Create a personal link to invite buyers; their workspaces connect to you automatically."}
        </p>
        {inviteUrl && (
          <p className="text-sm font-medium text-foreground mt-2 truncate" title={inviteUrl}>
            {inviteUrl}
          </p>
        )}
      </div>
      {inviteUrl ? (
        <button
          onClick={handleCopy}
          className="border border-border text-foreground rounded-lg px-4 py-2 text-base font-medium hover:bg-muted transition-colors flex items-center gap-2 shrink-0"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      ) : (
        <button
          onClick={() => createSlug.mutate(profile.display_name)}
          disabled={createSlug.isPending}
          className="bg-primary text-primary-foreground shadow-sm rounded-lg px-4 py-2 text-base font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
        >
          {createSlug.isPending ? "Creating..." : "Create invite link"}
        </button>
      )}
    </div>
  );
}

interface AgentDashboardProps {
  userId: string;
  showArchived?: boolean;
}

export function AgentDashboard({ userId, showArchived = false }: AgentDashboardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteFor, setInviteFor] = useState<Transaction | null>(null);
  const { data: allTransactions, isLoading } = useAgentTransactions(userId);
  const { setActiveTransactionId } = useUIStore();
  const deleteTransaction = useDeleteTransaction(userId);
  const qc = useQueryClient();

  const transactions = allTransactions?.filter((t) =>
    showArchived ? t.archived : !t.archived
  );

  function handleClientClick(transaction: Transaction) {
    setActiveTransactionId(transaction.id);
  }

  async function handleArchive(transaction: Transaction) {
    const supabase = createClient();
    const { error } = await supabase
      .from("transactions")
      .update({ archived: true })
      .eq("id", transaction.id);

    if (error) {
      toast.error("Failed to archive. Please try again.");
      return;
    }

    qc.invalidateQueries({ queryKey: ["transactions", "agent", userId] });
    toast.success(`${transaction.client_name || "Client"} archived`);
  }

  async function handleRestore(transaction: Transaction) {
    const supabase = createClient();
    const { error } = await supabase
      .from("transactions")
      .update({ archived: false })
      .eq("id", transaction.id);

    if (error) {
      toast.error("Failed to restore. Please try again.");
      return;
    }

    qc.invalidateQueries({ queryKey: ["transactions", "agent", userId] });
    toast.success(`${transaction.client_name || "Client"} restored`);
  }

  function handleDelete(transaction: Transaction) {
    deleteTransaction.mutate(transaction.id, {
      onSuccess: () => toast.success(`${transaction.client_name || "Client"} deleted`),
      onError: () => toast.error("Failed to delete. Please try again."),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            {showArchived ? "Archived" : "Your Clients"}
          </h2>
          <p className="text-base text-muted-foreground mt-1">
            {transactions?.length
              ? `${transactions.length} ${showArchived ? "archived" : "active"} transaction${transactions.length === 1 ? "" : "s"}`
              : showArchived ? "No archived transactions" : "Manage transactions for your clients"}
          </p>
        </div>
        {!showArchived && (
          <button
            onClick={() => setDialogOpen(true)}
            className="bg-accent text-accent-foreground shadow-sm rounded-lg px-5 py-2.5 text-base font-medium hover:bg-accent/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </button>
        )}
      </div>

      {!showArchived && <InviteLinkCard userId={userId} />}

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
              onArchive={() => handleArchive(t)}
              onRestore={() => handleRestore(t)}
              onDelete={() => handleDelete(t)}
              onInvite={() => setInviteFor(t)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
            {showArchived ? <Archive className="w-8 h-8 text-accent" /> : <Users className="w-8 h-8 text-accent" />}
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">
              {showArchived ? "No archived transactions" : "No clients yet"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {showArchived
                ? "Archived transactions will appear here"
                : "Add your first client to start managing their transaction"}
            </p>
          </div>
          {!showArchived && (
            <button
              onClick={() => setDialogOpen(true)}
              className="bg-accent text-accent-foreground shadow-sm rounded-lg px-5 py-2.5 text-base font-medium hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Client
            </button>
          )}
        </div>
      )}

      <AddClientDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        userId={userId}
      />

      <InviteBuyerDialog
        open={!!inviteFor}
        onClose={() => setInviteFor(null)}
        agentId={userId}
        transaction={inviteFor}
      />
    </div>
  );
}
