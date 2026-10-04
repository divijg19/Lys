"use client";

/**
 * @file: src/hooks/useReducedData.ts
 * @description: Reactive read of the Network Information API's data-constraint signals.
 *
 * This hook previously wrote `data-low-data` onto `<html>` itself, which made it a second
 * writer of calm state alongside `ClientAttrWrapper` -- and it only ever added the
 * attribute. There was no `removeAttribute` for it anywhere in the codebase and no
 * `change` listener, so a visitor who hit a slow connection stayed in low-data mode for the
 * rest of the session even after the connection recovered.
 *
 * It is now a pure read. `ClientAttrWrapper` is the single owner of the attribute and
 * derives it from this hook's value, which means the attribute is added and removed in one
 * place and cannot get stuck.
 */

import { useEffect, useState } from "react";

/** The subset of `NetworkInformation` this app relies on. */
export interface ConnectionLike {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: "change", listener: () => void) => void;
  removeEventListener?: (type: "change", listener: () => void) => void;
}

/** Effective connection types treated as too constrained for decorative motion. */
export const CONSTRAINED_CONNECTION_TYPES = ["slow-2g", "2g"] as const;

/**
 * Decide whether a connection counts as data-constrained.
 *
 * Pure, so the thresholds can be asserted without a browser.
 */
export function isConnectionConstrained(connection: ConnectionLike | undefined): boolean {
  if (!connection) return false;
  if (connection.saveData) return true;
  const effectiveType = connection.effectiveType ?? "";
  return (CONSTRAINED_CONNECTION_TYPES as readonly string[]).includes(effectiveType);
}

/** Read `navigator.connection` defensively; absent in Firefox and Safari. */
function getConnection(): ConnectionLike | undefined {
  if (typeof navigator === "undefined") return undefined;
  try {
    return (navigator as Navigator & { connection?: ConnectionLike }).connection;
  } catch {
    // Some browsers throw on property access rather than returning undefined.
    return undefined;
  }
}

/**
 * Reactive data-constraint flag.
 *
 * Starts `false` so server and first client render agree, then updates once the effect
 * runs. Callers that need the value before paint should read the `data-low-data`
 * attribute, which `ClientAttrWrapper` maintains.
 *
 * @returns `true` when the visitor asked to save data or is on a 2G connection.
 */
export function useReducedData(): boolean {
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    const connection = getConnection();
    // Unsupported platform: stay false and let the caller fall through to motion.
    if (!connection) return;

    const update = () => setIsReduced(isConnectionConstrained(connection));
    update();

    // The API fires `change` when effectiveType transitions, which is exactly the signal
    // needed to *un*-trip low-data mode rather than latching it for the session.
    connection.addEventListener?.("change", update);
    return () => {
      connection.removeEventListener?.("change", update);
    };
  }, []);

  return isReduced;
}
