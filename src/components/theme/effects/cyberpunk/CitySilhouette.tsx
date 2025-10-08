"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useDataRain } from "@/hooks/useDataRain";
import { useScroll } from "@/hooks/useScroll";

const NEON_COLORS = {
  cyan: { color: "#00ffff", emissive: "#00ffff", intensity: 2 },
  fuchsia: { color: "#ff00ff", emissive: "#ff00ff", intensity: 2 },
  red: { color: "#ff1e3c", emissive: "#ff1e3c", intensity: 2.5 },
  hotpink: { color: "#ff1493", emissive: "#ff1493", intensity: 2.5 },
  lime: { color: "#96ff00", emissive: "#96ff00", intensity: 2 },
  orange: { color: "#ff9600", emissive: "#ff9600", intensity: 2 },
  electricblue: { color: "#7df9ff", emissive: "#7df9ff", intensity: 2.5 },
};

interface BuildingData {
  buildingType: string;
  hasNeon: boolean;
  neonColor: string;
  signText: string;
  hasWindow: boolean;
  hasAC: boolean;
  hasCables: boolean;
  width: number;
  depth: number;
  windowLights: boolean[];
}

function CyberpunkBuilding({
  position,
  height,
  side,
  buildingData,
  width,
  depth,
  registerNeon,
}: {
  position: [number, number, number];
  height: number;
  side: "left" | "right";
  buildingData: BuildingData;
  width: number;
  depth: number;
  registerNeon: (mat: THREE.MeshStandardMaterial | null) => void;
}) {
  const neonColor =
    NEON_COLORS[buildingData.neonColor as keyof typeof NEON_COLORS] || NEON_COLORS.cyan;
  const buildingWidth = width;
  const buildingDepth = depth;
  return (
    <group position={position}>
      <mesh
        castShadow
        receiveShadow
      >
        <boxGeometry args={[buildingWidth, height, buildingDepth]} />
        <meshStandardMaterial
          color="#0a0a0f"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      {buildingData.hasNeon && (
        <>
          <mesh
            position={[
              side === "left" ? buildingWidth / 2 + 0.02 : -buildingWidth / 2 - 0.02,
              height * 0.3,
              0,
            ]}
            ref={(m) => registerNeon(m ? (m.material as THREE.MeshStandardMaterial) : null)}
          >
            <planeGeometry args={[buildingWidth * 0.85, height * 0.18]} />
            <meshStandardMaterial
              color={neonColor.color}
              emissive={neonColor.emissive}
              emissiveIntensity={neonColor.intensity}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </mesh>
          <mesh
            position={[side === "left" ? buildingWidth / 2 : -buildingWidth / 2, height * 0.3, 0]}
          >
            <boxGeometry args={[0.05, height * 0.2, buildingWidth * 0.9]} />
            <meshStandardMaterial
              color="#1a1a1a"
              roughness={0.8}
              metalness={0.3}
            />
          </mesh>
        </>
      )}
      {buildingData.hasNeon && (
        <>
          <pointLight
            position={[
              side === "left" ? buildingWidth / 2 + 0.3 : -buildingWidth / 2 - 0.3,
              height * 0.3,
              0,
            ]}
            color={neonColor.color}
            intensity={4}
            distance={10}
            decay={2}
          />
          <pointLight
            position={[
              side === "left" ? buildingWidth / 2 + 0.15 : -buildingWidth / 2 - 0.15,
              height * 0.3,
              0.5,
            ]}
            color={neonColor.color}
            intensity={2}
            distance={6}
            decay={2}
          />
        </>
      )}
      {buildingData.hasWindow &&
        buildingData.windowLights.map((isLit, i) => (
          <mesh
            key={`window-${i}-${position[0]}-${position[2]}`}
            position={[0, -height / 2 + i * 2 + 1, buildingDepth / 2 + 0.01]}
          >
            <planeGeometry args={[buildingWidth * 0.3, 0.8]} />
            <meshStandardMaterial
              color={isLit ? "#ffcc66" : "#334455"}
              emissive={isLit ? "#ffcc66" : "#000000"}
              emissiveIntensity={isLit ? 0.5 : 0}
            />
          </mesh>
        ))}
      {buildingData.hasAC && (
        <>
          <mesh position={[buildingWidth / 2 - 0.3, height * 0.4, buildingDepth / 2]}>
            <boxGeometry args={[0.4, 0.3, 0.25]} />
            <meshStandardMaterial
              color="#505560"
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>
          <mesh position={[buildingWidth / 2 - 0.3, height * 0.4, buildingDepth / 2 + 0.13]}>
            <cylinderGeometry args={[0.12, 0.12, 0.02, 8]} />
            <meshStandardMaterial
              color="#2a2a2a"
              metalness={0.5}
              roughness={0.5}
            />
          </mesh>
        </>
      )}
      {buildingData.hasCables && (
        <>
          <mesh
            position={[0, height / 2, 0]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.02, 0.02, buildingWidth * 1.5, 8]} />
            <meshStandardMaterial
              color="#1a1a1a"
              roughness={0.8}
            />
          </mesh>
          <mesh
            position={[0, height / 2 - 0.8, 0.1]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <cylinderGeometry args={[0.015, 0.015, buildingWidth * 1.3, 6]} />
            <meshStandardMaterial
              color="#2a2a2a"
              roughness={0.8}
            />
          </mesh>
        </>
      )}
      {Math.random() > 0.6 && (
        <mesh position={[-buildingWidth / 2 + 0.2, 0, buildingDepth / 2]}>
          <cylinderGeometry args={[0.08, 0.08, height, 8]} />
          <meshStandardMaterial
            color="#3a3a3a"
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>
      )}
    </group>
  );
}

function AlleyScene() {
  const scrollY = useScroll();
  const groupRef = useRef<THREE.Group>(null);
  // Keep direct refs to building groups to avoid scanning all children each frame
  const buildingRefs = useRef<THREE.Group[]>([]);
  // Collected neon materials for centralized pulsing
  const neonMaterialsRef = useRef<THREE.MeshStandardMaterial[]>([]);

  // Shared alley layout constants
  const BUILDING_PAIRS = 12;
  const zSpacing = -2.2; // decreased spacing for denser progression (was -3.2)
  const zStart = -0.8; // start almost at camera plane for immediacy
  const nearLeftX = -1.4; // narrower near gap
  const nearRightX = 1.4;
  const farLeftX = -40;
  const farRightX = 40;

  // Generate static building data once with increased heights and consistent per row
  const buildingData = useMemo(() => {
    // Generate array of random heights for buildings (left and right will share same heights for consistency)
    // Prior height ranges progressively reduced to make buildings non-imposing.
    // Further reduction: (1.05–2.10) * 1.2 => ~1.26 – 2.52 units total height.
    // Keeps bases consistent while lowering crowns for stronger backdrop emphasis.
    const heights = Array.from({ length: 12 }, () => (1.05 + Math.random() * 1.05) * 1.2);

    // Alley runs toward the backdrop (negative Z). Camera stands near z = 0 looking down -Z.
    // We place buildings in pairs along -Z; near pair close to viewer, far pair close to backdrop.
    // (Constants hoisted above for reuse in animation loop)

    const left = Array.from({ length: BUILDING_PAIRS }, (_, i) => {
      const height = heights[i]; // Use shared heights
      const width = 1.0 + Math.random() * 0.6; // slimmer
      const depth = 0.8 + Math.random() * 0.4; // shallower
      const windowCount = Math.floor(height / 2);
      const windowLights = Array.from({ length: windowCount }, () => Math.random() > 0.5);

      const zPos = zStart + i * zSpacing; // extends negatively
      const divergenceFactor = i / (BUILDING_PAIRS - 1); // 0 near, 1 far
      const xPos = nearLeftX + (farLeftX - nearLeftX) * divergenceFactor; // interpolate outward

      const divergence = i / (BUILDING_PAIRS - 1);
      return {
        id: `left-${i}`,
        height,
        xPos,
        zPos,
        index: i,
        side: "left" as const,
        divergence,
        data: {
          buildingType: ["ramen", "tech", "clinic", "bar"][Math.floor(Math.random() * 4)],
          hasNeon: Math.random() > 0.15,
          neonColor: ["cyan", "fuchsia", "red", "hotpink", "lime", "orange", "electricblue"][
            Math.floor(Math.random() * 7)
          ],
          signText: ["ラーメン", "営業中", "酒場", "診療所", "OPEN", "BAR"][
            Math.floor(Math.random() * 6)
          ],
          hasWindow: Math.random() > 0.3,
          hasAC: Math.random() > 0.5,
          hasCables: Math.random() > 0.4,
          width,
          depth,
          windowLights,
        },
      };
    });

    const right = Array.from({ length: BUILDING_PAIRS }, (_, i) => {
      const height = heights[i]; // Use same height as corresponding left building
      const width = 1.0 + Math.random() * 0.6;
      const depth = 0.8 + Math.random() * 0.4;
      const windowCount = Math.floor(height / 2);
      const windowLights = Array.from({ length: windowCount }, () => Math.random() > 0.5);

      const zPos = zStart + i * zSpacing; // extends negatively
      const divergenceFactor = i / (BUILDING_PAIRS - 1); // 0 near, 1 far
      const xPos = nearRightX + (farRightX - nearRightX) * divergenceFactor; // interpolate outward

      const divergence = i / (BUILDING_PAIRS - 1);
      return {
        id: `right-${i}`,
        height,
        xPos,
        zPos,
        index: i,
        side: "right" as const,
        divergence,
        data: {
          buildingType: ["ramen", "tech", "clinic", "bar"][Math.floor(Math.random() * 4)],
          hasNeon: Math.random() > 0.15,
          neonColor: ["cyan", "fuchsia", "red", "hotpink", "lime", "orange", "electricblue"][
            Math.floor(Math.random() * 7)
          ],
          signText: ["ラーメン", "営業中", "酒場", "診療所", "OPEN", "BAR"][
            Math.floor(Math.random() * 6)
          ],
          hasWindow: Math.random() > 0.3,
          hasAC: Math.random() > 0.5,
          hasCables: Math.random() > 0.4,
          width,
          depth,
          windowLights,
        },
      };
    });

    return [...left, ...right];
  }, []);

  // Precompute alley depth for dynamic distance-based effects
  const alleyDepth = Math.abs(zSpacing) * (BUILDING_PAIRS - 1); // total span of one alley cycle

  useFrame((state) => {
    const { camera, viewport } = state;
    const scrollValue = typeof scrollY === "number" ? scrollY : 0;
    // Camera looks toward negative Z; move deeper (more negative) as user scrolls
    const targetZ = -scrollValue * 0.08; // starts near 0, goes to -N

    // Smooth camera movement - walking forward
    camera.position.z += (targetZ - camera.position.z) * 0.1;
    // Lowered further to near ground so first building pair surrounds the viewer
    camera.position.y = -1.0;
    camera.position.x = 0;
    camera.lookAt(0, -1.0, -50); // keep gaze level aligned with new eye height

    // Update building positions for "walking through" effect with cycling
    const refs = buildingRefs.current;
    if (refs.length) {
      const cycleDistance = Math.abs(zSpacing) * BUILDING_PAIRS; // full alley depth for recycling
      const persp = camera as THREE.PerspectiveCamera;
      const halfVFOV = THREE.MathUtils.degToRad(persp.fov / 2);
      const halfHFOVFactor = Math.tan(halfVFOV) * viewport.aspect;
      const invPairs = 1 / (BUILDING_PAIRS - 1);
      const maxVisibleDistance = alleyDepth + 10;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.3 + 1; // shared neon pulse
      for (let i = 0; i < refs.length; i++) {
        const child = refs[i];
        if (!child) continue;
        const building = buildingData[i];
        if (!building) continue;
        const height = building.height;
        let baseZPos = building.zPos;
        const relativeZ = baseZPos - camera.position.z;
        if (relativeZ > 6) {
          baseZPos -= cycleDistance;
        } else if (relativeZ < -cycleDistance - 6) {
          baseZPos += cycleDistance;
        }
        // persist recycled position
        if (baseZPos !== building.zPos) building.zPos = baseZPos;
        child.position.z = baseZPos;

        const currentRelativeZ = baseZPos - camera.position.z;
        const distance = -currentRelativeZ;
        const distanceFactor = Math.max(0, Math.min(1, distance / maxVisibleDistance));

        const nearestBaseY = -2.0;
        const furthestBaseY = -34;
        const easedFactorY = distanceFactor ** 1.25;
        let baseYPos = nearestBaseY + (furthestBaseY - nearestBaseY) * easedFactorY;
        const pairFactor = building.index * invPairs;
        baseYPos -= pairFactor * 4;
        child.position.y = baseYPos + height / 2;

        const edgeX = distance * halfHFOVFactor * 1.05;
        const easedDiv = (building.divergence ?? building.index * invPairs) ** 0.65;
        if (building.side === "left") {
          child.position.x = THREE.MathUtils.lerp(nearLeftX, -edgeX, easedDiv);
        } else {
          child.position.x = THREE.MathUtils.lerp(nearRightX, edgeX, easedDiv);
        }

        const minLean = 0.06;
        const maxLean = 0.32;
        child.rotation.x = THREE.MathUtils.lerp(minLean, maxLean, distanceFactor);
      }
      // Update all neon emissive intensities once per frame
      neonMaterialsRef.current.forEach((mat) => {
        if (!mat) return;
        mat.emissiveIntensity = pulse * (mat.emissiveIntensity ? 1 : 1); // pulse baseline
      });
    }
  });

  return (
    <group ref={groupRef}>
      {/* Ground - wet reflective street sloping downward to meet backdrop base */}
      <mesh
        rotation={[-Math.PI / 2 - 0.3, 0, 0]}
        position={[0, -10, -27]}
        receiveShadow
      >
        <planeGeometry args={[150, 250]} />
        <meshStandardMaterial
          color="#0a0a0f"
          roughness={0.15}
          metalness={0.85}
          envMapIntensity={0.6}
          opacity={0.35}
          transparent
        />
      </mesh>

      {/* Ground fog planes for atmosphere */}
      <mesh
        rotation={[-Math.PI / 2 - 0.3, 0, 0]}
        position={[0, -12, -35]}
      >
        <planeGeometry args={[145, 105]} />
        <meshBasicMaterial
          color="#8800ff"
          transparent
          opacity={0.025}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2 - 0.3, 0, 0]}
        position={[0, -15, -52]}
      >
        <planeGeometry args={[96, 50]} />
        <meshBasicMaterial
          color="#00ffff"
          transparent
          opacity={0.018}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Side alley buildings - scroll-aware positioning */}
      {buildingData.map((building, i) => (
        <group
          key={building.id}
          ref={(el) => {
            if (el) buildingRefs.current[i] = el;
          }}
        >
          <CyberpunkBuilding
            position={[building.xPos, 0, building.zPos] as [number, number, number]}
            height={building.height}
            side={building.side}
            buildingData={building.data}
            width={building.data.width}
            depth={building.data.depth}
            registerNeon={(mat) => {
              if (mat) neonMaterialsRef.current.push(mat);
            }}
          />
        </group>
      ))}

      {/* Enhanced atmospheric lighting */}
      <ambientLight
        intensity={0.12}
        color="#1a1a2e"
      />

      {/* Purple atmospheric light from behind */}
      <pointLight
        position={[0, 8, -60]}
        color="#8800ff"
        intensity={4}
        distance={150}
        decay={2}
      />

      {/* Cyan street light from front */}
      <pointLight
        position={[0, 10, 15]}
        color="#00ffff"
        intensity={2.5}
        distance={120}
        decay={2}
      />

      {/* Side accent lights for alley ambiance */}
      <pointLight
        position={[-10, 5, -30]}
        color="#ff00ff"
        intensity={1.5}
        distance={40}
        decay={2}
      />
      <pointLight
        position={[10, 5, -30]}
        color="#00ff88"
        intensity={1.5}
        distance={40}
        decay={2}
      />

      {/* Atmospheric fog with better depth */}
      <fog
        attach="fog"
        args={["#0a0a0f", 10, 90]}
      />
    </group>
  );
}

export function CitySilhouette() {
  const canvasRefBehind = useRef<HTMLCanvasElement>(null); // 80% streams behind skyline
  const canvasRefFront = useRef<HTMLCanvasElement>(null); // 20% streams in front
  const lightningCanvasRef = useRef<HTMLCanvasElement>(null); // procedural bolt layer (behind skyline)
  useDataRain(canvasRefBehind);
  useDataRain(canvasRefFront);

  // Procedural lightning bolts (cyan & yellow) drawn on dedicated canvas behind skyline
  useEffect(() => {
    const canvas = lightningCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let mounted = true;
    let width = canvas.clientWidth * window.devicePixelRatio;
    let height = canvas.clientHeight * window.devicePixelRatio;
    canvas.width = width;
    canvas.height = height;

    const resize = () => {
      width = canvas.clientWidth * window.devicePixelRatio;
      height = canvas.clientHeight * window.devicePixelRatio;
      canvas.width = width;
      canvas.height = height;
    };
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

    const createBolt = () => {
      const startX = (0.1 + Math.random() * 0.8) * width;
      const startY = (0.02 + Math.random() * 0.12) * height; // top sky band
      const segments: BoltSegment[] = [{ x: startX, y: startY }];
      const mainLength = height * (0.35 + Math.random() * 0.25); // how deep
      let currentX = startX;
      let currentY = startY;
      while (currentY < startY + mainLength) {
        const stepY = (6 + Math.random() * 28) * window.devicePixelRatio;
        const deviation = (Math.random() - 0.5) * 40 * window.devicePixelRatio;
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
        const stepY = (4 + Math.random() * 14) * window.devicePixelRatio;
        const deviation = (Math.random() - 0.5) * 60 * window.devicePixelRatio;
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

    let lastFlash = 0;
    const loop = () => {
      if (!mounted) return;
      requestAnimationFrame(loop);
      const now = performance.now();
      // schedule new bolt if interval passed
      if (now - lastFlash > 1200 + Math.random() * 3000) {
        lastFlash = now;
        createBolt();
        if (Math.random() < 0.3) setTimeout(createBolt, 80 + Math.random() * 120);
      }
      if (!bolts.length) return; // idle skip (no clear needed)
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
          const w = (3 - layer) * 1.2 * window.devicePixelRatio;
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
    loop();
    return () => {
      mounted = false;
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Memoize static backdrop buildings - raised and more prominent
  const backdropBuildings = useMemo(() => {
    // Taller backdrop to increase vertical presence (55–110%)
    return Array.from({ length: 32 }, (_, i) => ({
      id: `skyline-${i}`,
      left: (i / 32) * 100,
      width: 2 + Math.random() * 3,
      height: 55 + Math.random() * 55, // 55–110 (previously 40–90)
      hasBeacon: Math.random() > 0.7,
    }));
  }, []);

  return (
    <div className="absolute inset-0">
      {/* BACKGROUND LAYERS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Multi-layer sky gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0510] via-[#0f0a15] to-[#050a10]" />
        <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 via-purple-900/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cyan-950/20" />

        {/* 80% DATA RAIN (behind skyline) - only upper 25% visible; majority hidden behind skyline */}
        <canvas
          ref={canvasRefBehind}
          className="absolute inset-0 pointer-events-none opacity-12"
          style={{
            mixBlendMode: "screen",
            // show only top quarter for subtle distant streaks
            clipPath: "inset(0 0 75% 0)",
            zIndex: 2,
          }}
        />

        {/* Procedural lightning canvas (behind skyline) */}
        <canvas
          ref={lightningCanvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 2,
            mixBlendMode: "screen",
            filter: "brightness(1.25)",
          }}
        />

        {/* Atmospheric glow behind skyline */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_30%,rgba(136,0,255,0.15)_0%,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(0,255,255,0.12)_0%,transparent_50%)]" />
        </div>

        {/* Static city skyline with enhanced depth - raised vertically and more prominent */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[85%] flex items-end opacity-80"
          style={{ zIndex: 3 }}
        >
          {backdropBuildings.map((building) => (
            <div
              key={building.id}
              className="absolute bottom-0 transition-opacity duration-300"
              style={{
                left: `${building.left}%`,
                width: `${building.width}%`,
                height: `${building.height}%`,
                background: "linear-gradient(to top, #0a0a12, #12121a, #1a1a22)",
                boxShadow: "inset -1px 0 3px rgba(0,0,0,0.9), 0 0 25px rgba(0,0,0,0.6)",
              }}
            >
              {building.hasBeacon && (
                <div
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-[2px] bg-red-500 rounded-full animate-[beacon-blink_2s_ease-in-out_infinite]"
                  style={{
                    boxShadow: "0 0 6px 2px rgba(255,0,0,0.6), 0 0 12px 4px rgba(255,0,0,0.3)",
                  }}
                />
              )}

              {/* Subtle window lights on backdrop buildings */}
              {Math.random() > 0.7 && (
                <div
                  className="absolute w-[40%] h-[60%] left-[30%] top-[20%] opacity-20"
                  style={{
                    background:
                      "repeating-linear-gradient(0deg, transparent 0px, transparent 8px, rgba(255,200,100,0.3) 8px, rgba(255,200,100,0.3) 10px)",
                  }}
                />
              )}
            </div>
          ))}

          {/* Enhanced ground atmospheric glow */}
          <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-t from-cyan-500/15 via-purple-500/8 to-transparent blur-md" />
          <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-gradient-to-t from-cyan-400/10 to-transparent blur-sm" />
        </div>

        {/* (Removed radial flash overlay; replaced by procedural bolt canvas) */}

        {/* Enhanced scan lines with variation */}
        <div className="absolute inset-0 opacity-[0.04] mix-blend-screen [background:repeating-linear-gradient(180deg,transparent_0_9px,rgba(0,255,255,0.2)_9px_10px,transparent_10px_22px)] animate-[rain-fall_1.4s_linear_infinite]" />
        <div className="absolute inset-0 opacity-[0.02] mix-blend-screen [background:repeating-linear-gradient(90deg,transparent_0_3px,rgba(136,0,255,0.15)_3px_4px,transparent_4px_12px)]" />
      </div>

      {/* 3D Scene with side buildings only */}
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

      {/* Data rain layer - visible between 3D buildings */}
      <canvas
        ref={canvasRefFront}
        className="absolute inset-0 pointer-events-none opacity-18"
        style={{
          mixBlendMode: "screen",
          zIndex: 12,
          width: "100%",
          left: 0,
        }}
      />
    </div>
  );
}
