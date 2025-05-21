// src/app/layout.tsx

import type { Metadata } from "next";
import "@/styles/globals.css";

import { geistSans, geistMono } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import ClientFooter from "@/components/layout/ClientFooter";
import BackgroundEffects from "@/components/theme/BackgroundEffects";

// --- Global metadata config ---
export const metadata: Metadata = {
  title: {
    default: "Divij Ganjoo",
    template: "%s | Divij Ganjoo",
  },
  description:
    "Portfolio of Divij Ganjoo – developer, writer, and systems thinker crafting integrated digital ecosystems.",
  authors: [{ name: "Divij Ganjoo", url: "https://your-domain.com" }],
  generator: "Next.js",
  metadataBase: new URL("https://your-domain.com"),
  openGraph: {
    title: "Divij Ganjoo",
    description:
      "Developer, writer, systems thinker – building meaningful digital solutions.",
    url: "https://your-domain.com",
    siteName: "Divij Ganjoo",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Divij's Portfolio",
      },
    ],
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// --- Root layout with SSR-safe hydration and theming ---
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        {/* Next.js will inject title and viewport from metadata/viewport exports */}
      </head>
      <body className="bg-background text-foreground antialiased min-h-screen flex flex-col">
        <ThemeProvider>
          <BackgroundEffects />
          <Navbar />
          <main
            id="main-content"
            className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 focus:outline-none"
            aria-label="Main content"
          >
            {children}
          </main>
          <ClientFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
