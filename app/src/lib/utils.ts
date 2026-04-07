import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(n: number | null | undefined): string {
  if (n == null) return "—";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

export function parseLoanTermYears(product: string): number {
  const match = product.match(/(\d+)\s*[-–]?\s*year/i);
  return match ? parseInt(match[1]) : 30;
}
