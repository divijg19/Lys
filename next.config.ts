import path from "node:path";
import withBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";
import type { Configuration as WebpackConfiguration } from "webpack";

/**
 * @type {NextConfig}
 *
 * A world-class Next.js configuration designed for performance, security, and a professional developer experience.
 * It includes advanced optimizations and is fully integrated with the project's content layer (Velite).
 */
const nextConfig: NextConfig = {
  // Add pageExtensions to ensure Next.js recognizes MDX files as pages
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],

  // Cutting-edge React 19 & Next.js experimental features
  experimental: {
    reactCompiler: true,
    inlineCss: true,
    mdxRs: true,
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-icons",
      "react-intersection-observer",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "date-fns",
      "clsx",
      "tailwind-merge",
      "react-hook-form",
      "@hookform/resolvers",
      "zod",
    ],
  },

  // Since you are using Tailwind CSS, the styled-components compiler is not needed.
  // compiler: {
  //   styledComponents: ...
  // },

  // Ultra-aggressive compiler optimizations for smaller production bundles
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
    reactRemoveProperties: process.env.NODE_ENV === "production",
  },

  // Next-gen image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Removed 512 to keep the list concise
    minimumCacheTTL: 31536000, // 1 year cache
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    loader: "default",
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    unoptimized: false,
  },

  // Advanced security & performance headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // A more refined Content-Security-Policy will be necessary after identifying inline scripts
        ],
      },
      // Cache-control headers for static assets
      {
        source: "/assets/(.*)", // Consolidating caching rules
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },

  // Smart redirects
  async redirects() {
    return [
      { source: "/github", destination: "https://github.com/divijg19", permanent: true }, // Set to true for permanent redirects
      {
        source: "/linkedin",
        destination: "https://linkedin.com/in/divij-ganjoo",
        permanent: true,
      },
      {
        source: "/instagram",
        destination: "https://instagram.com/one_excellent_hope",
        permanent: true,
      },
      { source: "/cv", destination: "/resume.pdf", permanent: false },
    ];
  },

  webpack: (
    config: WebpackConfiguration,
    { dev, isServer }: { dev: boolean; isServer: boolean }
  ) => {
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];

    const imageRule = config.module.rules.find((rule) => {
      if (rule && typeof rule === "object" && rule.test instanceof RegExp) {
        return rule.test.test(".svg");
      }
      return false;
    });

    if (imageRule && typeof imageRule === "object") {
      imageRule.exclude = /\.svg$/;
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            icon: true,
            svgoConfig: {
              plugins: [
                { name: "preset-default", params: { overrides: { removeViewBox: false } } },
                "removeDimensions", // Add this plugin to remove width/height attributes
              ],
            },
          },
        },
      ],
    });

    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        concatenateModules: true,
        splitChunks: {
          chunks: "all",
        },
      };
    }

    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./src"),
    };

    return config;
  },

  // General configuration
  trailingSlash: false,
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
  compress: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
};

// Pass options to withBundleAnalyzer and then wrap nextConfig
export default withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})(nextConfig);
