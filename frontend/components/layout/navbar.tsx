import Link from "next/link";
import { Building2, Menu, Phone } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

// ── Instagram SVG icon (inline so no extra dependency needed) ──────────────
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const nav = [
  { href: "/properties", label: "Properties" },
  { href: "/agents", label: "Agents" },
  { href: "/blog", label: "Insights" },
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About Us" }
];

// ── Replace this with your Instagram profile URL when ready ───────────────
const INSTAGRAM_URL = "https://www.instagram.com/";

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
          {/* Instagram icon */}
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Instagram"
            className="grid size-9 place-items-center rounded-md text-[#4f4942] transition hover:bg-black/5 hover:text-[#171717]"
          >
            <InstagramIcon size={18} />
          </a>

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
