import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { VercelIcon } from "./VercelIcon";

const meta: Meta<typeof VercelIcon> = {
  title: "Icons/VercelIcon",
  component: VercelIcon,
  args: { className: "size-20", title: "Vercel" },
};
export default meta;

type Story = StoryObj<typeof VercelIcon>;

export const Default: Story = {};
