import path from "node:path";
import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import type { RuleSetRule, Configuration as WebpackConfiguration } from "webpack";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  experimental: { mdxRs: true },
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
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
  webpack(config: WebpackConfiguration, { dev }) {
    // Exclude .svg from Next's default image loader and handle with @svgr
    const svgRule = (config.module?.rules as RuleSetRule[])?.find(
      (rule) => rule && rule.test instanceof RegExp && rule.test.test(".svg")
    );
    if (svgRule) svgRule.exclude = /\.svg$/;
    config.module = config.module || { rules: [] };
    (config.module.rules as RuleSetRule[]).push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: { icon: true, svgoConfig: { plugins: ["removeDimensions"] } },
        },
      ],
    });
    if (dev) config.watchOptions = { ignored: ["**/.next/**", "**/node_modules/**"] };
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, "./src"),
    };
    return config;
  },
  reactStrictMode: true,
  poweredByHeader: false,
};

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(nextConfig);
