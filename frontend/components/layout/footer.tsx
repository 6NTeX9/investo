import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 bg-[#171717] py-14 text-white">
      <div className="section-shell grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/favicon.png" alt="BricksNBeyond Logo" width={36} height={36} className="rounded-full shadow-sm" />
            <p className="font-[var(--font-display)] text-2xl font-bold tracking-tight text-white">
              Bricks<span className="text-[#d6bd82] italic font-serif">N</span>Beyond
            </p>
          </div>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
            Premium real estate advisory for residential, commercial, and investment-led property decisions.
          </p>
        </div>
        <div className="grid gap-2.5 text-sm text-white/70">
          <Link href="/properties" className="hover:text-white transition">Properties</Link>
          <Link href="/locations" className="hover:text-white transition">Bangalore Corridors</Link>
          <Link href="/locations/whitefield" className="hover:text-white transition text-xs text-white/50">Whitefield Properties</Link>
          <Link href="/locations/sarjapur-road" className="hover:text-white transition text-xs text-white/50">Sarjapur Road Villas</Link>
          <Link href="/locations/indiranagar" className="hover:text-white transition text-xs text-white/50">Indiranagar Luxury</Link>
        </div>
        <div className="text-sm text-white/70">
          <p className="mt-2">
            <a href="mailto:hello&#64;bricksnbeyond&#46;in" className="hover:text-white transition">
              hello&#64;bricksnbeyond&#46;in
            </a>
          </p>
          <p className="mt-2">Instagram · LinkedIn · YouTube</p>
        </div>
      </div>
    </footer>
  );
}
