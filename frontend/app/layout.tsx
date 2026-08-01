import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { Analytics } from "@/lib/analytics";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "BricksNBeyond | Luxury Properties",
    template: "%s | BricksNBeyond"
  },
  description: "Discover premium residences, investment projects, and commercial real estate in fast-growing city corridors.",
  openGraph: {
    title: "BricksNBeyond",
    description: "Premium real estate discovery and advisory platform.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body className="bg-[#f7f4ee] text-[#151515]">
        <NextTopLoader
          color="#b89658"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #b89658,0 0 5px #b89658"
          zIndex={99999}
        />
        <Analytics />
        <Navbar />
        <Providers>
          {children}
        </Providers>
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
