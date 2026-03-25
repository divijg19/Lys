/**
 * @file: src/components/theme/scenes/HorizonScene.tsx
 * @description: Renders the multi-layered "Dynamic Day Cycle" for the Horizon theme.
 * Identity: "Horizon / Dynamic Day Cycle"
 */

"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
/**
 * The background scene component for the Horizon theme.
 * This component builds a complex landscape by layering a sky gradient,
 * animated clouds, a lens flare effect, and a masked foreground to create
 * the feeling of looking out over a planet's horizon from orbit.
 */
import { type DayPhase, useDayPhase } from "@/hooks/useDayPhase";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const HorizonTheaterCanvas = dynamic(
  () =>
    import("./horizon/HorizonTheaterCanvas").then((mod) => ({ default: mod.HorizonTheaterCanvas })),
  {
    ssr: false,
    loading: () => null,
  }
);

const readIsCalm = (): boolean => {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return root.hasAttribute("data-low-data") || root.hasAttribute("data-reduce-motion");
};

const HORIZON_GRAIN_DATA_URI =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='180'%20height='180'%20viewBox='0%200%20180%20180'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='.9'%20numOctaves='3'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='180'%20height='180'%20filter='url(%23n)'%20opacity='.38'/%3E%3C/svg%3E";

const canUseWebGL = (): boolean => {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
};

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
  const [isCalmFromRoot, setIsCalmFromRoot] = useState(false);
  const [webglOk, setWebglOk] = useState(false);

  useEffect(() => {
    const update = () => setIsCalmFromRoot(readIsCalm());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-low-data", "data-reduce-motion"],
    });
    return () => observer.disconnect();
  }, []);

  const isCalm = noAnim || isCalmFromRoot;

  useEffect(() => {
    if (isCalm) {
      setWebglOk(false);
      return;
    }
    setWebglOk(canUseWebGL());
  }, [isCalm]);

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
          // Late-morning (≈10am): brighter whites/blues, minimal dusk warmth
          sky: "linear-gradient(to top, hsl(28 95% 62%), hsl(42 100% 78%), hsl(200 70% 86%), hsl(210 60% 96%), hsl(210 50% 98%))",
          lens: "radial-gradient(circle at 50% 58%, hsl(210 60% 98% / 0.75), transparent 72%)",
          overlayType: "clouds",
          foregroundColor: "hsl(220 30% 10% / 0.55)",
          mask: "/assets/backgrounds/horizon-cliffs.svg",
          extras: { reflection: true },
        };
      case "evening":
        return {
          id: "sunset",
          // Sunset: surreal orange horizon with a deeper indigo upper half
          sky: "linear-gradient(to top, hsl(8 95% 32%) 0%, hsl(14 98% 42%) 10%, hsl(22 100% 56%) 18%, hsl(32 100% 68%) 26%, hsl(242 78% 22%) 44%, hsl(234 70% 14%) 68%, hsl(230 55% 8%) 100%)",
          lens: "radial-gradient(circle at 52% 58%, hsl(28 100% 82% / 0.55), transparent 76%)",
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
          // seaside cliff foreground; skyline appears as a midground layer below
          foregroundColor: "hsl(240 30% 10% / 0.58)",
          mask: "/assets/backgrounds/horizon-cliffs.svg",
        };
      default:
        return {
          id: "day",
          // Afternoon: warm, orange-forward (avoid reading as dusk-blue)
          sky: "linear-gradient(to top, hsl(10 95% 44%) 0%, hsl(18 100% 52%) 14%, hsl(28 100% 62%) 28%, hsl(190 65% 52%) 52%, hsl(200 65% 82%) 76%, hsl(210 55% 96%) 100%)",
          lens: "radial-gradient(circle at 50% 56%, hsl(40 100% 88% / 0.5), transparent 68%)",
          overlayType: "clouds",
          foregroundColor: "hsl(24 55% 18% / 0.45)",
          mask: "/assets/backgrounds/dunes.svg",
        };
    }
  })();

  const vignette = (() => {
    switch (variant.id) {
      case "night-city":
        return { x: 60, y: 16, strength: 0.5, bottom: 0.14, opacity: 0.78 };
      case "sunset":
        return { x: 44, y: 18, strength: 0.4, bottom: 0.12, opacity: 0.74 };
      case "sunrise":
        return { x: 40, y: 14, strength: 0.32, bottom: 0.09, opacity: 0.7 };
      default:
        return { x: 54, y: 16, strength: 0.34, bottom: 0.1, opacity: 0.72 };
    }
  })();

  const phaseFx = (() => {
    switch (variant.id) {
      case "sunrise":
        return {
          className: isCalm ? "" : "animate-horizon-sunrise-shimmer",
          style: {
            backgroundImage:
              "linear-gradient(to top, transparent 52%, hsl(36 95% 72% / 0.10) 70%, transparent 88%), radial-gradient(1100px 640px at 50% 82%, hsl(40 100% 85% / 0.16), transparent 72%), radial-gradient(1200px 720px at 48% 70%, hsl(200 70% 88% / 0.10), transparent 72%)",
            backgroundSize: "100% 100%, 120% 120%, 120% 120%",
            mixBlendMode: "screen" as const,
            opacity: 0.48,
          },
        };
      case "sunset":
        return {
          className: isCalm ? "" : "animate-horizon-sunset-drift",
          style: {
            backgroundImage:
              "radial-gradient(1100px 700px at 50% 86%, hsl(24 100% 74% / 0.18), transparent 70%), radial-gradient(900px 640px at 42% 66%, hsl(35 100% 72% / 0.10), transparent 74%), radial-gradient(900px 640px at 62% 72%, hsl(12 100% 65% / 0.08), transparent 76%), linear-gradient(to top, transparent 54%, hsl(240 85% 62% / 0.06) 72%, transparent 88%)",
            backgroundSize: "120% 120%, 120% 120%, 120% 120%, 100% 100%",
            mixBlendMode: "screen" as const,
            opacity: 0.52,
          },
        };
      case "night-city":
        return {
          className: isCalm ? "" : "animate-horizon-night-twinkle",
          style: {
            backgroundImage:
              "radial-gradient(900px 700px at 58% 34%, hsl(250 90% 85% / 0.10), transparent 70%), radial-gradient(900px 700px at 24% 26%, hsl(190 90% 70% / 0.10), transparent 70%), linear-gradient(to top, transparent 60%, hsl(240 70% 85% / 0.07) 76%, transparent 90%), radial-gradient(circle at 12% 28%, hsl(0 0% 100% / 0.45) 0 1px, transparent 1px), radial-gradient(circle at 78% 44%, hsl(0 0% 100% / 0.28) 0 1px, transparent 1px)",
            backgroundRepeat: "no-repeat, no-repeat, no-repeat, repeat, repeat",
            backgroundSize: "140% 140%, 140% 140%, 100% 100%, 420px 420px, 620px 620px",
            mixBlendMode: "screen" as const,
            opacity: 0.55,
          },
        };
      default:
        return {
          className: isCalm ? "" : "animate-horizon-day-caustics",
          style: {
            backgroundImage:
              "radial-gradient(1200px 760px at 50% 84%, hsl(48 100% 86% / 0.10), transparent 72%), radial-gradient(1000px 680px at 56% 56%, hsl(190 80% 70% / 0.07), transparent 72%), radial-gradient(900px 520px at 42% 76%, hsl(28 100% 70% / 0.07), transparent 72%)",
            backgroundSize: "140% 140%, 140% 140%, 140% 140%",
            mixBlendMode: "overlay" as const,
            opacity: 0.42,
          },
        };
    }
  })();

  const grainOpacity =
    variant.id === "night-city"
      ? 0.08
      : variant.id === "sunset"
        ? 0.07
        : variant.id === "sunrise"
          ? 0.05
          : 0.06;

  const nightSetting =
    variant.id === "night-city"
      ? {
          skyline: {
            mask: "/assets/backgrounds/horizon-skyline.svg",
            color: "hsl(260 25% 10% / 0.55)",
            opacity: 0.42,
            blurPx: 0.8,
          },
        }
      : null;

  const sunriseSetting =
    variant.id === "sunrise"
      ? {
          ridge: {
            mask: "/assets/backgrounds/horizon-cliffs.svg",
            color: "hsl(25 55% 18% / 0.25)",
            opacity: 0.22,
            blurPx: 1.2,
          },
        }
      : null;

  return (
    <>
      {/* Sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: variant.sky,
          transitionProperty: isCalm ? "none" : "background",
          transitionDuration: isCalm ? "0ms" : "2000ms",
          transitionTimingFunction: "ease",
        }}
        data-day-phase={effectivePhase}
        data-horizon-variant={variant.id}
        data-phase-overridden={phaseOverride ? "true" : "false"}
      />

      {/* WebGL layered 2.5D theater (real depth; gated) */}
      {webglOk && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.96,
            mixBlendMode: "normal",
          }}
          aria-hidden
        >
          <HorizonTheaterCanvas
            variant={variant.id as "sunrise" | "sunset" | "night-city" | "day"}
            isCalm={isCalm}
          />
        </div>
      )}

      {/* Phase-specific cinematic FX (gentle loop per phase) */}
      {!webglOk && (
        <div
          className={`absolute inset-0 ${phaseFx.className}`}
          style={phaseFx.style}
          aria-hidden
        />
      )}

      {/* Subtle vignette for depth */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(1200px 700px at ${vignette.x}% ${vignette.y}%, transparent 48%, hsl(0 0% 0% / ${vignette.strength}) 100%), linear-gradient(to top, hsl(0 0% 0% / ${vignette.bottom}), transparent 55%)`,
          mixBlendMode: "multiply",
          opacity: vignette.opacity,
        }}
        aria-hidden
      />

      {/* Sun / moon / glow */}
      <div
        className={`absolute left-1/2 top-2/3 -translate-x-1/2 rounded-full opacity-50 mix-blend-screen ${
          isCalm ? "" : "animate-lens-flare-pulse"
        }`}
        style={{
          background: variant.lens,
          width: "28rem",
          height: "28rem",
        }}
        aria-hidden
      />

      {/* Evening: blurred beachside sunset sphere near the horizon */}
      {variant.id === "sunset" && (
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full"
          style={{
            // Sits just above the waterline to read as a beachside sun orb.
            bottom: "2%",
            width: "14rem",
            height: "14rem",
            background:
              "radial-gradient(circle at 50% 50%, hsl(32 100% 70% / 0.42), hsl(18 100% 58% / 0.26) 42%, hsl(235 70% 40% / 0.12) 62%, transparent 78%)",
            filter: "blur(14px)",
            opacity: 0.5,
            mixBlendMode: "screen",
          }}
          aria-hidden
        />
      )}

      {/* Evening: subtle water reflection banding (sunset only) */}
      {variant.id === "sunset" && (
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            height: "28%",
            backgroundImage:
              "radial-gradient(900px 420px at 50% 92%, hsl(28 100% 75% / 0.18), transparent 72%), repeating-linear-gradient(92deg, transparent 0 34px, hsl(0 0% 100% / 0.05) 34px 36px, transparent 36px 78px)",
            backgroundRepeat: "no-repeat, repeat",
            backgroundSize: "120% 120%, 520px 100%",
            mixBlendMode: "screen",
            opacity: 0.32,
            filter: "blur(2px)",
            maskImage: "linear-gradient(to top, hsl(0 0% 0% / 1) 0%, transparent 80%)",
            WebkitMaskImage: "linear-gradient(to top, hsl(0 0% 0% / 1) 0%, transparent 80%)",
          }}
          aria-hidden
        />
      )}

      {/* Atmospheric overlay */}
      {!webglOk && variant.overlayType === "clouds" && (
        <div
          className={`absolute inset-0 opacity-20 ${isCalm ? "" : "animate-sky-pan"}`}
          style={{
            backgroundImage:
              "radial-gradient(closest-side at 18% 28%, hsl(0 0% 100% / 0.18), transparent 68%), radial-gradient(closest-side at 44% 18%, hsl(0 0% 100% / 0.14), transparent 70%), radial-gradient(closest-side at 72% 32%, hsl(0 0% 100% / 0.16), transparent 72%), radial-gradient(closest-side at 30% 56%, hsl(0 0% 100% / 0.10), transparent 74%), radial-gradient(closest-side at 78% 62%, hsl(0 0% 100% / 0.10), transparent 76%)",
            backgroundRepeat: "repeat",
            backgroundSize: "620px 340px",
          }}
        />
      )}
      {!webglOk && variant.overlayType === "stars" && (
        <div
          className={`absolute inset-0 opacity-30 ${isCalm ? "" : "animate-pan-diagonal"}`}
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, hsl(0 0% 100% / 0.7) 0 1px, transparent 1px), radial-gradient(circle at 70% 60%, hsl(0 0% 100% / 0.5) 0 1px, transparent 1px), radial-gradient(circle at 40% 80%, hsl(0 0% 100% / 0.6) 0 1px, transparent 1px)",
            backgroundRepeat: "repeat",
            backgroundSize: "300px 300px, 500px 500px, 400px 400px",
          }}
        />
      )}
      {!webglOk && variant.overlayType === "haze" && (
        <div
          className="absolute inset-0 opacity-22"
          style={{
            background:
              "radial-gradient(ellipse at 50% 62%, hsl(28 95% 62% / 0.28), transparent 70%), radial-gradient(ellipse at 55% 28%, hsl(235 70% 40% / 0.26), transparent 62%), linear-gradient(to top, hsl(232 55% 14% / 0.42), transparent 60%)",
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* Optional water reflection glow */}
      {!webglOk && variant.extras?.reflection && (
        <div
          className="absolute inset-x-0 bottom-0 h-1/3 opacity-40 blur-md"
          style={{
            background:
              variant.id === "sunset"
                ? "linear-gradient(to top, hsl(18 100% 62% / 0.42), hsl(28 95% 65% / 0.18), transparent)"
                : variant.id === "sunrise"
                  ? "linear-gradient(to top, hsl(35 100% 68% / 0.38), hsl(200 70% 85% / 0.16), transparent)"
                  : "linear-gradient(to top, hsl(24 90% 60% / 0.5), hsl(24 90% 60% / 0.2), transparent)",
            mixBlendMode: "overlay",
          }}
        />
      )}

      {/* Midground silhouettes (distance detail for realism) */}
      {!webglOk && nightSetting && (
        <div
          className="absolute right-0 left-0"
          style={{
            height: "38%",
            bottom: "18%",
            opacity: nightSetting.skyline.opacity,
            background: nightSetting.skyline.color,
            maskImage: `url(${nightSetting.skyline.mask})`,
            WebkitMaskImage: `url(${nightSetting.skyline.mask})`,
            maskSize: "cover",
            maskPosition: "bottom",
            filter: `blur(${nightSetting.skyline.blurPx}px)`,
          }}
          aria-hidden
        />
      )}
      {!webglOk && sunriseSetting && (
        <div
          className="absolute right-0 left-0"
          style={{
            height: "44%",
            bottom: "10%",
            opacity: sunriseSetting.ridge.opacity,
            background: sunriseSetting.ridge.color,
            maskImage: `url(${sunriseSetting.ridge.mask})`,
            WebkitMaskImage: `url(${sunriseSetting.ridge.mask})`,
            maskSize: "cover",
            maskPosition: "bottom",
            filter: `blur(${sunriseSetting.ridge.blurPx}px)`,
          }}
          aria-hidden
        />
      )}

      {/* City lights / shoreline glints (adds realism; calm-gated) */}
      {!webglOk && nightSetting && (
        <div
          className={`absolute right-0 left-0 ${isCalm ? "" : "animate-horizon-city-flicker"}`}
          style={{
            height: "30%",
            bottom: "18%",
            opacity: 0.32,
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0 10px, hsl(40 100% 85% / 0.20) 10px 11px, transparent 11px 22px), repeating-linear-gradient(90deg, transparent 0 18px, hsl(200 90% 80% / 0.14) 18px 19px, transparent 19px 36px)",
            backgroundRepeat: "repeat",
            backgroundSize: "280px 100%, 420px 100%",
            mixBlendMode: "screen",
            maskImage: `url(${nightSetting.skyline.mask})`,
            WebkitMaskImage: `url(${nightSetting.skyline.mask})`,
            maskSize: "cover",
            maskPosition: "bottom",
          }}
          aria-hidden
        />
      )}

      {/* Foreground silhouette */}
      {!webglOk && (
        <div
          className="absolute right-0 bottom-0 left-0 opacity-85"
          style={{
            height: variant.id === "sunset" ? "18%" : "25%",
            background: variant.foregroundColor,
            maskImage: `url(${variant.mask})`,
            WebkitMaskImage: `url(${variant.mask})`,
            maskSize: "cover",
            maskPosition: "bottom",
          }}
        />
      )}

      {/* Cinematic grain (static, subtle; top-most) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${HORIZON_GRAIN_DATA_URI})`,
          backgroundRepeat: "repeat",
          backgroundSize: "180px 180px",
          mixBlendMode: "soft-light",
          opacity: grainOpacity,
        }}
        aria-hidden
      />
    </>
  );
};

export default HorizonScene;
