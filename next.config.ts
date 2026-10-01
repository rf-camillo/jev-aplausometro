import type { NextConfig } from "next";

/**
 * Headers for every response. The page may not be framed by another site, types are not
 * guessed, and no more than the origin leaks to the sites it links to. The content policy
 * stops plugins, a rewritten base and forms posting elsewhere; scripts stay as Next serves them.
 */
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'",
  },
];

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/opengraph-image": ["./assets/fonts/*.ttf"],
    "/r/[code]/opengraph-image": ["./assets/fonts/*.ttf"],
  },
  headers() {
    return Promise.resolve([{ source: "/:path*", headers: SECURITY_HEADERS }]);
  },
};

export default config;
