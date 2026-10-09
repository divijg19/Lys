import { createEvent, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Expertise } from "@/components/sections/Expertise";

/*
 * Coverage for the skill card's three states: collapsed -> expanded preview -> detail dialog.
 *
 * The expanded state was previously unreachable under test. `allowPreview` derives from
 * `useGridColumns`, which measured `getComputedStyle(grid).gridAutoColumns`; jsdom reports no
 * computed `gridAutoColumns` and implements no `ResizeObserver`, so the measured tile width was
 * always 0 and the grid was treated as single-column. With `allowPreview` false the expanded
 * markup never rendered, which hid an invalid nested `<button>` (a real collapse control inside
 * the card's `role="button"`) from axe entirely. Mocking the hook is what makes this file
 * meaningful rather than decorative.
 */

vi.mock("#velite", () => ({
  expertise: {
    categories: [
      {
        name: "Frontend",
        icon: "Code",
        skills: [
          {
            name: "React",
            iconPath: "/assets/icons/react.svg",
            level: "Proficient",
            keyCompetencies: ["Hooks", "JSX", "Context", "Testing"],
            details: "React is a JavaScript library for building user interfaces.",
            projectSlugs: ["lys"],
            rationale: "Widely used for modern web apps.",
            highlights: ["Built reusable components", "Used hooks extensively"],
            ecosystem: ["Redux", "React Router"],
          },
          {
            name: "Next.js",
            iconPath: "/assets/icons/next.svg",
            level: "Advanced",
            keyCompetencies: ["App Router", "Server Components", "Caching"],
            details: "Next.js is a React framework.",
            projectSlugs: ["lys"],
            rationale: "Full-stack React.",
            highlights: ["Migrated to App Router"],
            ecosystem: ["Vercel"],
          },
          {
            name: "TypeScript",
            iconPath: "/assets/icons/typescript.svg",
            level: "Advanced",
            keyCompetencies: ["Generics", "Narrowing", "Inference"],
            details: "TypeScript is a typed superset of JavaScript.",
            projectSlugs: ["lys"],
            rationale: "Catches errors before runtime.",
            highlights: ["Strict mode"],
            ecosystem: ["tsc"],
          },
          {
            name: "Tailwind",
            iconPath: "/assets/icons/tailwind.svg",
            level: "Advanced",
            keyCompetencies: ["Utilities", "Arbitrary values", "Tokens"],
            details: "Tailwind is a utility-first CSS framework.",
            projectSlugs: ["lys"],
            rationale: "Consistent styling without a CSS file per component.",
            highlights: ["Theme tokens"],
            ecosystem: ["PostCSS"],
          },
        ],
      },
    ],
  },
  projects: [{ slug: "lys", title: "Lys Portfolio", url: "/projects/lys" }],
}));

// Four visible columns, so `allowPreview` is true and the preview state is reachable.
vi.mock("@/hooks/useGridColumns", () => ({
  useGridColumns: () => 4,
}));

const trigger = (name: string) => screen.getByRole("button", { name: `View details for ${name}` });
const panel = (name: string) =>
  screen.getByRole("button", { name: `View details for ${name}` }).getAttribute("aria-controls");

async function runAxe(node: HTMLElement) {
  await Promise.resolve();
  return await axe.run(node, { rules: { "color-contrast": { enabled: false } } });
}

describe("Expertise skill card states", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts collapsed with no expanded panel", () => {
    render(<Expertise />);
    const card = trigger("React");
    expect(card).toHaveAttribute("aria-expanded", "false");
    expect(card.hasAttribute("aria-controls")).toBe(false);
  });

  it("expands on focus and wires aria-controls to the panel it reveals", async () => {
    const { container } = render(<Expertise />);
    const card = trigger("React");

    fireEvent.focus(card);
    // The preview is debounced at 250ms in the parent.
    await waitFor(
      () => {
        expect(card).toHaveAttribute("aria-expanded", "true");
      },
      { timeout: 2000 }
    );

    const id = panel("React");
    expect(id).toBeTruthy();
    const revealed = container.querySelector(`#${id}`);
    expect(revealed).toBeInTheDocument();
    expect(revealed?.textContent).toContain("Hooks");
    expect(screen.getByRole("button", { name: "Collapse preview" })).toBeInTheDocument();
  });

  it("has no nested interactive content while expanded", async () => {
    const { container } = render(<Expertise />);
    fireEvent.focus(trigger("React"));
    await waitFor(
      () => {
        expect(trigger("React")).toHaveAttribute("aria-expanded", "true");
      },
      { timeout: 2000 }
    );

    // The collapse control is a sibling of the overlay trigger, never a descendant. This is the
    // assertion that would have caught the original `role="button"` wrapper.
    const collapse = screen.getByRole("button", { name: "Collapse preview" });
    const overlay = trigger("React");
    expect(overlay.contains(collapse)).toBe(false);

    const results = await runAxe(container);
    const nested = results.violations.filter((v) => v.id === "nested-interactive");
    expect(nested.map((v) => v.id)).toEqual([]);
    expect(results.violations.filter((v) => v.impact === "critical")).toHaveLength(0);
  });

  it("collapses when focus leaves the card", async () => {
    render(<Expertise />);
    const card = trigger("React");

    fireEvent.focus(card);
    await waitFor(
      () => {
        expect(card).toHaveAttribute("aria-expanded", "true");
      },
      { timeout: 2000 }
    );

    // Tab to the collapse button: still inside the card, so it must stay expanded.
    const collapse = screen.getByRole("button", { name: "Collapse preview" });
    fireEvent.blur(card, { relatedTarget: collapse });
    expect(card).toHaveAttribute("aria-expanded", "true");

    // Focus leaves the card entirely: it must collapse. Previously only a pointer leaving the
    // grid or Escape could dismiss the preview, so keyboard users could strand it open.
    fireEvent.blur(card, { relatedTarget: document.body });
    await waitFor(
      () => {
        expect(card).toHaveAttribute("aria-expanded", "false");
      },
      { timeout: 2000 }
    );
  });

  it("opens the detail dialog from the card and restores focus on close", async () => {
    render(<Expertise />);
    const card = trigger("React");
    card.focus();
    fireEvent.click(card);
    const dialog = await screen.findByRole("dialog", undefined, { timeout: 3000 });
    expect(dialog).toBeInTheDocument();
    expect(dialog.textContent).toContain("React");

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(card);
  });

  it("moves focus across the grid with arrow, Home and End keys", () => {
    render(<Expertise />);
    const react = trigger("React");
    const typescript = trigger("TypeScript");
    const nextjs = trigger("Next.js");
    const tailwind = trigger("Tailwind");

    /*
     * `SkillGrid` reorders tiles into visual row-first order, so the rendered grid is
     *
     *     React | Next.js
     *     TypeScript | Tailwind
     *
     * and the DOM order is React, TypeScript, Next.js, Tailwind (column flow, two rows). The
     * arrow maths assumes `index = col * rows + row`, so "one column right, same row" is
     * index + 2, not index + 1.
     */
    fireEvent.keyDown(react, { key: "ArrowRight" });
    expect(document.activeElement).toBe(nextjs);

    fireEvent.keyDown(nextjs, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(react);

    // Past the first column to the left, wraps to the last tile in the same row.
    fireEvent.keyDown(react, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(nextjs);

    fireEvent.keyDown(react, { key: "ArrowDown" });
    expect(document.activeElement).toBe(typescript);

    fireEvent.keyDown(react, { key: "End" });
    expect(document.activeElement).toBe(tailwind);

    fireEvent.keyDown(tailwind, { key: "Home" });
    expect(document.activeElement).toBe(react);

    // Past the last column to the right, wraps to the first tile of the same row.
    fireEvent.keyDown(tailwind, { key: "ArrowRight" });
    expect(document.activeElement).toBe(typescript);
  });

  it("opens the dialog on Enter without relying on the mouse", async () => {
    render(<Expertise />);
    const card = trigger("React");
    fireEvent.keyDown(card, { key: "Enter" });
    expect(await screen.findByRole("dialog", undefined, { timeout: 3000 })).toBeInTheDocument();
  });

  it("treats the whole tile as the hover target, not just the header", async () => {
    const { container } = render(<Expertise />);
    const cardEl = container.querySelector("[data-skill-card]") as HTMLElement;

    /*
     * The trigger button is scoped to the header so the expanded panel stays scrollable, which
     * makes it only ~43% of the tile. Hovering the container rather than the button is what makes
     * the whole card expand.
     *
     * This has teeth: React derives `mouseEnter` from the ancestor chain of the event target, so
     * an event dispatched on the container never reaches the descendant trigger's handler. The
     * test therefore fails if the hover handler is moved back onto the button.
     */
    fireEvent.mouseOver(cardEl);
    await waitFor(
      () => {
        expect(trigger("React")).toHaveAttribute("aria-expanded", "true");
      },
      { timeout: 2000 }
    );
  });

  it("opens the dialog when the expanded panel itself is clicked", async () => {
    const { container } = render(<Expertise />);
    fireEvent.focus(trigger("React"));
    await waitFor(
      () => {
        expect(trigger("React")).toHaveAttribute("aria-expanded", "true");
      },
      { timeout: 2000 }
    );

    // Clicking anywhere on the expanded card -- including the competency list, which is what a
    // visitor reaching for the scroll area would hit -- opens the overview, matching v0.1.19-22.
    const panelEl = container.querySelector(`#${panel("React")}`) as HTMLElement;
    expect(panelEl).toBeInTheDocument();
    fireEvent.click(panelEl.querySelector("li") as HTMLElement);

    expect(await screen.findByRole("dialog", undefined, { timeout: 3000 })).toBeInTheDocument();
  });

  it("does not open the dialog when the collapse control is used", async () => {
    render(<Expertise />);
    fireEvent.focus(trigger("React"));
    await waitFor(
      () => {
        expect(trigger("React")).toHaveAttribute("aria-expanded", "true");
      },
      { timeout: 2000 }
    );

    fireEvent.click(screen.getByRole("button", { name: "Collapse preview" }));
    await waitFor(
      () => {
        expect(trigger("React")).toHaveAttribute("aria-expanded", "false");
      },
      { timeout: 2000 }
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("never passes a non-Node relatedTarget to contains when the pointer leaves the grid", () => {
    const { container } = render(<Expertise />);
    const grid = container.querySelector("[data-skill-grid]") as HTMLElement;

    /*
     * When the pointer leaves the document the browser reports `window` as `relatedTarget`, and
     * `Node.contains(window)` throws "parameter 1 is not of type 'Node'".
     *
     * The assertion spies on `contains` rather than wrapping the dispatch: React catches errors
     * thrown inside an event handler and reports them asynchronously, so a try/catch around
     * `fireEvent` still passes with the bug present. Asserting that `contains` is never handed a
     * non-Node fails deterministically against the unguarded version.
     */
    const contains = vi.spyOn(grid, "contains");

    // Assigned after construction because jsdom validates `relatedTarget` against
    // `EventTarget` in the constructor, and the browser condition is exactly a value that is an
    // `EventTarget` but not a `Node`.
    const leaveEvent = createEvent.mouseOut(grid, { bubbles: true });
    Object.defineProperty(leaveEvent, "relatedTarget", { value: window, configurable: true });
    fireEvent(grid, leaveEvent);

    expect(contains.mock.calls.flat()).not.toContain(window);

    // A genuine move to a sibling inside the grid still asks the question and is handled.
    const insideMove = createEvent.mouseOut(grid, { bubbles: true });
    Object.defineProperty(insideMove, "relatedTarget", {
      value: grid.querySelector("[data-skill-card]"),
      configurable: true,
    });
    fireEvent(grid, insideMove);
    expect(contains).toHaveBeenCalled();
  });

  it("never passes a non-Node relatedTarget to contains when the trigger blurs", async () => {
    const { container } = render(<Expertise />);
    const card = trigger("React");

    // The handler returns early unless the card is expanded, so it has to be expanded first for
    // the guarded `contains` call to actually run.
    fireEvent.focus(card);
    await waitFor(
      () => {
        expect(card).toHaveAttribute("aria-expanded", "true");
      },
      { timeout: 2000 }
    );

    const cardEl = container.querySelector("[data-skill-card]") as HTMLElement;
    const contains = vi.spyOn(cardEl, "contains");

    const blurEvent = createEvent.blur(card, { bubbles: true });
    Object.defineProperty(blurEvent, "relatedTarget", { value: window, configurable: true });
    fireEvent(card, blurEvent);

    // Collapse-on-blur itself is covered by the focus-leaves-the-card test above; this one is
    // only about what the handler is allowed to hand to `contains`.
    expect(contains.mock.calls.flat()).not.toContain(window);
  });
});

/*
 * `vitest.setup.ts` forces `prefers-reduced-motion: reduce` for every test, so the suite
 * otherwise only ever renders the calm branch. That is the minority path in production: most
 * visitors get the animated component. These tests re-stub `matchMedia` to allow motion so the
 * default rendering path is exercised too -- the state machine must be identical either way,
 * with only the animation differing.
 */
describe("Expertise skill card states (motion allowed)", () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.matchMedia = ((query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList) as typeof window.matchMedia;
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it("reaches all three states with the motion preference off", async () => {
    render(<Expertise />);
    const card = trigger("React");
    expect(card).toHaveAttribute("aria-expanded", "false");

    fireEvent.focus(card);
    await waitFor(
      () => {
        expect(card).toHaveAttribute("aria-expanded", "true");
      },
      { timeout: 2000 }
    );

    fireEvent.click(card);
    expect(await screen.findByRole("dialog", undefined, { timeout: 3000 })).toBeInTheDocument();
  });
});
