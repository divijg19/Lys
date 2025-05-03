import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enables React Strict Mode for highlighting potential problems
  webpack(config) {
    // Ensure alias object exists
    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }

    // Set up alias for absolute imports from 'src' directory
    config.resolve.alias["@"] = path.resolve(__dirname, "src");

    return config;
  },
};

export default nextConfig;
