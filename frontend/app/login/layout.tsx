import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Login",
  description: "Secure administrator dashboard entry for Aurum Estate.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
