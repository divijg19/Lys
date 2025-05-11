// src/app/layout.tsx

import type { Metadata } from "next";
import "@/styles/globals.css";

import NavbarWrapper from "@/components/layout/NavbarWrapper";
import ClientFooter from "@/components/layout/ClientFooter";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

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
  themeColor: "#ffffff",
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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

// --- Root layout with SSR-safe hydration and theming ---
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="min-h-screen bg-white text-black dark:bg-black dark:text-white transition-colors duration-300 ease-in-out">
        <ThemeProvider>
          <NavbarWrapper />
          <main className="min-h-[calc(100vh-5rem)] px-4 py-10 sm:px-8 md:px-12 lg:px-20">
            {children}
          </main>
          <ClientFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}
