import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-24 bg-[#171717] py-14 text-white">
      <div className="section-shell grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
        <div>
          <p className="text-xl font-semibold">Investo Properties</p>
          <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
            Premium real estate advisory for residential, commercial, and investment-led property decisions.
          </p>
        </div>
        <div className="grid gap-3 text-sm text-white/70">
          <Link href="/properties">Properties</Link>
          <Link href="/projects/READY_TO_MOVE">Ready to move</Link>
          <Link href="/contact">Book a consultation</Link>
        </div>
        <div className="text-sm text-white/70">
          <p>Bangalore, India</p>
          <p className="mt-2">hello@investoproperties.com</p>
          <p className="mt-2">Instagram · LinkedIn · YouTube</p>
        </div>
      </div>
    </footer>
  );
}
