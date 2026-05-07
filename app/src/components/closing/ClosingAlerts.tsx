"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, Clock, FileText, DollarSign, Shield, CheckCircle2 } from "lucide-react";
import { CollapsibleCard } from "@/components/ui/collapsible-card";
import { useUIStore } from "@/lib/store";
import { computeDaysRemaining } from "@/lib/computed";
import type { ClosingData } from "@/lib/hooks/use-closing-data";

interface Alert {
  id: string;
  severity: "destructive" | "warning" | "info";
  icon: React.ReactNode;
  message: string;
  action?: string;
  actionRoute?: string;
}

export function ClosingAlerts({ data }: { data: ClosingData }) {
  const router = useRouter();
  const { setActiveSidebarItem } = useUIStore();

  const { transaction, meta, cdDocument, insuranceInfo, chosenLE, titleReport } = data;
  const alerts: Alert[] = [];

  if (meta.wire_status === "pending") {
    alerts.push({
      id: "wire-fraud",
      severity: "destructive",
      icon: <Shield className="w-4 h-4" />,
      message: "Wire funds have NOT been sent. Complete the Wire SafeSend verification before wiring.",
    });
  }

  if (transaction?.closing_date) {
    const days = computeDaysRemaining(transaction.closing_date);
    if (days !== null && days <= 0) {
      alerts.push({
        id: "closing-today-past",
        severity: "destructive",
        icon: <Clock className="w-4 h-4" />,
        message: days === 0 ? "Closing is TODAY" : `Closing date was ${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} ago`,
      });
    } else if (days !== null && days <= 3) {
      alerts.push({
        id: "closing-soon",
        severity: "warning",
        icon: <Clock className="w-4 h-4" />,
        message: `Closing in ${days} day${days !== 1 ? "s" : ""}`,
      });
    }
  }

  if (!cdDocument) {
    alerts.push({
      id: "no-cd",
      severity: "warning",
      icon: <FileText className="w-4 h-4" />,
      message: "Closing Disclosure not yet received — upload when available",
      action: "Go to Documents",
      actionRoute: "/documents",
    });
  } else if (!meta.cd_received_confirmed) {
    alerts.push({
      id: "cd-unconfirmed",
      severity: "info",
      icon: <FileText className="w-4 h-4" />,
      message: "Closing Disclosure received but not yet reviewed",
    });
  }

  if (!chosenLE) {
    alerts.push({
      id: "no-le",
      severity: "info",
      icon: <DollarSign className="w-4 h-4" />,
      message: "No loan estimate marked as chosen — set one in Financing",
      action: "Go to Financing",
      actionRoute: "/financing",
    });
  }

  if (!insuranceInfo || (insuranceInfo.binder_status !== "bound" && insuranceInfo.binder_status !== "verified")) {
    alerts.push({
      id: "insurance-not-bound",
      severity: "warning",
      icon: <AlertTriangle className="w-4 h-4" />,
      message: "Insurance binder is not yet bound — required before closing",
    });
  }

  if (!titleReport) {
    alerts.push({
      id: "no-title",
      severity: "info",
      icon: <FileText className="w-4 h-4" />,
      message: "Title report not uploaded",
      action: "Go to Documents",
      actionRoute: "/documents",
    });
  }

  if (!meta.signing_confirmed) {
    alerts.push({
      id: "signing-not-scheduled",
      severity: "info",
      icon: <Clock className="w-4 h-4" />,
      message: "Signing appointment not yet confirmed",
    });
  }

  // State-specific alerts
  if (data.stateConfig) {
    if (data.stateConfig.taxes.supplemental_tax) {
      alerts.push({
        id: "supplemental-tax",
        severity: "info",
        icon: <DollarSign className="w-4 h-4" />,
        message: `${data.stateConfig.state_name} charges a supplemental property tax — expect a bill 6-12 months after closing`,
      });
    }

    if (data.stateConfig.state_code === "FL" && transaction?.property_type === "condo") {
      alerts.push({
        id: "fl-condo-sirs",
        severity: "warning",
        icon: <AlertTriangle className="w-4 h-4" />,
        message: "Florida condos require SIRS (Structural Integrity Reserve Study) compliance — confirm with HOA before closing",
      });
    }

    if (transaction?.property_in_special_district) {
      alerts.push({
        id: "special-district",
        severity: "info",
        icon: <DollarSign className="w-4 h-4" />,
        message: "Property is in a special district — expect an annual assessment in addition to regular property taxes",
      });
    }
  }

  const sevOrder = { destructive: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => sevOrder[a.severity] - sevOrder[b.severity]);

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 p-4 rounded-xl border border-primary/20 bg-primary/5 text-primary-foreground">
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-sm font-medium">All closing items on track</span>
      </div>
    );
  }

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
              {alert.action && alert.actionRoute && (
                <button
                  onClick={() => { setActiveSidebarItem(alert.actionRoute === "/financing" ? "financing" : "documents"); router.push(alert.actionRoute!); }}
                  className="text-xs mt-0.5 underline opacity-80 hover:opacity-100"
                >
                  {alert.action}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
}
