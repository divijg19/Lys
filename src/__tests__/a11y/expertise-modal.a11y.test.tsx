import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it, vi } from "vitest";
import { Expertise } from "@/components/sections/Expertise";

// Ensure deterministic #velite data for this test (explicit mock)
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
        ],
      },
    ],
  },
  projects: [{ slug: "lys", title: "Lys Portfolio", url: "/projects/lys" }],
}));

async function runAxe(node: HTMLElement) {
  await Promise.resolve();
  return await axe.run(node, { rules: { "color-contrast": { enabled: false } } });
}

describe("Expertise modal accessibility", () => {
  it("opens and traps focus with no critical violations", async () => {
    const { container } = render(<Expertise />);
    const button = await screen
      .findAllByRole("button", { name: /view details for/i })
      .then((l) => l[0]);
    // Prefer click (less timing sensitive than keyboard simulation here)
    fireEvent.click(button);

    // Wait via Testing Library (act-wrapped) so dynamic import updates are tracked.
    const dialogEl = await screen.findByRole("dialog", undefined, { timeout: 3000 });
    expect(dialogEl).toBeInTheDocument();

    // Wait for focus management effect to run.
    await waitFor(() => {
      expect(dialogEl.contains(document.activeElement)).toBe(true);
    });

    // Focus trap: attempt a Tab; focus should remain inside
    fireEvent.keyDown(dialogEl, { key: "Tab" });
    expect(dialogEl.contains(document.activeElement)).toBe(true);

    const results = await runAxe(container);
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toHaveLength(0);
  }, 15000);
});
