import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { ClientFooter } from "@/components/layout/ClientFooter";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { geistMono, geistSans } from "@/lib/fonts";
import { cn } from "@/lib/utils"; // Best practice for combining class names
import "@/styles/globals.css";

// --- METADATA & VIEWPORT ---
// This is world-class. No changes are needed.
// It's static, specific, and provides a great experience on all devices and platforms.
export const metadata: Metadata = {
  title: {
    default: "Divij Ganjoo",
    template: "%s | Divij Ganjoo",
  },
  description:
    "Portfolio of Divij Ganjoo – a software developer crafting performant and accessible digital experiences.",
  authors: [{ name: "Divij Ganjoo", url: "https://divijganjoo.me/" }], // Use your actual domain
  metadataBase: new URL("https://divijganjoo.me/"), // Use your actual domain
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
      className={cn(
        "scroll-smooth", // Provides a smoother scrolling experience for anchor links
        geistSans.variable,
        geistMono.variable
      )}
      suppressHydrationWarning // Essential for next-themes to prevent hydration errors
    >
      <body className={cn("min-h-screen bg-background font-sans text-foreground antialiased")}>
        <ThemeProvider
          attribute="class" // Connects to Tailwind's `darkMode: 'class'`
          defaultTheme="system" // Defaults to user's OS setting
          enableSystem // Allows toggling between light, dark, and system
          disableTransitionOnChange // Prevents flash of unstyled content on theme change
        >
          {/* A "Skip to Main Content" link is a non-negotiable for accessibility (A11y) */}
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
