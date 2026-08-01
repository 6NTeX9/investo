import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const base = (envUrl && !envUrl.includes("localhost")) ? envUrl.replace(/\/$/, "") : "https://www.bricksnbeyond.in";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin"
    },
    sitemap: `${base}/sitemap.xml`
  };
}
