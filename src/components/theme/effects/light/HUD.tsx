/**
 * @file: src/components/theme/effects/light/HUD.tsx
 * @description: Renders the complete Heads-Up Display for the Light theme.
 * This component includes the corner brackets and the telemetry panel for distance
 * and scan targets. It is decorative only.
 *
 * This component lives inside the theme background layer, which is
 * `pointer-events-none` and sits at `-z-50` behind the page content. Any interactive
 * control rendered here is unreachable by pointer and, worse, is still reachable by
 * keyboard while being wrapped in `aria-hidden` -- a focusable element inside an
 * aria-hidden subtree is an explicit WCAG failure. The HUD is therefore presentation
 * only; interactive behaviour belongs in the page UI layer.
 */

"use client";

// This component receives all necessary state as props from the main scene.
interface HUDProps {
  isThirdPerson: boolean;
  hasReachedAnomaly: boolean;
  distance: number;
  scanTarget: string | null;
}

// --- DEFINITIVE REFINEMENT: Destructure props directly for improved clarity. ---
export function HUD({ isThirdPerson, hasReachedAnomaly, distance, scanTarget }: HUDProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      aria-hidden="true"
    >
      {/* Top Left HUD element */}
      <div className="absolute top-4 left-4 h-8 w-8 border-[hsl(var(--foreground)/0.2)] border-t-2 border-l-2" />

      {/* Top Right HUD (view state readout) */}
      <div className="absolute top-4 right-4 flex h-auto w-auto flex-col items-end border-[hsl(var(--foreground)/0.2)] border-t-2 border-r-2 p-2">
        <p className="font-mono text-[hsl(var(--foreground)/0.5)] text-xs">
          VIEW: {isThirdPerson ? "THIRD-PERSON" : "FIRST-PERSON"}
        </p>
        <p className="font-mono text-[hsl(var(--foreground)/0.5)] text-xs">
          {hasReachedAnomaly ? "ANOMALY: LOCKED" : "ANOMALY: TRACKING"}
        </p>
      </div>

      {/* Bottom Left HUD (Telemetry Panel) */}
      <div className="absolute bottom-4 left-4 flex h-auto w-auto min-w-[200px] flex-col border-[hsl(var(--foreground)/0.2)] border-b-2 border-l-2 p-2">
        <p className="font-mono text-[hsl(var(--foreground)/0.5)] text-xs">
          DIST. TO ANOMALY: {distance.toFixed(1)}
        </p>
        <p className="font-mono text-[hsl(var(--foreground)/0.5)] text-xs">
          SCAN TARGET: {scanTarget ?? "NONE"}
        </p>
      </div>

      {/* Bottom Right HUD element */}
      <div className="absolute right-4 bottom-4 h-8 w-8 border-[hsl(var(--foreground)/0.2)] border-r-2 border-b-2" />
    </div>
  );
}
