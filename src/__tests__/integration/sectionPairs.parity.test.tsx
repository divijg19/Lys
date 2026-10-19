import { cleanup, render, waitFor } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { About } from "@/components/sections/About";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Hero } from "@/components/sections/Hero";
import { ProjectsPreview } from "@/components/sections/ProjectsPreview";

/**
 * Structural parity between the plain and animated branches of every section pair.
 *
 * Each section parent (`About`, `Hero`, `Contact`, ...) branches on `useSectionMotion()`: the
 * plain path renders in tests and for reduced-motion visitors, the animated path is what a
 * normal browser gets. The two branches are separate markup -- three of the six `*Animated`
 * components re-implement their content instead of sharing it -- so they can and did drift apart.
 * Four shipped bugs came from exactly that: `ProjectList` losing the `preventDefault()` its
 * siblings had, `AboutAnimated` never receiving `headingAs` (two `<h1>` on the home page), and
 * two more from v0.2.4's duplicated close/scroll logic.
 *
 * The contract asserted here: for every pair, the two branches expose the same *semantic
 * surface* -- heading levels and text, links and their targets, buttons, form fields, labels,
 * image alts, list contents and section landmarks. Styling is deliberately out of scope (the
 * animated branch exists to differ in motion), as are raw `useId` values, which legitimately
 * differ between two separate renders and are therefore normalised to positional ids.
 */

const originalMatchMedia = window.matchMedia;

/** Answer every media query as "motion allowed" -- the branch a normal browser takes. */
const allowMotion = () => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
};

/** Back to the suite default from `vitest.setup.ts`: reduced motion is forced. */
const forceReducedMotion = () => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: (query: string) => ({
      matches: /prefers-reduced-motion\s*:\s*reduce/.test(query),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
};

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  cleanup();
});

/** Accessible name: aria-label wins, exactly as it does for assistive tech. */
const name = (el: Element): string =>
  (el.getAttribute("aria-label") ?? el.textContent ?? "").trim().replace(/\s+/g, " ");

function signature(root: HTMLElement): Record<string, string[]> {
  // `useId` values advance across renders within a test file, so map ids to their document
  // position. Pairing structure (label -> input) is preserved; absolute values are not compared.
  const idMap = new Map<string, string>();
  root.querySelectorAll("[id]").forEach((el, i) => {
    idMap.set((el as HTMLElement).id, `#${i}`);
  });
  const id = (raw: string | null): string => (raw ? (idMap.get(raw) ?? raw) : "-");
  const all = (sel: string) => Array.from(root.querySelectorAll(sel));

  return {
    headings: all("h1,h2,h3,h4,h5,h6").map(
      (el) => `${el.tagName.toLowerCase()}[${id(el.id)}]:${name(el)}`
    ),
    links: all("a").map(
      (el) => `${el.getAttribute("href")}|${name(el)}|${id(el.getAttribute("id"))}`
    ),
    buttons: all("button").map((el) => `${name(el)}|${id(el.id)}|${el.getAttribute("type") ?? ""}`),
    inputs: all("input,textarea,select").map(
      (el) =>
        `${el.tagName}|${el.getAttribute("name") ?? ""}|${el.getAttribute("type") ?? ""}|${el.getAttribute("placeholder") ?? ""}|${el.getAttribute("aria-label") ?? ""}|${id(el.id)}`
    ),
    labels: all("label").map((el) => `${name(el)}->${id(el.getAttribute("for"))}`),
    images: all("img").map((el) => `alt=${el.getAttribute("alt")}`),
    lists: all("ul,ol").map(
      (el) =>
        `${el.getAttribute("aria-label") ?? ""}:${Array.from(el.children)
          .map((li) => (li.textContent ?? "").trim())
          .join("|")}`
    ),
    sections: all("section").map(
      (el) =>
        `${el.getAttribute("data-section") ?? "-"}|${el.getAttribute("aria-label") ?? ""}|${id(el.getAttribute("id"))}`
    ),
  };
}

type Pair = {
  name: string;
  element: ReactElement;
  /**
   * Selects markup only the animated branch produces. Framer Motion writes `initial` styles
   * inline, and the plain branches contain no inline styles at all (verified), so an inline
   * `style` attribute is a clean animated-branch signal. Experience uses its explicit
   * `-animated` data attribute instead.
   */
  animatedMarker: string;
};

const pairs: Pair[] = [
  {
    name: "About (h1 default)",
    element: <About />,
    animatedMarker: 'section[data-section="about"][style]',
  },
  {
    // The home page passes headingAs="h2". The #252 bug was exactly this: the animated branch
    // silently kept the default <h1>, so testing only the default would miss it.
    name: "About (h2 as on home)",
    element: <About headingAs="h2" />,
    animatedMarker: 'section[data-section="about"][style]',
  },
  {
    name: "Hero",
    element: <Hero />,
    // `staggerContainer` has no visual props of its own, so the hero root itself may carry no
    // style -- its fade-up children do.
    animatedMarker: 'section[data-section="hero"] [style], section[data-section="hero"][style]',
  },
  {
    name: "Contact",
    element: <Contact />,
    animatedMarker: 'section[data-section="contact"][style]',
  },
  {
    name: "Experience",
    element: <Experience />,
    animatedMarker: '[data-section="experience-heading-animated"]',
  },
  {
    name: "ProjectsPreview",
    element: <ProjectsPreview />,
    animatedMarker: 'section[data-section="projects-preview"][style]',
  },
  {
    name: "BlogPreview",
    element: <BlogPreview />,
    animatedMarker: 'section[data-section="blog-preview"][style]',
  },
];

async function capturePlain(pair: Pair): Promise<Record<string, string[]>> {
  forceReducedMotion();
  const { container } = render(pair.element);
  // The plain branch must not match the animated marker -- otherwise "waiting for the marker"
  // below would silently capture the plain markup and compare it with itself.
  expect(container.querySelector(pair.animatedMarker)).toBeNull();
  const sig = signature(container);
  cleanup();
  return sig;
}

async function captureAnimated(pair: Pair): Promise<Record<string, string[]>> {
  allowMotion();
  const { container } = render(pair.element);
  // First paint is still plain (`useMounted` starts false); the effect flips the gate and the
  // dynamic chunk resolves, replacing the subtree. Wait until animated-only markup exists.
  await waitFor(() => expect(container.querySelector(pair.animatedMarker)).not.toBeNull(), {
    timeout: 4000,
    interval: 25,
  });
  const sig = signature(container);
  cleanup();
  return sig;
}

describe("plain/animated pair parity", () => {
  for (const pair of pairs) {
    it(`${pair.name}: both motion branches expose the same semantic structure`, async () => {
      const plain = await capturePlain(pair);
      const animated = await captureAnimated(pair);

      expect(animated).toEqual(plain);
    });
  }
});
