import type { MetadataRoute } from "next";
import { getLiveProperties } from "@/lib/live-properties";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.bricksnbeyond.in";
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
