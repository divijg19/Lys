/**
 * @file: src/lib/canvasSize.ts
 * @description: Measuring a canvas that is not the size of the window.
 *
 * A canvas that covers the whole viewport and a canvas that covers the top band of it are very
 * different amounts of work: the backing store is allocated at the canvas' own size, and the
 * clear that happens on every frame covers the same area. Sizing a canvas to the window and then
 * clipping it with CSS means paying for the clipped part too.
 */

/** The size of a canvas, in CSS pixels. */
export type CanvasSize = { width: number; height: number };

/**
 * The size of a canvas, falling back to the window when the canvas has no box of its own.
 *
 * A canvas that is not in the document yet, or is hidden, reports a zero-sized box; the window
 * is the better guess in that case.
 */
export function measureCanvas(
  canvas: { clientWidth: number; clientHeight: number },
  fallback: { width: number; height: number }
): CanvasSize {
  return {
    width: canvas.clientWidth || fallback.width,
    height: canvas.clientHeight || fallback.height,
  };
}

/**
 * Rescale the points of a shape when the canvas underneath it changes size.
 *
 * The lightning bolts are stored in CSS pixels. When the canvas is reallocated the old
 * coordinates no longer describe where anything is, so the shape has to be moved with it --
 * otherwise a bolt in flight is wiped by the reallocation, and any that survived would be drawn
 * in the old coordinate space, off the edge of the new canvas.
 */
export function rescalePoints(
  points: { x: number; y: number }[],
  scaleX: number,
  scaleY: number
): { x: number; y: number }[] {
  return points.map((point) => ({ x: point.x * scaleX, y: point.y * scaleY }));
}
