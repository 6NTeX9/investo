import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Cormorant_Garamond } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import { Analytics } from "@/lib/analytics";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Providers } from "@/components/providers";
import "./globals.css";

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap"
});

const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.bricksnbeyond.in"),
  title: {
    default: "BricksNBeyond | Premium Real Estate Advisory in Bangalore",
    template: "%s | BricksNBeyond"
  },
  description: "Explore luxury properties in Bangalore with BricksNBeyond. Browse premium apartments, villas, and commercial real estate with expert investment advisory.",
  alternates: {
    canonical: "./"
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ]
  },
  openGraph: {
    title: "BricksNBeyond | Premium Real Estate Advisory in Bangalore",
    description: "Explore luxury properties in Bangalore with BricksNBeyond. Browse premium apartments, villas, and commercial real estate with expert investment advisory.",
    url: "https://www.bricksnbeyond.in",
    siteName: "BricksNBeyond",
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "BricksNBeyond | Premium Real Estate Advisory in Bangalore",
    description: "Explore luxury properties in Bangalore with BricksNBeyond. Browse premium apartments, villas, and commercial real estate with expert investment advisory."
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sansFont.variable} ${displayFont.variable} light`} style={{ colorScheme: "light" }}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://nv3jinq3tz.ufs.sh" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#f7f4ee] text-[#151515] font-sans">
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
