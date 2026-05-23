import Link from "next/link";
import { Building2, Menu, Phone } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

const nav = [
  { href: "/properties", label: "Properties" },
  { href: "/projects/UPCOMING", label: "Upcoming" },
  { href: "/projects/ONGOING", label: "Ongoing" },
  { href: "/blog/market-outlook-2026", label: "Insights" },
  { href: "/contact", label: "Contact" }
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f7f4ee]/86 backdrop-blur-xl">
      <nav className="section-shell flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-wide">
          <span className="grid size-10 place-items-center rounded-md bg-[#171717] text-white">
            <Building2 size={20} />
          </span>
          <span>Aurum Estate</span>
        </Link>
        <div className="hidden items-center gap-7 text-sm text-[#4f4942] lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[#171717]">
              {item.label}
            </Link>
          ))}
        </div>
        <div className="hidden items-center gap-3 lg:flex">
          <LinkButton href="tel:+971552107788" variant="ghost">
            <Phone size={16} />
            <span className="ml-2">Call sales</span>
          </LinkButton>
          <LinkButton href="/admin">Admin</LinkButton>
        </div>
        <button className="grid size-11 place-items-center rounded-md border border-black/10 bg-white/70 lg:hidden" aria-label="Open menu">
          <Menu size={20} />
        </button>
      </nav>
    </header>
  );
}
