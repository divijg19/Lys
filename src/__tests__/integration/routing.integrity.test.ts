/* @vitest-environment node */

import { existsSync } from "node:fs";
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
