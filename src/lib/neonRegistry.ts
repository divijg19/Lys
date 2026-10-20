/**
 * @file: src/lib/neonRegistry.ts
 * @description: The registry of the cyberpunk theme's neon signs.
 *
 * ## What this is for
 *
 * The signs in the cyberpunk alley share one pulse: the whole street breathes together rather
 * than each sign flickering on its own. The pulse is applied in a single frame hook, which means
 * the hook has to know every sign -- and every sign has to be able to say when it is gone.
 *
 * ## The two defects it replaces
 *
 * **The registry grew without bound.** A ref callback is called with the object on mount and with
 * `null` on unmount, and `null` says nothing about *which* object left. The registry used to
 * push on every mount and ignore the nulls, so a material was in the list several times over and
 * never left it.
 *
 * **The pulse replaced the intensity instead of modulating it.** The frame hook wrote
 * `pulse * (mat.emissiveIntensity ? 1 : 1)`, which is `pulse * 1`: the authored 2.0-2.5 was
 * overwritten by a value between 0.7 and 1.3, so the signs rendered at roughly half the
 * brightness they were designed for.
 *
 * This keeps the authored intensity alongside the material, so the pulse can multiply it.
 */

import type { MeshStandardMaterial } from "three";

/** The part of a material the registry needs. */
export type NeonMaterial = Pick<MeshStandardMaterial, "emissiveIntensity">;

export class NeonRegistry {
  private readonly materials = new Map<NeonMaterial, number>();

  /** How many signs are registered. */
  get size(): number {
    return this.materials.size;
  }

  /**
   * Register a sign, remembering the intensity it was authored with.
   *
   * Returns the unregister function, which the caller keeps for the lifetime of the sign.
   */
  register(material: NeonMaterial): () => void {
    this.materials.set(material, material.emissiveIntensity);

    return () => {
      this.materials.delete(material);
    };
  }

  /**
   * Apply the pulse to every registered sign.
   *
   * The pulse is a multiplier around 1, so the signs breathe around the brightness they were
   * designed with rather than around an arbitrary one.
   */
  apply(pulse: number): void {
    for (const [material, authored] of this.materials) {
      material.emissiveIntensity = authored * pulse;
    }
  }
}
