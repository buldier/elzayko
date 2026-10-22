import { defineConfig } from "vitest/config";

const shared = {
  resolve: {
    tsconfigPaths: true,
    alias: { "server-only": new URL("./tests/support/empty.ts", import.meta.url).pathname },
  },
};

export default defineConfig({
  test: {
    projects: [
      { ...shared, test: { name: "unit", include: ["tests/unit/**/*.test.ts"], environment: "node" } },
      {
        ...shared,
        test: {
          name: "integration",
          include: ["tests/integration/**/*.test.ts"],
          environment: "node",
          globalSetup: ["tests/support/integration-global-setup.ts"],
          setupFiles: ["tests/support/integration-setup.ts"],
          fileParallelism: false,
          testTimeout: 30_000,
          hookTimeout: 60_000,
        },
      },
    ],
  },
});
