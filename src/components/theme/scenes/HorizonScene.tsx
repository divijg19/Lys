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
const HorizonScene = () => {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, hsl(30, 100%, 65%), hsl(260, 100%, 15%), hsl(224, 71%, 4%))",
        }}
      />
      <div
        className="-translate-x-1/2 absolute top-2/3 left-1/2 h-96 w-96 animate-lens-flare-pulse rounded-full opacity-30"
        style={{ background: "radial-gradient(ellipse, white, transparent 60%)" }}
      />
      <div
        className="absolute inset-0 animate-sky-pan opacity-20"
        style={{
          backgroundImage: "url(/assets/backgrounds/clouds.png)",
          backgroundSize: "auto 100%",
        }}
      />
      <div
        className="absolute right-0 bottom-0 left-0 h-1/4 opacity-80"
        style={{
          background: "hsl(var(--background))",
          maskImage: "url(/assets/backgrounds/dunes.svg)",
          maskSize: "cover",
          maskPosition: "bottom",
        }}
      />
    </>
  );
};

export default HorizonScene;
