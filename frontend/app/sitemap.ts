import type { MetadataRoute } from "next";
import { properties } from "@/lib/data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
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
