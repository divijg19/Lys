/**
 * @file: src/app/layout.tsx
 * @description: The root layout for the entire application.
 */

import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
// SEO and utilities
import { ClientAttrWrapper } from "@/components/ClientAttrWrapper";
// Layout components
import { AppErrorBoundary } from "@/components/layout/AppErrorBoundary";
import { ClientFooter } from "@/components/layout/ClientFooter";
import { MainWrapper } from "@/components/layout/MainWrapper";
import { Navbar } from "@/components/layout/Navbar";
import { SkipLink } from "@/components/layout/SkipLink";
// Performance and theme components
import { LazyMotionProvider } from "@/components/perf/LazyMotion";
import { RootPersonJsonLd } from "@/components/seo/RootPersonJsonLd";
import { ClientThemeBackground } from "@/components/theme/ClientThemeBackground";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { geistMono, geistSans } from "@/lib/fonts";
import { THEME_NAMES } from "@/lib/themes";
import { cn } from "@/lib/utils";

// Styles
import "@/styles/globals.css";
import "@/styles/a11y.css";

export const metadata: Metadata = {
  title: { default: "Divij Ganjoo", template: "%s | Divij Ganjoo" },
  description:
    "Portfolio of Divij Ganjoo – a software developer crafting performant and accessible digital experiences.",
  authors: [{ name: "Divij Ganjoo", url: "https://divijganjoo.me/" }],
  metadataBase: new URL("https://divijganjoo.me/"),
  openGraph: {
    title: "Divij Ganjoo | Software Developer",
    description: "Performant and accessible digital experiences.",
    url: "https://divijganjoo.me/",
    siteName: "Divij Ganjoo's Portfolio",
    locale: "en_US",
    type: "website",
  },
  icons: { icon: "/favicon.ico", shortcut: "/favicon-16x16.png", apple: "/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Use a stable ID for skip link target
  const mainId = "main-content";
  return (
    <html
      lang="en"
      className={cn("scroll-smooth", geistSans.variable, geistMono.variable)}
      suppressHydrationWarning
    >
      <head>
        {/* Debug utilities removed for production build */}
        <meta
          name="color-scheme"
          content="light dark"
        />
        <meta
          name="theme-color"
          content="#000000"
        />
        <link
          rel="preconnect"
          href="https://images.unsplash.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="//images.unsplash.com"
        />
        <link
          rel="preconnect"
          href="https://res.cloudinary.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="//res.cloudinary.com"
        />
        <link
          rel="preconnect"
          href="https://cdn.sanity.io"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="//cdn.sanity.io"
        />
        {/* Performance and optimization hints */}
        <link
          rel="preload"
          href="/assets/images/divij-ganjoo.jpg"
          as="image"
          type="image/jpeg"
        />
        <meta
          name="robots"
          content="index,follow"
        />
        <meta
          name="googlebot"
          content="index,follow"
        />
        <RootPersonJsonLd />
      </head>
      <body className={cn("min-h-screen bg-background font-sans antialiased")}>
        <ClientAttrWrapper>
          <ThemeProvider
            attribute="data-theme"
            defaultTheme="light"
            enableSystem={false}
            themes={[...THEME_NAMES]}
          >
            {/* Debug hydration & error catcher removed */}
            <ClientThemeBackground />
            <LazyMotionProvider>
              <SkipLink targetId={mainId} />
              <div className="relative z-10 flex min-h-dvh flex-col">
                <Navbar />
                {/** Accessibility: stable id required for skip link target (intentional). */}
                <AppErrorBoundary>
                  <MainWrapper
                    targetId={mainId}
                    className="container flex-1 py-8 md:py-12 outline-none"
                  >
                    {/* Client debug snapshot removed */}
                    {children}
                  </MainWrapper>
                </AppErrorBoundary>
                <Suspense>
                  <ClientFooter />
                </Suspense>
              </div>
              <Toaster />
            </LazyMotionProvider>
          </ThemeProvider>
        </ClientAttrWrapper>
      </body>
    </html>
  );
}
