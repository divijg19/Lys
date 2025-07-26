/**
 * @file: src/components/theme/ThemeToggle.tsx
 * @description: A highly animated, accessible theme switcher component.
 *
 * This component provides a dropdown menu to switch between all available themes.
 * It features:
 * - A smooth, "scrolling" animation for the currently selected theme.
 * - Hydration-safe rendering to work seamlessly with Next.js SSR.
 * - An important fix (`modal={false}`) to prevent body layout shifts on open.
 * - Direct integration with `next-themes` for robust state management.
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes"; // <-- USE THE STANDARD HOOK
import { useEffect, useState } from "react";

// --- CORE-UI & DATA ---
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { themes } from "@/lib/themes"; // <-- SINGLE SOURCE OF TRUTH

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  // Use the standard `next-themes` hook. It returns the current theme as a string.
  const { theme: currentThemeName, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Find the full theme object based on the current theme name string.
  const currentTheme = themes.find((t) => t.name === currentThemeName);

  // The animation variants for the text inside the button.
  const animation = {
    initial: { y: "150%" },
    animate: { y: 0 },
    exit: { y: "-150%" },
    transition: { type: "spring" as const, duration: 0.35, bounce: 0 },
  };

  return (
    // THE FIX: `modal={false}` is crucial. It prevents the underlying Radix UI
    // component from adding `padding-right` to the body when the dropdown
    // is open, which is the root cause of layout shift on scrollable pages.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label={`Current theme: ${currentTheme?.displayName || "Loading..."}`}
          // Set a fixed width to prevent layout shift as the theme name changes.
          className="relative h-9 w-32 justify-start overflow-hidden px-3 font-medium text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {/* Hydration Guard: Render a skeleton while waiting for the client to mount */}
          {!mounted && (
            <div className="absolute inset-0 h-full w-full animate-pulse rounded-md bg-muted" />
          )}

          {/* AnimatePresence allows the exit animation of the old theme name */}
          {mounted && currentTheme && (
            <AnimatePresence initial={false}>
              <motion.span
                key={currentTheme.name}
                initial={animation.initial}
                animate={animation.animate}
                exit={animation.exit}
                transition={animation.transition}
                className="absolute flex items-center gap-2"
              >
                <currentTheme.icon className="h-4 w-4" />
                {currentTheme.displayName}
              </motion.span>
            </AnimatePresence>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-32">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            // `setTheme` expects the theme name string, not the full object.
            onClick={() => setTheme(theme.name)}
            aria-selected={currentThemeName === theme.name}
          >
            <theme.icon className="mr-2 h-4 w-4" />
            <span>{theme.displayName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
