import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MojoIcon } from "./MojoIcon";

const meta: Meta<typeof MojoIcon> = {
  title: "Icons/MojoIcon",
  component: MojoIcon,
  args: { className: "size-20", title: "Mojo" },
};
export default meta;

type Story = StoryObj<typeof MojoIcon>;

export const Default: Story = {};
