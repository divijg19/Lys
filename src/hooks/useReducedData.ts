"use client";
import { useEffect, useState } from "react";

interface NavigatorConnection {
  connection?: { saveData?: boolean; effectiveType?: string };
}

/**
 * useReducedData
 * Detects user intent to save data via the Network Information API (saveData / effectiveType)
 * and applies a `data-low-data` attribute to <html>. Heavy visuals / animations can key off this.
 * Gracefully no-ops in unsupported environments.
 */
export function useReducedData() {
  const [reducedData, setReducedData] = useState(false);
  useEffect(() => {
    try {
      const nav = navigator as Navigator & NavigatorConnection;
      const saveData = !!nav.connection?.saveData;
      const effectiveType: string | undefined = nav.connection?.effectiveType;
      if (saveData || ["slow-2g", "2g"].includes(effectiveType || "")) {
        setReducedData(true);
        document.documentElement.setAttribute("data-low-data", "true");
      }
    } catch {
      // ignore
    }
  }, []);
  return { reducedData } as const;
}
