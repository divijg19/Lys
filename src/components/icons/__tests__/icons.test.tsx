import { render } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { AwsIcon, DuckDbIcon, LuaIcon, MojoIcon, VercelIcon, YamlIcon } from "../../icons";
import { resolveIconFromPath } from "../../icons/registry";

describe("icon registry", () => {
  // Reference React to avoid unused import removal; required for JSX under test env
  void React;
  const entries = [
    ["/assets/icons/mojo.svg", MojoIcon],
    ["/assets/icons/vercel.svg", VercelIcon],
    ["/assets/icons/YAML.svg", YamlIcon],
    ["/assets/icons/aws.svg", AwsIcon],
    ["/assets/icons/lua.svg", LuaIcon],
    ["/assets/icons/duckdb.svg", DuckDbIcon],
  ] as const;

  it("resolves correct component from path", () => {
    for (const [p, C] of entries) {
      expect(resolveIconFromPath(p)).toBe(C);
    }
  });

  it("renders accessible svg with aria-label", () => {
    for (const [p, C] of entries) {
      const label = p.split("/").pop() || "icon";
      const { getByLabelText } = render(<C title={label} />);
      expect(getByLabelText(label)).toBeTruthy();
    }
  });
});
