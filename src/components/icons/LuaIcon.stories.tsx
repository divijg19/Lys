import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LuaIcon } from "./LuaIcon";

const meta: Meta<typeof LuaIcon> = {
  title: "Icons/LuaIcon",
  component: LuaIcon,
  args: { className: "size-20", title: "Lua" },
};
export default meta;

type Story = StoryObj<typeof LuaIcon>;

export const Default: Story = {};
