import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const srcDir = fileURLToPath(new URL("./src/", import.meta.url));

export default defineConfig({
  resolve: {
    // Same mapping as tsconfig "paths": #config/env.js -> src/config/env.ts
    alias: [{ find: /^#(.*)\.js$/, replacement: `${srcDir}$1.ts` }],
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: { NODE_ENV: "test", LOG_LEVEL: "silent" },
  },
});
