import type { ComponentType } from "react";
import { AwsIcon, DuckDbIcon, LuaIcon, MojoIcon, VercelIcon, YamlIcon } from "@/components/icons";

export const ICON_COMPONENTS = {
  "mojo.svg": MojoIcon,
  "vercel.svg": VercelIcon,
  "YAML.svg": YamlIcon,
  "aws.svg": AwsIcon,
  "lua.svg": LuaIcon,
  "duckdb.svg": DuckDbIcon,
} as const;

export type IconName = keyof typeof ICON_COMPONENTS; // e.g. "aws.svg" | "lua.svg" ...

export function isIconName(value: string): value is IconName {
  return value in ICON_COMPONENTS;
}

export function resolveIconFromPath(path: string) {
  const file = path.split("/").pop() || "";
  if (isIconName(file))
    return ICON_COMPONENTS[file] as ComponentType<{ className?: string; title?: string }>;
  return undefined;
}
