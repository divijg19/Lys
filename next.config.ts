import path from "node:path";
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
    //ppr: true,
    //cacheComponents: true,
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
      "@react-three/rapier",
      "date-fns",
      "clsx",
      "tailwind-merge",
      "react-hook-form",
      "@hookform/resolvers",
      "zod",
    ],
  },

  serverExternalPackages: ["sharp", "canvas", "jsdom"],

  turbopack: {
    rules: {
      "*.svg": { loaders: ["@svgr/webpack"], as: "*.js" },
    },
  },

  // Ultra-aggressive compiler optimizations for smaller production bundles
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
    reactRemoveProperties: process.env.NODE_ENV === "production",
    styledComponents: {
      displayName: process.env.NODE_ENV !== "production",
      ssr: true,
      minify: true,
      transpileTemplateLiterals: true,
    },
  },

  // Next-gen image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    minimumCacheTTL: 31536000, // 1 year cache
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    loader: "default",
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.sanity.io" },
      { protocol: "https", hostname: "**.githubusercontent.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
    unoptimized: false,
  },

  // Advanced security & performance headers to protect against common attacks
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
            value:
              "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
          },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/icons/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/fonts/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },

  // Smart redirects for SEO and user convenience
  async redirects() {
    return [
      { source: "/github", destination: "https://github.com/divijg19", permanent: false },
      {
        source: "/linkedin",
        destination: "https://linkedin.com/in/divij-ganjoo",
        permanent: false,
      },
      { source: "/cv", destination: "/resume.pdf", permanent: false },
    ];
  },

  // World-class webpack optimizations
  webpack: (
    config: WebpackConfiguration,
    { dev, isServer }: { dev: boolean; isServer: boolean }
  ) => {
    if (process.env.ANALYZE === "true") {
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
      config.plugins = config.plugins || [];
      config.plugins.push(
        new BundleAnalyzerPlugin({
          // analyzerMode: "server",
          // openAnalyzer: true,
        })
      );
    }

    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    // This rule is for SVGs, it should not conflict with the MDX loader
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            /* svgr options */
          },
        },
      ],
    });

    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          // Your cacheGroups config can go here
        },
        usedExports: true,
        sideEffects: false,
        concatenateModules: true,
      };
    }

    // --- OPTIMIZATION: Robust Path Aliasing ---
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "./src"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/styles": path.resolve(__dirname, "./src/styles"),
      "#velite": path.resolve(__dirname, "./.velite"),
    };

    config.performance = {
      maxAssetSize: 250000,
      maxEntrypointSize: 250000,
      hints: process.env.NODE_ENV === "production" ? "warning" : false,
    };

    return config;
  },

  output: process.env.EXPORT === "true" ? "export" : undefined,
  distDir: ".next",
  async generateBuildId() {
    return process.env.BUILD_ID || `build-${Date.now()}`;
  },
  trailingSlash: false,
  typescript: { ignoreBuildErrors: false, tsconfigPath: "./tsconfig.json" },
  eslint: { ignoreDuringBuilds: false, dirs: ["src", "components", "lib", "app", "pages"] },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  httpAgentOptions: { keepAlive: true },
  onDemandEntries: { maxInactiveAge: 60 * 1000, pagesBufferLength: 5 },
  productionBrowserSourceMaps: false,
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://yourportfolio.com",
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_UMAMI_ID: process.env.NEXT_PUBLIC_UMAMI_ID,
  },
  modularizeImports: {
    "lucide-react": { transform: "lucide-react/dist/esm/icons/{{member}}" },
    "date-fns": { transform: "date-fns/{{member}}" },
    lodash: { transform: "lodash/{{member}}" },
  },
  logging: { fetches: { fullUrl: true } },
  crossOrigin: "anonymous",
};

export default nextConfig;
