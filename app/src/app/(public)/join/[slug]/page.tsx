/**
 * /join/[slug] — public agent invite landing page (Strategy A distribution).
 *
 * An agent shares phazr.co/join/<their-slug> with a buyer. This page looks up the
 * slug via the service-role client (profiles RLS is own-row only; slugs are public
 * handles that reveal nothing beyond the agent's display name) and sends the buyer
 * into signup with ?ref=<slug>, which onboarding resolves into
 * profiles.referred_by_agent_id.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { isValidInviteSlug } from "@/lib/invites";
import { FileText, CalendarClock, MessageCircleQuestion, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "You're invited — Phazr",
  description: "Your agent invited you to Phazr, the homebuying workspace that keeps your purchase organized from offer to keys.",
};

async function lookupAgent(slug: string): Promise<{ displayName: string } | null> {
  if (!isValidInviteSlug(slug)) return null;
  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const { data } = await admin
    .from("profiles")
    .select("display_name")
    .eq("invite_slug", slug)
    .eq("role", "agent")
    .maybeSingle();
  return data ? { displayName: data.display_name } : null;
}

export default async function JoinPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const agent = await lookupAgent(slug);

  if (!agent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-card rounded-xl border border-border shadow-sm p-10 text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">
            This invite link isn&apos;t valid
          </h1>
          <p className="text-base text-muted-foreground">
            The link may have been typed incorrectly or is no longer active. Ask your
            agent for a fresh link — or explore Phazr on your own.
          </p>
          <Link
            href="/"
            className="inline-block bg-accent text-accent-foreground shadow-sm rounded-lg px-5 py-2.5 text-base font-medium hover:bg-accent/90 transition-colors"
          >
            Go to Phazr
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-10">
        <div className="text-center space-y-3">
          <p className="text-sm font-medium text-accent uppercase tracking-wide">
            You&apos;re invited
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            {agent.displayName} invited you to Phazr
          </h1>
          <p className="text-base text-muted-foreground max-w-lg mx-auto">
            Phazr is your homebuying workspace — one place to understand your documents,
            stay ahead of deadlines, and always know what happens next, from serious
            shopping to keys in hand.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Feature
            icon={<FileText className="w-5 h-5 text-accent" />}
            title="Documents, explained"
            body="Upload contracts, loan estimates, and inspection reports — get plain-English summaries of what they mean."
          />
          <Feature
            icon={<CalendarClock className="w-5 h-5 text-accent" />}
            title="Never miss a deadline"
            body="Contingency countdowns and reminders for every date that matters in your purchase."
          />
          <Feature
            icon={<MessageCircleQuestion className="w-5 h-5 text-accent" />}
            title="Ask Homie anything"
            body="An AI guide that knows your transaction and answers questions about your actual documents."
          />
          <Feature
            icon={<ShieldCheck className="w-5 h-5 text-accent" />}
            title="Close safely"
            body="Wire-fraud safeguards and final-walkthrough checklists for the moments with the highest stakes."
          />
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-8 text-center space-y-4">
          <p className="text-base text-foreground">
            Your workspace will be connected to {agent.displayName}, so you stay
            organized together — your data stays yours.
          </p>
          <Link
            href={`/signup?ref=${encodeURIComponent(slug)}`}
            className="inline-block bg-accent text-accent-foreground shadow-sm rounded-lg px-6 py-3 text-base font-medium hover:bg-accent/90 transition-colors"
          >
            Create your free workspace
          </Link>
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-accent font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Free during early access &middot; Phazr provides educational guidance only — we
          don&apos;t provide legal, financial, or brokerage services.
        </p>
      </div>
    </div>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{body}</p>
    </div>
  );
}
