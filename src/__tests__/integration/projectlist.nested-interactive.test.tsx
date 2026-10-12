import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ProjectList } from "@/components/layout/ProjectList";

// Real velite output, trimmed to the fields ProjectList reads. `date` is required: ProjectList sorts
// on it, and a missing date makes the sort throw.
vi.mock("#velite", () => ({
  projects: [
    {
      title: "Test Project",
      description: "A test project.",
      url: "/projects/test",
      repository: "https://github.com/example/test",
      liveUrl: "https://example.com",
      cover: "",
      tags: ["TypeScript"],
      slug: "test",
      content: "",
      date: "2026-01-01",
      path: "/projects/test",
      readingTime: 1,
    },
  ],
}));

/**
 * The source/live controls sit inside the card's `<Link>`.
 *
 * Their onClick used to call only `stopPropagation()`, never `preventDefault()`. stopPropagation does
 * not cancel the browser's default action, so clicking one opened the popup *and* followed the card
 * link, navigating the user off the projects list to the project detail.
 *
 * ProjectsPreview and ProjectsPreviewAnimated both call preventDefault() and so never had this bug;
 * this is the copy that drifted.
 *
 * Note on what jsdom can and cannot show here. The mechanism test below pins `preventDefault()`
 * being called, which is what the fix changes. The "does not navigate" test asserts `window.open`
 * and an unchanged location, but jsdom does not implement anchor navigation at all, so that
 * assertion would pass even with the bug present. The navigation itself was confirmed in a real
 * browser, where the URL became /projects/Nargis alongside the popup; these tests exist so the
 * mechanism cannot silently regress.
 */
const cardLink = () => document.querySelector("a[href='/projects/test']") as HTMLAnchorElement;
const iconButton = (name: RegExp) => screen.getByRole("button", { name });

describe("project card icon controls", () => {
  it("open in a new tab without navigating the current page", () => {
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<ProjectList />);

    fireEvent.click(iconButton(/view source code/i));
    fireEvent.click(iconButton(/view live site/i));

    // Both popups opened...
    expect(open).toHaveBeenCalledTimes(2);
    for (const call of open.mock.calls) {
      expect(call[1]).toBe("_blank");
      expect(call[2]).toContain("noopener");
    }
    // ...and the current page did not navigate to the project detail.
    expect(window.location.pathname).toBe("/");
    open.mockRestore();
  });

  it("cancels the anchor's default action, which is what prevents the navigation", () => {
    // Pins the mechanism, not just the outcome. The click event is captured by reference and
    // inspected after dispatch completes, because React's synthetic handler -- the one calling
    // preventDefault -- runs at the root after the event has already passed the anchor.
    render(<ProjectList />);

    const captured: MouseEvent[] = [];
    const link = cardLink();
    link.addEventListener("click", (e: MouseEvent) => captured.push(e));

    fireEvent.click(iconButton(/view source code/i));

    expect(captured.length).toBeGreaterThan(0);
    for (const e of captured) {
      expect(e.defaultPrevented).toBe(true);
    }
  });

  it("keep the card's own link as the route to the detail page", () => {
    render(<ProjectList />);
    expect(cardLink()).toHaveAttribute("href", "/projects/test");
    expect(screen.getByRole("link", { name: /test project/i })).toBe(cardLink());
  });
});
