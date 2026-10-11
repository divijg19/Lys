import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Navbar } from "@/components/layout/Navbar";
import { isScrollLocked } from "@/lib/scrollLock";

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

afterEach(() => {
  document.body.style.overflow = "";
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
