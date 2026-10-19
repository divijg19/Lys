import { fireEvent, render, screen, within } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ClientFooter } from "@/components/layout/ClientFooter";

vi.mock("#velite", () => ({
  bio: { name: "Test Name", email: "test@example.com" },
}));

/**
 * The expanded footer was unreachable by keyboard.
 *
 * It sat behind `invisible` (visibility: hidden), which removes a subtree from both the tab order and
 * the accessibility tree. The reveal was meant to be `group-focus-within`, but the collapsed state
 * was plain text, so nothing inside the footer could ever take focus -- leaving three controls
 * (scroll to top, GitHub, email) available to a mouse and to nothing else.
 */

const disclosure = () =>
  document.querySelector('button[aria-label="Show footer links"]') as HTMLButtonElement;

/** The layer holding the expanded controls, found without adding test-only markup. */
const linksLayer = () => {
  const trigger = screen.getByRole("button", { name: /scroll to top/i });
  // Nearest absolutely-positioned ancestor is the expanded layer; the collapsed layer is a sibling,
  // not an ancestor, so it cannot match.
  return trigger.closest("div.absolute") as HTMLElement;
};

const footerEl = () => disclosure().closest("footer");

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("footer keyboard reachability", () => {
  it("starts closed, with the expanded links out of reach", () => {
    render(<ClientFooter />);

    // `invisible` here is the whole bug: it puts these controls outside the tab order and the
    // accessibility tree, so no keyboard path can reach them.
    expect(linksLayer().className).toContain("invisible");
    // Exposed as a real button in the closed state.
    expect(screen.getByRole("button", { name: /show footer links/i })).toBe(disclosure());
    expect(disclosure()).toHaveAttribute("tabindex", "0");
    expect(disclosure()).toHaveAttribute("aria-expanded", "false");
  });

  it("reveals the links when the disclosure takes focus", () => {
    render(<ClientFooter />);
    fireEvent.focusIn(disclosure());

    expect(linksLayer().className).not.toContain("invisible");
    expect(linksLayer().className).not.toContain("pointer-events-none");
    expect(disclosure()).toHaveAttribute("aria-expanded", "true");
  });

  it("reveals the links when the disclosure is clicked", () => {
    // Pointer users get the same explicit affordance, and the footer stays open once it is.
    render(<ClientFooter />);
    fireEvent.click(disclosure());
    expect(linksLayer().className).not.toContain("invisible");
  });

  it("makes the revealed controls focusable", () => {
    render(<ClientFooter />);
    fireEvent.focusIn(disclosure());

    const email = screen.getByRole("link", { name: /email me/i });
    email.focus();
    expect(document.activeElement).toBe(email);
  });

  it("steps out of the tab order once open", () => {
    // The disclosure is the way *in*. Leaving it as a stop would put a transparent control between
    // the user and the links they just revealed.
    render(<ClientFooter />);
    const trigger = disclosure();
    fireEvent.focusIn(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("tabindex", "-1");
    expect(trigger).toHaveAttribute("aria-hidden", "true");
  });

  it("stays open while focus moves between its own controls", () => {
    render(<ClientFooter />);
    const trigger = disclosure();
    fireEvent.focusIn(trigger);

    const scrollToTop = screen.getByRole("button", { name: /scroll to top/i });
    const email = screen.getByRole("link", { name: /email me/i });
    scrollToTop.focus();
    expect(document.activeElement).toBe(scrollToTop);

    // Moving focus onto a sibling control must not collapse the footer -- that would hide the very
    // control being tabbed to, mid-keystroke.
    fireEvent.focusOut(footerEl() as HTMLElement, { relatedTarget: email });
    expect(linksLayer().className).not.toContain("invisible");
  });

  it("closes again once focus leaves the footer entirely", () => {
    render(<ClientFooter />);
    fireEvent.focusIn(disclosure());
    expect(linksLayer().className).not.toContain("invisible");

    fireEvent.focusOut(footerEl() as HTMLElement, { relatedTarget: null });

    expect(linksLayer().className).toContain("invisible");
    expect(disclosure()).toHaveAttribute("aria-expanded", "false");
  });

  it("suspends the scroll-hide while open so focus is never off-screen", () => {
    // The footer slides off-screen while the user scrolls up (see useScroll). Opening it has to
    // cancel that slide, or the first Tab stop is a control parked outside the viewport.
    render(<ClientFooter />);
    fireEvent.focusIn(disclosure());

    const wrapper = footerEl()?.parentElement as HTMLElement;
    expect(wrapper.className).not.toContain("translate-y-24");
    expect(wrapper.className).toContain("bottom-4");
  });

  it("scrolls to top instantly when reduced motion is preferred", () => {
    // The control was hardcoded to `smooth`, a vestibular trigger for anyone who asked for reduced
    // motion -- and it scrolls the entire document.
    const scrollTo = vi.fn();
    vi.spyOn(window, "scrollTo").mockImplementation(scrollTo);
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

    render(<ClientFooter />);
    fireEvent.focusIn(disclosure());
    fireEvent.click(screen.getByRole("button", { name: /scroll to top/i }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });

  it("has no critical accessibility violations", async () => {
    const { container } = render(<ClientFooter />);
    await Promise.resolve();
    const results = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  }, 15000);
});

describe("footer content", () => {
  it("exposes the links it always advertised", () => {
    render(<ClientFooter />);
    fireEvent.focusIn(disclosure());
    const q = within(linksLayer());

    const lysLink = q.getByRole("link", { name: /view source code for project lys/i });
    expect(lysLink.getAttribute("href")).toContain("github.com");
    expect(q.getByRole("link", { name: /view source code on github/i })).toBeInTheDocument();
    expect(q.getByRole("link", { name: /email me/i }).getAttribute("href")).toMatch(/^mailto:/);
    expect(q.getByRole("button", { name: /scroll to top/i })).toBeInTheDocument();
  });
});
