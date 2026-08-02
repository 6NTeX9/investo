import { NextResponse } from "next/server";
import { getLiveProperties } from "@/lib/live-properties";
import { LOCATIONS } from "@/lib/locations";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = "https://www.bricksnbeyond.in";
  let properties: any[] = [];

  try {
    const response = await getLiveProperties({ limit: 200 });
    properties = response.items || [];
  } catch (error) {
    console.error("Sitemap properties fetch error:", error);
  }

  const locationPaths = LOCATIONS.map((loc) => `/locations/${loc.slug}`);
  const staticPaths = [
    "", 
    "/properties", 
    "/locations", 
    ...locationPaths, 
    "/contact", 
    "/about", 
    "/agents", 
    "/blog"
  ];
  const now = new Date().toISOString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPaths
  .map(
    (path) => `<url>
<loc>${base}${path}</loc>
<lastmod>${now}</lastmod>
<changefreq>daily</changefreq>
<priority>${path === "" ? "1.0" : "0.8"}</priority>
</url>`
  )
  .join("\n")}
${properties
  .filter((p) => p && p.slug)
  .map(
    (p) => `<url>
<loc>${base}/properties/${encodeURIComponent(p.slug)}</loc>
<lastmod>${p.updatedAt ? new Date(p.updatedAt).toISOString() : now}</lastmod>
<changefreq>weekly</changefreq>
<priority>0.9</priority>
</url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(xml.trim(), {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400"
    }
  });
}
