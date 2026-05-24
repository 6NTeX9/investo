import type { MetadataRoute } from "next";
import { getLiveProperties } from "@/lib/live-properties";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  let properties: any[] = [];

  try {
    const response = await getLiveProperties({ limit: 200 });
    properties = response.items;
  } catch (error) {
    console.error("Failed to load live properties for sitemap:", error);
  }

  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/properties`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
    ...properties.map((property) => ({
      url: `${base}/properties/${property.slug}`,
      lastModified: new Date()
    }))
  ];
}
