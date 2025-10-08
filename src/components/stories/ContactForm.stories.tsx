import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Contact } from "@/components/sections/Contact";

// Wrapper to isolate form states by simulating fetch.
const meta: Meta = {
  title: "Sections/Contact",
  component: Contact,
  parameters: { layout: "fullscreen" },
};
export default meta;

export const Default: StoryObj = { render: () => <Contact /> };
