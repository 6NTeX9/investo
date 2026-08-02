import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, TrendingUp, Compass, ArrowRight, Building2 } from "lucide-react";
import { LOCATIONS } from "@/lib/locations";

export const metadata: Metadata = {
  title: "Prime Bangalore Real Estate Locations & Growth Corridors | BricksNBeyond",
  description: "Explore Bangalore's top investment locations — Whitefield, Sarjapur Road, Indiranagar, Hebbal, Yelahanka & Koramangala. Property prices, growth rates & luxury listings.",
  alternates: {
    canonical: "https://www.bricksnbeyond.in/locations"
  }
};

export default function LocationsHubPage() {
  return (
    <main>
      {/* Hero Header */}
      <section className="section-shell pt-16 pb-12 border-b border-black/5">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">
          <Compass size={16} />
          Bangalore Growth Corridors
        </div>
        <h1 className="mt-3 font-[var(--font-display)] text-4xl sm:text-5xl font-bold text-[#171717]">
          Explore Prime Neighborhoods
        </h1>
        <p className="mt-4 max-w-2xl text-base sm:text-lg text-[#68625a] leading-7">
          Detailed market guides, pricing metrics, connectivity analysis, and luxury listings across Bangalore&apos;s most lucrative real estate investment corridors.
        </p>
      </section>

      {/* Locations Grid */}
      <section className="section-shell py-14 pb-24">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {LOCATIONS.map((loc) => (
            <Link key={loc.slug} href={`/locations/${loc.slug}`} className="group block">
              <article className="h-full rounded-2xl bg-white border border-black/8 luxury-shadow overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <div className="relative h-56 overflow-hidden bg-[#f0ece4]">
                  <Image
                    src={loc.heroImage}
                    alt={loc.name}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-[#171717]">
                    {loc.region}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="text-xs font-medium text-[#d6bd82] flex items-center gap-1">
                      <MapPin size={12} /> {loc.district}
                    </span>
                    <h2 className="font-[var(--font-display)] text-2xl font-bold mt-0.5 text-white">
                      {loc.name}
                    </h2>
                  </div>
                </div>

                <div className="p-6 flex flex-col justify-between gap-4">
                  <p className="text-xs sm:text-sm font-medium text-[#68625a] line-clamp-2 leading-relaxed">
                    {loc.tagline}
                  </p>

                  <div className="grid grid-cols-2 gap-3 border-y border-black/5 py-3 text-xs">
                    <div>
                      <span className="text-[#8c8275] block text-[10px] uppercase font-semibold">Avg Price</span>
                      <span className="font-semibold text-[#171717]">{loc.avgPriceSqft} / sqft</span>
                    </div>
                    <div>
                      <span className="text-[#8c8275] block text-[10px] uppercase font-semibold">Appreciation</span>
                      <span className="font-semibold text-[#b89658] flex items-center gap-0.5">
                        <TrendingUp size={11} /> {loc.growthRate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs font-semibold text-[#b89658] group-hover:text-[#8a6e38]">
                    <span className="flex items-center gap-1.5">
                      <Building2 size={14} /> View Properties &amp; Guide
                    </span>
                    <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
