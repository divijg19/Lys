import type React from "react";
import { useId } from "react";

export interface IconProps {
  title?: string;
  className?: string;
  size?: number | string; // number treated as px, string passed through (e.g. 1.5rem)
  adaptive?: boolean; // optional flag some icons use for theme-based styling
}

interface BaseIconProps extends IconProps {
  viewBox: string;
  children: React.ReactNode;
  role?: string;
  focusable?: boolean;
  // Optional inline style block injection for per-icon adaptive theming
  styleBlock?: string; // raw CSS inserted inside <style>
  labelled?: boolean; // if false, will set aria-hidden
}

export function BaseIcon({
  title = "",
  className = "",
  size,
  adaptive,
  viewBox,
  children,
  role = "img",
  focusable = false,
  styleBlock,
  labelled = true,
}: BaseIconProps) {
  const titleId = useId();
  const sizeProps: Record<string, unknown> = {};
  if (size !== undefined) {
    if (typeof size === "number") {
      sizeProps.width = size;
      sizeProps.height = size;
    } else if (typeof size === "string") {
      sizeProps.style = { ...(sizeProps.style as object), width: size, height: size };
    }
  }
  return (
    <svg
      className={["icon", className].filter(Boolean).join(" ")}
      viewBox={viewBox}
      role={role}
      aria-labelledby={labelled && title ? titleId : undefined}
      aria-hidden={labelled ? undefined : true}
      data-adaptive={adaptive ? "true" : undefined}
      focusable={focusable ? "true" : "false"}
      xmlns="http://www.w3.org/2000/svg"
      {...sizeProps}
    >
      {labelled && title ? <title id={titleId}>{title}</title> : null}
      {styleBlock ? <style>{styleBlock}</style> : null}
      {children}
    </svg>
  );
}

/** Helper to create a simple monochrome (currentColor) icon from a path definition */
export function createPathIcon(d: string, viewBox = "0 0 24 24") {
  return function PathIcon(props: IconProps) {
    return (
      <BaseIcon
        viewBox={viewBox}
        {...props}
      >
        <path
          d={d}
          fill="currentColor"
        />
      </BaseIcon>
    );
  };
}
