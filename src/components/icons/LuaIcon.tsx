import { BaseIcon, type IconProps } from "./BaseIcon";

export function LuaIcon({
  title = "Lua",
  size = 32,
  className = "",
  adaptive = true,
  ...rest
}: IconProps) {
  const styleBlock = `.lua-circle{stroke:hsla(var(--foreground),0.18);stroke-width:2}html[data-theme="dark"] svg[data-adaptive="true"] .lua-circle,html[data-theme="horizon"] svg[data-adaptive="true"] .lua-circle{stroke:hsla(var(--foreground),0.35)}html[data-theme="cyberpunk"] svg[data-adaptive="true"] .lua-circle{stroke:hsla(var(--foreground),0.3)}`;
  return (
    <BaseIcon
      title={title}
      size={size}
      className={className}
      adaptive={adaptive}
      viewBox="0 0 128 128"
      styleBlock={styleBlock}
      {...rest}
    >
      <circle
        className="lua-circle"
        cx="64"
        cy="64"
        r="60"
        fill="#000080"
      />
      <circle
        cx="104"
        cy="24"
        r="16"
        fill="#ffffff"
      />
      <text
        x="50%"
        y="60%"
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight={600}
        fontSize="40"
        fill="#ffffff"
        style={{ dominantBaseline: "middle" }}
      >
        Lua
      </text>
    </BaseIcon>
  );
}
