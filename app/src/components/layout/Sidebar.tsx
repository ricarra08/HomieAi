"use client";

import { useRouter, usePathname } from "next/navigation";
import { useUIStore } from "@/lib/store";
import { LayoutDashboard, FileText, CreditCard, ChevronLeft, ChevronRight, LogOut, Users, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useProfile, useTransaction } from "@/lib/hooks/queries";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

const buyerNavItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "documents" as const, label: "Documents", icon: FileText, href: "/documents" },
  { id: "financing" as const, label: "Financing", icon: CreditCard, href: "/financing" },
];

const agentClientListNavItems = [
  { id: "dashboard" as const, label: "Clients", icon: Users, href: "/dashboard" },
];

const agentTransactionNavItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "documents" as const, label: "Documents", icon: FileText, href: "/documents" },
  { id: "financing" as const, label: "Financing", icon: CreditCard, href: "/financing" },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setActiveSidebarItem, sidebarCollapsed, toggleSidebar, activeTransactionId, setActiveTransactionId, setCurrentPhase } = useUIStore();
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setUserEmail(data.user?.email ?? null);
    });
  }, []);

  const { data: profile } = useProfile(userId ?? undefined);
  const { data: activeTransaction } = useTransaction(activeTransactionId);
  const isAgent = profile?.role === "agent";
  const isAgentInTransaction = isAgent && !!activeTransactionId;

  const navItems = isAgent
    ? isAgentInTransaction
      ? agentTransactionNavItems
      : agentClientListNavItems
    : buyerNavItems;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const displayName = profile?.display_name;
  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : userEmail
      ? userEmail.slice(0, 2).toUpperCase()
      : "U";

  return (
    <div className="relative shrink-0">
      <aside
        className={`bg-sidebar border-r border-sidebar-border shadow-sm flex flex-col h-full transition-all duration-200 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
        <div className={`${sidebarCollapsed ? "p-4 flex justify-center" : "p-6 pb-5"}`}>
          {!sidebarCollapsed && (
            <h1 className="text-2xl font-semibold text-sidebar-foreground tracking-tight">
              HomeBuyer Pro
            </h1>
          )}
          {sidebarCollapsed && (
            <span className="text-lg font-semibold text-sidebar-foreground">HP</span>
          )}
        </div>

        {/* Agent inside a transaction: back button + client context */}
        {isAgentInTransaction && !sidebarCollapsed && (
          <div className="px-4 pb-3 space-y-2">
            <button
              onClick={() => {
                setActiveTransactionId(null);
                setCurrentPhase("shopping");
                router.push("/dashboard");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to clients
            </button>
            {activeTransaction && (
              <div className="px-3 py-2 rounded-lg bg-muted/50">
                <p className="text-sm font-semibold text-foreground truncate">
                  {activeTransaction.client_name || "Client"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {activeTransaction.property_address !== "TBD"
                    ? activeTransaction.property_address
                    : "No property yet"}
                </p>
              </div>
            )}
          </div>
        )}

        <nav className={`flex-1 space-y-1 ${sidebarCollapsed ? "px-2" : "px-4"}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSidebarItem(item.id);
                  router.push(item.href);
                }}
                title={sidebarCollapsed ? item.label : undefined}
                className={`w-full flex items-center rounded-lg text-base font-medium transition-colors ${
                  sidebarCollapsed
                    ? "justify-center p-3"
                    : "gap-3 px-4 py-3"
                } ${
                  isActive
                    ? "bg-accent text-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && item.label}
              </button>
            );
          })}
        </nav>

        <div className={`border-t border-sidebar-border ${sidebarCollapsed ? "px-2 py-3" : "px-4 py-3"}`}>
          <DropdownMenu>
            <DropdownMenuTrigger
              className={`w-full flex items-center rounded-lg text-base font-medium transition-colors text-sidebar-foreground hover:bg-muted ${
                sidebarCollapsed
                  ? "justify-center p-2"
                  : "gap-3 px-3 py-2"
              }`}
              title={sidebarCollapsed ? (displayName ?? userEmail ?? "Account") : undefined}
            >
              <Avatar size="sm">
                <AvatarFallback className="text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {!sidebarCollapsed && (
                <span className="truncate text-sm text-sidebar-foreground">
                  {displayName ?? userEmail ?? "Account"}
                </span>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              sideOffset={8}
              align="end"
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel>
                  {displayName ?? userEmail}
                  {isAgent && (
                    <span className="block text-xs font-normal text-muted-foreground">Agent</span>
                  )}
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <button
        onClick={toggleSidebar}
        className="absolute top-1/2 -translate-y-1/2 -right-3 z-10 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
