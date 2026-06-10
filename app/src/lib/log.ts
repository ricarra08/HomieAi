/**
 * Production-safe error logging for API routes.
 *
 * Dev: full detail including message, stack, and arbitrary context.
 * Production: redacted output keyed by `event` and `route`, with a hashed user id when supplied.
 *   Stack traces are kept (helpful for ops) but free-form context is dropped to avoid leaking
 *   addresses, emails, or other PII to stdout.
 */

import { createHash } from "node:crypto";

const IS_PROD = process.env.NODE_ENV === "production";

export interface LogContext {
  route: string;
  event: string;
  userId?: string;
  status?: number;
  [key: string]: unknown;
}

function hashUserId(userId: string | undefined): string | undefined {
  if (!userId) return undefined;
  return createHash("sha256").update(userId).digest("hex").slice(0, 16);
}

export function logRouteError(ctx: LogContext, err: unknown): void {
  const errClass = err instanceof Error ? err.constructor.name : typeof err;
  const message = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : undefined;

  if (IS_PROD) {
    const safe = {
      level: "error",
      route: ctx.route,
      event: ctx.event,
      status: ctx.status,
      userHash: hashUserId(ctx.userId),
      errClass,
      stack,
    };
    console.error(JSON.stringify(safe));
    return;
  }

  console.error(`[${ctx.route}] ${ctx.event}:`, { message, stack, ctx });
}
