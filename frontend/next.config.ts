import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: {
    root: path.join(process.cwd(), "..")
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.amazonaws.com" }
    ]
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ]
      },
      {
        source: "/((?!api|_next/static|_next/image|favicon.ico|admin).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
