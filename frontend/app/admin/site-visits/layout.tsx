import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Site Visits",
};

export default function SiteVisitsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
