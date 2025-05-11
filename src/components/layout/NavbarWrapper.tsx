// src/components/layout/NavbarWrapper.tsx

"use client";

import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { initializeTheme } from "@/lib/themeUtils";

export default function NavbarWrapper() {
  const [isThemeReady, setIsThemeReady] = useState(false);

  useEffect(() => {
    initializeTheme();
    setIsThemeReady(true);
  }, []);

  // Prevent hydration mismatch by ensuring theme is initialized before rendering Navbar
  if (!isThemeReady) return null;

  return <Navbar />;
}
