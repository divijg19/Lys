import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      reporter: ["text", "json", "html"],
      thresholds: { lines: 0.84, branches: 0.73, functions: 0.82, statements: 0.83 },
    },
    projects: [
      {
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./vitest.setup.ts"],
        },
        resolve: {
          alias: {
            "@": path.resolve(import.meta.dirname, "src"),
            // Must mirror the "#velite" path mapping in tsconfig.json ("./.velite").
            // velite emits its output to <root>/.velite, not src/.velite/generated.
            "#velite": path.resolve(import.meta.dirname, ".velite"),
          },
        },
      },
    ],
  },
});
