"use client";

import { useState } from "react";
import { Copy, Link2, X, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCollaboratorLinks } from "@/lib/hooks/queries";
import { useCreateCollaboratorLink, useRevokeCollaboratorLink } from "@/lib/hooks/mutations";
import type { CollaboratorLink } from "@/lib/types";

const ROLES = [
  { value: "agent" as const, label: "Agent" },
  { value: "lender" as const, label: "Lender" },
  { value: "escrow" as const, label: "Escrow Officer" },
  { value: "title" as const, label: "Title Company" },
  { value: "inspector" as const, label: "Inspector" },
  { value: "other" as const, label: "Other" },
];

function buildUploadUrl(token: string): string {
  return `${typeof window !== "undefined" ? window.location.origin : ""}/upload/${token}`;
}

function LinkRow({ link, transactionId }: { link: CollaboratorLink; transactionId: string }) {
  const revoke = useRevokeCollaboratorLink(transactionId);
  const [copied, setCopied] = useState(false);
  const url = buildUploadUrl(link.link_token);
  const isExpired = new Date(link.expires_at) < new Date();
  const isActive = link.status === "active" && !isExpired;

  function handleCopy() {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium capitalize">{link.recipient_role}</span>
          <Badge className={isActive ? "bg-primary/20 text-primary-foreground text-xs" : "bg-muted text-muted-foreground text-xs"}>
            {isActive ? "Active" : link.status === "revoked" ? "Revoked" : "Expired"}
          </Badge>
        </div>
        {link.recipient_email && (
          <p className="text-xs text-muted-foreground truncate">{link.recipient_email}</p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">
          {link.uploads_received} upload{link.uploads_received !== 1 ? "s" : ""} &middot; expires {new Date(link.expires_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {isActive && (
          <>
            <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 w-8 p-0">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => revoke.mutate(link.id)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
              <X className="w-3.5 h-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function CollaboratorLinkDialog({ transactionId }: { transactionId: string }) {
  const { data: links } = useCollaboratorLinks(transactionId);
  const createLink = useCreateCollaboratorLink(transactionId);
  const [selectedRole, setSelectedRole] = useState<(typeof ROLES)[number]["value"]>("agent");
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);

  function handleCreate() {
    createLink.mutate(
      { recipientRole: selectedRole, recipientEmail: email || undefined },
      { onSuccess: () => { setEmail(""); } }
    );
  }

  const activeLinks = (links ?? []).filter((l) => l.status === "active" && new Date(l.expires_at) > new Date());

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border text-foreground px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors">
        <Link2 className="w-3.5 h-3.5" />
        Share Upload Link
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Secure Upload Links</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Generate a link for your agent, lender, or escrow officer to upload files directly into your workspace.
            </p>

            <div className="flex gap-2">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as typeof selectedRole)}
                className="bg-transparent border border-border rounded-lg px-3 py-1.5 text-sm text-foreground"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email (optional)"
                className="flex-1 bg-transparent border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Button onClick={handleCreate} disabled={createLink.isPending} size="sm" className="w-full">
              {createLink.isPending ? "Creating..." : "Generate Link"}
            </Button>
          </div>

          {(links ?? []).length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {activeLinks.length} active link{activeLinks.length !== 1 ? "s" : ""}
              </p>
              {(links ?? []).map((link) => (
                <LinkRow key={link.id} link={link} transactionId={transactionId} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
