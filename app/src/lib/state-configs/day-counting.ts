/**
 * Day counting utility for real estate deadlines.
 *
 * Replaces the inline addDays() functions previously duplicated across
 * TransactionSetupForm, AddClientDialog, OfferView, and computed.ts.
 *
 * Supports:
 * - Calendar day counting (FL, TX)
 * - Business day counting (some deadline types)
 * - Weekend extension: if deadline falls on Sat/Sun, push to Monday (AZ, CA)
 */

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function toDateString(date: Date): string {
  // Use local date parts instead of toISOString() which converts to UTC
  // and can shift the date backward in negative-offset timezones (US).
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(input: Date | string): Date {
  // Append T00:00:00 to date-only strings to force local-time parsing.
  // Without this, "2026-04-26" is parsed as UTC midnight per the JS spec,
  // which shifts to the previous day in negative-offset US timezones.
  const d = typeof input === "string"
    ? new Date(input.length === 10 ? input + "T00:00:00" : input)
    : new Date(input);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Add days to a base date using the specified counting method.
 *
 * @param baseDate - Starting date
 * @param days - Number of days to add
 * @param countingType - "calendar" counts every day, "business" skips weekends
 * @param weekendExtension - If true and final date lands on weekend, push to Monday
 * @returns ISO date string (YYYY-MM-DD)
 */
export function addDays(
  baseDate: Date | string,
  days: number,
  countingType: "calendar" | "business" = "calendar",
  weekendExtension: boolean = false
): string {
  const date = parseDate(baseDate);

  if (countingType === "business") {
    let added = 0;
    while (added < days) {
      date.setDate(date.getDate() + 1);
      if (!isWeekend(date)) {
        added++;
      }
    }
  } else {
    date.setDate(date.getDate() + days);
  }

  if (weekendExtension && isWeekend(date)) {
    while (isWeekend(date)) {
      date.setDate(date.getDate() + 1);
    }
  }

  return toDateString(date);
}

/**
 * Simple calendar-day addition without any business day or weekend logic.
 * Drop-in replacement for the inline addDays used in legacy code paths.
 */
export function addCalendarDays(baseDate: Date | string, days: number): string {
  return addDays(baseDate, days, "calendar", false);
}
