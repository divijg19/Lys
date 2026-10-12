import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Contact } from "@/components/sections/Contact";

/**
 * The contact form unmounts itself on submit.
 *
 * Both success and error replace the form with a result panel. The submit button inside the form
 * is what held focus, so it went to <body>. The aria-live region still announced the outcome, but
 * a keyboard user was dropped out of the form with nothing focused and no route to the result.
 */

/** Fill the form with valid values matching the zod schema. */
function fillValidForm() {
  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: "Test Person" } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
  fireEvent.change(screen.getByLabelText(/message/i), { target: { value: "A real message." } });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("contact form focus on result", () => {
  it("moves focus to the success panel instead of dropping it on <body>", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({}) }))
    );

    render(<Contact />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /^send/i }));

    const heading = await waitFor(() => screen.getByRole("heading", { name: /thank you/i }));
    // Wait for the effect that moves focus, rather than asserting on the same tick the heading
    // appears -- focus is set after render, and asserting immediately races it.
    await waitFor(() => expect(heading).toHaveFocus());

    // The failure mode before the fix: activeElement was <body>, because the form -- and the
    // submit button holding focus -- had unmounted with nothing taking over.
    expect(document.activeElement).not.toBe(document.body);
  }, 15000);

  it("offers a way back to the form after a successful send", async () => {
    // The success panel previously contained no control at all, so it was a dead end: a keyboard
    // user had to Shift+Tab out of it to reach the form again.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({}) }))
    );

    render(<Contact />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /^send/i }));

    const reset = await waitFor(() =>
      screen.getByRole("button", { name: /send another message/i })
    );
    await waitFor(() => expect(reset).toBeEnabled());

    fireEvent.click(reset);
    expect(await screen.findByLabelText(/name/i)).toHaveValue("");
  }, 15000);

  it("moves focus to the retry action when the send fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: false, status: 500, json: async () => ({}) }))
    );

    render(<Contact />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /^send/i }));

    const retry = await waitFor(() => screen.getByRole("button", { name: /try again/i }));
    await waitFor(() => expect(retry).toHaveFocus());
  }, 15000);

  it("announces the outcome in the live region as well as moving focus", async () => {
    // Both mechanisms: focus for keyboard users, the live region for screen-reader users browsing
    // elsewhere when the form was submitted.
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, json: async () => ({}) }))
    );

    render(<Contact />);
    fillValidForm();
    fireEvent.click(screen.getByRole("button", { name: /^send/i }));

    await waitFor(() => screen.getByRole("heading", { name: /thank you/i }));
    const live = document.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toMatch(/sent successfully/i);
  }, 15000);
});
