import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(n: number | null | undefined): string {
  if (n == null) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

/** Format a rate/APR-style value as a percent (e.g. 6.5 → "6.5%"). Not a fraction — the input is
 *  already in percentage units. Trims trailing zeros up to 3 decimals. */
export function formatPercent(n: number | null | undefined, maxFractionDigits = 3): string {
  if (n == null) return "—";
  return `${n.toLocaleString("en-US", { maximumFractionDigits: maxFractionDigits })}%`;
}

export function parseLoanTermYears(product: string): number {
  const match = product.match(/(\d+)\s*[-–]?\s*year/i);
  return match ? parseInt(match[1]) : 30;
}
