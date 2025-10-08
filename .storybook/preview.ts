// .storybook/preview.ts

// @ts-expect-error - side-effect global CSS import accepted in Storybook environment
import "@/styles/globals.css";
// @ts-expect-error - side-effect global CSS import accepted in Storybook environment
import "@/styles/a11y.css";
import type { Decorator, Preview, StoryFn as SBStoryFn } from "@storybook/nextjs-vite";
import { useEffect } from "react";

// Global decorator to sync Storybook toolbar globals with data attributes on <html>
const withEnvAttributes: Decorator = (StoryFn: SBStoryFn, context) => {
  const { reduceMotion, lowData } = context.globals as {
    reduceMotion?: boolean;
    lowData?: boolean;
  };
  useEffect(() => {
    const root = document.documentElement;
    if (reduceMotion) root.setAttribute("data-reduce-motion", "true");
    else root.removeAttribute("data-reduce-motion");
    if (lowData) root.setAttribute("data-low-data", "true");
    else root.removeAttribute("data-low-data");
  }, [reduceMotion, lowData]);
  return StoryFn(context.args, context);
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
    layout: "centered",
  },
  globalTypes: {
    reduceMotion: {
      name: "Reduced Motion",
      description: "Simulate prefers-reduced-motion",
      defaultValue: false,
      toolbar: {
        icon: "accessibility",
        items: [
          { value: false, title: "Normal" },
          { value: true, title: "Reduced" },
        ],
      },
    },
    lowData: {
      name: "Low Data",
      description: "Simulate data saving mode",
      defaultValue: false,
      toolbar: {
        icon: "power",
        items: [
          { value: false, title: "Full" },
          { value: true, title: "Low" },
        ],
      },
    },
  },
  decorators: [withEnvAttributes],
};

export default preview;
