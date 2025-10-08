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

    // Robust wait: quick polling loop before falling back to waitFor
    let dialogEl: HTMLElement | null = null;
    for (let i = 0; i < 10; i++) {
      dialogEl = screen.queryByRole("dialog");
      if (dialogEl) break;
      // eslint-disable-next-line no-await-in-loop
      await new Promise((r) => setTimeout(r, 30));
    }
    if (!dialogEl) {
      // Fallback to waitFor (in case animation took longer)
      dialogEl = await waitFor(() => screen.getByRole("dialog"), { timeout: 3000 });
    }
    expect(dialogEl).toBeInTheDocument();

    // Focus trap: attempt a Tab; focus should remain inside
    if (dialogEl) {
      fireEvent.keyDown(dialogEl, { key: "Tab" });
      expect(dialogEl.contains(document.activeElement)).toBe(true);
    } else {
      throw new Error("Dialog element not found for focus trap test");
    }

    const results = await runAxe(container);
    const critical = results.violations.filter((v) => v.impact === "critical");
    expect(critical).toHaveLength(0);
  }, 15000);
});
