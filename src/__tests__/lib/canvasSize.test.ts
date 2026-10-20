/**
 * @file: src/__tests__/lib/canvasSize.test.ts
 * @description: Measuring a canvas, and moving a shape when the canvas changes size.
 *
 * The cyberpunk rain's rear layer covers the top band of the screen. It used to be a
 * full-viewport canvas with a clip path over it: the backing store was allocated at the full
 * size, and the clear that happens on every frame covered the whole viewport, two thirds of
 * which nobody could see.
 *
 * The lightning bolts are stored in CSS pixels. When the canvas is reallocated underneath them,
 * the bolts have to move with it -- otherwise a bolt in flight is wiped by the reallocation and
 * any that survived are drawn in the old coordinate space, off the edge of the new canvas.
 */

import { describe, expect, it } from "vitest";
import { measureCanvas, rescalePoints } from "@/lib/canvasSize";

describe("measureCanvas", () => {
  it("measures the canvas, not the window", () => {
    const size = measureCanvas(
      { clientWidth: 1280, clientHeight: 288 },
      { width: 1280, height: 720 }
    );

    expect(size).toEqual({ width: 1280, height: 288 });
  });

  it("falls back to the window when the canvas has no box", () => {
    // A canvas that is not in the document yet, or is hidden, reports zero.
    const size = measureCanvas({ clientWidth: 0, clientHeight: 0 }, { width: 1280, height: 720 });

    expect(size).toEqual({ width: 1280, height: 720 });
  });
});

describe("rescalePoints", () => {
  it("moves the points with the canvas", () => {
    const points = [
      { x: 100, y: 200 },
      { x: 50, y: 25 },
    ];

    expect(rescalePoints(points, 0.5, 2)).toEqual([
      { x: 50, y: 400 },
      { x: 25, y: 50 },
    ]);
  });

  it("leaves the points alone when the size has not changed", () => {
    const points = [{ x: 10, y: 20 }];

    expect(rescalePoints(points, 1, 1)).toEqual([{ x: 10, y: 20 }]);
  });

  it("does not modify the points it was given", () => {
    const points = [{ x: 10, y: 20 }];
    rescalePoints(points, 2, 2);

    expect(points).toEqual([{ x: 10, y: 20 }]);
  });
});
