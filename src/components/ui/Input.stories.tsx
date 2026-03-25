import type { Meta, StoryObj } from "@storybook/react";
import { Mail } from "lucide-react";
// Import the component we are documenting
import { Input } from "@/components/ui/Input";
// Import a related component to show a common use case
import { Label } from "@/components/ui/Label";

/**
 * Displays a form input field or a component that looks like an input field.
 * This is a foundational component for building forms.
 */
const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  // A decorator to provide some spacing and a max-width for better presentation.
  decorators: [
    (Story) => (
      <div className="w-full max-w-sm">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

/**
 * The default input field. It's clean, simple, and ready for user input.
 */
export const Default: Story = {
  args: {
    type: "email",
    placeholder: "your@email.com",
  },
};

/**
 * The disabled state of an input field. This prevents user interaction and is
 * visually distinct to indicate that it's not active.
 */
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
    placeholder: "Email (disabled)",
  },
};

/**
 * A world-class pattern showing the `Input` paired with a `Label`.
 * The `htmlFor` attribute on the `Label` is linked to the `id` of the `Input`,
 * which is a crucial practice for accessibility.
 */
export const WithLabel: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="email-with-label">Email</Label>
      <Input
        id="email-with-label"
        {...args}
      />
    </div>
  ),
  args: {
    ...Default.args,
  },
};

/**
 * An example of an input with an icon. This is a common pattern for sign-up
 * or login forms and is achieved by wrapping them in a relative container.
 */
export const WithIcon: Story = {
  render: (args) => (
    <div className="relative">
      <Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
      <Input
        {...args}
        className="pl-10"
      />
    </div>
  ),
  args: {
    ...Default.args,
  },
};

/**
 * The `Input` component also supports `type="file"`. The styling for the
 * file input button is handled gracefully.
 */
export const FileInput: Story = {
  render: (args) => (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="picture">Picture</Label>
      <Input
        id="picture"
        {...args}
      />
    </div>
  ),
  args: {
    type: "file",
  },
};
