import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname =
  typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reportsDirectory: "coverage",
      reporter: ["text", "json", "html"],
      thresholds: { lines: 0.7, branches: 0.6, functions: 0.65, statements: 0.7 },
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
            "@": path.resolve(dirname, "src"),
            "#velite": path.resolve(dirname, "src/.velite/generated"),
          },
        },
      },
      // Storybook project temporarily disabled due to missing peer dep (markdown-to-jsx) resolution in optimizeDeps.
      // Re-enable after adding the dependency or adjusting Storybook docgen configuration.
    ],
  },
});
