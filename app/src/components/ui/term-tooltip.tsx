"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface TermTooltipProps {
  term: string;
  definition: string;
}

export function TermTooltip({ term, definition }: TermTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger className="inline-flex items-center gap-1 cursor-help text-left">
        {term}
        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[280px] text-sm leading-relaxed">
        {definition}
      </TooltipContent>
    </Tooltip>
  );
}
