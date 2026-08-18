"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { useState } from "react";
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
const INSTAGRAM_URL = "https://www.instagram.com/bricksnbeyond.in/";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-black/8 bg-[#f7f4ee]/95 backdrop-blur-xl transition-all duration-300">
      <nav className="section-shell flex h-14 sm:h-16 md:h-20 items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0" onClick={closeMenu}>
          <div className="relative size-8 sm:size-9 overflow-hidden rounded-full border border-[#b89658]/30 shadow-xs transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/favicon.png"
              alt="BricksNBeyond Logo"
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          </div>
          <span className="font-[var(--font-display)] text-base sm:text-lg md:text-xl font-bold tracking-tight text-[#171717]">
            Bricks<span className="text-[#b89658] italic font-serif">N</span>Beyond
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden items-center gap-6 xl:gap-8 text-sm font-medium text-[#4f4942] lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link transition hover:text-[#171717]">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop Controls */}
        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Instagram"
            className="grid size-9 place-items-center rounded-full text-[#4f4942] transition hover:bg-black/5 hover:text-[#171717]"
          >
            <InstagramIcon size={18} />
          </a>

          <LinkButton href="tel:+919006206309" variant="ghost" className="gap-2 text-xs font-semibold">
            <Phone size={14} className="text-[#b89658]" />
            <span>Call Sales</span>
          </LinkButton>
          <LinkButton href="/admin">Admin</LinkButton>
        </div>

        {/* Mobile Top Shelf Actions */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="tel:+919006206309"
            className="flex items-center gap-1.5 rounded-full border border-[#b89658]/40 bg-[#b89658]/10 px-2.5 py-1.5 text-xs font-semibold text-[#b89658] transition-all hover:bg-[#b89658]/20 shadow-xs"
            aria-label="Call sales"
          >
            <Phone size={13} className="text-[#b89658]" />
            <span className="text-[11px] font-semibold">Call Sales</span>
          </a>

          <button
            type="button"
            className="grid size-9 place-items-center rounded-full border border-black/10 bg-white/80 text-[#171717] transition-all hover:bg-white shadow-xs"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Dismiss backdrop overlay */}
      <div
        className={`backdrop-overlay fixed inset-0 top-14 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
      />

      {/* Slide-out mobile drawer menu */}
      <div
        id="mobile-navigation"
        className={`fixed right-0 top-14 z-50 h-[calc(100dvh-3.5rem)] w-[min(84vw,20rem)] overflow-y-auto border-l border-black/10 bg-[#f7f4ee] px-5 py-6 shadow-2xl lg:hidden transition-transform duration-300 ease-out ${
          isMenuOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
        }`}
      >
        <div className="grid gap-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3.5 py-2.5 text-sm font-semibold text-[#292520] transition hover:bg-black/5"
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-6 grid gap-2.5 border-t border-black/10 pt-5">
          <a
            href="tel:+919006206309"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#b89658] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#a38347]"
            onClick={closeMenu}
          >
            <Phone size={14} />
            Call Sales Advisory
          </a>
          <LinkButton href="/admin" className="justify-center rounded-xl py-2.5 text-xs" onClick={closeMenu}>
            Admin Portal
          </LinkButton>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Instagram"
            className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white/80 px-4 py-2.5 text-xs font-semibold text-[#4f4942] hover:bg-white"
            onClick={closeMenu}
          >
            <InstagramIcon size={16} />
            Follow on Instagram
          </a>
        </div>
      </div>
    </header>
  );
}
