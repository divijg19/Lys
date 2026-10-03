import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useState } from "react";
import { buildAlley, ALLEY_SLOTS, NEON_COLORS } from "@/components/theme/effects/cyberpunk/alley";
import { themes } from "@/lib/themes";
import CyberpunkScene from "./CyberpunkScene";
import DarkScene from "./DarkScene";
import EtherealScene from "./EtherealScene";
import LightScene from "./LightScene";

/**
 * Renders the real background scenes so they can be reviewed in isolation, rather than
 * only through the full app where a regression can hide behind page content.
 *
 * These are the four themes this pass took ownership of. Horizon, Mirage and Simple are
 * deferred, so their scenes are deliberately absent rather than half-wired.
 */
const SCENES = {
  light: LightScene,
  dark: DarkScene,
  cyberpunk: CyberpunkScene,
  ethereal: EtherealScene,
} as const;

type SceneName = keyof typeof SCENES;

/**
 * Constrain height the way the app does, so composition and the horizon/vanishing point
 * can be judged at something close to their real proportions.
 */
const Frame = ({ children, label }: { children: React.ReactNode; label?: string }) => (
  <div
    style={{ height: "520px" }}
    className="relative w-full overflow-hidden bg-background"
  >
    {children}
    {label && (
      <div className="absolute top-2 right-3 z-20 rounded bg-background/70 px-3 py-1 font-medium text-xs backdrop-blur">
        {label}
      </div>
    )}
  </div>
);

const Scene = ({
  name,
  reducedMotion,
  lowData,
}: {
  name: SceneName;
  reducedMotion: boolean;
  lowData: boolean;
}) => {
  const SceneComponent = SCENES[name];
  return (
    <div
      data-theme={name}
      style={{
        position: "relative",
        isolation: "isolate",
        height: "100%",
        width: "100%",
      }}
      {...(reducedMotion ? { "data-reduce-motion": "true" } : {})}
      {...(lowData ? { "data-low-data": "true" } : {})}
    >
      <SceneComponent />
    </div>
  );
};

const meta: Meta = {
  title: "Theme/Scenes",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The live background scenes for the four redesigned themes. Each renders its real component, so shader, geometry and calm-mode regressions are visible here rather than only in the running app. Toggle reduceMotion or lowData in the toolbar to review the calm paths.",
      },
    },
  },
  argTypes: {
    scene: {
      control: "select",
      options: Object.keys(SCENES),
    },
    reducedMotion: { control: "boolean" },
    lowData: { control: "boolean" },
  },
  args: {
    scene: "cyberpunk",
    reducedMotion: false,
    lowData: false,
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: (args) => (
    <Frame label={args.scene}>
      <Scene
        name={args.scene as SceneName}
        reducedMotion={args.reducedMotion}
        lowData={args.lowData}
      />
    </Frame>
  ),
};

/**
 * All four side by side. The most useful single view for spotting a theme whose scene has
 * gone dark, stopped animating, or lost its palette.
 */
export const Gallery: Story = {
  args: { scene: "cyberpunk" },
  render: (args) => (
    <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
      {(Object.keys(SCENES) as SceneName[]).map((name) => (
        <Frame
          key={name}
          label={themes.find((t) => t.name === name)?.displayName ?? name}
        >
          <Scene
            name={name}
            reducedMotion={args.reducedMotion}
            lowData={args.lowData}
          />
        </Frame>
      ))}
    </div>
  ),
};

/**
 * The calm paths. Every scene here returns null under reduced motion or a data-constrained
 * connection, so each frame shows ThemeBackground's static fallback gradient in the app and
 * simply the page background in isolation. Useful for confirming nothing crashes and
 * nothing is left half-rendered.
 */
export const CalmPaths: Story = {
  args: { reducedMotion: true },
  render: (args) => (
    <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
      {(Object.keys(SCENES) as SceneName[]).map((name) => (
        <Frame
          key={name}
          label={`${name} · ${args.lowData ? "low data" : "reduced motion"}`}
        >
          <Scene
            name={name}
            reducedMotion={args.reducedMotion}
            lowData={args.lowData}
          />
        </Frame>
      ))}
    </div>
  ),
};

/**
 * The generated alley, as data.
 *
 * The scene derives its street from buildAlley(), which is deterministic and free of
 * Three.js precisely so it can be reviewed. Scroll position itself cannot be staged here,
 * since the scene reads the real window scroll offset, so this is the honest way to
 * inspect the layout the renderer is drawing: slot order, side, width, height, sign copy
 * and which facades carry signage.
 */
export const AlleyLayout: Story = {
  args: { scene: "cyberpunk" },
  render: () => {
    const buildings = buildAlley("cyberpunk:alley:v2", false);
    return (
      <div
        data-theme="cyberpunk"
        className="p-6"
      >
        <p className="mb-4 text-sm text-muted-foreground">
          {buildings.length} buildings across {ALLEY_SLOTS} slots, seed{" "}
          <code>cyberpunk:alley:v2</code>, CJK signage off. Wider bar = wider building; brighter
          marker = neon sign.
        </p>
        <div className="space-y-1">
          {buildings.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-3"
            >
              <span className="w-16 shrink-0 font-mono text-[10px] text-muted-foreground">
                {b.id}
              </span>
              <span className="w-14 shrink-0 font-mono text-[10px] text-muted-foreground">
                z {b.baseZ.toFixed(0)}
              </span>
              <span
                className="h-2 shrink-0 rounded-full bg-muted"
                style={{ width: `${b.width * 22}px` }}
              />
              <span
                className="font-mono text-[10px]"
                style={{
                  color: b.hasNeon ? NEON_COLORS[b.neonHue].hex : "hsl(var(--muted-foreground))",
                }}
              >
                {b.signText}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground/70">
                h {b.height.toFixed(1)} · {b.windows.length} windows
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  },
};

/** Cycle through the four scenes on a timer, for eyeballing motion. */
export const Cycling: Story = {
  args: { scene: "cyberpunk" },
  render: (args) => {
    const names = Object.keys(SCENES) as SceneName[];
    const [index, setIndex] = useState(0);
    const [playing, setPlaying] = useState(true);

    // Advance only while playing. Without the dependency the button did nothing.
    useEffect(() => {
      if (!playing) return;
      const id = setInterval(() => setIndex((i) => (i + 1) % names.length), 4000);
      return () => clearInterval(id);
    }, [playing, names.length]);

    return (
      <div>
        <div className="flex gap-3 p-3">
          <button
            type="button"
            className="rounded border border-border px-3 py-1.5 text-sm"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? "Pause" : "Play"}
          </button>
          {names.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => setIndex(i)}
              className={`rounded border px-3 py-1.5 text-sm ${
                index === i ? "bg-primary text-primary-foreground" : "bg-background"
              }`}
            >
              {name}
            </button>
          ))}
        </div>
        <Frame label={names[index]}>
          <Scene
            name={names[index]}
            reducedMotion={args.reducedMotion}
            lowData={args.lowData}
          />
        </Frame>
      </div>
    );
  },
};
