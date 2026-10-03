"use client";

/**
 * @file: src/hooks/useRippleField.ts
 * @description: Pointer and touch interaction for the Ethereal ripple field.
 *
 * Why this listens on `window` rather than on the canvas:
 *
 * The canvas lives in the theme background layer, which sits at `-z-50` behind the page,
 * while the page is wrapped in a full-viewport `relative z-10` element. That wrapper
 * covers every pixel, so the canvas never becomes the hit-test target and its own
 * `onPointerDown` could never fire. The previous implementation therefore had no working
 * interaction at all, and `pointer-events-auto` on the canvas root did not help: z-order
 * decides the target before `pointer-events` is consulted.
 *
 * Listening on `window` and raycasting by hand sidesteps hit-testing entirely, so the
 * field responds to mouse, touch and pen regardless of what content sits above it, and
 * never steals a click from a real control.
 *
 * It also fixes a clock mismatch. Ripples and wisps were created with
 * `event.nativeEvent.timeStamp / 1000` but compared against the renderer's
 * `clock.getElapsedTime()`. Those are different epochs, so progress went permanently
 * negative: ripples rendered at negative radius (invisible) and wisps never reached the
 * end of their life, accumulating without bound. Everything here uses one monotonic scene
 * clock instead.
 */

import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

/** Maximum simultaneous ripple sources. Also the size of the shader uniform arrays. */
export const MAX_RIPPLE_SOURCES = 4;

/** How long a source keeps displacing the surface after the pointer releases. */
export const SOURCE_FADE_SECONDS = 0.45;

/**
 * Synthetic key for the single hover-trail source.
 *
 * Negative so it can never collide with a real `pointerId`, which browsers allocate from
 * a small positive range.
 */
const TRAIL_SOURCE_KEY = -1;

/** A live interaction point on the surface. */
export type RippleSource = {
  /** `pointerId` for pointer-driven sources, or a synthetic id for autonomous ones. */
  key: number;
  /** Position in the surface's local space (the plane's own XY). */
  local: THREE.Vector2;
  /** Seconds on the scene clock when this source was created. */
  bornAt: number;
  /** Pointer-driven sources fade on release; autonomous ones live a fixed lifetime. */
  pointerId: number | null;
};

/** A visual ripple. `createdAt` is on the shared scene clock. */
export type RippleEvent = {
  id: number;
  /** World-space position, for placing the ripple quad. */
  position: THREE.Vector3;
  createdAt: number;
  /** Strength, so a gentle hover trail can be fainter than a deliberate tap. */
  strength: number;
};

export type RippleField = {
  /** Live sources, read every frame by the surface shader. */
  sourcesRef: RefObject<RippleSource[]>;
  ripples: RippleEvent[];
  /** Remove a finished ripple. */
  removeRipple: (id: number) => void;
  /** Advance the shared scene clock. Call once per frame from the render loop. */
  setSceneTime: (time: number) => void;
};

/** Elements that own their own clicks; the field must not react to those. */
const INTERACTIVE_SELECTOR =
  'a[href], button, input, textarea, select, [role="button"], [role="menuitem"], [role="tab"], [contenteditable="true"], [data-no-ripple]';

/** Regions whose clicks belong to the chrome, not to the scene. */
const CHROME_SELECTOR =
  "header, nav, footer, [role='dialog'], [role='menu'], [data-slot='toaster']";

/** Should a pointer that landed on `target` start a ripple? */
export function shouldStartRipple(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return true;
  if (target.closest(INTERACTIVE_SELECTOR)) return false;
  if (target.closest(CHROME_SELECTOR)) return false;
  return true;
}

type Options = {
  /** The object whose plane defines the interactive surface. */
  surfaceRef: RefObject<THREE.Object3D | null>;
  camera: THREE.Camera;
  /** The renderer's canvas, used to map client coordinates into NDC. */
  domElement: HTMLElement | null;
  /** Disabled in calm mode, and before the surface has mounted. */
  enabled: boolean;
  /** Decides whether autonomous (non-pointer) sources are allowed. */
  allowAmbient?: boolean;
  /**
   * Called for every ripple the field raises, alongside the internal state update.
   * Used to spawn the secondary effects (wisps) from the same event and the same clock.
   */
  onRipple?: (ripple: RippleEvent) => void;
};

export function useRippleField({
  surfaceRef,
  camera,
  domElement,
  enabled,
  allowAmbient = true,
  onRipple,
}: Options): RippleField {
  const [ripples, setRipples] = useState<RippleEvent[]>([]);
  const sourcesRef = useRef<RippleSource[]>([]);

  /*
   * The shared scene clock. Written from the render loop and read from DOM event
   * handlers, so ripples, wisps and the surface displacement all agree on "now".
   */
  const sceneTime = useRef(0);

  /** Scratch objects, hoisted so a pointer event allocates nothing. */
  const scratch = useRef({
    rect: new DOMRect(),
    ndc: new THREE.Vector2(),
    raycaster: new THREE.Raycaster(),
    plane: new THREE.Plane(),
    normal: new THREE.Vector3(),
    worldPoint: new THREE.Vector3(),
    localPoint: new THREE.Vector3(),
    origin: new THREE.Vector3(),
    quaternion: new THREE.Quaternion(),
  });

  const pushRipple = useCallback((ripple: RippleEvent) => {
    setRipples((prev) => [...prev, ripple]);
  }, []);

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const setSceneTime = useCallback((time: number) => {
    sceneTime.current = time;
  }, []);

  useEffect(() => {
    if (!enabled) {
      sourcesRef.current = [];
      setRipples([]);
      return;
    }
    if (!domElement) return;

    const s = scratch.current;

    /**
     * Project a client-space point onto the surface plane.
     * @returns The hit point in the surface's local space, or null when the ray misses.
     */
    const project = (clientX: number, clientY: number): THREE.Vector2 | null => {
      const surface = surfaceRef.current;
      if (!surface) return null;

      s.rect = domElement.getBoundingClientRect();
      if (s.rect.width === 0 || s.rect.height === 0) return null;

      s.ndc.set(
        ((clientX - s.rect.left) / s.rect.width) * 2 - 1,
        -((clientY - s.rect.top) / s.rect.height) * 2 + 1
      );

      s.raycaster.setFromCamera(s.ndc, camera);

      // Derive the world-space plane from the surface's own transform, so the maths keeps
      // working if the surface is ever moved or re-oriented.
      surface.getWorldQuaternion(s.quaternion);
      s.normal.set(0, 0, 1).applyQuaternion(s.quaternion);
      surface.getWorldPosition(s.origin);
      s.plane.setFromNormalAndCoplanarPoint(s.normal, s.origin);

      const hit = s.raycaster.ray.intersectPlane(s.plane, s.worldPoint);
      if (!hit) return null;

      s.localPoint.copy(hit);
      surface.worldToLocal(s.localPoint);
      // PlaneGeometry vertices live in local XY, so XY is the surface's own 2D space.
      return new THREE.Vector2(s.localPoint.x, s.localPoint.y);
    };

    /**
     * Insert or move a source.
     *
     * Looked up by `key` rather than `pointerId`, so a non-pointer source that must decay
     * (the hover trail) can still be tracked as a single continuous source instead of
     * accumulating one dead entry per mouse move.
     *
     * @param persistent True while the pointer is down, so the source holds at full
     *   strength. False for the trail, which is marked for decay and fades out.
     */
    const touch = (
      key: number,
      clientX: number,
      clientY: number,
      persistent: boolean
    ): RippleSource | null => {
      const local = project(clientX, clientY);
      if (!local) return null;

      const now = sceneTime.current;
      const existing = sourcesRef.current.find((src) => src.key === key);

      if (existing) {
        existing.local.copy(local);
        existing.bornAt = now;
        existing.pointerId = persistent ? key : null;
        return existing;
      }

      // Evict the oldest source when the pool is full, so a fifth finger pushes out the
      // longest-lived ripple instead of being silently dropped.
      if (sourcesRef.current.length >= MAX_RIPPLE_SOURCES) {
        let oldestIndex = 0;
        for (let i = 1; i < sourcesRef.current.length; i++) {
          if (sourcesRef.current[i].bornAt < sourcesRef.current[oldestIndex].bornAt) {
            oldestIndex = i;
          }
        }
        sourcesRef.current.splice(oldestIndex, 1);
      }

      const source: RippleSource = {
        key,
        local,
        bornAt: now,
        pointerId: persistent ? key : null,
      };
      sourcesRef.current.push(source);
      return source;
    };

    const release = (pointerId: number) => {
      const index = sourcesRef.current.findIndex((src) => src.pointerId === pointerId);
      // Kept in the pool so the ripple decays rather than stopping dead.
      if (index >= 0) sourcesRef.current[index].pointerId = null;
    };

    let nextEventId = 0;
    /** Register a ripple at a world-space point. */
    const emit = (world: THREE.Vector3, strength: number) => {
      const ripple: RippleEvent = {
        id: nextEventId++,
        position: world.clone(),
        createdAt: sceneTime.current,
        strength,
      };
      pushRipple(ripple);
      onRipple?.(ripple);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!shouldStartRipple(event.target)) return;
      const surface = surfaceRef.current;
      if (!surface) return;

      const local = project(event.clientX, event.clientY);
      if (!local) return;

      if (!touch(event.pointerId, event.clientX, event.clientY, true)) return;

      s.localPoint.set(local.x, local.y, 0);
      emit(surface.localToWorld(s.localPoint.clone()), 1);
    };

    /**
     * Hover trail.
     *
     * A field that only reacts to clicks feels dead under a mouse. This is deliberately
     * faint and throttled: it gives the surface a sense of being alive under the cursor
     * without turning into a trail of ripples the visitor did not ask for. Touch input has
     * no hover phase, so this only runs for mouse and pen.
     */
    let lastTrailAt = 0;
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      if (!shouldStartRipple(event.target)) return;
      const surface = surfaceRef.current;
      if (!surface) return;

      const now = performance.now();
      if (now - lastTrailAt < 110) return;
      lastTrailAt = now;

      const local = project(event.clientX, event.clientY);
      if (!local) return;

      if (!touch(TRAIL_SOURCE_KEY, event.clientX, event.clientY, false)) return;

      s.localPoint.set(local.x, local.y, 0);
      emit(surface.localToWorld(s.localPoint.clone()), 0.35);
    };

    const onPointerUp = (event: PointerEvent) => release(event.pointerId);
    const onPointerCancel = (event: PointerEvent) => release(event.pointerId);

    /*
     * Ambient sources. Without them the field goes completely still if the visitor never
     * touches it, which reads as broken rather than as calm. Deliberately autonomous and
     * slow, and suppressed in calm mode.
     */
    let ambientTimer: ReturnType<typeof setInterval> | undefined;
    if (allowAmbient) {
      ambientTimer = setInterval(() => {
        const surface = surfaceRef.current;
        if (!surface) return;
        const now = sceneTime.current;

        // Retire sources whose fade has elapsed.
        sourcesRef.current = sourcesRef.current.filter(
          (src) => src.pointerId !== null || now - src.bornAt < SOURCE_FADE_SECONDS
        );

        const angle = Math.random() * Math.PI * 2;
        const radius = 2 + Math.random() * 9;
        const local = new THREE.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius);

        if (sourcesRef.current.length >= MAX_RIPPLE_SOURCES) sourcesRef.current.shift();
        const source: RippleSource = {
          key: -1000 - Math.floor(now * 1000),
          local,
          bornAt: now,
          pointerId: null,
        };
        sourcesRef.current.push(source);

        s.localPoint.set(local.x, local.y, 0);
        emit(surface.localToWorld(s.localPoint.clone()), 0.5);
      }, 5200);
    }

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerCancel, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      if (ambientTimer) clearInterval(ambientTimer);
      sourcesRef.current = [];
      setRipples([]);
    };
  }, [enabled, allowAmbient, domElement, camera, surfaceRef, pushRipple, onRipple]);

  return { sourcesRef, ripples, removeRipple, setSceneTime };
}
