import { describe, expect, it } from "vitest";
import { isolateBackground } from "@/lib/backgroundIsolation";

/**
 * Background isolation for portalled overlays.
 *
 * This logic was copy-pasted in the expertise dialog and the mobile menu, each with its own
 * `@ts-expect-error` for `inert`. The duplication was a drift surface -- the same pattern of
 * "update one copy of duplicated logic and not its sibling" has caused several bugs in this
 * codebase. Extracted so there is one implementation.
 */

function makePage() {
  const root = document.createElement("div");
  root.id = "root";
  const main = document.createElement("main");
  const footer = document.createElement("footer");
  document.body.append(root, main, footer);
  return { root, main, footer };
}

describe("isolateBackground", () => {
  it("returns null when the overlay is not a direct child of body", () => {
    // Rendered inline, the "siblings" would include the overlay's own ancestors, and making them
    // inert would hide the page the overlay lives in. Callers must bail instead.
    const { root } = makePage();
    const inline = document.createElement("div");
    root.append(inline);

    expect(isolateBackground(inline)).toBeNull();
    expect(root.getAttribute("aria-hidden")).toBeNull();
    expect(inline.getAttribute("aria-hidden")).toBeNull();
  });

  it("makes the page behind inert and aria-hidden", () => {
    makePage();
    const overlay = document.createElement("div");
    document.body.append(overlay);

    const restore = isolateBackground(overlay);
    expect(restore).toBeTypeOf("function");

    for (const el of Array.from(document.body.children)) {
      if (el === overlay) continue;
      expect(el.getAttribute("aria-hidden")).toBe("true");
      expect((el as HTMLElement).inert).toBe(true);
    }
    // The overlay itself must stay reachable. jsdom has no `inert` implementation, so only the
    // aria-hidden check is meaningful here.
    expect(overlay.getAttribute("aria-hidden")).toBeNull();
    expect(overlay.inert).not.toBe(true);
  });

  it("restores the page when the returned function runs", () => {
    makePage();
    const overlay = document.createElement("div");
    document.body.append(overlay);

    const restore = isolateBackground(overlay);
    restore?.();

    for (const el of Array.from(document.body.children)) {
      if (el === overlay) continue;
      expect(el.getAttribute("aria-hidden")).toBeNull();
      expect((el as HTMLElement).inert).not.toBe(true);
    }
  });
});
