/**
 * @file: src/components/theme/scenes/HorizonScene.tsx
 * @description: Renders the multi-layered "Dynamic Day Cycle" for the Horizon theme.
 * Identity: "Horizon / Dynamic Day Cycle"
 */

"use client";

/**
 * The background scene component for the Horizon theme.
 * This component builds a complex landscape by layering a sky gradient,
 * animated clouds, a lens flare effect, and a masked foreground to create
 * the feeling of looking out over a planet's horizon from orbit.
 */
import { type DayPhase, useDayPhase } from "@/hooks/useDayPhase";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface HorizonVariant {
  id: string; // semantic id (e.g., sunrise, sunset, night-city)
  sky: string;
  lens: string;
  overlayType: "clouds" | "stars" | "haze" | "none";
  foregroundColor: string;
  mask: string; // path to silhouette mask
  extras?: {
    reflection?: boolean; // add water reflection glow
  };
}

export interface HorizonSceneProps {
  /** Force a specific day phase (storybook / testing). If omitted, live time is used. */
  phaseOverride?: DayPhase;
  /** Disable animations (respect prefers-reduced-motion or for visual regression). */
  disableAnimation?: boolean;
}

const HorizonScene = ({ phaseOverride, disableAnimation }: HorizonSceneProps) => {
  const { phase } = useDayPhase();
  const effectivePhase = phaseOverride ?? phase;
  const reduceMotion = usePrefersReducedMotion();
  const noAnim = disableAnimation || reduceMotion;

  // Map day phase -> requested narrative variants
  // late-night  -> night city moonbeam
  // morning     -> seacliff sunrise
  // evening     -> beachside sunset
  // afternoon   -> legacy horizon day cycle (retain prior aesthetic)
  const variant: HorizonVariant = (() => {
    switch (effectivePhase) {
      case "morning":
        return {
          id: "sunrise",
          // soft oceanic dawn gradient rising into pale sky
          sky: "linear-gradient(to top, hsl(22 90% 48%), hsl(28 95% 62%), hsl(36 92% 72%), hsl(200 65% 80%), hsl(210 50% 92%))",
          lens: "radial-gradient(circle at 50% 60%, hsl(40 100% 90% / 0.9), transparent 70%)",
          overlayType: "clouds",
          foregroundColor: "hsl(25 65% 40% / 0.25)",
          mask: "/assets/backgrounds/horizon-cliffs.svg",
          extras: { reflection: true },
        };
      case "evening":
        return {
          id: "sunset",
          sky: "linear-gradient(to top, hsl(10 90% 38%), hsl(18 85% 50%), hsl(28 80% 58%), hsl(300 45% 30%), hsl(260 55% 18%))",
          lens: "radial-gradient(circle at 52% 58%, hsl(18 100% 80% / 0.6), transparent 75%)",
          overlayType: "haze",
          foregroundColor: "hsl(18 60% 35% / 0.35)",
          mask: "/assets/backgrounds/horizon-waves.svg",
          extras: { reflection: true },
        };
      case "late-night":
        return {
          id: "night-city",
          sky: "linear-gradient(to top, hsl(230 35% 8%), hsl(248 40% 14%), hsl(260 45% 20%), hsl(270 55% 30%))",
          lens: "radial-gradient(circle at 65% 35%, hsl(250 90% 85% / 0.35), transparent 70%)",
          overlayType: "stars",
          foregroundColor: "hsl(250 30% 20% / 0.45)",
          mask: "/assets/backgrounds/horizon-skyline.svg",
        };
      default:
        return {
          id: "day",
          sky: "linear-gradient(to top, hsl(30 95% 60%), hsl(260 70% 35%), hsl(224 71% 4%))",
          lens: "radial-gradient(circle at 50% 55%, hsl(48 100% 85% / 0.6), transparent 65%)",
          overlayType: "clouds",
          foregroundColor: "hsl(28 65% 40% / 0.3)",
          mask: "/assets/backgrounds/dunes.svg",
        };
    }
  })();

  return (
    <>
      {/* Sky gradient */}
      <div
        className="absolute inset-0 transition-[background] duration-[2000ms]"
        style={{ background: variant.sky }}
        data-day-phase={effectivePhase}
        data-horizon-variant={variant.id}
        data-phase-overridden={phaseOverride ? "true" : "false"}
      />

      {/* Sun / moon / glow */}
      <div
        className={`-translate-x-1/2 absolute top-2/3 left-1/2 h-[28rem] w-[28rem] rounded-full opacity-50 mix-blend-screen ${
          noAnim ? "" : "animate-lens-flare-pulse"
        }`}
        style={{ background: variant.lens }}
        aria-hidden
      />

      {/* Atmospheric overlay */}
      {variant.overlayType === "clouds" && (
        <div
          className={`absolute inset-0 opacity-25 ${noAnim ? "" : "animate-sky-pan"}`}
          style={{
            backgroundImage: "url(/assets/backgrounds/clouds.png)",
            backgroundSize: "auto 100%",
          }}
        />
      )}
      {variant.overlayType === "stars" && (
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, hsl(0 0% 100% / 0.7) 0 1px, transparent 1px), radial-gradient(circle at 70% 60%, hsl(0 0% 100% / 0.5) 0 1px, transparent 1px), radial-gradient(circle at 40% 80%, hsl(0 0% 100% / 0.6) 0 1px, transparent 1px)",
            backgroundRepeat: "repeat",
            backgroundSize: "300px 300px, 500px 500px, 400px 400px",
            animation: noAnim ? "none" : "pan-diagonal 60s linear infinite",
          }}
        />
      )}
      {variant.overlayType === "haze" && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(ellipse at 50% 60%, hsl(28 90% 60% / 0.4), transparent 70%), linear-gradient(to top, hsl(18 70% 30% / 0.4), transparent)",
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* Optional water reflection glow */}
      {variant.extras?.reflection && (
        <div
          className="absolute inset-x-0 bottom-0 h-1/3 opacity-40 blur-md"
          style={{
            background:
              "linear-gradient(to top, hsl(24 90% 60% / 0.5), hsl(24 90% 60% / 0.2), transparent)",
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* Foreground silhouette */}
      <div
        className="absolute right-0 bottom-0 left-0 h-1/4 opacity-85"
        style={{
          background: variant.foregroundColor,
          maskImage: `url(${variant.mask})`,
          WebkitMaskImage: `url(${variant.mask})`,
          maskSize: "cover",
          maskPosition: "bottom",
        }}
      />
    </>
  );
};

export default HorizonScene;
