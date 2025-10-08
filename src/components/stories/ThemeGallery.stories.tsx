import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { type ThemeName, themes } from "@/lib/themes";

const meta: Meta = {
  title: "Foundations/Theme Gallery",
  parameters: { layout: "fullscreen" },
};
export default meta;

export const AllThemes: StoryObj = {
  render: () => {
    const [active, setActive] = useState<ThemeName>(themes[0].name as ThemeName);
    return (
      <ThemeProvider
        attribute="data-theme"
        defaultTheme={active}
        value={{ light: "light" }}
      >
        <div className="min-h-screen space-y-8 p-8">
          <h1 className="font-bold text-3xl">Theme Gallery</h1>
          <div className="flex flex-wrap gap-3">
            {themes.map((t) => (
              <button
                key={t.name}
                onClick={() => setActive(t.name as ThemeName)}
                type="button"
                className={`rounded-md border px-4 py-2 font-medium text-sm transition-colors ${active === t.name ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
              >
                {t.displayName}
              </button>
            ))}
          </div>
          <p className="max-w-xl text-muted-foreground">
            Active Theme: <strong>{active}</strong>
          </p>
        </div>
      </ThemeProvider>
    );
  },
};
