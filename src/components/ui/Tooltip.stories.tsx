import type { Meta, StoryObj } from "@storybook/react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
// Import all the parts of your Tooltip component
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";

/**
 * A popup that displays information related to an element when the element
 * receives keyboard focus or the mouse hovers over it. Built on top of Radix UI
 * for world-class accessibility and functionality.
 */
const meta: Meta<typeof Tooltip> = {
  title: "UI/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
  // --- WORLD-CLASS BEST PRACTICE ---
  // A decorator is a way to wrap every story with a component.
  // The TooltipProvider is required for any tooltips to function correctly.
  decorators: [
    (Story) => (
      <TooltipProvider>
        <div className="flex h-32 items-center justify-center">
          <Story />
        </div>
      </TooltipProvider>
    ),
  ],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

/**
 * The default Tooltip composition. Hover over the button to see the tooltip.
 */
export const Default: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover Me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a default tooltip.</p>
      </TooltipContent>
    </Tooltip>
  ),
};

/**
 * You can control the position of the tooltip using the `side` prop on the `TooltipContent`.
 */
export const RightSide: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover Me</Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>Tooltip on the right.</p>
      </TooltipContent>
    </Tooltip>
  ),
};

/**
 * Tooltips are often used on icon buttons to provide context.
 */
export const WithIconButton: Story = {
  render: (args) => (
    <Tooltip {...args}>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Information">
          <Info className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>More Information</p>
      </TooltipContent>
    </Tooltip>
  ),
};
