import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  experimental: {
    typedRoutes: true,
    serverActions: {
      bodySizeLimit: "1mb", // Adjust the size limit as needed
      allowedOrigins: ["*"], // Replace with specific origins if required
    }, // Enable if you're using Server Actions
  },

  images: {
    domains: ["your-domain.com"], // ✅ Replace with your actual domain(s) if using external images
  },

  webpack(config) {
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
