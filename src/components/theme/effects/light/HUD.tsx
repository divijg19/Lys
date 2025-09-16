/**
 * @file: src/components/theme/effects/light/HUD.tsx
 * @description: Renders the complete Heads-Up Display for the Light theme.
 * This component includes the corner brackets, the telemetry panel for distance
 * and scan targets, and the intuitive camera view toggle. It is built to be
 * stable, clean, and adhere to React best practices.
 */

"use client";

// This component receives all necessary state as props from the main scene.
interface HUDProps {
  isThirdPerson: boolean;
  setIsThirdPerson: (value: boolean) => void;
  hasReachedAnomaly: boolean;
  distance: number;
  scanTarget: string | null;
}

// --- DEFINITIVE REFINEMENT: Destructure props directly for improved clarity. ---
export function HUD({
  isThirdPerson,
  setIsThirdPerson,
  hasReachedAnomaly,
  distance,
  scanTarget,
}: HUDProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      aria-hidden="true"
    >
      {/* Top Left HUD element */}
      <div className="absolute top-4 left-4 h-8 w-8 border-[hsl(var(--foreground)/0.2)] border-t-2 border-l-2" />

      {/* Top Right HUD (with Toggle Camera) */}
      <div className="absolute top-4 right-4 flex h-auto w-auto flex-col items-end border-[hsl(var(--foreground)/0.2)] border-t-2 border-r-2 p-2">
        <p className="font-mono text-[hsl(var(--foreground)/0.5)] text-xs">
          VIEW: {isThirdPerson ? "THIRD-PERSON" : "FIRST-PERSON"}
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsThirdPerson(!isThirdPerson);
          }}
          disabled={hasReachedAnomaly}
          className="pointer-events-auto mt-2 px-2 py-1 font-semibold text-[hsl(var(--foreground)/0.7)] text-xs uppercase tracking-widest ring-1 ring-[hsl(var(--foreground)/0.2)] transition-colors hover:bg-[hsl(var(--foreground)/0.05)] hover:text-[hsl(var(--foreground))] active:bg-[hsl(var(--foreground)/0.1)] disabled:pointer-events-none disabled:opacity-50"
        >
          Toggle View
        </button>
      </div>

      {/* Bottom Left HUD (Telemetry Panel) */}
      <div className="absolute bottom-4 left-4 flex h-auto w-auto min-w-[200px] flex-col border-[hsl(var(--foreground)/0.2)] border-b-2 border-l-2 p-2">
        <p className="font-mono text-[hsl(var(--foreground)/0.5)] text-xs">
          DIST. TO ANOMALY: {distance.toFixed(2)}
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
