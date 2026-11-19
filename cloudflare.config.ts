import { bindings, defineConfig, defineWorker } from "cf/config";

export default defineConfig({
  worker: defineWorker({
    name: "terraco-website",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-19",
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    observability: {
      enabled: true,
      traces: {
        enabled: true,
      },
    },
    env: {
      ASSETS: bindings.assets(),
    },
  }),
});
