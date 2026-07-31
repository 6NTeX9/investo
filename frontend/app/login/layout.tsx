import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Secure administrator dashboard entry for BricksNBeyond.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
