"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, Clock, FileText, DollarSign, Shield } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { useUIStore } from "@/lib/store";
import { computeDeadlineUrgency, computeDaysRemaining } from "@/lib/computed";
import type { EscrowData } from "@/lib/hooks/use-escrow-data";

interface Alert {
  id: string;
  severity: "destructive" | "warning" | "info";
  icon: React.ReactNode;
  message: string;
  action?: string;
  actionRoute?: string;
}

export function EscrowAlerts({ data }: { data: EscrowData }) {
  const router = useRouter();
  const { setActiveSidebarItem } = useUIStore();

  const { deal, deadlines, documents, loanEstimates } = data;
  const alerts: Alert[] = [];

  alerts.push({
    id: "wire-fraud",
    severity: "destructive",
    icon: <Shield className="w-4 h-4" />,
    message: "Never wire funds based on email instructions alone. Always verify by phone using a trusted number.",
  });

  for (const d of deadlines) {
    const urgency = computeDeadlineUrgency(d);
    if (urgency === "overdue") {
      alerts.push({
        id: `deadline-${d.id}`,
        severity: "destructive",
        icon: <Clock className="w-4 h-4" />,
        message: `${d.name} is overdue (was due ${new Date(d.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })})`,
      });
    } else if (urgency === "due-soon") {
      const days = computeDaysRemaining(d.due_date);
      alerts.push({
        id: `due-soon-${d.id}`,
        severity: "warning",
        icon: <Clock className="w-4 h-4" />,
        message: `${d.name} is due in ${days} day${days !== 1 ? "s" : ""}`,
      });
    }
  }

  const hasContract = documents.some((d) => d.doc_type === "purchase_contract");
  const hasInspection = documents.some((d) => d.doc_type === "inspection_report");
  if (!hasContract) {
    alerts.push({
      id: "missing-contract",
      severity: "warning",
      icon: <FileText className="w-4 h-4" />,
      message: "Purchase contract not uploaded yet",
      action: "Go to Documents",
      actionRoute: "/documents",
    });
  }
  if (!hasInspection) {
    alerts.push({
      id: "missing-inspection",
      severity: "info",
      icon: <FileText className="w-4 h-4" />,
      message: "No inspection report uploaded yet",
      action: "Go to Documents",
      actionRoute: "/documents",
    });
  }

  const chosen = loanEstimates.find((le) => le.is_chosen);
  if (chosen?.lock_expires) {
    const lockDays = computeDaysRemaining(chosen.lock_expires);
    if (lockDays !== null && lockDays <= 7 && lockDays > 0) {
      alerts.push({
        id: "lock-expiring",
        severity: "warning",
        icon: <Clock className="w-4 h-4" />,
        message: `Rate lock expires in ${lockDays} day${lockDays !== 1 ? "s" : ""} (${chosen.lender})`,
      });
    } else if (lockDays !== null && lockDays <= 0) {
      alerts.push({
        id: "lock-expired",
        severity: "destructive",
        icon: <Clock className="w-4 h-4" />,
        message: `Rate lock has expired (${chosen.lender})`,
      });
    }
  }

  if (deal && deal.earnest_money_amount && deal.earnest_money_status !== "confirmed" && deal.earnest_money_status !== "held") {
    alerts.push({
      id: "emd-pending",
      severity: "warning",
      icon: <DollarSign className="w-4 h-4" />,
      message: `Earnest money deposit (${deal.earnest_money_status ?? "pending"}) — not yet confirmed`,
    });
  }

  const sevOrder = { destructive: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);

  if (alerts.length === 0) return null;

  const sevStyles = {
    destructive: "bg-destructive/5 border-destructive/20 text-destructive",
    warning: "bg-warning/5 border-warning/20 text-warning",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <CollapsibleCard title="Alerts & Issues" subtitle={`${alerts.length} item${alerts.length !== 1 ? "s" : ""}`}>
      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg border ${sevStyles[alert.severity]}`}>
            <div className="shrink-0 mt-0.5">{alert.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{alert.message}</p>
              {alert.action && alert.actionRoute ? (
                <button
                  onClick={() => { setActiveSidebarItem(alert.actionRoute === "/financing" ? "financing" : "documents"); router.push(alert.actionRoute!); }}
                  className="text-xs mt-0.5 underline opacity-80 hover:opacity-100"
                >
                  {alert.action}
                </button>
              ) : alert.action ? (
                <p className="text-xs mt-0.5 opacity-80">{alert.action}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
}
