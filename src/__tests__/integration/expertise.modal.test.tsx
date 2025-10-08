import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Expertise } from "@/components/sections/Expertise";

// Explicitly mock #velite so Expertise uses deterministic data in tests
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

describe("Expertise modal", () => {
  it("opens and closes a skill modal with Escape restoring focus", async () => {
    const { container } = render(<Expertise />);
    const trigger = container.querySelector('[aria-label^="View details"]') as HTMLElement;
    expect(trigger).toBeTruthy();
    trigger.focus();
    fireEvent.click(trigger);
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
    expect(document.activeElement).toBe(trigger);
  }, 10000);
});
