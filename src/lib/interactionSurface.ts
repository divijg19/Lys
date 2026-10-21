/**
 * @file: src/lib/interactionSurface.ts
 * @description: Where a pointer lands in the ethereal scene.
 *
 * ## Why this is not the floor
 *
 * The ethereal scene is a background: a receding floor plane at `y = -3`, seen by a camera that
 * sits at `y = 2` and looks horizontally along `-z`. Intersecting a click with that floor puts
 * the effect tens of units away, at a grazing angle, where the plane is nearly edge-on. A ripple
 * there was drawn as a thin, pale ellipse about a hundred pixels wide and twenty tall, in the
 * lower part of the screen -- never where the click was, and never visible enough to read.
 *
 * So the effects are placed on a surface that faces the camera instead. The click's normalised
 * device coordinates land on it directly, which means the effect appears *under the cursor*,
 * at a size that can be chosen in screen terms rather than in world terms.
 *
 * The floor keeps its own role: the click is also intersected with it, and that point drives
 * the concentric wave in the floor's shader. The wave is the echo spreading away; the ring at
 * the cursor is the echo itself.
 */

import { type PerspectiveCamera, Vector2, Vector3 } from "three";

/** How far in front of the camera the interaction surface sits, in world units. */
export const INTERACTION_DISTANCE = 8;

/** The height of the floor plane the scene's waves are drawn on. */
export const FLOOR_HEIGHT = -3;

/** The half-extent of the floor plane; points outside it are pulled in. */
export const FLOOR_EXTENT = 18;

/**
 * Convert a client-space pointer position into normalised device coordinates.
 *
 * `rect` is the canvas' own bounding rectangle, so the coordinates are relative to the canvas
 * rather than to whatever element the pointer happened to be over.
 */
export function ndcFromClient(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number }
): Vector2 {
  if (rect.width === 0 || rect.height === 0) return new Vector2(0, 0);

  return new Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1
  );
}

/**
 * The point on a surface that faces the camera, at the given normalised device coordinates.
 *
 * The surface is placed `distance` units in front of the camera and is sized to fill the view
 * at that distance, so a point on it lands exactly under the pointer.
 */
export function pointOnCameraSurface(
  camera: PerspectiveCamera,
  ndc: Vector2,
  distance: number = INTERACTION_DISTANCE
): Vector3 {
  const forward = new Vector3();
  camera.getWorldDirection(forward);
  const up = camera.up.clone().normalize();
  const right = new Vector3().crossVectors(forward, up).normalize();

  const halfHeight = distance * Math.tan((camera.fov * Math.PI) / 360);
  const halfWidth = halfHeight * camera.aspect;

  return camera.position
    .clone()
    .addScaledVector(forward, distance)
    .addScaledVector(right, ndc.x * halfWidth)
    .addScaledVector(up, ndc.y * halfHeight);
}

/**
 * The point where the pointer's ray meets the floor plane, for the wave that spreads away.
 *
 * Returns `null` when the ray never reaches the floor -- a click above the horizon points
 * upwards, and there is nothing to intersect -- and `null` when it reaches the floor beyond the
 * plane's own extent.
 *
 * It used to clamp the point to the plane's edge instead, which put the wave at the horizon for
 * any click near the top of the page: the wave appeared as far from the click as the field
 * allows, which is not what "the click made a wave here" should mean.
 */
export function pointOnFloor(
  camera: PerspectiveCamera,
  ndc: Vector2,
  floorHeight: number = FLOOR_HEIGHT,
  extent: number = FLOOR_EXTENT
): Vector3 | null {
  const forward = new Vector3();
  camera.getWorldDirection(forward);

  // Build the ray through the pointer. The camera's own axes give the basis.
  const up = new Vector3(0, 1, 0);
  const right = new Vector3().crossVectors(forward, up).normalize();
  const trueUp = new Vector3().crossVectors(right, forward).normalize();

  const halfHeight = Math.tan((camera.fov * Math.PI) / 360);
  const halfWidth = halfHeight * camera.aspect;

  const direction = forward
    .clone()
    .addScaledVector(right, ndc.x * halfWidth)
    .addScaledVector(trueUp, ndc.y * halfHeight)
    .normalize();

  if (Math.abs(direction.y) < 1e-6) return null;

  const distance = (floorHeight - camera.position.y) / direction.y;
  if (!Number.isFinite(distance) || distance <= 0) return null;

  const point = camera.position.clone().addScaledVector(direction, distance);

  // Beyond the plane's own extent there is no field to disturb.
  if (Math.abs(point.x) > extent || Math.abs(point.z) > extent) return null;

  point.y = floorHeight;
  return point;
}
