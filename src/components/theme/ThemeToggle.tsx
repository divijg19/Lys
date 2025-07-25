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
import { useTheme } from "@/hooks/useTheme";
import { themes } from "@/lib/themes";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme: currentTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    // --- THE FIX ---
    // Add the modal={false} prop here. This tells the underlying Radix UI
    // component not to lock the body scroll when the dropdown is open,
    // which is the root cause of the layout shift.
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label={`Current theme: ${currentTheme?.displayName || "Loading..."}`}
          className="relative h-9 w-32 justify-start overflow-hidden px-3 font-medium text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        >
          {!mounted && (
            <div className="absolute inset-0 h-full w-full animate-pulse rounded-md bg-muted" />
          )}
          {mounted &&
            themes.map((theme) => (
              <AnimatePresence key={theme.name} initial={false}>
                {currentTheme.name === theme.name && (
                  <motion.span
                    initial={{ y: "150%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "-150%" }}
                    transition={{ type: "spring", duration: 0.35, bounce: 0 }}
                    className="absolute flex items-center gap-2"
                  >
                    {theme.icon && <theme.icon className="h-4 w-4" />}
                    {theme.displayName}
                  </motion.span>
                )}
              </AnimatePresence>
            ))}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {themes.map((theme) => (
          <DropdownMenuItem key={theme.name} onClick={() => setTheme(theme)}>
            {theme.icon && <theme.icon className="mr-2 h-4 w-4" />}
            {theme.displayName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
