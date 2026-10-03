/**
 * @file: src/components/theme/effects/cyberpunk/CitySilhouette.tsx
 * @description: WebGL alley, procedural lightning and data rain for the Cyberpunk theme.
 * Identity: "Rain-Soaked Night Market Alley".
 *
 * The CSS atmosphere strata live in Atmosphere.tsx. This file owns only what has to sit
 * between that backdrop and the viewer: the 3D street, the lightning layer, and two rain
 * layers at different depths.
 */

"use client";

"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useDataRain } from "@/hooks/useDataRain";
import {
  type AlleyBuilding,
  ALLEY_CAMERA_Z,
  ALLEY_EYE_Y,
  ALLEY_HALF_WIDTH,
  ALLEY_LOOK_DISTANCE,
  ALLEY_STREET_Y,
  ALLEY_TRAVEL_RANGE,
  alleyZ,
  buildAlley,
  depthFromCamera,
  NEON_COLORS,
  neonPulseAt,
} from "@/components/theme/effects/cyberpunk/alley";
import { CyberpunkPostFX } from "@/components/theme/effects/cyberpunk/CyberpunkPostFX";
import {
  resetGridPower,
  subscribeGridPower,
  triggerPowerDip,
} from "@/components/theme/effects/cyberpunk/gridPower";
import {
  getRadialGlowTexture,
  getSignTexture,
  isCjkText,
  supportsCjkRendering,
} from "@/components/theme/effects/cyberpunk/signage";

/** Neon sign panel size, in world units, before aspect correction for CJK. */
const SIGN_HEIGHT = 1.5;

/** How far down the street a sign's reflection stretches. */
const REFLECTION_LENGTH = 7;

/** Lamp posts along the alley, in addition to the signage. */
const LAMP_SPACING = 18;
const LAMP_COUNT = 6;

/** The baked light pools laid along the street, cycling colours down the corridor. */
/** Authored light intensities. The frame loop scales these by the grid power level. */
const HEMI_INTENSITY = 1.1;
const FILL_CYAN_INTENSITY = 30;
const FILL_MAGENTA_INTENSITY = 26;
const DEPTH_INTENSITY = 70;

const LIGHT_POOLS = [
  { id: "pool-0", tint: "#00e5ff", z: -10 },
  { id: "pool-1", tint: "#ff3ce0", z: -25 },
  { id: "pool-2", tint: "#8844ff", z: -40 },
  { id: "pool-3", tint: "#00e5ff", z: -55 },
  { id: "pool-4", tint: "#ff9600", z: -70 },
  { id: "pool-5", tint: "#8844ff", z: -85 },
] as const;

type NeonEntry = {
  /** The sign panel, which is unlit and driven by the shared pulse. */
  panel: THREE.MeshBasicMaterial;
  /** The matching wet-street reflection. */
  reflection: THREE.MeshBasicMaterial;
  /** Authored intensity for this sign, so the pulse does not compound. */
  base: number;
};

/**
 * A single building: dark facade, lit windows, clutter, an emissive neon sign and its
 * reflection in the wet street below.
 *
 * Note there is no `pointLight` here. The previous version mounted two per neon building
 * across twelve buildings -- twenty-two real lights on `MeshStandardMaterial` geometry,
 * which multiplies the per-fragment lighting cost for every pixel. Signage is emissive
 * geometry instead, so it reads as light without costing any, and a small fixed rig in
 * AlleyScene does the actual illumination.
 */
function CyberpunkBuilding({
  building,
  registerNeon,
}: {
  building: AlleyBuilding;
  registerNeon: (entry: NeonEntry | null, key: string) => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const facadeX = building.side === "left" ? building.width / 2 : -building.width / 2;
  const neon = NEON_COLORS[building.neonHue];
  const vertical = isCjkText(building.signText);
  const signWidth = vertical ? SIGN_HEIGHT * 0.55 : SIGN_HEIGHT * 1.9;
  const signY = building.height * 0.42;
  const hasSign = building.hasNeon;

  const panelMaterial = useMemo(() => {
    if (!hasSign) return null;
    const material = new THREE.MeshBasicMaterial({
      map: getSignTexture(building.signText, neon.hex),
      transparent: true,
      depthWrite: false,
      // Signage is meant to clip: without this the tone mapper flattens it to grey.
      toneMapped: false,
    });
    return material;
  }, [hasSign, building.signText, neon.hex]);

  const reflectionMaterial = useMemo(() => {
    if (!hasSign) return null;
    const material = new THREE.MeshBasicMaterial({
      map: panelMaterial?.map ?? null,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return material;
  }, [hasSign, panelMaterial]);

  // Report the materials once so a single frame loop can pulse every sign together.
  useEffect(() => {
    if (!panelMaterial || !reflectionMaterial) return;
    const key = building.id;
    registerNeon(
      { panel: panelMaterial, reflection: reflectionMaterial, base: building.neonIntensity },
      key
    );
    return () => registerNeon(null, key);
  }, [registerNeon, panelMaterial, reflectionMaterial, building.id, building.neonIntensity]);

  // Dispose materials and their textures when the building unmounts.
  useEffect(() => {
    return () => {
      panelMaterial?.map?.dispose();
      panelMaterial?.dispose();
      reflectionMaterial?.dispose();
    };
  }, [panelMaterial, reflectionMaterial]);

  return (
    <group
      ref={meshRef}
      position={[building.x, ALLEY_STREET_Y, building.baseZ]}
    >
      <mesh>
        <boxGeometry args={[building.width, building.height, building.depth]} />
        <meshStandardMaterial
          color="#0b0b12"
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>

      {/* Windows. Lit ones carry a warm interior glow; dark ones read as depth. */}
      {building.windows.map((window, i) => (
        <mesh
          key={window.id}
          position={[facadeX * 1.01, ALLEY_STREET_Y + building.height * 0.12 + i * 2.4, 0]}
          rotation={[0, building.side === "left" ? Math.PI / 2 : -Math.PI / 2, 0]}
        >
          <planeGeometry args={[building.width * 0.34, 1.1]} />
          <meshStandardMaterial
            color={window.isLit ? "#3a2f1a" : "#101018"}
            emissive={window.isLit ? "#ffb765" : "#000000"}
            emissiveIntensity={window.isLit ? 0.7 : 0}
            toneMapped={false}
          />
        </mesh>
      ))}

      {hasSign && panelMaterial && reflectionMaterial && (
        <>
          {/*
            Blade sign: mounted perpendicular to the facade and projecting into the alley.
            A sign laid flat on a side wall is viewed almost edge-on from down the street,
            which is why the previous wall-mounted rectangles showed no readable text at
            all -- `signText` was generated, drawn as a featureless quad, and never
            legible. Facing the sign down the alley is what makes the copy readable.
          */}
          <mesh
            position={[facadeX * 0.72, ALLEY_STREET_Y + signY, 0.2]}
            rotation={[0, 0, 0]}
          >
            <planeGeometry args={[signWidth, SIGN_HEIGHT]} />
            <primitive
              object={panelMaterial}
              attach="material"
            />
          </mesh>

          {/* Backing box, so the sign reads as a physical object on the wall. */}
          <mesh position={[facadeX * 0.75, ALLEY_STREET_Y + signY, 0]}>
            <boxGeometry args={[signWidth * 1.08, SIGN_HEIGHT * 1.18, 0.16]} />
            <meshStandardMaterial
              color="#141420"
              roughness={0.7}
              metalness={0.4}
            />
          </mesh>

          {/* Mounting arm back to the facade. */}
          <mesh
            position={[facadeX * 0.88, ALLEY_STREET_Y + signY, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.04, 0.04, signWidth * 0.35, 6]} />
            <meshStandardMaterial
              color="#1c1c28"
              roughness={0.8}
            />
          </mesh>

          {/*
            Reflection in the wet street. Additively blended and stretched away from the
            viewer along the road. A real mirrored render pass would cost a second scene
            render; this is the standard cheap approximation, and it is what makes the
            asphalt read as soaked.
          */}
          <mesh
            position={[facadeX * 0.72, ALLEY_STREET_Y + 0.02, REFLECTION_LENGTH * 0.42]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[signWidth * 1.3, REFLECTION_LENGTH]} />
            <primitive
              object={reflectionMaterial}
              attach="material"
            />
          </mesh>
        </>
      )}

      {/* Awning / air-con unit. */}
      {building.hasAC && (
        <mesh position={[facadeX * 0.72, ALLEY_STREET_Y + building.height * 0.34, 0]}>
          <boxGeometry args={[0.5, 0.45, 0.4]} />
          <meshStandardMaterial
            color="#4a4f5a"
            metalness={0.6}
            roughness={0.45}
          />
        </mesh>
      )}

      {/* Overhead cabling, which is what makes an alley read as an alley. */}
      {building.hasCables && (
        <>
          <mesh
            position={[0, ALLEY_STREET_Y + building.height * 0.82, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.025, 0.025, building.width * 1.3, 6]} />
            <meshStandardMaterial
              color="#14141c"
              roughness={0.9}
            />
          </mesh>
          <mesh
            position={[0, ALLEY_STREET_Y + building.height * 0.78, 0.2]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.018, 0.018, building.width * 1.1, 6]} />
            <meshStandardMaterial
              color="#1c1c26"
              roughness={0.9}
            />
          </mesh>
        </>
      )}

      {/* Drainpipe running down the facade. */}
      {building.hasPipe && (
        <mesh
          position={[facadeX * 0.9, ALLEY_STREET_Y + building.height / 2, building.depth * 0.3]}
        >
          <cylinderGeometry args={[0.09, 0.09, building.height, 8]} />
          <meshStandardMaterial
            color="#33333f"
            metalness={0.5}
            roughness={0.5}
          />
        </mesh>
      )}
    </group>
  );
}

function AlleyScene() {
  const groupRef = useRef<THREE.Group>(null);
  const buildingRefs = useRef<THREE.Group[]>([]);
  const neonRegistry = useRef<Map<string, NeonEntry>>(new Map());
  const scrollProgressRef = useRef(0);
  const scrollZRef = useRef(0);

  const supportsCjk = useMemo(() => supportsCjkRendering(), []);
  const glowTexture = useMemo(() => getRadialGlowTexture(), []);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);
  const magentaRef = useRef<THREE.PointLight>(null);
  const depthRef = useRef<THREE.PointLight>(null);
  const gridPower = useMemo(() => ({ current: 1 }), []);

  // A lightning strike browns out the whole street, not just the bolt.
  useEffect(
    () =>
      subscribeGridPower((level) => {
        gridPower.current = level;
      }),
    [gridPower]
  );
  const buildings = useMemo(() => buildAlley("cyberpunk:alley:v2", supportsCjk), [supportsCjk]);

  // Single-frame registry, keyed by building id so remounts cannot leak duplicates.
  const registerNeon = useMemo(
    () => (entry: NeonEntry | null, key: string) => {
      if (entry) neonRegistry.current.set(key, entry);
      else neonRegistry.current.delete(key);
    },
    []
  );

  // Lamp positions are static, so derive them once.
  const lamps = useMemo(
    () =>
      Array.from({ length: LAMP_COUNT }, (_, i) => ({
        id: `lamp-${i}`,
        z: -(i * LAMP_SPACING + 12),
        side: i % 2 === 0 ? "left" : "right",
      })),
    []
  );
  const lampRefs = useRef<THREE.Group[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const update = () => {
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      scrollProgressRef.current = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };

    update();

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  useFrame((state, delta) => {
    // Scroll drives distance travelled along the street; the buildings travel toward the
    // viewer and wrap, so the alley stays populated however far the page is scrolled.
    const targetZ = -scrollProgressRef.current * ALLEY_TRAVEL_RANGE;
    const eased = THREE.MathUtils.damp(scrollZRef.current, targetZ, 4, delta);
    scrollZRef.current = eased;

    const camera = state.camera;
    camera.position.set(0, ALLEY_EYE_Y, ALLEY_CAMERA_Z);
    // Kept close to level: aiming up pushed the horizon down and filled the lower half
    // of the frame with empty road.
    camera.lookAt(0, ALLEY_EYE_Y + 0.4, ALLEY_CAMERA_Z - ALLEY_LOOK_DISTANCE);

    const pulse = neonPulseAt(state.clock.elapsedTime);

    for (const building of buildings) {
      const group = buildingRefs.current[building.index * 2 + (building.side === "left" ? 0 : 1)];
      if (!group) continue;
      const z = alleyZ(building.baseZ, scrollZRef.current);
      group.position.z = z;

      // Hide anything that has walked past the camera rather than letting it fill the
      // near plane and smear across the frame.
      group.visible = depthFromCamera(z) > 0.5;
    }

    const power = gridPower.current;
    for (const entry of neonRegistry.current.values()) {
      entry.panel.opacity = pulse * power;
      entry.reflection.opacity = 0.3 * pulse * power;
    }
    // Authored intensities, so a dip multiplies rather than accumulates each frame.
    if (hemiRef.current) hemiRef.current.intensity = HEMI_INTENSITY * power;
    if (fillRef.current) fillRef.current.intensity = FILL_CYAN_INTENSITY * power;
    if (magentaRef.current) magentaRef.current.intensity = FILL_MAGENTA_INTENSITY * power;
    if (depthRef.current) depthRef.current.intensity = DEPTH_INTENSITY * power;

    // Lamp pools follow the loop so the near street is always lit.
    for (const lamp of lamps) {
      const group = lampRefs.current[Number(lamp.id.split("-")[1])];
      if (!group) continue;
      const z = alleyZ(lamp.z, scrollZRef.current);
      group.position.z = z;
      group.position.x = (lamp.side === "left" ? -1 : 1) * (ALLEY_HALF_WIDTH + 0.4);
    }
  });

  return (
    <group ref={groupRef}>
      {/*
        The street. One plane, correctly aligned with the building bases. The previous
        ground was a 150x250 plane at y=-10/-27 that shared no plane with the buildings
        standing on it, which is why the alley appeared to plunge.

        Kept mostly dielectric: a metallic surface with no environment map renders black,
        so `metalness` is low and the wet look is carried by the light pools below plus
        the specular response of the rig.
      */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, ALLEY_STREET_Y, -ALLEY_TRAVEL_RANGE / 2 - 10]}
      >
        <planeGeometry args={[90, 260]} />
        <meshStandardMaterial
          color="#0d0d16"
          roughness={0.28}
          metalness={0.12}
        />
      </mesh>

      {/*
        Light pools on the asphalt. A handful of real lights cannot convincingly light a
        100-unit street, and the previous per-building rig left the ground as a black void
        occupying the lower half of the frame. These are unlit additive planes laid along
        the corridor, which cost nothing and give the road its wet sheen.
      */}
      {LIGHT_POOLS.map((pool) => (
        <mesh
          key={pool.id}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, ALLEY_STREET_Y + 0.015, pool.z]}
        >
          <planeGeometry args={[15, 34]} />
          <meshBasicMaterial
            map={glowTexture}
            color={pool.tint}
            transparent
            opacity={0.3}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Buildings, indexed positionally to match the frame loop's lookup. */}
      {buildings.map((building) => (
        <group
          key={building.id}
          ref={(el) => {
            if (el) {
              buildingRefs.current[building.index * 2 + (building.side === "left" ? 0 : 1)] = el;
            }
          }}
        >
          <CyberpunkBuilding
            building={building}
            registerNeon={registerNeon}
          />
        </group>
      ))}

      {/* Lamp posts: two-sided emissive tubes, no additional real lights. */}
      {lamps.map((lamp, i) => (
        <group
          key={lamp.id}
          ref={(el) => {
            if (el) lampRefs.current[i] = el;
          }}
        >
          <mesh position={[0, 3.2, 0]}>
            <cylinderGeometry args={[0.07, 0.09, 6.4, 6]} />
            <meshStandardMaterial
              color="#1a1a24"
              roughness={0.8}
            />
          </mesh>
          <mesh position={[(lamp.side === "left" ? 1 : -1) * 0.7, 6.2, 0]}>
            <sphereGeometry args={[0.28, 10, 8]} />
            <meshBasicMaterial
              color="#ffe9b0"
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/*
        Lighting rig: four lights total, down from twenty-seven. A hemisphere light gives
        cheap sky/ground separation, and three tinted point lights ride the corridor so
        near facades are lit without paying for a light per building.
      */}
      <hemisphereLight args={["#4a4a8a", "#141428", 1.1]} />
      <ambientLight
        intensity={0.16}
        color="#1a1a2e"
      />
      <pointLight
        position={[-3.2, 3.2, ALLEY_CAMERA_Z - 5]}
        color="#00e5ff"
        intensity={30}
        distance={30}
        decay={1.6}
      />
      <pointLight
        position={[3.2, 3.2, ALLEY_CAMERA_Z - 13]}
        color="#ff3ce0"
        intensity={26}
        distance={30}
        decay={1.6}
      />
      <pointLight
        position={[0, 8, ALLEY_CAMERA_Z - 36]}
        color="#8844ff"
        intensity={70}
        distance={90}
        decay={1.8}
      />

      {/*
        Fog matches the void colour the CSS sky resolves to, so the far end of the alley
        dissolves into the atmosphere layers instead of terminating on a hard edge.
      */}
      <fog
        attach="fog"
        args={["#0a0813", 14, 96]}
      />

      {/*
        Last in the tree so it grades everything above it. Bloom is what turns emissive
        colour into actual light.
      */}
      <CyberpunkPostFX />
    </group>
  );
}

export function CitySilhouette() {
  const canvasRefBehind = useRef<HTMLCanvasElement>(null); // 80% streams behind skyline
  const canvasRefFront = useRef<HTMLCanvasElement>(null); // 20% streams in front
  const lightningCanvasRef = useRef<HTMLCanvasElement>(null); // procedural bolt layer (behind skyline)
  useDataRain(canvasRefBehind, { profile: "drizzle" });
  useDataRain(canvasRefFront, { profile: "heavy" });

  // Procedural lightning bolts (cyan & yellow) drawn on dedicated canvas behind skyline
  useEffect(() => {
    const canvas = lightningCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let mounted = true;
    let width = 0;
    let height = 0;

    const getDpr = () => Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const dpr = getDpr();
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);
    };
    resize();

    window.addEventListener("resize", resize);

    interface BoltSegment {
      x: number;
      y: number;
    }
    interface Bolt {
      path: BoltSegment[];
      created: number;
      life: number;
      color: "cyan" | "yellow";
    }
    const bolts: Bolt[] = [];

    let rafId = 0;
    let flashTimeout: ReturnType<typeof setTimeout> | undefined;
    let secondaryTimeout: ReturnType<typeof setTimeout> | undefined;
    let paused = document.visibilityState === "hidden";

    const createBolt = () => {
      const startX = (0.1 + Math.random() * 0.8) * width;
      const startY = (0.02 + Math.random() * 0.12) * height; // top sky band
      const segments: BoltSegment[] = [{ x: startX, y: startY }];
      const mainLength = height * (0.35 + Math.random() * 0.25); // how deep
      let currentX = startX;
      let currentY = startY;
      while (currentY < startY + mainLength) {
        const stepY = 6 + Math.random() * 28;
        const deviation = (Math.random() - 0.5) * 40;
        currentX += deviation;
        currentY += stepY;
        segments.push({ x: currentX, y: currentY });
        // occasional small branch
        if (Math.random() < 0.18) {
          createBranch(currentX, currentY, stepY * (0.4 + Math.random() * 0.4));
        }
        if (currentX < 0 || currentX > width) break;
      }
      bolts.push({
        path: segments,
        created: performance.now(),
        life: 260 + Math.random() * 120,
        color: Math.random() > 0.5 ? "cyan" : "yellow",
      });
    };

    const createBranch = (xStart: number, yStart: number, length: number) => {
      const branch: BoltSegment[] = [{ x: xStart, y: yStart }];
      let x = xStart;
      let y = yStart;
      let traveled = 0;
      while (traveled < length) {
        const stepY = 4 + Math.random() * 14;
        const deviation = (Math.random() - 0.5) * 60;
        x += deviation;
        y += stepY;
        traveled += stepY;
        branch.push({ x, y });
        if (x < 0 || x > width) break;
      }
      bolts.push({
        path: branch,
        created: performance.now(),
        life: 180 + Math.random() * 120,
        color: Math.random() > 0.4 ? "cyan" : "yellow",
      });
    };

    const scheduleNextFlash = () => {
      if (!mounted || paused) return;
      if (flashTimeout) clearTimeout(flashTimeout);
      const delay = 1200 + Math.random() * 3000;
      flashTimeout = setTimeout(() => {
        if (!mounted || paused) return;
        createBolt();
        // The strike takes the street's power with it.
        triggerPowerDip(0.24 + Math.random() * 0.16);
        if (Math.random() < 0.3) {
          secondaryTimeout = setTimeout(createBolt, 80 + Math.random() * 120);
        }
        startRaf();
        scheduleNextFlash();
      }, delay);
    };

    const draw = (now: number) => {
      if (!bolts.length) {
        stopRaf();
        return;
      }

      ctx.clearRect(0, 0, width, height);
      for (let i = bolts.length - 1; i >= 0; i--) {
        const bolt = bolts[i];
        const age = now - bolt.created;
        if (age > bolt.life) {
          bolts.splice(i, 1);
          continue;
        }
        const fade = 1 - age / bolt.life;
        const intensity = fade ** 0.7;
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        const baseColor = bolt.color === "cyan" ? [0, 255, 255] : [255, 255, 120];
        ctx.lineCap = "round";
        for (let layer = 0; layer < 3; layer++) {
          ctx.beginPath();
          const w = (3 - layer) * 1.2;
          ctx.lineWidth = w * intensity;
          const alpha = (0.25 + (2 - layer) * 0.35) * intensity;
          ctx.strokeStyle = `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},${alpha})`;
          for (let p = 0; p < bolt.path.length; p++) {
            const seg = bolt.path[p];
            if (p === 0) ctx.moveTo(seg.x, seg.y);
            else ctx.lineTo(seg.x, seg.y);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
    };

    const startRaf = () => {
      if (!mounted || paused) return;
      if (rafId) return;
      const tick = () => {
        if (!mounted || paused) return;
        const now = performance.now();
        draw(now);
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    const stopRaf = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      ctx.clearRect(0, 0, width, height);
    };

    const onVisibilityChange = () => {
      paused = document.visibilityState === "hidden";
      if (paused) {
        stopRaf();
      } else {
        resize();
        if (bolts.length) startRaf();
        scheduleNextFlash();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    scheduleNextFlash();

    return () => {
      mounted = false;
      resetGridPower();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopRaf();
      if (flashTimeout) clearTimeout(flashTimeout);
      if (secondaryTimeout) clearTimeout(secondaryTimeout);
    };
  }, []);
  return (
    <div className="absolute inset-0">
      {/*
        The sky, haze, distant skyline and colour grade now live in Atmosphere.tsx,
        which CyberpunkScene renders as a separate layer beneath this one. What remains
        here is only what has to sit *between* that backdrop and the viewer.
      */}

      {/* Procedural lightning, behind the alley but in front of the far skyline.
          `h-full w-full` is load-bearing: a <canvas> is a replaced element, so with only
          `inset-0` the used width comes from its intrinsic (attribute) size and the
          over-constrained `right` is dropped. Sizing it explicitly breaks the loop where
          resize() reads clientWidth and writes back the same 300x150 default. */}
      <canvas
        ref={lightningCanvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{
          zIndex: 1,
          mixBlendMode: "screen",
          filter: "brightness(1.25)",
        }}
      />

      {/* Rear rain: distant, thinner and slower, so the alley reads as deep. */}
      <canvas
        ref={canvasRefBehind}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{
          zIndex: 2,
          mixBlendMode: "screen",
          opacity: "calc(var(--cp-rain-opacity) * 0.55)",
        }}
      />

      <Canvas
        camera={{ position: [0, 1.6, -2], fov: 75 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        frameloop="always"
        style={{ background: "transparent", zIndex: 6 }}
      >
        <AlleyScene />
      </Canvas>

      {/* Front rain: the full, dense layer the viewer is looking through. */}
      <canvas
        ref={canvasRefFront}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{
          mixBlendMode: "screen",
          zIndex: 12,
          opacity: "var(--cp-rain-opacity)",
        }}
      />
    </div>
  );
}
