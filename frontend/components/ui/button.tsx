import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const styles = {
  primary: "bg-[#171717] !text-white hover:bg-[#2d2a26]",
  gold: "bg-[#b89658] !text-[#171717] hover:bg-[#c8a96c]",
  ghost: "border border-black/10 bg-white/70 !text-[#171717] hover:bg-white"
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof styles;
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn("focus-ring inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition", styles[variant], className)}
      {...props}
    />
  );
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: keyof typeof styles;
};

export function LinkButton({ className, variant = "primary", href, ...props }: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={cn("focus-ring inline-flex min-h-11 items-center justify-center rounded-md px-5 py-2.5 text-sm font-semibold transition", styles[variant], className)}
      {...props}
    />
  );
}
