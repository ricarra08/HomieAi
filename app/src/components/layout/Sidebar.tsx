"use client";

import { useRouter, usePathname } from "next/navigation";
import { useUIStore } from "@/lib/store";
import { LayoutDashboard, FileText, CreditCard, ChevronLeft, ChevronRight } from "lucide-react";

const navItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "documents" as const, label: "Documents", icon: FileText, href: "/documents" },
  { id: "financing" as const, label: "Financing", icon: CreditCard, href: "/financing" },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setActiveSidebarItem, sidebarCollapsed, toggleSidebar } = useUIStore();

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
