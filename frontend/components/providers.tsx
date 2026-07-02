"use client";

import { PageTransition } from "@/components/ui/page-transition";

export function Providers({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
