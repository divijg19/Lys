import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AwsIcon } from "./AwsIcon";

const meta: Meta<typeof AwsIcon> = {
  title: "Icons/AwsIcon",
  component: AwsIcon,
  args: { className: "size-20", title: "AWS" },
};
export default meta;

type Story = StoryObj<typeof AwsIcon>;

export const Default: Story = {};
