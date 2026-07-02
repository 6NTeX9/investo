"use client";

import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const styles = {
  primary: "bg-[#171717] !text-white hover:bg-[#2d2a26] shadow-sm hover:shadow-md",
  gold:    "bg-[#b89658] !text-[#171717] hover:bg-[#c8a96c] shadow-sm hover:shadow-[0_4px_20px_rgba(184,150,88,0.35)]",
  ghost:   "border border-black/10 bg-white/70 !text-[#171717] hover:bg-white hover:border-black/20",
};

const base =
  "focus-ring inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold select-none";

// ── Button ────────────────────────────────────────────────────────────────────
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof styles;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={cn(base, styles[variant], "transition-colors transition-shadow duration-200", className)}
      {...(props as any)}
    />
  );
}

// ── LinkButton ────────────────────────────────────────────────────────────────
type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: keyof typeof styles;
};

export function LinkButton({ className, variant = "primary", href, ...props }: LinkButtonProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="inline-flex"
    >
      <Link
        href={href}
        className={cn(base, styles[variant], "transition-colors transition-shadow duration-200 w-full", className)}
        {...props}
      />
    </motion.div>
  );
}
