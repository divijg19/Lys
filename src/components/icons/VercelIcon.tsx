import React from "react";
import { BaseIcon, type IconProps } from "./BaseIcon";

void React;
export function VercelIcon({ className = "", title = "Vercel", size }: IconProps) {
  return (
    <BaseIcon
      viewBox="0 0 24 24"
      title={title}
      className={className}
      size={size}
    >
      <path
        d="M12 2 2 22h20L12 2Z"
        fill="currentColor"
      />
    </BaseIcon>
  );
}
