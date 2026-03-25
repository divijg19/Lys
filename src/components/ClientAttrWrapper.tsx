"use client";
import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useReducedData } from "@/hooks/useReducedData";

/**
 * ClientAttrWrapper
 * Applies runtime data attributes to <html> for motion & data preferences.
 */
export function ClientAttrWrapper({ children }: { children: React.ReactNode }) {
  const reduceMotion = usePrefersReducedMotion();
  useReducedData();

  const [themeName, setThemeName] = useState<string>("light");

  useEffect(() => {
    const root = document.documentElement;

    const readTheme = () => {
      const nextTheme = root.getAttribute("data-theme") || "light";
      setThemeName(nextTheme);
    };

    readTheme();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
          readTheme();
          break;
        }
      }
    });

    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const themeForcesCalm = themeName === "simple";

  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion || themeForcesCalm) root.setAttribute("data-reduce-motion", "true");
    else root.removeAttribute("data-reduce-motion");
  }, [reduceMotion, themeForcesCalm]);

  useEffect(() => {
    const root = document.documentElement;
    if (themeForcesCalm) root.setAttribute("data-ui-calm", "true");
    else root.removeAttribute("data-ui-calm");
  }, [themeForcesCalm]);
  // Fallback: ensure a data-theme attribute exists very early if next-themes hasn't applied yet
  useEffect(() => {
    const root = document.documentElement;
    if (!root.getAttribute("data-theme")) {
      root.setAttribute("data-theme", "light");
    }
  }, []);
  return <>{children}</>;
}
