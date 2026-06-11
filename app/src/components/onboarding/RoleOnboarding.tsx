"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { useCreateProfile } from "@/lib/hooks/mutations";
import { AGENT_REF_STORAGE_KEY, CLAIM_TOKEN_STORAGE_KEY, isLikelyClaimToken } from "@/lib/invites";
import type { UserRole } from "@/lib/types";

interface RoleOnboardingProps {
  userId: string;
}

/**
 * Resolve a stored agent invite slug (set by /signup?ref=) into the agent's user id.
 * Non-fatal by design: a stale or invalid ref never blocks onboarding.
 */
async function resolveAgentReferral(role: UserRole): Promise<string | null> {
  const slug = localStorage.getItem(AGENT_REF_STORAGE_KEY);
  if (!slug) return null;
  localStorage.removeItem(AGENT_REF_STORAGE_KEY);
  if (role !== "buyer") return null;
  try {
    const res = await fetch("/api/join/resolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { agentId?: string };
    return body.agentId ?? null;
  } catch {
    return null;
  }
}

export function RoleOnboarding({ userId }: RoleOnboardingProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  // Covers the async referral round-trip before createProfile.isPending flips — without
  // it a second click would re-enter handleSubmit, having already consumed the stored
  // referral slug, and attempt a duplicate profile insert.
  const [submitting, setSubmitting] = useState(false);
  const createProfile = useCreateProfile(userId);

  async function handleSubmit() {
    if (!displayName.trim() || !selectedRole || submitting) return;
    setSubmitting(true);

    const referredByAgentId = await resolveAgentReferral(selectedRole);

    createProfile.mutate(
      { displayName: displayName.trim(), role: selectedRole, referredByAgentId },
      {
        onSuccess: () => {
          // If the buyer arrived via a claim link, finish the claim before the dashboard.
          // Consume on read (the claim page re-stashes if still unauthenticated) so a stale
          // token can't mis-route a later session.
          const pendingClaim = localStorage.getItem(CLAIM_TOKEN_STORAGE_KEY);
          localStorage.removeItem(CLAIM_TOKEN_STORAGE_KEY);
          if (selectedRole === "buyer" && isLikelyClaimToken(pendingClaim)) {
            router.push(`/claim/${pendingClaim}`);
          } else {
            router.push("/dashboard");
          }
        },
        onError: () => {
          setSubmitting(false);
        },
      }
    );
  }

  return (
    <div className="max-w-lg w-full mx-auto space-y-8 text-center">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Welcome to Phazr
        </h1>
        <p className="text-base text-muted-foreground mt-2">
          Let&apos;s set up your account
        </p>
      </div>

      <div className="space-y-2 text-left">
        <label
          htmlFor="display-name"
          className="text-base font-medium text-foreground"
        >
          Your name
        </label>
        <input
          id="display-name"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g. Sarah Johnson"
          className="w-full text-base px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
      </div>

      <div className="space-y-3 text-left">
        <p className="text-base font-medium text-foreground">I am a...</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedRole("buyer")}
            className={`group bg-card rounded-xl border shadow-sm p-6 text-left transition-all ${
              selectedRole === "buyer"
                ? "border-accent ring-2 ring-accent/30"
                : "border-border hover:border-accent/40 hover:shadow-md"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <Home className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Homebuyer
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track your home purchase from search to close
            </p>
          </button>

          <button
            onClick={() => setSelectedRole("agent")}
            className={`group bg-card rounded-xl border shadow-sm p-6 text-left transition-all ${
              selectedRole === "agent"
                ? "border-accent ring-2 ring-accent/30"
                : "border-border hover:border-accent/40 hover:shadow-md"
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Real Estate Agent
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage transactions for your clients
            </p>
          </button>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={
          !displayName.trim() || !selectedRole || submitting || createProfile.isPending
        }
        className="w-full bg-accent text-accent-foreground shadow-sm rounded-lg px-5 py-3 text-base font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting || createProfile.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Setting up...
          </>
        ) : (
          <>
            Continue
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
