"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AGENT_REF_STORAGE_KEY, isValidInviteSlug } from "@/lib/invites";

// Agent invite referral (/join/<slug> → /signup?ref=<slug>): the URL/localStorage pair
// is external state — read it with useSyncExternalStore (server snapshot: false, so
// hydration stays consistent); the effect below only WRITES to localStorage so the
// slug survives the email-confirmation roundtrip until onboarding resolves it.
const subscribeNoop = () => () => {};
function readInvitedSnapshot(): boolean {
  const ref = new URLSearchParams(window.location.search).get("ref");
  if (ref && isValidInviteSlug(ref)) return true;
  return !!localStorage.getItem(AGENT_REF_STORAGE_KEY);
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const invited = useSyncExternalStore(subscribeNoop, readInvitedSnapshot, () => false);
  const supabase = createClient();

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref && isValidInviteSlug(ref)) {
      localStorage.setItem(AGENT_REF_STORAGE_KEY, ref);
    }
  }, []);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="bg-card rounded-xl border border-border p-8 space-y-4">
            <div className="text-4xl">📬</div>
            <h2 className="text-xl font-semibold">Check your email</h2>
            <p className="text-muted-foreground text-sm">
              We sent a confirmation link to <strong>{email}</strong>.
              Click the link to activate your account.
            </p>
            <Link href="/login">
              <Button variant="outline" className="mt-4">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-foreground">
            Phazr
          </h1>
          <p className="text-muted-foreground mt-2">
            Create your homebuying workspace
          </p>
          {invited && (
            <p className="text-sm text-accent mt-2">
              You were invited by your agent — your workspace will be connected
              after setup.
            </p>
          )}
        </div>

        <form
          onSubmit={handleSignup}
          className="bg-card rounded-xl border border-border p-8 space-y-6 shadow-sm"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="At least 12 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={12}
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            {loading ? "Creating account..." : "Create Account"}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            By creating an account, you agree to the{" "}
            <Link href="/terms" className="text-accent hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
            .
          </p>

          <p className="text-sm text-center text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-accent font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>

        <p className="text-xs text-center text-muted-foreground">
          🔒 Your data is encrypted in transit and at rest
        </p>
      </div>
    </div>
  );
}
