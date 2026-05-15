"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { useCreateProfile } from "@/lib/hooks/mutations";
import type { UserRole } from "@/lib/types";

interface RoleOnboardingProps {
  userId: string;
}

export function RoleOnboarding({ userId }: RoleOnboardingProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const createProfile = useCreateProfile(userId);

  function handleSubmit() {
    if (!displayName.trim() || !selectedRole) return;

    createProfile.mutate(
      { displayName: displayName.trim(), role: selectedRole },
      {
        onSuccess: () => {
          router.push("/dashboard");
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
          !displayName.trim() || !selectedRole || createProfile.isPending
        }
        className="w-full bg-accent text-accent-foreground shadow-sm rounded-lg px-5 py-3 text-base font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {createProfile.isPending ? (
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
