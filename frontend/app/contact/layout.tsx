import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with BricksNBeyond real estate advisors. Book a site visit or request a callback.",
  alternates: {
    canonical: "https://www.bricksnbeyond.in/contact"
  }
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
