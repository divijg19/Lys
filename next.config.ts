import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    typedRoutes: true,
    // Removed unsupported serverActions block for Next.js 15
  },

  images: {
    domains: ["your-domain.com"], // ✅ Replace with your actual domain(s) if using external images
  },

  webpack(config: any) {
    // Setup alias for cleaner imports
    config.resolve.alias ||= {};
    config.resolve.alias["@"] = path.resolve(__dirname, "src");

    return config;
  },

  // i18n: {
  //   locales: ["en"],
  //   defaultLocale: "en",
  // },

  // Optional: Static export fallback (for GitHub Pages or static hosting)
  // output: "export",
};

export default nextConfig;
