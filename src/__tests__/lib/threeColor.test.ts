/**
 * @file: src/__tests__/lib/threeColor.test.ts
 * @description: Guards the CSS-custom-property -> three.js colour bridge.
 *
 * The theme scenes used to build their colours by string concatenation -- `hsl(${token})` -- and
 * hand the result to three.js. three.js parses colours with `Color.setStyle`, whose HSL branch
 * only understands the **comma separated** form. The space separated form that the design tokens
 * use (`250 82% 72%`) therefore never parsed, and the colour was silently left at its default:
 * white.
 *
 * That is invisible in a screenshot of a light theme and obvious in the ethereal one, where the
 * lavender/pink palette never reached the GPU and the whole 3D layer rendered as a grey sheet.
 *
 * These tests pin the parsing, and pin the equivalence with what three.js itself produces for a
 * colour string it *can* read -- so the helper cannot drift away from three's colour model.
 */

import { Color } from "three";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cssVarToThreeColor, hslToThreeColor, parseHslToken } from "@/lib/threeColor";

/** Parse a token that is expected to be a colour, failing loudly if it is not. */
const parse = (token: string) => {
  const parsed = parseHslToken(token);
  if (!parsed) throw new Error(`expected "${token}" to parse as a colour`);
  return parsed;
};

describe("parseHslToken", () => {
  it("parses the space separated form the design tokens use", () => {
    expect(parseHslToken("250 82% 72%")).toEqual({ h: 250, s: 0.82, l: 0.72 });
  });

  it("parses the comma separated form", () => {
    expect(parseHslToken("250, 82%, 72%")).toEqual({ h: 250, s: 0.82, l: 0.72 });
  });

  it("parses both hsl() wrapper forms", () => {
    expect(parseHslToken("hsl(250 82% 72%)")).toEqual({ h: 250, s: 0.82, l: 0.72 });
    expect(parseHslToken("hsl(250, 82%, 72%)")).toEqual({ h: 250, s: 0.82, l: 0.72 });
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseHslToken("  250 82% 72%  ")).toEqual({ h: 250, s: 0.82, l: 0.72 });
  });

  it("normalises the hue into 0-360", () => {
    expect(parseHslToken("370 82% 72%")?.h).toBe(10);
    expect(parseHslToken("-10 82% 72%")?.h).toBe(350);
  });

  it("clamps saturation and lightness into 0-1", () => {
    expect(parseHslToken("250 120% 72%")?.s).toBe(1);
    expect(parseHslToken("250 82% -5%")?.l).toBe(0);
  });

  it("returns null for values that are not colours", () => {
    expect(parseHslToken("")).toBeNull();
    expect(parseHslToken("var(--primary)")).toBeNull();
    expect(parseHslToken("250 82%")).toBeNull();
    expect(parseHslToken("not a colour at all")).toBeNull();
  });
});

describe("hslToThreeColor", () => {
  it("matches the colour three.js produces for the same colour in its parseable form", () => {
    // The equivalence that matters: our parser plus setHSL must land on exactly the colour
    // three.js would have produced had it been handed a string it can read.
    const ours = hslToThreeColor(parse("250 82% 72%"));
    const theirs = new Color("hsl(250, 82%, 72%)");

    expect(ours.r).toBeCloseTo(theirs.r, 5);
    expect(ours.g).toBeCloseTo(theirs.g, 5);
    expect(ours.b).toBeCloseTo(theirs.b, 5);
  });

  it("produces a colour that the old, broken path could not", () => {
    // The regression this file exists for: three.js cannot read the space separated form, so the
    // old path produced white while the helper produces the real colour.
    const broken = new Color("hsl(250 82% 72%)");
    const fixed = hslToThreeColor(parse("250 82% 72%"));

    expect(broken.getHexString()).toBe("ffffff");
    expect(fixed.getHexString()).not.toBe("ffffff");
  });

  it("converts the primary hue correctly", () => {
    expect(hslToThreeColor({ h: 0, s: 1, l: 0.5 }).getHexString()).toBe("ff0000");
    expect(hslToThreeColor({ h: 120, s: 1, l: 0.5 }).getHexString()).toBe("00ff00");
  });
});

describe("cssVarToThreeColor", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reads the custom property from the document root", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      getPropertyValue: (name: string) => (name === "--primary" ? "250 82% 72%" : ""),
    } as unknown as CSSStyleDeclaration);

    const colour = cssVarToThreeColor("--primary");

    expect(colour.getHexString()).toBe(
      hslToThreeColor({ h: 250, s: 0.82, l: 0.72 }).getHexString()
    );
  });

  it("falls back when the variable is missing or unparseable", () => {
    vi.spyOn(window, "getComputedStyle").mockReturnValue({
      getPropertyValue: () => "",
    } as unknown as CSSStyleDeclaration);

    const fallback = { h: 0, s: 0, l: 0.5 };
    expect(cssVarToThreeColor("--primary", fallback).getHexString()).toBe(
      hslToThreeColor(fallback).getHexString()
    );
  });
});
