import type { MetadataRoute } from "next";
import { LANCAMENTOS } from "@/data/lancamentos";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/lancamentos`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const launchRoutes: MetadataRoute.Sitemap = LANCAMENTOS.map((item) => ({
    url: `${SITE_URL}/lancamentos/${item.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...launchRoutes];
}
