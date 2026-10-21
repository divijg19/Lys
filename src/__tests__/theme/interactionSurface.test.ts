/**
 * @file: src/__tests__/theme/interactionSurface.test.ts
 * @description: Where a pointer lands in the ethereal scene.
 *
 * The effects used to be placed on the scene's floor plane, tens of units away and seen at a
 * grazing angle. A ripple there was a thin, pale ellipse about a hundred pixels wide and twenty
 * tall, in the lower part of the screen -- never under the cursor. The effect *happened* (the
 * draw calls doubled) and was invisible (the pixel difference was zero), which is the hardest
 * kind of bug to notice.
 *
 * These tests pin the property that was missing: the effect lands where the pointer is.
 */

import { PerspectiveCamera, Vector2 } from "three";
import { describe, expect, it } from "vitest";
import {
  FLOOR_HEIGHT,
  INTERACTION_DISTANCE,
  ndcFromClient,
  pointOnCameraSurface,
  pointOnFloor,
  screenConsistentScale,
} from "@/lib/interactionSurface";

/** The scene's camera: at (0, 2, 5), looking horizontally along -z. */
const camera = (): PerspectiveCamera => {
  const instance = new PerspectiveCamera(75, 1280 / 720, 0.1, 1000);
  instance.position.set(0, 2, 5);
  instance.updateMatrixWorld(true);
  return instance;
};

/** Where a point projects to on the screen, in normalised device coordinates. */
const project = (point: { x: number; y: number; z: number }): Vector2 => {
  const view = camera();
  const projected = new Vector2();
  const vector = new Vector2();
  void vector;
  const v = { x: point.x, y: point.y, z: point.z };
  // Project through the camera by hand, so the test does not depend on three's internals.
  const m = view.projectionMatrix.clone().multiply(view.matrixWorldInverse);
  const e = m.elements;
  const w = e[3] * v.x + e[7] * v.y + e[11] * v.z + e[15];
  const x = (e[0] * v.x + e[4] * v.y + e[8] * v.z + e[12]) / w;
  const y = (e[1] * v.x + e[5] * v.y + e[9] * v.z + e[13]) / w;
  projected.set(x, y);
  return projected;
};

describe("ndcFromClient", () => {
  it("maps the canvas centre to the centre of the view", () => {
    const rect = { left: 0, top: 0, width: 1280, height: 720 };
    const ndc = ndcFromClient(640, 360, rect);

    expect(ndc.x).toBeCloseTo(0, 6);
    expect(ndc.y).toBeCloseTo(0, 6);
  });

  it("maps the corners to the corners of the view", () => {
    const rect = { left: 0, top: 0, width: 1280, height: 720 };

    expect(ndcFromClient(0, 0, rect).x).toBeCloseTo(-1, 6);
    expect(ndcFromClient(0, 0, rect).y).toBeCloseTo(1, 6);
    expect(ndcFromClient(1280, 720, rect).x).toBeCloseTo(1, 6);
    expect(ndcFromClient(1280, 720, rect).y).toBeCloseTo(-1, 6);
  });

  it("is relative to the canvas, not to the page", () => {
    const rect = { left: 100, top: 50, width: 1280, height: 720 };
    const ndc = ndcFromClient(100 + 640, 50 + 360, rect);

    expect(ndc.x).toBeCloseTo(0, 6);
    expect(ndc.y).toBeCloseTo(0, 6);
  });
});

describe("pointOnCameraSurface", () => {
  it("puts the effect exactly under the pointer", () => {
    // The property that was missing: project the point back and it must land on the pointer.
    for (const [x, y] of [
      [0, 0],
      [-0.8, 0.6],
      [0.5, -0.7],
      [1, 1],
    ]) {
      const ndc = new Vector2(x, y);
      const point = pointOnCameraSurface(camera(), ndc);
      const projected = project(point);

      expect(projected.x).toBeCloseTo(x, 4);
      expect(projected.y).toBeCloseTo(y, 4);
    }
  });

  it("sits in front of the camera", () => {
    const point = pointOnCameraSurface(camera(), new Vector2(0, 0));

    // The camera looks along -z from (0, 2, 5), so the surface is at z = 5 - distance.
    expect(point.z).toBeCloseTo(5 - INTERACTION_DISTANCE, 4);
    expect(point.y).toBeCloseTo(2, 4);
  });

  it("is farther from the camera for a pointer further from the centre", () => {
    // The surface is flat and faces the camera, so a point at the edge of the view is further
    // away than one at the centre. That is what makes it a *surface* and not a billboard.
    const centre = pointOnCameraSurface(camera(), new Vector2(0, 0));
    const edge = pointOnCameraSurface(camera(), new Vector2(1, 0));

    expect(centre.distanceTo(camera().position)).toBeLessThan(edge.distanceTo(camera().position));
  });
});

describe("pointOnFloor", () => {
  it("meets the floor where the pointer's ray goes", () => {
    const point = pointOnFloor(camera(), new Vector2(0, -0.5));

    expect(point).not.toBeNull();
    expect(point?.y).toBeCloseTo(FLOOR_HEIGHT, 4);
  });

  it("is null for a pointer above the horizon", () => {
    // A click in the upper half of the page points upwards; there is no floor to meet.
    expect(pointOnFloor(camera(), new Vector2(0, 0.9))).toBeNull();
  });

  it("has no point where the ray leaves the floor's own extent", () => {
    /*
     * A ray just below the horizon travels a very long way before it reaches the floor, and the
     * floor ends. It used to be clamped to the edge, which put the wave at the horizon for any
     * click near the top of the page -- as far from the click as the field allows.
     */
    expect(pointOnFloor(camera(), new Vector2(0, -0.02))).toBeNull();
  });

  it("has a point where the ray does meet the floor", () => {
    const point = pointOnFloor(camera(), new Vector2(0, -0.5));

    expect(point).not.toBeNull();
    expect(Math.abs(point?.x ?? 0)).toBeLessThanOrEqual(18);
    expect(Math.abs(point?.z ?? 0)).toBeLessThanOrEqual(18);
  });
});

describe("screenConsistentScale", () => {
  it("scales a thing further away so that it stays the same size on the screen", () => {
    // The interaction surface is flat, so a point at the top of the view is further away than
    // one at the bottom, and a fixed-size quad on it came out 167 pixels across at the top of the
    // page and 128 in the middle.
    expect(screenConsistentScale(INTERACTION_DISTANCE)).toBe(1);
    expect(screenConsistentScale(INTERACTION_DISTANCE * 1.5)).toBeCloseTo(1.5, 6);
    expect(screenConsistentScale(INTERACTION_DISTANCE * 0.5)).toBeCloseTo(0.5, 6);
  });

  it("keeps the size on the screen constant", () => {
    // The apparent size of an object is its size divided by its distance, so scaling by the
    // distance cancels that out.
    for (const distance of [6, 8, 11, 16]) {
      const size = 2.2 * screenConsistentScale(distance);
      expect(size / distance).toBeCloseTo(2.2 / INTERACTION_DISTANCE, 6);
    }
  });

  it("does nothing when the distance is not a number", () => {
    expect(screenConsistentScale(0)).toBe(1);
    expect(screenConsistentScale(Number.NaN)).toBe(1);
  });
});
