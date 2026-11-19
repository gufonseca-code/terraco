import path from "node:path";
import {
  buildPagesASSETSBinding,
  cloudflareTest,
} from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest(async () => ({
      miniflare: {
        compatibilityDate: "2026-11-19",
        serviceBindings: {
          ASSETS: await buildPagesASSETSBinding(
            path.join(import.meta.dirname, "public")
          ),
        },
      },
    })),
  ],
  test: {
    include: ["tests/**/*.test.ts"],
  },
});
