import type { Meta, StoryObj } from "@storybook/nextjs-vite";
// Import a related component to show the Label's primary use case
import { Input } from "@/components/ui/Input";
// Import the component we are documenting
import { Label } from "@/components/ui/Label";

/**
 * Renders an accessible label associated with a form control. Built on Radix UI,
 * it provides a crucial link between text and inputs for accessibility.
 */
const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
  // A decorator to provide consistent layout and spacing for the stories.
  decorators: [
    (Story) => (
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Label>;

/**
 * This is the default and most important use case. The `htmlFor` attribute of the
 * `Label` is programmatically linked to the `id` of the `Input`. Clicking the
 * label will now correctly focus the input field, a critical accessibility feature.
 */
export const Default: Story = {
  render: (args) => (
    <>
      <Label
        htmlFor="email-default"
        {...args}
      >
        Your Email
      </Label>
      <Input
        id="email-default"
        type="email"
        placeholder="your@email.com"
      />
    </>
  ),
};

/**
 * This story demonstrates the `peer-disabled` styling. When the associated `Input`
 * is disabled, the `Label`'s styles automatically update to appear muted,
 * providing clear visual feedback to the user.
 */
export const Disabled: Story = {
  render: (args) => (
    <>
      <Label
        htmlFor="email-disabled"
        {...args}
      >
        Your Email (Disabled)
      </Label>
      <Input
        id="email-disabled"
        type="email"
        placeholder="your@email.com"
        disabled
      />
    </>
  ),
};
