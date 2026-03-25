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
const STREAM_DENSITY = FONT_SIZE + 3;

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
  constructor(x: number, canvasHeight: number) {
    this.speed = Math.random() * 2 + 2;
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

// --- The Custom Hook ---
// THE DEFINITIVE FIX: The function signature now accepts a RefObject where the generic
// type itself can be null, perfectly matching the type provided by the component.
export const useDataRain = (canvasRef: RefObject<HTMLCanvasElement | null>) => {
  const streamsRef = useRef<Stream[]>([]);
  const animationFrameId = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // This guard clause correctly handles the null case.

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const style = getComputedStyle(document.documentElement);
    const primaryColor = `hsl(${style.getPropertyValue("--primary").trim()})`;
    const accentColor = `hsl(${style.getPropertyValue("--accent").trim()})`;
    const backgroundColor = `hsla(${style.getPropertyValue("--background").trim()} / 0.1)`;

    const setup = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      streamsRef.current = [];
      const streamCount = Math.floor(window.innerWidth / STREAM_DENSITY);
      for (let i = 0; i < streamCount; i++) {
        streamsRef.current.push(new Stream(i * STREAM_DENSITY, window.innerHeight));
      }
      ctx.font = `bold ${FONT_SIZE}px monospace`;
    };

    const animate = () => {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      streamsRef.current.forEach((stream) =>
        stream.render(ctx, window.innerHeight, primaryColor, accentColor)
      );
      animationFrameId.current = requestAnimationFrame(animate);
    };

    let timeoutId: NodeJS.Timeout;
    const debouncedSetup = () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId.current);
      timeoutId = setTimeout(() => {
        setup();
        animate();
      }, 250);
    };

    debouncedSetup();
    window.addEventListener("resize", debouncedSetup);

    return () => {
      clearTimeout(timeoutId);
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener("resize", debouncedSetup);
    };
  }, [canvasRef]);
};
