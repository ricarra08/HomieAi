const windows = new Map<string, { count: number; start: number }>();

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { limited: boolean; remaining: number } {
  const now = Date.now();
  const entry = windows.get(key);

  if (!entry || now - entry.start > windowMs) {
    windows.set(key, { count: 1, start: now });
    return { limited: false, remaining: maxRequests - 1 };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);
  return { limited: entry.count > maxRequests, remaining };
}
