import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { Hero } from "@/components/sections/Hero";

async function runAxe(node: HTMLElement) {
  // Allow pending layout/animation microtasks to flush
  await Promise.resolve();
  return await axe.run(node, { rules: { "color-contrast": { enabled: false } } });
}

describe("Hero accessibility", () => {
  it("has no critical violations", async () => {
    const { container } = render(<Hero />);
    const results = await runAxe(container);
    if (results.violations.length > 0) {
      // Log details for debugging
      console.log("Axe violations:", results.violations);
    }
    expect(results.violations.length).toBe(0);
  }, 15000);
});
