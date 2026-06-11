"use client";

import { useState } from "react";
import { X, Loader2, Copy, Check, Mail } from "lucide-react";
import { toast } from "sonner";
import { useInviteBuyer } from "@/lib/hooks/mutations";
import type { Transaction } from "@/lib/types";

interface Props {
  open: boolean;
  onClose: () => void;
  agentId: string;
  transaction: Transaction | null;
}

/**
 * Lets the agent invite a buyer to take over a client transaction: generates a /claim link
 * (Copy) and, if a client email is on file, emails it. On claim, ownership transfers to the
 * buyer and the workspace becomes shared.
 */
export function InviteBuyerDialog({ open, onClose, agentId, transaction }: Props) {
  const invite = useInviteBuyer(agentId);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const clientEmail = transaction?.client_email ?? null;
  const clientName = transaction?.client_name ?? "your client";

  if (!open || !transaction) return null;

  async function generate(sendEmail: boolean) {
    if (!transaction) return;
    try {
      const result = await invite.mutateAsync({ transactionId: transaction.id, sendEmail });
      setClaimUrl(result.claimUrl);
      if (sendEmail) {
        toast.success(result.emailed ? `Invite emailed to ${clientEmail}` : "Link ready (email not sent)");
      }
    } catch {
      toast.error("Couldn't create the invite. Please try again.");
    }
  }

  async function copy() {
    if (!claimUrl) return;
    try {
      await navigator.clipboard.writeText(claimUrl);
      setCopied(true);
      toast.success("Invite link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select and copy the link manually.");
    }
  }

  function handleClose() {
    setClaimUrl(null);
    setCopied(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={handleClose} />
      <div className="relative bg-card rounded-xl border border-border shadow-sm w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Invite {clientName}</h2>
          <button onClick={handleClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground">
          Send your client a link to take over this workspace. They&apos;ll own it; you stay
          connected and can keep helping. Their private Homie chats stay theirs.
        </p>

        {!claimUrl ? (
          <div className="space-y-3">
            {clientEmail ? (
              <button
                onClick={() => generate(true)}
                disabled={invite.isPending}
                className="w-full bg-accent text-accent-foreground shadow-sm rounded-lg px-5 py-2.5 text-base font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {invite.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                Email invite to {clientEmail}
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">
                No client email on file — generate a link to share manually.
              </p>
            )}
            <button
              onClick={() => generate(false)}
              disabled={invite.isPending}
              className="w-full border border-border text-foreground rounded-lg px-5 py-2.5 text-base font-medium hover:bg-muted transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {invite.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Just get a link to share
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Invite link</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={claimUrl}
                className="flex-1 text-sm bg-muted border border-border rounded-lg px-3 py-2 truncate"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={copy}
                className="border border-border text-foreground rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              This link is private and expires in 14 days. Anyone who opens it can claim the
              workspace, so share it only with {clientName}.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
