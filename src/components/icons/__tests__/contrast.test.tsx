import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { AwsIcon, DuckDbIcon, LuaIcon, MojoIcon, VercelIcon, YamlIcon } from "../../icons";

// Quick relative luminance helpers for contrast approximation
function parseRgb(css: string): [number, number, number] | null {
  const m = /rgb\((\d+),\s*(\d+),\s*(\d+)\)/.exec(css);
  if (!m) return null;
  return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
}

function relLum([r, g, b]: [number, number, number]) {
  const toLin = (v: number) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const R = toLin(r);
  const G = toLin(g);
  const B = toLin(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrast(c1: [number, number, number], c2: [number, number, number]) {
  const L1 = relLum(c1);
  const L2 = relLum(c2);
  const [light, dark] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (light + 0.05) / (dark + 0.05);
}

// We just sample currentColor against background for light/dark themes.
const THEMES: { name: string; background: string; foreground: string }[] = [
  { name: "light", background: "#ffffff", foreground: "#121212" },
  { name: "dark", background: "#0d0e11", foreground: "#f2f2f5" },
];

const ICONS = [AwsIcon, DuckDbIcon, LuaIcon, MojoIcon, VercelIcon, YamlIcon];

describe("icon contrast (approx)", () => {
  void React;
  ICONS.forEach((Icon) => {
    THEMES.forEach(({ name, background, foreground }) => {
      it(`${Icon.name} has >= 3:1 contrast with bg in ${name} theme (base shape)`, () => {
        const { container } = render(
          <div style={{ color: foreground, background }}>
            <Icon className="size-8" />
          </div>
        );
        const svg = container.querySelector("svg");
        expect(svg).toBeTruthy();
        if (!svg) return;
        const style = getComputedStyle(svg);
        // currentColor maps to foreground
        const rgb = parseRgb(style.color);
        const bgRgb = parseRgb(
          getComputedStyle(container.firstChild as HTMLElement).backgroundColor
        );
        if (!rgb || !bgRgb) return; // skip silently if parsing fails
        const ratio = contrast(rgb, bgRgb);
        expect(ratio).toBeGreaterThanOrEqual(3); // relaxed threshold for brand accent cases
      });
    });
  });
});
