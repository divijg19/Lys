import { createRequire } from "node:module";
import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  async headers() {
    // Disable CSP/security headers in dev to unblock react-refresh (unsafe-eval not needed in prod build output)
    if (!isProd) return [];
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/assets/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/github", destination: "https://github.com/divijg19", permanent: true },
      { source: "/linkedin", destination: "https://linkedin.com/in/divij-ganjoo", permanent: true },
      {
        source: "/instagram",
        destination: "https://instagram.com/one_excellent_hope",
        permanent: true,
      },
      { source: "/cv", destination: "/resume.pdf", permanent: false },
      { source: "/blogs", destination: "/blog", permanent: true },
      { source: "/blogs/:slug*", destination: "/blog/:slug*", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 95],
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

// Keep bundle analyzer optional so it doesn't bloat production installs.
// NOTE: Next transpiles TS config and loads it via require(), so we must avoid top-level await.
const withBundleAnalyzer = (() => {
  if (process.env.ANALYZE !== "true") return (config: NextConfig) => config;
  const require = createRequire(import.meta.url);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const mod = require("@next/bundle-analyzer");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  return mod.default({ enabled: true }) as (config: NextConfig) => NextConfig;
})();

export default withBundleAnalyzer(nextConfig);
