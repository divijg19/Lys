import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Expertise } from "@/components/sections/Expertise";
import { isScrollLocked, resetScrollLockForTests } from "@/lib/scrollLock";

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
            keyCompetencies: ["Hooks", "JSX"],
            details: "React details.",
            projectSlugs: [],
            rationale: "",
            highlights: [],
            ecosystem: [],
          },
        ],
      },
    ],
  },
  projects: [],
}));

afterEach(() => {
  // Reset through the module rather than by hand. Clearing `style.overflow` alone leaves the
  // `overflow-hidden` class this lock adds, which leaks into the next test and would also be
  // recorded as the "previous" state by any later acquire, permanently re-locking the body.
  resetScrollLockForTests();
});

describe("dialog + scroll lock + background isolation", () => {
  it("locks the page while the dialog is open and releases it on close", async () => {
    const { container } = render(<Expertise />);
    const trigger = container.querySelector('[aria-label^="View details"]') as HTMLElement;
    trigger.focus();
    fireEvent.click(trigger);

    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    expect(isScrollLocked()).toBe(true);

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(isScrollLocked()).toBe(false);
  });

  it("renders the dialog as a direct child of body so siblings can be isolated", async () => {
    const { container } = render(<Expertise />);
    const trigger = container.querySelector('[aria-label^="View details"]') as HTMLElement;
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = await waitFor(() => screen.getByRole("dialog"));

    // The parent-child relationship is what the background inert/aria-hidden effect relies on:
    // without the portal the overlay's parent is the <section>, so the effect bailed and the
    // siblings behind were never made inert.
    expect(dialog.parentElement).toBe(document.body);
    const siblings = Array.from(document.body.children).filter((el) => el !== dialog);
    expect(siblings.length).toBeGreaterThan(0);
    expect(siblings.every((el) => el.getAttribute("aria-hidden") === "true")).toBe(true);
    expect(siblings.some((el) => (el as HTMLElement).inert)).toBe(true);
  });

  it("does not steal focus back when unrelated state changes", async () => {
    const { container } = render(<Expertise />);
    const trigger = container.querySelector('[aria-label^="View details"]') as HTMLElement;
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = await waitFor(() => screen.getByRole("dialog"));
    const closeBtn = dialog.querySelector('[aria-label="Close skill details"]') as HTMLElement;
    expect(closeBtn).toBeTruthy();
    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);

    // Move focus onto a different control inside the dialog. A pre-fix regression would re-run
    // the effect (keyed on an unstable `onClose`) and yank focus back to the first focusable.
    // "buttons"[0] is the dismiss overlay (excluded from the trap), "[1]" is the close control
    // we are already on, so pick a later one -- any other control in the dialog.
    const otherBtn = dialog.querySelectorAll("button")[2] as HTMLElement;
    if (otherBtn) {
      otherBtn.focus();
      expect(document.activeElement).toBe(otherBtn);
      closeBtn.focus();
      expect(document.activeElement).toBe(closeBtn);
    }
  });

  it("returns focus to the tile that opened it on close", async () => {
    const { container } = render(<Expertise />);
    const trigger = container.querySelector('[aria-label^="View details"]') as HTMLElement;
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
    // Focus has moved into the dialog, so it is no longer on the tile.
    expect(document.activeElement).not.toBe(trigger);

    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    // Without restoration focus falls back to <body>, which strands keyboard and screen-reader
    // users at the top of the document instead of the card they dismissed. Restoration is
    // deferred past the portal teardown, so wait for it.
    await waitFor(
      () => {
        expect(document.activeElement).toBe(trigger);
      },
      { timeout: 3000 }
    );
  });

  it("does not strand the page in a locked state across repeated open/close cycles", async () => {
    const { container } = render(<Expertise />);
    const trigger = container.querySelector('[aria-label^="View details"]') as HTMLElement;

    // Two full cycles: a leaked lock on either open or close shows up as `true` at the end.
    for (let i = 0; i < 2; i++) {
      fireEvent.click(trigger);
      await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
      expect(isScrollLocked()).toBe(true);
      fireEvent.keyDown(document, { key: "Escape" });
      await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
      expect(isScrollLocked()).toBe(false);
    }
  });
});
