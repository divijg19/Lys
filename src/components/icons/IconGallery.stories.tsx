import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AwsIcon, DuckDbIcon, LuaIcon, MojoIcon, VercelIcon, YamlIcon } from ".";

const meta: Meta = {
  title: "Icons/Gallery",
};
export default meta;

type Story = StoryObj;

export const All: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-6 p-6 text-[hsl(var(--foreground))]">
      <div className="flex flex-col items-center gap-2">
        <AwsIcon className="size-16" />
        <span className="text-xs">AWS</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <DuckDbIcon className="size-16" />
        <span className="text-xs">DuckDB</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <LuaIcon className="size-16" />
        <span className="text-xs">Lua</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <MojoIcon className="size-16" />
        <span className="text-xs">Mojo</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <VercelIcon className="size-16" />
        <span className="text-xs">Vercel</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <YamlIcon className="size-16" />
        <span className="text-xs">YAML</span>
      </div>
    </div>
  ),
};
