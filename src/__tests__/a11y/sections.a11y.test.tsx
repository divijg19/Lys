import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";

// Section components
import { About } from "@/components/sections/About";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Expertise } from "@/components/sections/Expertise";
import { Hero } from "@/components/sections/Hero";
import { ProjectsPreview } from "@/components/sections/ProjectsPreview";

async function runAxe(node: HTMLElement) {
  await Promise.resolve();
  return await axe.run(node, { rules: { "color-contrast": { enabled: false } } });
}

const components = [
  ["Hero", Hero],
  ["About", About],
  ["ProjectsPreview", ProjectsPreview],
  ["BlogPreview", BlogPreview],
  ["Experience", Experience],
  ["Expertise", Expertise],
  ["Contact", Contact],
] as const;

describe("Sections accessibility", () => {
  components.forEach(([label, Comp]) => {
    it(`${label} has no critical violations`, async () => {
      const { container } = render(<Comp />);
      // Run axe sequentially by awaiting each run
      await new Promise((resolve) => setTimeout(resolve, 100));
      const results = await runAxe(container);
      if (results.violations.length > 0) {
        // Helpful debug output when a single section regresses.
        // eslint-disable-next-line no-console
        console.log(`[axe][${label}]`, JSON.stringify(results.violations, null, 2));
      }
      expect(results.violations.length).toBe(0);
    }, 15000);
  });
});
