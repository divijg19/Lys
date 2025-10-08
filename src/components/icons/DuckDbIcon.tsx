import { BaseIcon, type IconProps } from "./BaseIcon";

export function DuckDbIcon({
  title = "DuckDB",
  size = 32,
  adaptive = true,
  className = "",
  ...rest
}: IconProps) {
  const styleBlock = `.bg{fill:#000}.mark{stroke:#333;stroke-width:.8}html[data-theme="dark"] svg[data-duckdb] .bg,html[data-theme="cyberpunk"] svg[data-duckdb] .bg,html[data-theme="horizon"] svg[data-duckdb] .bg,html[data-theme="mirage"] svg[data-duckdb] .bg{fill:#fff}html[data-theme="dark"] svg[data-duckdb] .mark,html[data-theme="cyberpunk"] svg[data-duckdb] .mark,html[data-theme="horizon"] svg[data-duckdb] .mark,html[data-theme="mirage"] svg[data-duckdb] .mark{stroke-width:1.2}.mark{vector-effect:non-scaling-stroke}`;
  return (
    <BaseIcon
      title={title}
      size={size}
      className={className}
      adaptive={adaptive}
      viewBox="0 0 24 24"
      styleBlock={styleBlock}
      data-duckdb
      {...rest}
    >
      <circle
        className="bg"
        cx="12"
        cy="12"
        r="12"
      />
      <path
        className="mark"
        fill="#fff100"
        d="M9.502 7.03a4.974 4.974 0 0 1 4.97 4.97 4.974 4.974 0 0 1 -4.97 4.97A4.974 4.974 0 0 1 4.532 12a4.974 4.974 0 0 1 4.97 -4.97zm6.563 3.183h2.351c0.98 0 1.787 0.782 1.787 1.762s-0.807 1.789 -1.787 1.789h-2.351v-3.551z"
      />
    </BaseIcon>
  );
}
