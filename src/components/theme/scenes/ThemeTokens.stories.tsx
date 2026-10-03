import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { themes } from "@/lib/themes";

/**
 * Token swatches per theme.
 *
 * Exists because token problems are invisible in a screenshot until you know what to look
 * for. The Cyberpunk `--border` problem is the motivating case: at `180 80% 20%` it sat
 * within a couple of points of `--card`, so every hairline in the UI had simply vanished
 * and there was no visual cue that anything was wrong. Seeing foreground, background,
 * border and card side by side makes that obvious at a glance.
 */

type TokenName =
  | "background"
  | "foreground"
  | "card"
  | "muted"
  | "muted-foreground"
  | "primary"
  | "primary-foreground"
  | "secondary"
  | "accent"
  | "border"
  | "ring"
  | "destructive";

/** Tokens worth reviewing together, in visual priority order. */
const TOKENS: { name: TokenName; label: string }[] = [
  { name: "background", label: "background" },
  { name: "card", label: "card" },
  { name: "muted", label: "muted" },
  { name: "foreground", label: "foreground" },
  { name: "muted-foreground", label: "muted foreground" },
  { name: "primary", label: "primary" },
  { name: "primary-foreground", label: "on primary" },
  { name: "secondary", label: "secondary" },
  { name: "accent", label: "accent" },
  { name: "border", label: "border" },
  { name: "ring", label: "ring" },
  { name: "destructive", label: "destructive" },
];

function Swatch({ theme, token, label }: { theme: string; token: TokenName; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="flex h-14 items-end rounded border border-border p-2"
        style={{ backgroundColor: `hsl(var(--${token}))` }}
      >
        <span
          className="rounded px-1.5 py-0.5 font-mono text-[10px]"
          style={{
            backgroundColor: `hsl(var(--${token}))`,
            color: `hsl(var(--${token === "foreground" || token.endsWith("foreground") ? "background" : "foreground"}))`,
          }}
        >
          Aa
        </span>
      </div>
      <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
      <span className="font-mono text-[10px] text-muted-foreground/70">--{token}</span>
      <span className="font-mono text-[9px] text-muted-foreground/50">{theme}</span>
    </div>
  );
}

const meta: Meta = {
  title: "Theme/Tokens",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Design tokens per theme. Compare border against card to confirm hairlines are actually visible, and muted-foreground against background for body-text legibility.",
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

/** Every registered theme, so a new theme cannot be added without tokens being reviewed. */
export const AllThemes: Story = {
  render: () => (
    <div className="space-y-8 p-6">
      {themes.map((theme) => (
        <section
          key={theme.name}
          data-theme={theme.name}
        >
          <h2 className="mb-1 text-lg font-semibold text-foreground">{theme.displayName}</h2>
          <p className="mb-3 text-sm text-muted-foreground">{theme.docs}</p>
          <div className="grid grid-cols-4 gap-3 md:grid-cols-6 lg:grid-cols-12">
            {TOKENS.map((token) => (
              <Swatch
                key={`${theme.name}-${token.name}`}
                theme={theme.name}
                token={token.name}
                label={token.label}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

/**
 * Border against card for each theme, which is where a hairline can disappear without
 * anyone noticing.
 */
export const BorderVisibility: Story = {
  name: "Border vs card",
  render: () => (
    <div className="grid grid-cols-2 gap-6 p-6 md:grid-cols-4">
      {themes.map((theme) => (
        <div
          key={theme.name}
          data-theme={theme.name}
        >
          <p className="mb-2 text-sm font-medium text-foreground">{theme.displayName}</p>
          <div className="rounded border border-border bg-card p-4 text-sm text-card-foreground">
            <p className="text-muted-foreground">Body copy on a card</p>
            <p className="mt-2 font-semibold">A visible hairline is here</p>
            <div className="mt-3 h-8 rounded border border-border bg-background" />
          </div>
        </div>
      ))}
    </div>
  ),
};

/** Controls in context, to catch state colours that disappear against the base. */
export const Controls: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-6 p-6 md:grid-cols-4">
      {themes.map((theme) => (
        <div
          key={theme.name}
          data-theme={theme.name}
          className="space-y-3"
        >
          <p className="text-sm font-medium text-foreground">{theme.displayName}</p>
          <button
            type="button"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Primary
          </button>
          <button
            type="button"
            className="w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium"
          >
            Outline
          </button>
          <input
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Input"
          />
          <p className="text-sm text-muted-foreground">Muted supporting text</p>
          <a
            href="#tokens"
            className="text-sm font-medium text-primary underline underline-offset-4"
          >
            Primary link
          </a>
          <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            Badge
          </span>
        </div>
      ))}
    </div>
  ),
};
