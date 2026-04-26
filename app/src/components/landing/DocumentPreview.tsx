"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { DEMO_LE_PAGES } from "./data";

export function DocumentPreview() {
  const [activePage, setActivePage] = useState(0);

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden select-none h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <FileText className="w-4 h-4 text-accent" />
        <span className="text-xs font-medium text-foreground">
          Loan_Estimate_Ficus_Bank.pdf
        </span>
        <span className="ml-auto text-xs text-muted-foreground">3 pages</span>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-100 p-3">
        <img
          src={DEMO_LE_PAGES[activePage].src}
          alt={DEMO_LE_PAGES[activePage].label}
          className="w-full rounded shadow-sm border border-gray-200"
          draggable={false}
        />
      </div>
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-t border-border bg-secondary/50 shrink-0">
        {DEMO_LE_PAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setActivePage(i)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              activePage === i
                ? "bg-accent text-accent-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <span className="ml-2 text-xs text-muted-foreground truncate">
          {DEMO_LE_PAGES[activePage].label}
        </span>
      </div>
    </div>
  );
}
