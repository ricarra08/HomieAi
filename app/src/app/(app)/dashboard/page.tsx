"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PhaseDashboard } from "@/components/transaction/PhaseDashboard";
import { AgentDashboard } from "@/components/agent/AgentDashboard";
import { DocumentDetailView } from "@/components/documents/SlideOverViewer";
import { useUIStore } from "@/lib/store";
import { useDocuments, useProfile } from "@/lib/hooks/queries";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-base text-muted-foreground p-10 text-center">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { viewerDocId, viewerOpen, activeTransactionId, clearTransactionContext, activeSidebarItem } = useUIStore();
  const { data: documents } = useDocuments(activeTransactionId);
  const [userId, setUserId] = useState<string | null>(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (searchParams.get("confirmed") === "true") {
      toast.success("Email confirmed! Welcome to Phazr.");
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [searchParams]);

  const { data: profile } = useProfile(userId ?? undefined);

  const activeDoc = viewerOpen && viewerDocId
    ? documents?.find((d) => d.id === viewerDocId)
    : null;

  if (!userId || !profile) {
    return <div className="text-base text-muted-foreground p-10 text-center">Loading...</div>;
  }

  // Agent on client list (no active transaction)
  if (profile.role === "agent" && !activeTransactionId) {
    return <AgentDashboard userId={userId} showArchived={activeSidebarItem === "archived"} />;
  }

  // Agent inside a transaction — show back button + PhaseDashboard
  if (profile.role === "agent" && activeTransactionId) {
    return (
      <>
        {activeDoc && <DocumentDetailView doc={activeDoc} />}
        <div className={activeDoc ? "hidden" : ""}>
          <button
            onClick={() => {
              clearTransactionContext();
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to clients
          </button>
          <PhaseDashboard />
        </div>
      </>
    );
  }

  // Buyer — standard flow
  return (
    <>
      {activeDoc && <DocumentDetailView doc={activeDoc} />}
      <div className={activeDoc ? "hidden" : ""}>
        <PhaseDashboard />
      </div>
    </>
  );
}
