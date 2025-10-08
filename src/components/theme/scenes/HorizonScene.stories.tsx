// Storybook stories for HorizonScene time-of-day variants
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useEffect, useState } from "react";
import type { DayPhase } from "@/hooks/useDayPhase";
import HorizonScene, { type HorizonSceneProps } from "./HorizonScene";

const PHASES: DayPhase[] = ["late-night", "morning", "afternoon", "evening"];

const meta: Meta<HorizonSceneProps> = {
  title: "Theme/HorizonScene",
  component: HorizonScene,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "HorizonScene dynamically adapts visuals based on time-of-day. Stories allow forcing phases and cycling through them.",
      },
    },
  },
  argTypes: {
    phaseOverride: {
      control: "select",
      options: PHASES,
    },
    disableAnimation: {
      control: "boolean",
    },
  },
  args: {
    disableAnimation: false,
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

// Utility wrapper to constrain height similar to app usage.
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{ height: "420px" }}
    className="relative w-full overflow-hidden bg-background"
  >
    {children}
    <div className="absolute top-2 right-3 z-10 rounded bg-background/60 px-3 py-1 font-medium text-xs backdrop-blur">
      HorizonScene Demo
    </div>
  </div>
);

export const Playground: Story = {
  render: (args) => (
    <Wrapper>
      <HorizonScene {...args} />
    </Wrapper>
  ),
};

export const AllPhasesStatic: Story = {
  render: () => (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {PHASES.map((p) => (
        <div
          key={p}
          className="relative h-64 overflow-hidden rounded border border-border"
        >
          <HorizonScene
            phaseOverride={p}
            disableAnimation
          />
          <span className="absolute bottom-2 left-2 rounded bg-background/70 px-2 py-1 font-medium text-xs backdrop-blur">
            {p}
          </span>
        </div>
      ))}
    </div>
  ),
  parameters: { layout: "fullscreen" },
};

// Auto-cycling story.
export const Cycling: Story = {
  args: { disableAnimation: false },
  render: (args) => {
    const [index, setIndex] = useState(0);
    useEffect(() => {
      const id = setInterval(() => setIndex((i) => (i + 1) % PHASES.length), 3000);
      return () => clearInterval(id);
    }, []);
    const phase = PHASES[index];
    return (
      <Wrapper>
        <HorizonScene
          {...args}
          phaseOverride={phase}
        />
        <div className="-translate-x-1/2 absolute bottom-3 left-1/2 z-10 rounded bg-background/70 px-3 py-1 font-semibold text-sm tracking-wide backdrop-blur">
          {phase}
        </div>
      </Wrapper>
    );
  },
};
