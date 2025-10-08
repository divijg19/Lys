"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { ThemeSceneKey } from "@/lib/themes";

// Dynamic scene components (client-only). All heavy visual effects live here.
const LightScene = dynamic(() => import("@/components/theme/scenes/LightScene"), {
  ssr: false,
  loading: () => null,
});
const DarkScene = dynamic(() => import("@/components/theme/scenes/DarkScene"), {
  ssr: false,
  loading: () => null,
});
const CyberpunkScene = dynamic(() => import("@/components/theme/scenes/CyberpunkScene"), {
  ssr: false,
  loading: () => null,
});
const EtherealScene = dynamic(() => import("@/components/theme/scenes/EtherealScene"), {
  ssr: false,
  loading: () => null,
});
const HorizonScene = dynamic(() => import("@/components/theme/scenes/HorizonScene"), {
  ssr: false,
  loading: () => null,
});
const MirageScene = dynamic(() => import("@/components/theme/scenes/MirageScene"), {
  ssr: false,
  loading: () => null,
});
const SimpleScene: ComponentType = () => null;

export const themeScenes: Record<ThemeSceneKey, ComponentType> = {
  lightScene: LightScene,
  darkScene: DarkScene,
  cyberpunkScene: CyberpunkScene,
  etherealScene: EtherealScene,
  horizonScene: HorizonScene,
  mirageScene: MirageScene,
  simpleScene: SimpleScene,
};
