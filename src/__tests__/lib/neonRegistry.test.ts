/**
 * @file: src/__tests__/lib/neonRegistry.test.ts
 * @description: The cyberpunk theme's shared neon pulse.
 *
 * Two defects lived here, and both were invisible in a screenshot.
 *
 * The registry grew without bound: a ref callback is called with the object on mount and with
 * `null` on unmount, and `null` says nothing about which object left, so the registry pushed on
 * every mount and never removed anything.
 *
 * And the pulse replaced the authored intensity instead of modulating it -- the signs rendered
 * at roughly half the brightness they were designed for.
 */

import { describe, expect, it } from "vitest";
import { type NeonMaterial, NeonRegistry } from "@/lib/neonRegistry";

/** A stand-in for a material: the registry only touches the emissive intensity. */
const material = (intensity: number): NeonMaterial => ({ emissiveIntensity: intensity });

describe("NeonRegistry", () => {
  it("modulates the authored intensity rather than replacing it", () => {
    const registry = new NeonRegistry();
    const sign = material(2.5);
    registry.register(sign);

    // The pulse is a multiplier around 1, so the sign breathes around its authored brightness.
    registry.apply(1);
    expect(sign.emissiveIntensity).toBeCloseTo(2.5, 6);

    registry.apply(1.3);
    expect(sign.emissiveIntensity).toBeCloseTo(2.5 * 1.3, 6);

    registry.apply(0.7);
    expect(sign.emissiveIntensity).toBeCloseTo(2.5 * 0.7, 6);
  });

  it("does not lose the authored intensity between pulses", () => {
    // The defect: the frame hook read the material's *current* intensity, so the first pulse
    // replaced the authored value and every pulse after that compounded on the last one.
    const registry = new NeonRegistry();
    const sign = material(2.5);
    registry.register(sign);

    registry.apply(0.7);
    registry.apply(1.3);
    registry.apply(0.7);
    registry.apply(1.3);

    expect(sign.emissiveIntensity).toBeCloseTo(2.5 * 1.3, 6);
  });

  it("removes a sign when it is unregistered", () => {
    const registry = new NeonRegistry();
    const sign = material(2);
    const unregister = registry.register(sign);

    expect(registry.size).toBe(1);
    unregister();
    expect(registry.size).toBe(0);

    // A removed sign must not be touched again.
    sign.emissiveIntensity = 2;
    registry.apply(1.3);
    expect(sign.emissiveIntensity).toBe(2);
  });

  it("keeps one entry per sign, however many times it registers", () => {
    const registry = new NeonRegistry();
    const sign = material(2);

    registry.register(sign);
    registry.register(sign);
    registry.register(sign);

    expect(registry.size).toBe(1);
  });

  it("keeps the signs apart", () => {
    const registry = new NeonRegistry();
    const first = material(2);
    const second = material(2.5);
    const removeFirst = registry.register(first);
    registry.register(second);

    removeFirst();

    expect(registry.size).toBe(1);
    registry.apply(1.3);
    expect(second.emissiveIntensity).toBeCloseTo(2.5 * 1.3, 6);
    expect(first.emissiveIntensity).toBeCloseTo(2, 6);
  });
});
