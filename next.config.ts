import type { NextConfig } from "next";

const exposeTestingApi = process.env.EXPOSE_TESTING_API === "1";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75, 85, 95],
  },
  cacheComponents: true,
  partialPrefetching: true,
  ...(exposeTestingApi
    ? {
        experimental: {
          exposeTestingApiInProductionBuild: true,
        },
      }
    : {}),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
