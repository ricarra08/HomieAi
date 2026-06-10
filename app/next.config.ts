import type { NextConfig } from "next";

// Baseline security response headers (audit finding H9). Applied to every route.
// Note: a full script/style Content-Security-Policy is deferred — it needs per-request nonce
// wiring in Next to avoid breaking the inline runtime. `frame-ancestors 'none'` is safe to enable
// now and, with X-Frame-Options, blocks clickjacking of authenticated pages.
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
