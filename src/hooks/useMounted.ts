"use client";

import { useEffect, useState } from "react";

/**
 * True once the component has mounted on the client. Server rendering and the
 * first client render both report `false`, so consumers keep a stable,
 * server-renderable value until hydration. Use it to gate features that must
 * not appear in the server HTML (e.g. animated forms built with framer-motion).
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
