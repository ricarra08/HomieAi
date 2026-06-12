"use client";

/**
 * /claim/[token] — buyer-facing landing for an agent's "take over your workspace" invite.
 *
 * Unauthenticated: stash the token (so login/onboarding route back here) and offer signup/login.
 * Authenticated: show an explicit "Claim" button that transfers ownership (POST /api/claim).
 * The explicit button is deliberate — claiming is a consequential ownership action.
 */
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUIStore } from "@/lib/store";
import { CLAIM_TOKEN_STORAGE_KEY } from "@/lib/invites";
import { Loader2, CheckCircle2, KeyRound } from "lucide-react";

type Info =
  | { state: "loading" }
  | { state: "invalid"; reason: string }
  | { state: "ok"; agentName: string; propertyAddress: string | null };

export default function ClaimPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const setActiveTransactionId = useUIStore((s) => s.setActiveTransactionId);

  const [info, setInfo] = useState<Info>({ state: "loading" });
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);

  // Load link info + auth state once.
  useEffect(() => {
    let active = true;
    (async () => {
      const [infoRes, userRes] = await Promise.all([
        fetch(`/api/claim/info?token=${encodeURIComponent(token)}`).then((r) => r.json()).catch(() => null),
        createClient().auth.getUser(),
      ]);
      if (!active) return;
      setAuthed(!!userRes.data.user);
      if (!infoRes || infoRes.valid !== true) {
        setInfo({ state: "invalid", reason: infoRes?.reason ?? "invalid" });
      } else {
        setInfo({ state: "ok", agentName: infoRes.agentName, propertyAddress: infoRes.propertyAddress });
      }
    })();
    return () => {
      active = false;
    };
  }, [token]);

  // For an unauthenticated visitor, persist the token so login/onboarding can route back here.
  useEffect(() => {
    if (authed === false) {
      localStorage.setItem(CLAIM_TOKEN_STORAGE_KEY, token);
    }
  }, [authed, token]);

  async function handleClaim() {
    setClaiming(true);
    setClaimError(null);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setClaimError(
          body.error === "already_claimed"
            ? "This workspace has already been claimed."
            : body.error === "expired"
              ? "This invite link has expired. Ask your agent for a new one."
              : body.error === "email_mismatch"
                ? "This invite was sent to a different email address. Sign in with the email your agent used, or ask them for a new link."
                : body.error === "cannot_claim_own"
                  ? "This is your own invite link — it's meant for your client. Send it to them instead."
                  : body.error === "not_a_buyer" || body.error === "no_profile"
                    ? "This account is set up as an agent. Your client should open this link with their own (buyer) account."
                    : "Couldn't claim this workspace. Please try again.",
        );
        setClaiming(false);
        return;
      }
      localStorage.removeItem(CLAIM_TOKEN_STORAGE_KEY);
      if (body.transactionId) setActiveTransactionId(body.transactionId);
      router.push("/dashboard");
    } catch {
      setClaimError("Couldn't claim this workspace. Please try again.");
      setClaiming(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card rounded-xl border border-border shadow-sm p-10 text-center space-y-5">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto">
          <KeyRound className="w-6 h-6 text-accent" />
        </div>

        {info.state === "loading" && (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="w-5 h-5 text-accent animate-spin" />
            <p className="text-sm text-muted-foreground">Checking your invite…</p>
          </div>
        )}

        {info.state === "invalid" && (
          <>
            <h1 className="text-2xl font-semibold text-foreground">
              {info.reason === "expired" ? "This invite has expired" : "This invite isn't valid"}
            </h1>
            <p className="text-base text-muted-foreground">
              {info.reason === "expired"
                ? "Ask your agent to send you a fresh invite link."
                : "The link may be incorrect, already used, or no longer active. Ask your agent for a new one."}
            </p>
            <Link
              href="/"
              className="inline-block bg-accent text-accent-foreground shadow-sm rounded-lg px-5 py-2.5 text-base font-medium hover:bg-accent/90 transition-colors"
            >
              Go to Phazr
            </Link>
          </>
        )}

        {info.state === "ok" && (
          <>
            <h1 className="text-2xl font-semibold text-foreground">
              {info.agentName} set up your workspace
            </h1>
            <p className="text-base text-muted-foreground">
              {info.propertyAddress
                ? `For ${info.propertyAddress}. `
                : ""}
              Take it over to track your documents, deadlines, and closing — with {info.agentName}{" "}
              alongside you. You&apos;ll own your workspace; your private notes and Homie chats stay yours.
            </p>

            {authed ? (
              <>
                <button
                  onClick={handleClaim}
                  disabled={claiming}
                  className="w-full bg-accent text-accent-foreground shadow-sm rounded-lg px-5 py-3 text-base font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
                >
                  {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {claiming ? "Claiming…" : "Claim your workspace"}
                </button>
                {claimError && <p className="text-sm text-destructive">{claimError}</p>}
              </>
            ) : (
              <div className="space-y-3">
                <Link
                  href="/signup"
                  className="block w-full bg-accent text-accent-foreground shadow-sm rounded-lg px-5 py-3 text-base font-medium hover:bg-accent/90 transition-colors"
                >
                  Create your free account
                </Link>
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-accent font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
