"use client";

import { Clock, Check, X as XIcon, MessageCircle } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { Button } from "@/components/ui/button";
import { useUpdateDeadlineStatus } from "@/lib/hooks/mutations";
import { computeDeadlineUrgency, computeDaysRemaining } from "@/lib/computed";
import { useUIStore } from "@/lib/store";
import type { Deadline } from "@/lib/types";

const urgencyStyles: Record<string, string> = {
  upcoming: "text-primary",
  "due-soon": "text-warning",
  overdue: "text-destructive",
  completed: "text-muted-foreground",
  waived: "text-muted-foreground",
};

const urgencyBg: Record<string, string> = {
  upcoming: "bg-primary",
  "due-soon": "bg-warning",
  overdue: "bg-destructive",
  completed: "bg-muted",
  waived: "bg-muted",
};

function DeadlineRow({ deadline, dealId, maxDays }: { deadline: Deadline; dealId: string; maxDays: number }) {
  const updateStatus = useUpdateDeadlineStatus(dealId);
  const urgency = computeDeadlineUrgency(deadline);
  const days = computeDaysRemaining(deadline.due_date);
  const isDone = urgency === "completed" || urgency === "waived";

  const dueDate = new Date(deadline.due_date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className={`flex items-center gap-4 py-3 border-b border-border last:border-0 ${isDone ? "opacity-50" : ""}`}>
      <div className={`w-3 h-3 rounded-full shrink-0 ${urgencyBg[urgency]}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-base font-medium ${isDone ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {deadline.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 text-sm text-muted-foreground">
          <span>{dueDate}</span>
          {days !== null && !isDone && (
            <>
              <span>&middot;</span>
              <span className={urgencyStyles[urgency]}>
                {days > 0 ? `${days} days left` : days === 0 ? "Due today" : `${Math.abs(days)} days overdue`}
              </span>
            </>
          )}
          {isDone && <span>{urgency === "waived" ? "Waived" : "Completed"}</span>}
        </div>
      </div>
      {!isDone && days !== null && (
        <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden shrink-0">
          <div
            className={`h-full rounded-full ${urgencyBg[urgency]}`}
            style={{ width: `${Math.max(0, Math.min(100, days <= 0 ? 100 : 100 - (days / maxDays) * 100))}%` }}
          />
        </div>
      )}
      {!isDone && (
        <div className="flex items-center gap-1 shrink-0">
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateStatus.mutate({ deadlineId: deadline.id, status: "completed" })}
            disabled={updateStatus.isPending}
            className="text-xs gap-1 h-7"
          >
            <Check className="w-3 h-3" />
            Done
          </Button>
          <button
            onClick={() => updateStatus.mutate({ deadlineId: deadline.id, status: "waived" })}
            disabled={updateStatus.isPending}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Waive"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

interface ContingencyCountdownProps {
  dealId: string;
  deadlines: Deadline[];
  isLoading?: boolean;
}

export function ContingencyCountdown({ dealId, deadlines, isLoading }: ContingencyCountdownProps) {
  const { setCopilotOpen } = useUIStore();

  const active = deadlines.filter((d) => d.status !== "completed" && d.status !== "waived");
  const done = deadlines.filter((d) => d.status === "completed" || d.status === "waived");

  // Compute the longest active deadline as the scale for all progress bars
  const maxDays = Math.max(1, ...active.map((d) => computeDaysRemaining(d.due_date) ?? 1));

  function handleAskHomie() {
    setCopilotOpen(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("copilot:prefill", {
        detail: "What are my upcoming deadlines and what do I need to do for each one?",
      }));
    }, 100);
  }

  return (
    <CollapsibleCard
      title="Contingency Countdown"
      subtitle={`${active.length} active deadline${active.length !== 1 ? "s" : ""}`}
    >
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />)}
        </div>
      ) : deadlines.length > 0 ? (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              {active.length > 0 ? "Active Deadlines" : "All deadlines resolved"}
            </span>
          </div>
          {active.map((d) => <DeadlineRow key={d.id} deadline={d} dealId={dealId} maxDays={maxDays} />)}
          {done.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground mt-4 mb-2 uppercase tracking-wider">Resolved</p>
              {done.map((d) => <DeadlineRow key={d.id} deadline={d} dealId={dealId} maxDays={maxDays} />)}
            </>
          )}
        </div>
      ) : (
        <p className="text-base text-muted-foreground py-4 text-center">
          No deadlines set. Deadlines are auto-created when you set up your deal.
        </p>
      )}
      {active.length > 0 && (
        <Button variant="outline" size="sm" onClick={handleAskHomie} className="text-sm gap-1.5 w-full mt-3">
          <MessageCircle className="w-3.5 h-3.5" />
          Ask Homie about my deadlines
        </Button>
      )}
    </CollapsibleCard>
  );
}
