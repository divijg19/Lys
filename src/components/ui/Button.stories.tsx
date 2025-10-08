// src/components/ui/Button.stories.ts

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Ghost } from "lucide-react"; // Correct icon import
import { fn } from "storybook/test";

// Import the component and its props from the same file.
import { Button, type ButtonProps } from "./Button";

// The meta object defines the story's main configuration.
const meta: Meta<ButtonProps> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],

  // OPTIMAL FIX 1: Add argTypes for interactive controls.
  // This tells Storybook exactly what props are available and what their options are.
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
        "cyberpunk",
        "horizon",
      ],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
  },

  // OPTIMAL FIX 2: Set default args to make stories DRY.
  // Individual stories now only need to specify what's different.
  args: {
    onClick: fn(),
    variant: "default",
    size: "default",
    children: "Button Text",
  },
};

export default meta;

// OPTIMAL FIX 3: Use `typeof meta` for perfect type inference.
// This ensures the `Story` type inherits the argTypes and default args.
type Story = StoryObj<typeof meta>;

// --- Stories ---
// Each story is now incredibly clean and focuses only on its unique state.

// This story inherits all the defaults, so it needs no extra configuration.
export const Default: Story = {};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Cancel",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large Button",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small Button",
  },
};

export const Icon: Story = {
  args: {
    size: "icon",
    children: <Ghost className="h-4 w-4" />,
  },
};
