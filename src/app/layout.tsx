import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { ClientFooter } from "@/components/layout/ClientFooter";
import { GlobalLayoutShiftFix } from "@/components/layout/GlobalLayoutShiftFix"; // <-- IMPORT THE FIX
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { geistMono, geistSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";

// --- METADATA & VIEWPORT ---
// This is perfectly configured for SEO and a great cross-device experience.
export const metadata: Metadata = {
  title: {
    default: "Divij Ganjoo",
    template: "%s | Divij Ganjoo",
  },
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
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
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

// --- ROOT LAYOUT ---
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn("scroll-smooth", geistSans.variable, geistMono.variable)}
      suppressHydrationWarning // Essential for next-themes to prevent hydration errors
    >
      <body className={cn("min-h-screen bg-background font-sans text-foreground antialiased")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* This component renders nothing but contains the global logic
              to automatically detect and compensate for layout shifts. */}
          <GlobalLayoutShiftFix />

          {/* Accessibility best practice: "Skip to Main Content" link */}
          <a
            href="#main-content"
            className="-translate-x-full absolute top-0 left-0 block rounded-md bg-primary p-3 font-medium text-primary-foreground text-sm transition-transform focus:translate-x-0"
          >
            Skip to Main Content
          </a>

          <div className="relative flex min-h-dvh flex-col">
            <Navbar />
            <main id="main-content" className="container flex-1 py-8 md:py-12">
              {children}
            </main>
            <Suspense>
              <ClientFooter />
            </Suspense>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
