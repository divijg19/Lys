import type { Meta, StoryObj } from "@storybook/react";
// Import a related component to show the Textarea's primary use case
import { Label } from "@/components/ui/Label";
// Import the component we are documenting
import { Textarea } from "@/components/ui/Textarea";

/**
 * Displays a multi-line text input field. This component is essential for
 * capturing longer form content from users, such as messages or comments.
 */
const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
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
type Story = StoryObj<typeof Textarea>;

/**
 * The default textarea. It's clean, resizable (by default in most browsers),
 * and ready for multi-line user input.
 */
export const Default: Story = {
  args: {
    placeholder: "Type your message here.",
  },
};

/**
 * The disabled state of a textarea. This prevents user interaction and is
 * visually distinct to indicate that it's not active.
 */
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
    placeholder: "This textarea is disabled.",
  },
};

/**
 * A world-class pattern showing the `Textarea` paired with a `Label`.
 * The `htmlFor` attribute on the `Label` is linked to the `id` of the `Textarea`,
 * a crucial practice for accessibility.
 */
export const WithLabel: Story = {
  render: (args) => (
    <>
      <Label htmlFor="message">Your Message</Label>
      <Textarea id="message" {...args} />
    </>
  ),
  args: {
    ...Default.args,
  },
};

/**
 * This story demonstrates the `Textarea` with a text helper below it, a very
 * common pattern in forms for providing context or instructions.
 */
export const WithText: Story = {
  render: (args) => (
    <>
      <Label htmlFor="bio">Bio</Label>
      <Textarea id="bio" {...args} />
      <p className="text-muted-foreground text-sm">
        You can <span>@mention</span> other users and organizations.
      </p>
    </>
  ),
  args: {
    placeholder: "Tell us a little bit about yourself",
  },
};
