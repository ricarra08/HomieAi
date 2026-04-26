"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProfile } from "@/lib/hooks/queries";
import { RoleOnboarding } from "@/components/onboarding/RoleOnboarding";

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUserId(data.user.id);
    });
  }, [router]);

  const { data: profile, isLoading } = useProfile(userId ?? undefined);

  useEffect(() => {
    if (profile && !isLoading) {
      router.push("/dashboard");
    }
  }, [profile, isLoading, router]);

  if (!userId || isLoading) {
    return (
      <div className="text-base text-muted-foreground">Loading...</div>
    );
  }

  if (profile) return null;

  return <RoleOnboarding userId={userId} />;
}
