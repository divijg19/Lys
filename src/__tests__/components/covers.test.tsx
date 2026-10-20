/**
 * @file: src/__tests__/components/covers.test.tsx
 * @description: The project and blog cover images.
 *
 * The covers used to be loaded with `unoptimized`, which tells Next to serve the file as it is.
 * The one real cover in the repository is a 424 KB PNG, and that is what every visitor of the
 * projects and blog pages downloaded.
 *
 * The placeholder covers are empty files. The optimiser cannot read one, so the image has to
 * fall back to the placeholder graphic -- the same thing the About section has always done.
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BlogList } from "@/components/layout/BlogList";
import { ProjectList } from "@/components/layout/ProjectList";

// Deterministic data: one project and one blog post, each with a real cover path.
vi.mock("#velite", () => ({
  projects: [
    {
      slug: "lys",
      title: "Lys Portfolio",
      url: "/projects/lys",
      cover: "/assets/images/projects/Lys.png",
      description: "A portfolio",
      tags: ["next"],
    },
  ],
  blogs: [
    {
      slug: "next",
      title: "My Journey with Next.js",
      url: "/blog/next",
      date: "2024-06-10",
      tags: ["next"],
      cover: "/assets/images/projects/Lys.png",
      description: "A post",
      readingTime: "3 min",
    },
  ],
}));

describe("the cover images", () => {
  it("are sized for the list they sit in", () => {
    render(<ProjectList />);

    // Two columns from the small breakpoint up.
    expect(screen.getByAltText(/cover image for lys portfolio/i).getAttribute("sizes")).toBe(
      "(min-width: 640px) 50vw, 100vw"
    );
  });

  it("fall back to the placeholder when the cover cannot be read", () => {
    render(<ProjectList />);

    // The optimiser answers 400 for an empty file; the image then asks for the placeholder.
    fireEvent.error(screen.getByAltText(/cover image for lys portfolio/i));

    expect(screen.getByAltText(/cover image for lys portfolio/i).getAttribute("src")).toContain(
      "placeholder.svg"
    );
  });

  it("are sized for the blog list too", () => {
    render(<BlogList />);

    // A single column on small screens, a row on wide ones where the cover takes a third.
    const sizes = screen
      .getAllByRole("img")
      .map((image) => image.getAttribute("sizes"))
      .filter(Boolean);

    expect(sizes).toContain("(min-width: 640px) 33vw, 100vw");
  });
});

describe("no image is loaded unoptimized", () => {
  it("passes the file through the optimiser", () => {
    /*
     * `unoptimized` tells Next to serve the file as it is: no resizing, no modern format, no
     * cache-busting. The one real cover in the repository is a 424 KB PNG.
     *
     * The optimiser's URLs cannot be observed in jsdom, so this is checked against the source.
     */
    const offenders: string[] = [];

    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (entry.name !== "__tests__") walk(full);
        } else if (/\.tsx$/.test(entry.name)) {
          const source = readFileSync(full, "utf8");
          if (/<Image[\s\S]{0,400}?unoptimized/.test(source)) {
            offenders.push(path.relative(process.cwd(), full));
          }
        }
      }
    };

    walk(path.resolve(process.cwd(), "src"));

    expect(offenders, `images loaded unoptimized: ${offenders.join(", ")}`).toEqual([]);
  });
});
