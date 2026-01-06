/**
@file: src/components/theme/ThemeToggle.tsx
@description: The user's primary interface for navigating the portfolio's seven aesthetic universes.
This component provides a highly animated, accessible, and robust dropdown menu
for switching between themes. It is engineered to deliver a world-class user
experience, featuring:
Seamless Integration: Leverages our custom useTheme hook, abstracting away raw theme logic and hydration state.
Fluid Animations: A custom "scrolling" text animation using Framer Motion provides slick visual feedback when the theme changes.
Layout Shift Prevention: Implements the critical modal={false} prop to prevent page content from shifting when the menu is opened.
SSR-Ready & Hydration-Safe: Ensures robust operation by using the isMounted state from our hook to gracefully handle server-side rendering.
Centralized Data: Pulls theme objects from a single source of truth (/lib/themes) for easy maintenance and scalability.
*/

"use client";

import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useTheme } from "@/hooks/useTheme";
import { themes } from "@/lib/themes";

/**
 * The primary UI control for selecting and cycling through the portfolio's themes.
 */
export function ThemeToggle() {
  // Use our custom, application-specific hook.
  // This provides the full theme object, a type-safe setter, and the mounted state.
  const { theme: currentTheme, setTheme, isMounted } = useTheme();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label={`Current theme: ${isMounted ? currentTheme.displayName : "Loading..."}`}
          className="relative h-9 w-36 justify-start overflow-hidden px-3 font-medium text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {/* Show a skeleton loader until the hook is mounted on the client. */}
          {!isMounted && <div className="h-full w-full animate-pulse rounded-md bg-muted" />}

          {/* Once mounted, display the animated theme name and icon. */}
          {isMounted && (
            <span
              key={currentTheme.name}
              className="absolute flex items-center gap-2 animate-slot-in"
            >
              <currentTheme.icon
                className="h-4 w-4 shrink-0"
                aria-hidden="true"
              />
              {currentTheme.displayName}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      {/* Set width to w-36 to match the button and add sideOffset for spacing */}
      <DropdownMenuContent
        align="end"
        className="w-36"
        sideOffset={4}
      >
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.name}
            // Pass the entire theme object to our custom hook's setter.
            onClick={() => setTheme(themeOption)}
            aria-selected={currentTheme.name === themeOption.name}
            className="cursor-pointer"
          >
            <themeOption.icon
              className="mr-2 h-4 w-4"
              aria-hidden="true"
            />
            <span>{themeOption.displayName}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
