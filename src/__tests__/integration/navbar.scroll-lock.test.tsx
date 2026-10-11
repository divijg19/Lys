import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "@/components/layout/Navbar";
import { isScrollLocked, resetScrollLockForTests } from "@/lib/scrollLock";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    onClick,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      href={href}
      onClick={onClick}
      {...rest}
    >
      {children}
    </a>
  ),
}));

// `usePathname` is mocked so the route-change effect is driveable in jsdom.
const pathnameMock = vi.fn(() => "/about");
vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
}));

/**
 * Controllable `matchMedia` for the width query.
 *
 * The global stub in vitest.setup.ts answers `false` for every non-reduced-motion query and its
 * listeners are no-ops, so the viewport hook would never observe a change. This installs a stub
 * whose listeners really fire, so a test can simulate crossing the breakpoint the way a real
 * rotation would.
 */
const WIDTH_QUERY = "(min-width: 768px)";
let widthMatches = false;
const widthListeners = new Set<(e: MediaQueryListEvent) => void>();
const originalMatchMedia = window.matchMedia;

/** Install the stub. Call before `render` so the hook subscribes to this object, not the global one. */
const installWidthMatchMedia = () => {
  widthMatches = false;
  widthListeners.clear();
  window.matchMedia = ((query: string) => ({
    get matches() {
      return query === WIDTH_QUERY ? widthMatches : false;
    },
    media: query,
    onchange: null,
    addEventListener: (_type: string, fn: (e: MediaQueryListEvent) => void) => {
      if (query === WIDTH_QUERY) widthListeners.add(fn);
    },
    removeEventListener: (_type: string, fn: (e: MediaQueryListEvent) => void) => {
      widthListeners.delete(fn);
    },
    addListener: (fn: (e: MediaQueryListEvent) => void) => {
      if (query === WIDTH_QUERY) widthListeners.add(fn);
    },
    removeListener: (fn: (e: MediaQueryListEvent) => void) => {
      widthListeners.delete(fn);
    },
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
};

/** Report a new viewport width to everything currently subscribed. */
const setViewportWidth = (matches: boolean) => {
  widthMatches = matches;
  const event = { matches, media: WIDTH_QUERY } as MediaQueryListEvent;
  for (const fn of [...widthListeners]) fn(event);
};

beforeEach(() => {
  installWidthMatchMedia();
});

afterEach(() => {
  // Unmount before restoring matchMedia. Several tests here leave a Navbar mounted, and each one
  // holds a width-query listener. Without unmounting, a later setViewportWidth() call notifies
  // those stale components too, and their effects run against trees that are no longer on screen.
  cleanup();
  window.matchMedia = originalMatchMedia;
});

afterEach(() => {
  // Reset through the module rather than by hand. Clearing `style.overflow` alone leaves the
  // `overflow-hidden` class this lock adds, which leaks into the next test and would also be
  // recorded as the "previous" state by any later acquire, permanently re-locking the body.
  resetScrollLockForTests();
});

describe("mobile menu scroll lock", () => {
  it("locks the page while open and unlocks when closed via the toggle", async () => {
    render(<Navbar />);
    const toggle = screen.getByRole("button", { name: /toggle menu/i });

    expect(isScrollLocked()).toBe(false);

    fireEvent.click(toggle);
    await waitFor(() => expect(isScrollLocked()).toBe(true));

    fireEvent.click(toggle);
    await waitFor(() => expect(isScrollLocked()).toBe(false));
  });

  it("unlocks on Escape", async () => {
    // Regression: the menu held a scroll lock but had no keyboard route out, so opening it and
    // pressing Escape left the page locked with no way for a keyboard user to release it.
    render(<Navbar />);
    const toggle = screen.getByRole("button", { name: /toggle menu/i });

    fireEvent.click(toggle);
    await waitFor(() => expect(isScrollLocked()).toBe(true));

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(isScrollLocked()).toBe(false));
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("does not stay locked across repeated open/close cycles", async () => {
    render(<Navbar />);
    const toggle = screen.getByRole("button", { name: /toggle menu/i });

    for (let i = 0; i < 3; i++) {
      fireEvent.click(toggle);
      await waitFor(() => expect(isScrollLocked()).toBe(true));
      fireEvent.click(toggle);
      await waitFor(() => expect(isScrollLocked()).toBe(false));
    }
  });
});

describe("mobile menu dialog semantics", () => {
  it("is exposed as a modal dialog with an accessible name", async () => {
    render(<Navbar />);
    fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    // The accessible name comes from a visually hidden heading rather than a bare aria-label, so
    // it stays translatable.
    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    expect(document.getElementById(labelledBy as string)).toBeTruthy();
  });

  it("is portalled to document.body so the page behind can be isolated", async () => {
    // Without the portal the overlay's parent is <header>, not <body>, so the background-isolation
    // guard could never hold and the page behind stayed reachable.
    render(<Navbar />);
    fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog.parentElement).toBe(document.body);
  });

  it("makes the background inert and aria-hidden while open, and restores it on close", async () => {
    render(
      <div>
        <button type="button">background control</button>
        <Navbar />
      </div>
    );
    const toggle = screen.getByRole("button", { name: /toggle menu/i });

    fireEvent.click(toggle);
    const dialog = await screen.findByRole("dialog");
    const siblings = Array.from(document.body.children).filter((el) => el !== dialog);
    expect(siblings.length).toBeGreaterThan(0);
    expect(siblings.every((el) => el.getAttribute("aria-hidden") === "true")).toBe(true);
    expect(siblings.some((el) => (el as HTMLElement).inert)).toBe(true);

    fireEvent.click(toggle);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(
      Array.from(document.body.children).some(
        (el) => (el as HTMLElement).inert || el.getAttribute("aria-hidden") === "true"
      )
    ).toBe(false);
  });

  it("moves focus into the menu on open", async () => {
    render(<Navbar />);
    const toggle = screen.getByRole("button", { name: /toggle menu/i });

    fireEvent.click(toggle);
    await screen.findByRole("dialog");

    // Previously focus stayed on the toggle while a full-screen overlay covered the page.
    await waitFor(() => {
      expect(document.activeElement).not.toBe(toggle);
      expect(document.activeElement?.closest('[role="dialog"]')).not.toBeNull();
    });
  });

  it("returns focus to the toggle when closed", async () => {
    render(<Navbar />);
    const toggle = screen.getByRole("button", { name: /toggle menu/i });

    fireEvent.click(toggle);
    await screen.findByRole("dialog");
    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    // Without this, focus fell back to <body> and a keyboard user lost their place in the header.
    await waitFor(() => expect(document.activeElement).toBe(toggle));
  });

  it("traps Tab inside the menu instead of escaping to the page behind", async () => {
    render(
      <div>
        <button type="button">background control</button>
        <Navbar />
      </div>
    );
    const toggle = screen.getByRole("button", { name: /toggle menu/i });

    fireEvent.click(toggle);
    const dialog = await screen.findByRole("dialog");
    const links = Array.from(dialog.querySelectorAll<HTMLElement>("a[href]"));
    expect(links.length).toBeGreaterThan(1);

    // Focus the last link, then Tab: it must wrap to the first rather than leaving the overlay.
    links[links.length - 1].focus();
    expect(document.activeElement).toBe(links[links.length - 1]);

    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(links[0]);

    // And Shift+Tab from the first wraps back to the last.
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(links[links.length - 1]);
  });

  it("keeps focus handling correct across repeated open/close cycles", async () => {
    // Guards the whole cycle rather than a single open: the v0.2.4 dialog work needed several
    // attempts before restoration held on every cycle, so a one-shot assertion is not enough.
    render(<Navbar />);
    const toggle = screen.getByRole("button", { name: /toggle menu/i });

    for (let i = 0; i < 3; i++) {
      fireEvent.click(toggle);
      const dialog = await screen.findByRole("dialog");
      expect(dialog.parentElement).toBe(document.body);
      await waitFor(() => {
        expect(document.activeElement?.closest('[role="dialog"]')).not.toBeNull();
      });

      fireEvent.keyDown(document, { key: "Escape" });
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      await waitFor(() => expect(document.activeElement).toBe(toggle));
      expect(isScrollLocked()).toBe(false);
    }
  });
});

describe("mobile menu link behaviour", () => {
  it("leaves the menu open when a link is clicked", () => {
    // Regression: the links used to call setIsMenuOpen(false) from onClick. That unmounts the
    // anchor in the same tick as the click, so Next's router never acted on it and tapping a menu
    // link did nothing at all -- confirmed against the production build, where every menu link
    // stayed put.
    //
    // This asserts the observable jsdom consequence rather than the absence of an `onClick` prop.
    // React attaches onClick as a prop and never as an `onclick` attribute, so checking the
    // attribute passed even with the handler attached -- the previous version of this test was
    // therefore vacuous. A stray handler closes the menu on click; the fixed version leaves it
    // open and lets the route change close it, which never happens in jsdom.
    render(<Navbar />);
    const toggle = screen.getByRole("button", { name: /toggle menu/i });
    fireEvent.click(toggle);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    fireEvent.click(dialog.querySelector("a[href]") as HTMLElement);

    // With the handler the menu is gone. Without it, it is still open, waiting on the route
    // change to close it -- and since there is no router in jsdom, that never comes.
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("keeps an href on every menu link so the route is reachable", () => {
    render(<Navbar />);
    fireEvent.click(screen.getByRole("button", { name: /toggle menu/i }));
    const links = Array.from(screen.getByRole("dialog").querySelectorAll("a"));
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(link.getAttribute("href")).toBeTruthy();
    }
  });
});

describe("mobile menu on viewport change", () => {
  it("closes when the viewport reaches the md breakpoint", async () => {
    // Regression: the overlay is `md:hidden`, so past this width it is invisible but still
    // mounted -- and while mounted it held the scroll lock, marked every sibling inert and
    // aria-hidden, and trapped focus. Rotating a phone left the page unreachable, and a
    // touch-only user had no visible way out.
    render(<Navbar />);
    const toggle = screen.getByRole("button", { name: /toggle menu/i });
    fireEvent.click(toggle);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    await waitFor(() => expect(isScrollLocked()).toBe(true));

    act(() => setViewportWidth(true));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(isScrollLocked()).toBe(false);
  });
});
