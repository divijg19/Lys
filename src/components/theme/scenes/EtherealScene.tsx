/**
 * @file: src/components/theme/scenes/EtherealScene.tsx
 * @description: Renders the Ethereal theme using a robust, single-plane interaction model.
 */

"use client";

// Installs the Three.js console filter at module scope, before the scene mounts.
import "./installThreeConsole";

import { Canvas, useThree } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { Color, type PerspectiveCamera, type Vector3 } from "three";
import { ndcFromClient, pointOnCameraSurface, pointOnFloor } from "@/lib/interactionSurface";
import { cssVarToThreeColor } from "@/lib/threeColor";
import { cn } from "@/lib/utils";
import { type RippleData, Ripples } from "../effects/ethereal/Ripples";
import { type WispData, Wisps } from "../effects/ethereal/Wisps";
import { FlowingPlane } from "../effects/FlowingPlane";

const readIsCalm = (): boolean => {
  if (typeof document === "undefined") return false;
  const root = document.documentElement;
  return root.hasAttribute("data-low-data") || root.hasAttribute("data-reduce-motion");
};

/*
 * The colours the scene uses.
 *
 * The *foreground* variants are what the interaction effects are drawn in. The pastel tokens are
 * the field itself -- a lavender ring on a lavender wash is invisible, which is exactly what
 * happened: the echo read clearly over the white parts of the background and disappeared over
 * the tinted parts. The deep tones are what the theme already defines as "the colour to put on
 * this background", and they read on every part of it.
 */
type ThemeColors = {
  primary: Color;
  secondary: Color;
  accent: Color;
  primaryForeground: Color;
  accentForeground: Color;
};

const SceneContent = ({
  isCalm,
  onEcho,
}: {
  isCalm: boolean;
  /** Raised when the visitor clicks, so the field can answer in its own colours. */
  onEcho: (clientX: number, clientY: number) => void;
}) => {
  const [ripples, setRipples] = useState<RippleData[]>([]);
  const [wisps, setWisps] = useState<WispData[]>([]);
  const [isMounted, setMounted] = useState(false);
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    primary: new Color(),
    secondary: new Color(),
    accent: new Color(),
    primaryForeground: new Color(),
    accentForeground: new Color(),
  });

  /*
   * One clock for the whole scene.
   *
   * The ripples and the wisps are spawned from DOM pointer events, but they are aged against
   * `@react-three/fiber`'s clock inside `useFrame`. Those two clocks have different origins: the
   * event timestamp counts from the page's time origin, while `clock.getElapsedTime()` counts from
   * the moment the canvas mounted. The canvas always mounts *after* the page did, so the age
   * computed from the two came out negative -- every ripple and wisp was invisible, never expired,
   * and stayed in the scene forever, growing the state, the meshes and the draw calls with every
   * click.
   *
   * The scene's own clock is now used for both ends of the comparison: it is read here, at spawn
   * time, and read again in the effect that ages it. `clock.elapsedTime` is the raw accumulator,
   * so reading it does not advance the clock the way `getElapsedTime()` does.
   */
  const clock = useThree((state) => state.clock);
  const camera = useThree((state) => state.camera);
  const gl = useThree((state) => state.gl);

  /*
   * A monotonic counter, so two effects spawned in the same millisecond cannot collide on a
   * React key. `performance.now()` has millisecond resolution and was used for this before.
   */
  const nextId = useRef(1);

  useEffect(() => {
    const updateThemeColors = () => {
      setThemeColors({
        primary: cssVarToThreeColor("--primary"),
        secondary: cssVarToThreeColor("--secondary"),
        accent: cssVarToThreeColor("--accent"),
        primaryForeground: cssVarToThreeColor("--primary-foreground"),
        accentForeground: cssVarToThreeColor("--accent-foreground"),
      });
    };

    updateThemeColors();
    setMounted(true);
    const observer = new MutationObserver(updateThemeColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isCalm) return;
    setRipples([]);
    setWisps([]);
  }, [isCalm]);

  const handleRemoveRipple = useCallback(
    (id: number) => setRipples((prev) => prev.filter((r) => r.id !== id)),
    []
  );
  const handleRemoveWisp = useCallback(
    (id: number) => setWisps((prev) => prev.filter((w) => w.id !== id)),
    []
  );

  /*
   * The interaction is handled on the window, not on the canvas.
   *
   * The scene is a background: it sits behind the page content, in a layer at `-z-50`, so a
   * pointer never reaches the canvas. That was measured, not assumed: across the whole page, at
   * every scroll position, the canvas was the hit target at 0 of 544 sampled points. The effects
   * were therefore not merely broken, they were *unreachable* -- no click could ever have
   * raised a ripple.
   *
   * So the pointer is read from the window, and the click is projected onto the scene's plane
   * with the scene's own camera. A click on a real control -- a link, a button, a form field --
   * is left alone, so the page keeps behaving exactly as it did.
   *
   * The gestures are the ones the theme was designed with: a click raises a ripple, a right
   * click lifts wisps. The right click no longer suppresses the browser's context menu: that
   * suppression was acceptable while the handler could only fire on the canvas, but from the
   * window it would take the menu away from the whole page.
   */
  /*
   * The pointer is placed on a surface that faces the camera, so the effect appears under the
   * cursor.
   *
   * It used to be intersected with the scene's floor plane instead, which put the effect tens of
   * units away at a grazing angle: a ripple there was drawn as a thin, pale ellipse about a
   * hundred pixels wide and twenty tall, in the lower part of the screen, never where the click
   * was. The effect happened; nobody could see it.
   */
  const pointerToSurface = useCallback(
    (clientX: number, clientY: number): { surface: Vector3; floor: Vector3 | null } => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndc = ndcFromClient(clientX, clientY, rect);

      // The scene's canvas is created with a perspective camera; the store's type is the union
      // of both camera kinds.
      const perspective = camera as PerspectiveCamera;

      return {
        surface: pointOnCameraSurface(perspective, ndc),
        floor: pointOnFloor(perspective, ndc),
      };
    },
    [camera, gl]
  );

  useEffect(() => {
    if (isCalm) return;

    const isControl = (target: EventTarget | null): boolean =>
      target instanceof Element &&
      target.closest("a, button, input, textarea, select, [role='button']") !== null;

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      if (isControl(event.target)) return;

      const { surface } = pointerToSurface(event.clientX, event.clientY);

      // The echo in the field's own colours, at the cursor.
      onEcho(event.clientX, event.clientY);

      // The ring at the cursor. The echo in the field's colours is the scene's own.
      setRipples((prev) => [
        ...prev,
        {
          id: nextId.current++,
          position: surface,
          creationTime: clock.elapsedTime,
        },
      ]);
    };

    const onContextMenu = (event: MouseEvent) => {
      if (isControl(event.target)) return;

      const { surface } = pointerToSurface(event.clientX, event.clientY);

      setWisps((prev) => [
        ...prev,
        {
          id: nextId.current++,
          position: surface,
          creationTime: clock.elapsedTime,
        },
      ]);
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("contextmenu", onContextMenu, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("contextmenu", onContextMenu);
    };
    // The canvas element, not the renderer: the element is the same object on every render,
    // so this effect runs once.
    // The camera's position and the canvas' element: both are the same object on every
    // render, so this effect runs once.
  }, [clock, isCalm, onEcho, pointerToSurface]);

  return (
    <>
      {/* --- VISUAL ELEMENTS --- */}
      {isMounted && (
        <>
          <FlowingPlane
            primaryColor={themeColors.primary}
            secondaryColor={themeColors.secondary}
            accentColor={themeColors.accent}
          />
          <Ripples
            ripples={ripples}
            onComplete={handleRemoveRipple}
            color={themeColors.primaryForeground}
          />
          <Wisps
            wisps={wisps}
            onComplete={handleRemoveWisp}
            color={themeColors.accentForeground}
          />
        </>
      )}
    </>
  );
};

const EtherealScene = () => {
  const [isCalm, setIsCalm] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerBloomRef = useRef<HTMLDivElement>(null);
  const echoBloomRef = useRef<HTMLDivElement>(null);
  const echoTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const update = () => setIsCalm(readIsCalm());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-low-data", "data-reduce-motion"],
    });
    return () => observer.disconnect();
  }, []);

  /*
   * The field's answer to the pointer, and to a click.
   *
   * These are *screen-space* effects, and they live in the screen-space layer: two soft pools of
   * light in the theme's own colours, one that follows the cursor and one that a click leaves
   * behind.
   *
   * They were drawn on the 3D plane at first, which cannot work. The plane is a floor seen at a
   * grazing angle: it covers the lower third of the screen, so a pointer over the headline had no
   * plane to answer on, and lifting the plane's alpha revealed the quad's own square edge in the
   * middle of the background.
   *
   * The pools are positioned with a transform, so following the cursor is a composited change
   * rather than a repaint of a full-screen gradient.
   */
  const place = useCallback((element: HTMLElement | null, clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!element || !container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    element.style.transform = `translate3d(${clientX - rect.left}px, ${clientY - rect.top}px, 0)`;
  }, []);

  useEffect(() => {
    if (isCalm) return;

    const onPointerMove = (event: PointerEvent) => {
      place(pointerBloomRef.current, event.clientX, event.clientY);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [isCalm, place]);

  /*
   * A click leaves an echo: a pool of light where the click was, fading out over about a second
   * and a half. It is faded by a CSS transition rather than per frame, so it costs nothing to
   * keep.
   */
  const raiseEcho = useCallback(
    (clientX: number, clientY: number) => {
      const echo = echoBloomRef.current;
      if (!echo) return;

      place(echo, clientX, clientY);
      echo.style.opacity = "1";

      if (echoTimer.current) clearTimeout(echoTimer.current);
      echoTimer.current = setTimeout(() => {
        if (echo) echo.style.opacity = "0";
      }, 120);
    },
    [place]
  );

  useEffect(
    () => () => {
      if (echoTimer.current) clearTimeout(echoTimer.current);
    },
    []
  );

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto absolute inset-0"
    >
      {/*
       * The pools of light: the cursor's, and the last click's.
       *
       * They are behind the field's gradient layers, so the colour they add reads as the field
       * brightening rather than as a light on top of it.
       */}
      <div
        ref={pointerBloomRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 h-[38rem] w-[38rem] rounded-full"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--accent) / 0.16) 0%, hsl(var(--primary) / 0.08) 35%, transparent 70%)",
          transform: "translate3d(-100rem, -100rem, 0)",
          marginTop: "-19rem",
          marginLeft: "-19rem",
        }}
      />
      <div
        ref={echoBloomRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 h-[30rem] w-[30rem] rounded-full opacity-0 transition-opacity duration-1000 ease-out"
        style={{
          background:
            "radial-gradient(circle, hsl(var(--accent) / 0.3) 0%, hsl(var(--primary) / 0.14) 40%, transparent 72%)",
          transform: "translate3d(-100rem, -100rem, 0)",
          marginTop: "-15rem",
          marginLeft: "-15rem",
        }}
      />
      {/*
       * The field's colour comes from here, and the plane's displacement gives it structure.
       *
       * The base layer is a gradient of the theme's own three pastels. It used to be a gradient
       * from the background to the muted colour -- two near-whites -- which made the ethereal
       * theme's background almost colourless while the rest of the theme stayed pastel. The
       * coloured washes that were layered on top of it (two radial gradients, two blobs, a
       * vignette) were an attempt to put the colour back, and they left the field paler than it
       * had been before any of them.
       *
       * The pastels at 0.2 are what the theme's tokens are for: they are light colours, and over a
       * white background they stay a wash rather than a tint.
       */}
      <div
        className={cn("-z-10 absolute inset-0 animate-dreamscape-flow")}
        style={{
          backgroundSize: "200% 200%",
          backgroundImage:
            "linear-gradient(45deg, hsl(var(--primary) / 0.2), hsl(var(--secondary) / 0.2), hsl(var(--accent) / 0.2))",
        }}
      />
      <div
        className={cn(
          "-translate-x-1/2 -translate-y-1/2 -z-10 absolute top-0 left-0 h-2/3 w-2/3 animate-float-subtle rounded-full"
        )}
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, hsl(var(--primary) / 0.2) 0%, transparent 70%)",
          animationDuration: "15s",
        }}
      />
      <div
        className={cn(
          "-z-10 absolute right-0 bottom-0 h-2/3 w-2/3 translate-x-1/2 translate-y-1/2 animate-float-subtle rounded-full"
        )}
        style={{
          backgroundImage:
            "radial-gradient(ellipse at center, hsl(var(--accent) / 0.2) 0%, transparent 70%)",
          animationDuration: "18s",
          animationDelay: "3s",
        }}
      />
      <Canvas
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 2, 5], fov: 75 }}
        frameloop={isCalm ? "demand" : "always"}
        className="absolute inset-0"
        style={{ background: "transparent" }}
      >
        <SceneContent
          isCalm={isCalm}
          onEcho={raiseEcho}
        />
      </Canvas>
    </div>
  );
};

export default EtherealScene;
