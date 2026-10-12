import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { About } from "@/components/sections/About";

vi.mock("#velite", () => ({
  bio: {
    name: "Test Name",
    email: "test@example.com",
    summary: "A short summary.",
    keyStrengths: [],
  },
}));

/**
 * The home page renders both the hero and the About section. Both used to emit an `<h1>`, so the
 * document exposed two level-1 headings -- "Divij Ganjoo" and "About Me" -- which dilutes
 * single-title semantics for anyone navigating by heading.
 *
 * `/about` is the page whose subject *is* that section, so it keeps the `<h1>`; the home page passes
 * `headingAs="h2"`.
 */
describe("About heading level", () => {
  it("renders an <h1> by default, which is correct for the /about page", () => {
    render(<About />);

    const heading = screen.getByRole("heading", { level: 1, name: /about me/i });
    expect(heading.tagName).toBe("H1");
    expect(screen.queryByRole("heading", { level: 2, name: /about me/i })).toBeNull();
  });

  it("renders an <h2> when asked, which is what the home page does", () => {
    render(<About headingAs="h2" />);

    const heading = screen.getByRole("heading", { level: 2, name: /about me/i });
    expect(heading.tagName).toBe("H2");
    // The point of the prop: no competing level-1 heading on a page that already has one.
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("keeps the same text and styling classes either way", () => {
    // The element type carries no styling here -- the size, weight and gradient are explicit classes
    // -- so switching levels must not change how the heading looks. Scoped by name because the
    // strength cards render their own <h2>s.
    render(<About />);
    const h1 = screen.getByRole("heading", { level: 1, name: /about me/i });
    const h1Class = h1.className;
    const h1Text = h1.textContent;
    cleanup();

    render(<About headingAs="h2" />);
    const h2 = screen.getByRole("heading", { level: 2, name: /about me/i });

    expect(h2.textContent).toBe(h1Text);
    expect(h2.className).toBe(h1Class);
  });
});

describe("About heading level (motion allowed)", () => {
  /**
   * The animated branch renders in a normal browser -- `vitest.setup.ts` forces reduced motion, so
   * every other test takes the plain path. `headingAs` has to be forwarded by both, and it was
   * originally missing from this one: the animated path kept `<h1>`, which the browser caught while
   * the reduced-motion tests passed.
   */
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

  const original = window.matchMedia;

  afterEach(() => {
    window.matchMedia = original;
  });

  it("renders <h2> in the animated branch too when asked", async () => {
    allowMotion();
    const { About: MotionAbout } = await import("@/components/sections/About");
    render(<MotionAbout headingAs="h2" />);

    const heading = await screen.findByRole("heading", { level: 2, name: /about me/i });
    expect(heading.tagName).toBe("H2");
    expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
  });

  it("renders <h1> in the animated branch by default", async () => {
    allowMotion();
    const { About: MotionAbout } = await import("@/components/sections/About");
    render(<MotionAbout />);

    const heading = await screen.findByRole("heading", { level: 1, name: /about me/i });
    expect(heading.tagName).toBe("H1");
  });
});
