"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useTheme } from "@/hooks/useTheme"; // Using your custom hook
import { themes } from "@/lib/themes"; // Your theme definitions

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  // Using your custom hook's return values
  const { theme: currentTheme, setTheme } = useTheme();

  // Standard hydration safety check
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label={`Current theme: ${currentTheme?.displayName || "Loading..."}`}
          // --- FIXED SIZE & LAYOUT ---
          // `w-36` gives a generous, fixed width for your theme names.
          // `justify-start` prevents the text from jumping when the name changes.
          className="w-36 justify-start font-medium text-sm"
        >
          {mounted && currentTheme ? (
            // Use AnimatePresence for a smooth text transition
            <AnimatePresence mode="wait">
              <motion.span
                key={currentTheme.displayName}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                {/* Display the theme's icon (if it exists) and name */}
                {currentTheme.icon && <currentTheme.icon className="h-4 w-4" />}
                {currentTheme.displayName}
              </motion.span>
            </AnimatePresence>
          ) : (
            // Skeleton loader for initial render and hydration
            <div className="h-4 w-24 animate-pulse rounded-md bg-muted" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {/* Map over your defined themes to create the dropdown items */}
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.name}
            // Use your custom `setTheme` function
            onClick={() => setTheme(theme)}
          >
            {/* Display icon in the dropdown */}
            {theme.icon && <theme.icon className="mr-2 h-4 w-4" />}
            {theme.displayName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
