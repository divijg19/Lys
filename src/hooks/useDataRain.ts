/**
 * @file: src/hooks/useDataRain.ts
 * @description: A highly performant, canvas-based "Matrix-style" data rain effect hook.
 */

"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";

// --- Constants ---
const ALPHABET =
  "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789";
const FONT_SIZE = 8;
const STREAM_DENSITY = FONT_SIZE + 6; // Increased from 3 to 6 (20% less dense)

/** How the rain should read. The two Cyberpunk layers use different profiles so the
 *  effect has depth instead of looking like one canvas drawn twice. */
export type DataRainProfile = "heavy" | "drizzle";

export interface DataRainOptions {
  /**
   * `heavy` gives the dense leading-glyph look; `drizzle` thins the streams out and
   * slows them, which reads as depth-of-field rather than a second copy.
   */
  profile?: DataRainProfile;
  /**
   * Multiplier on the base stream count. Values below 1 thin the layer out.
   * @default 1
   */
  density?: number;
  /** Multiplier on fall speed. @default 1 */
  speed?: number;
}

const PROFILE_DEFAULTS: Record<DataRainProfile, { density: number; speed: number }> = {
  heavy: { density: 1, speed: 1 },
  drizzle: { density: 0.45, speed: 0.55 },
};

// --- Class Definitions ---
class RainSymbol {
  character: string;
  x: number;
  y: number;
  speed: number;
  isFirst: boolean = false;
  constructor(x: number, y: number, speed: number) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.character = this.getRandomChar();
  }
  private getRandomChar(): string {
    return ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  public draw(ctx: CanvasRenderingContext2D, primaryColor: string, accentColor: string) {
    ctx.fillStyle = this.isFirst ? primaryColor : accentColor;
    ctx.fillText(this.character, this.x, this.y);
  }
  public rain(canvasHeight: number) {
    this.y = this.y >= canvasHeight ? 0 : this.y + this.speed;
  }
}

class Stream {
  symbols: RainSymbol[] = [];
  totalSymbols: number;
  speed: number;
  constructor(x: number, canvasHeight: number, speedScale: number) {
    this.speed = (Math.random() * 2 + 2) * speedScale;
    this.totalSymbols = Math.round(Math.random() * 20 + 5);
    this.generateSymbols(x, canvasHeight);
  }
  private generateSymbols(x: number, canvasHeight: number) {
    let y = Math.random() * canvasHeight - canvasHeight;
    for (let i = 0; i < this.totalSymbols; i++) {
      const symbol = new RainSymbol(x, y, this.speed);
      this.symbols.push(symbol);
      y -= FONT_SIZE;
    }
    if (this.symbols.length > 0) this.symbols[0].isFirst = true;
  }
  public render(
    ctx: CanvasRenderingContext2D,
    canvasHeight: number,
    primaryColor: string,
    accentColor: string
  ) {
    this.symbols.forEach((symbol) => {
      symbol.draw(ctx, primaryColor, accentColor);
      symbol.rain(canvasHeight);
    });
  }
}

/**
 * Read the theme tokens this effect paints with.
 *
 * These are stored as bare HSL triplets and wrapped in `hsl()` here, because
 * CanvasRenderingContext2D.fillStyle cannot resolve `hsl(var(--primary))`.
 */
const readRainColors = () => {
  const style = getComputedStyle(document.documentElement);
  const primary = style.getPropertyValue("--primary").trim();
  const accent = style.getPropertyValue("--accent").trim();
  const background = style.getPropertyValue("--background").trim();
  return {
    primaryColor: `hsl(${primary})`,
    accentColor: `hsl(${accent})`,
    backgroundColor: `hsla(${background} / 0.1)`,
  };
};

// --- The Custom Hook ---
// THE DEFINITIVE FIX: The function signature now accepts a RefObject where the generic
// type itself can be null, perfectly matching the type provided by the component.
export const useDataRain = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  { profile = "heavy", density = 1, speed: speedScale = 1 }: DataRainOptions = {}
) => {
  const streamsRef = useRef<Stream[]>([]);
  const animationFrameId = useRef<number>(0);

  const profileDefaults = PROFILE_DEFAULTS[profile];
  const effectiveDensity = density * profileDefaults.density;
  const effectiveSpeed = speedScale * profileDefaults.speed;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // This guard clause correctly handles the null case.

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Read inside `setup` rather than once at mount, so a theme change repaints the rain
    // in the new palette instead of leaving it stuck on the colours it booted with.
    let colors = readRainColors();

    const getDpr = () => Math.min(window.devicePixelRatio || 1, 1.5);

    let cssWidth = 0;
    let cssHeight = 0;

    const setup = () => {
      colors = readRainColors();
      const dpr = getDpr();
      cssWidth = window.innerWidth;
      cssHeight = window.innerHeight;
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);

      // Prevent cumulative scaling on re-setup.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      streamsRef.current = [];
      const streamCount = Math.floor((cssWidth / STREAM_DENSITY) * effectiveDensity);
      for (let i = 0; i < streamCount; i++) {
        streamsRef.current.push(
          new Stream(i * (STREAM_DENSITY / effectiveDensity), cssHeight, effectiveSpeed)
        );
      }
      ctx.font = `bold ${FONT_SIZE}px monospace`;
    };

    let stopped = false;

    const animate = () => {
      if (stopped) return;

      ctx.fillStyle = colors.backgroundColor;
      ctx.fillRect(0, 0, cssWidth, cssHeight);
      streamsRef.current.forEach((stream) => {
        stream.render(ctx, cssHeight, colors.primaryColor, colors.accentColor);
      });
      animationFrameId.current = requestAnimationFrame(animate);
    };

    const start = () => {
      stopped = false;
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = requestAnimationFrame(animate);
    };

    const stop = () => {
      stopped = true;
      cancelAnimationFrame(animationFrameId.current);
    };

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const debouncedSetup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      stop();
      timeoutId = setTimeout(() => {
        setup();
        start();
      }, 250);
    };

    // Re-read the palette as soon as the theme changes. The fill colour is applied every
    // frame from `colors`, so nothing further is needed to repaint.
    const themeObserver = new MutationObserver(() => {
      colors = readRainColors();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    debouncedSetup();
    window.addEventListener("resize", debouncedSetup);

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stop();
      } else {
        // Ensure dimensions are current after tab switches.
        debouncedSetup();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      themeObserver.disconnect();
      stop();
      window.removeEventListener("resize", debouncedSetup);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [canvasRef, effectiveDensity, effectiveSpeed]);
};
