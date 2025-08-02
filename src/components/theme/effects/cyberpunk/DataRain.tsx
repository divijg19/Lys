/**
 * @file: src/components/theme/effects/DataRain.tsx
 * @description: The React component that renders the canvas for the data rain effect.
 */
"use client";

import type React from "react";
import { useRef } from "react";
import { useDataRain } from "@/hooks/useDataRain";

export const DataRain: React.FC = () => {
  // This useRef call correctly creates a ref of type `React.RefObject<HTMLCanvasElement | null>`.
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // This call is now type-safe and will no longer produce an error because the hook
  // has been updated to accept this exact type.
  useDataRain(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      className="-z-50 pointer-events-none fixed inset-0 opacity-30"
    />
  );
};
