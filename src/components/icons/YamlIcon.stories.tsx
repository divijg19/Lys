import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { YamlIcon } from "./YamlIcon";

const meta: Meta<typeof YamlIcon> = {
  title: "Icons/YamlIcon",
  component: YamlIcon,
  args: { className: "size-20", title: "YAML" },
};
export default meta;

type Story = StoryObj<typeof YamlIcon>;

export const Default: Story = {};
