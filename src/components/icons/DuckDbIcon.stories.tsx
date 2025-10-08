import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DuckDbIcon } from "./DuckDbIcon";

const meta: Meta<typeof DuckDbIcon> = {
  title: "Icons/DuckDbIcon",
  component: DuckDbIcon,
  args: { className: "size-20", title: "DuckDB" },
};
export default meta;

type Story = StoryObj<typeof DuckDbIcon>;

export const Default: Story = {};
