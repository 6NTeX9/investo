import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@/lib/analytics";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Aurum Estate | Luxury Properties",
    template: "%s | Aurum Estate"
  },
  description: "Discover premium residences, investment projects, and commercial real estate in fast-growing city corridors.",
  openGraph: {
    title: "Aurum Estate",
    description: "Premium real estate discovery and advisory platform.",
    type: "website"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${playfair.variable}`}>
      <body>
        <Analytics />
        <Navbar />
        {children}
        <Footer />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
