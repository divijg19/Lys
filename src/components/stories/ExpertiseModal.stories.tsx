import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Expertise } from "@/components/sections/Expertise";

const meta: Meta = {
  title: "Sections/Expertise/Modal",
  parameters: { layout: "fullscreen" },
};
export default meta;

// Basic story just renders the Expertise section; opening a skill can be user-driven.
export const Interactive: StoryObj = { render: () => <Expertise /> };
