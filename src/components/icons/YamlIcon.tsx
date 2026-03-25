import React from "react";
import { BaseIcon } from "./BaseIcon";

void React;
export function YamlIcon({
  className = "",
  title = "YAML",
  size,
}: {
  className?: string;
  title?: string;
  size?: number;
}) {
  return (
    <BaseIcon
      viewBox="0 0 24 24"
      title={title}
      className={className}
      size={size}
    >
      <text
        x="3"
        y="16"
        fontFamily="ui-monospace, SFMono-Regular, 'Cascadia Code', 'Roboto Mono', monospace"
        fontSize={7}
        fontWeight={600}
        fill="currentColor"
      >
        YAML
      </text>
    </BaseIcon>
  );
}
