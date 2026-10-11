/* @vitest-environment node */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { blogs, projects } from "#velite";
import { ROUTES } from "@/lib/routes";

const ROOT = process.cwd();

function appPath(...parts: string[]) {
  return path.join(ROOT, "src", "app", ...parts);
}

describe("routing integrity (prevent 404s)", () => {
  it("primary nav route files exist", () => {
    expect(existsSync(appPath("page.tsx"))).toBe(true);
    expect(existsSync(appPath("about", "page.tsx"))).toBe(true);
    expect(existsSync(appPath("projects", "page.tsx"))).toBe(true);
    expect(existsSync(appPath("blog", "page.tsx"))).toBe(true);
    expect(existsSync(appPath("contact", "page.tsx"))).toBe(true);

    expect(ROUTES.blog).toBe("/blog");
  });

  it("blog urls match /blog/<slug> and are flat", () => {
    for (const b of blogs) {
      expect(b.slug).toBeTruthy();
      expect(b.url).toBeTruthy();
      expect(b.slug.includes("/")).toBe(false);
      expect(b.url).toBe(`/blog/${b.slug}`);
    }
  });

  it("project urls match /projects/<slug> and are flat", () => {
    for (const p of projects) {
      expect(p.slug).toBeTruthy();
      expect(p.url).toBeTruthy();
      expect(p.slug.includes("/")).toBe(false);
      expect(p.url).toBe(`/projects/${p.slug}`);
    }
  });

  it("resume asset exists for /cv redirect", () => {
    expect(ROUTES.cv).toBe("/cv");
    expect(existsSync(path.join(ROOT, "public", "resume.pdf"))).toBe(true);
  });
});

describe("root layout smooth-scroll opt-in", () => {
  // Comments in layout.tsx mention `rel="preload"` when explaining why the manual preload was
  // removed, so strip block and line comments before matching markup.
  const layout = readFileSync(appPath("layout.tsx"), "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*\/\/.*$/gm, "");

  it("declares data-scroll-behavior on <html>", () => {
    // Next only disables smooth scrolling during route transitions when this attribute is
    // present. Without it Next logs "[next] Detected `scroll-behavior: smooth` on the `<html>`
    // element..." and leaves every route change animating a long scroll to the top.
    expect(layout).toMatch(/data-scroll-behavior=["']smooth["']/);
  });

  it("keeps smooth scrolling enabled in-page", () => {
    // The attribute is an opt-in for Next's transition handling; it must not be paired with
    // turning off the underlying smooth behaviour, or the fix would remove smooth scrolling
    // entirely instead of only suppressing it during route changes.
    expect(layout).toMatch(/scroll-smooth/);
  });

  it("does not hand-write a preload for the hero image", () => {
    // `next/image`'s `priority` already emits a preload that carries imagesrcset/imagesizes.
    // A manual <link rel="preload"> bypasses the image optimiser, so the browser downloads the
    // raw 1.2 MB JPEG and warns that the preloaded resource "was not used within a few seconds".
    const preloads = layout.match(/<link[\s\S]*?rel=["']preload["'][\s\S]*?\/>/g) ?? [];
    expect(preloads).toEqual([]);
  });
});
