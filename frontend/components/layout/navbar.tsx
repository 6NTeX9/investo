"use client";

import Link from "next/link";
import { Building2, Menu, Moon, Phone, Sun, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);

  // Sync dark mode state on mount from localStorage / OS preference
  useEffect(() => {
    const stored = localStorage.getItem("crm_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const dark = stored ? stored === "dark" : prefersDark;
    setIsDark(dark);
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("crm_theme", next ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[#f7f4ee]/86 backdrop-blur-xl">
      <nav className="section-shell flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-semibold tracking-wide" onClick={closeMenu}>
          <span className="grid size-10 place-items-center rounded-md bg-[#171717] text-white">
            <Building2 size={20} />
          </span>
          <span>Investo Properties</span>
        </Link>

        <div className="hidden items-center gap-7 text-sm text-[#4f4942] lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link transition hover:text-[#171717]">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Desktop right-side controls */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Dark mode toggle */}
          <button
            type="button"
            onClick={toggleDark}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="grid size-9 place-items-center rounded-md text-[#4f4942] transition hover:bg-black/5 hover:text-[#171717]"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

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

        {/* Mobile: Call sales + hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <a
            href="tel:+971552107788"
            className="flex items-center gap-1.5 rounded-md border border-black/10 bg-white/70 px-2 py-1.5 text-xs font-semibold text-[#171717] transition hover:bg-white"
            aria-label="Call sales"
          >
            <Phone size={13} />
            <span>Call sales</span>
          </a>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-md border border-black/10 bg-white/70 transition hover:bg-white"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Dismiss backdrop overlay */}
      <div
        className={`backdrop-overlay absolute inset-x-0 top-full z-40 h-[calc(100dvh-5rem)] bg-black/30 backdrop-blur-[2px] lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
      />

      {/* Slide-out mobile menu */}
      <div
        id="mobile-navigation"
        className={`absolute right-0 top-full z-50 h-[calc(100dvh-5rem)] w-[min(86vw,22rem)] overflow-y-auto border-l border-black/10 bg-[#f7f4ee] px-6 py-6 shadow-2xl lg:hidden transition-transform duration-300 ease-out ${
          isMenuOpen ? "translate-x-0 pointer-events-auto" : "translate-x-full pointer-events-none"
        }`}
      >
        <div className="grid gap-2">
          {nav.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className="block rounded-md px-3 py-3 text-base font-semibold text-[#292520] transition hover:bg-black/5"
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 border-t border-black/10 pt-5">
          <LinkButton href="/admin" className="justify-center" onClick={closeMenu}>
            Admin
          </LinkButton>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow us on Instagram"
            className="flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold text-[#4f4942]"
            onClick={closeMenu}
          >
            <InstagramIcon size={18} />
            Instagram
          </a>
          {/* Dark mode toggle in mobile drawer */}
          <button
            type="button"
            onClick={() => {
              toggleDark();
              closeMenu();
            }}
            className="flex items-center justify-center gap-2 rounded-md border border-black/10 bg-white/70 px-4 py-3 text-sm font-semibold text-[#4f4942] transition hover:bg-black/5"
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {isDark ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </div>
    </header>
  );
}
