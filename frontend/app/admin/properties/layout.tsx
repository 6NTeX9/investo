import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Properties",
};

export default function AdminPropertiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
