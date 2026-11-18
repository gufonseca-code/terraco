import type { MetadataRoute } from "next";
import { LANCAMENTOS } from "@/data/lancamentos";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/lancamentos`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const launchRoutes: MetadataRoute.Sitemap = LANCAMENTOS.map((item) => ({
    url: `${siteUrl}/lancamentos/${item.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...launchRoutes];
}
