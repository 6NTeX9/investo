import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  MapPin, 
  TrendingUp, 
  Train, 
  Plane, 
  CheckCircle2, 
  ArrowLeft, 
  Phone, 
  Mail, 
  Building2, 
  Sparkles, 
  ArrowRight 
} from "lucide-react";
import { getLocationBySlug, LOCATIONS } from "@/lib/locations";
import { getLiveProperties } from "@/lib/live-properties";
import { PropertyCard } from "@/components/property/property-card";
import { normalizeProperty } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const loc = getLocationBySlug(slug);
  if (!loc) return { title: "Location Not Found | BricksNBeyond" };

  const canonicalUrl = `https://www.bricksnbeyond.in/locations/${loc.slug}`;

  return {
    title: loc.metaTitle,
    description: loc.metaDescription,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: loc.metaTitle,
      description: loc.metaDescription,
      url: canonicalUrl,
      images: [loc.heroImage]
    }
  };
}

export default async function LocationDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const loc = getLocationBySlug(slug);
  if (!loc) notFound();

  // Fetch properties matching this location (case-insensitive substring match)
  let locationProperties: any[] = [];
  try {
    const response = await getLiveProperties({ limit: 50 });
    const allItems = response.items || [];
    locationProperties = allItems
      .map(normalizeProperty)
      .filter((p: any) => 
        p && 
        (p.location?.toLowerCase().includes(loc.slug) || 
         p.location?.toLowerCase().includes(loc.name.toLowerCase()) ||
         p.address?.toLowerCase().includes(loc.name.toLowerCase()))
      );
  } catch (error) {
    console.error("Failed to fetch location properties:", error);
  }

  const otherLocations = LOCATIONS.filter((l) => l.slug !== loc.slug).slice(0, 4);

  // Schema.org JSON-LD Breadcrumbs & Real Estate Listing
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.bricksnbeyond.in"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Locations",
            "item": "https://www.bricksnbeyond.in/locations"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": loc.name,
            "item": `https://www.bricksnbeyond.in/locations/${loc.slug}`
          }
        ]
      },
      {
        "@type": "Place",
        "name": `${loc.name}, Bangalore`,
        "description": loc.description,
        "containedInPlace": {
          "@type": "City",
          "name": "Bangalore"
        }
      }
    ]
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      {/* Hero Banner */}
      <section className="relative h-[360px] sm:h-[440px] w-full overflow-hidden bg-black">
        <Image
          src={loc.heroImage}
          alt={loc.name}
          fill
          priority
          className="object-cover opacity-60"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#171717] via-black/40 to-black/20" />

        <div className="section-shell relative h-full flex flex-col justify-end pb-10 text-white">
          <Link
            href="/locations"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d6bd82] hover:text-white transition mb-4 w-fit bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10"
          >
            <ArrowLeft size={13} /> Back to All Locations
          </Link>
          <div className="flex items-center gap-2 text-xs uppercase font-semibold tracking-widest text-[#d6bd82]">
            <MapPin size={14} /> {loc.region} &bull; {loc.district}
          </div>
          <h1 className="mt-1 font-[var(--font-display)] text-3xl sm:text-5xl font-bold tracking-tight text-white">
            {loc.name} Real Estate
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-neutral-300">
            {loc.tagline}
          </p>
        </div>
      </section>

      {/* Key Metrics Bar */}
      <section className="bg-[#171717] text-white border-y border-white/10 py-6">
        <div className="section-shell grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <span className="text-[10px] sm:text-xs uppercase font-semibold text-[#b89658] block">Avg Price / Sqft</span>
            <span className="text-base sm:text-xl font-bold text-white mt-1 block">{loc.avgPriceSqft}</span>
          </div>
          <div>
            <span className="text-[10px] sm:text-xs uppercase font-semibold text-[#b89658] block flex items-center gap-1">
              <TrendingUp size={12} /> YoY Growth
            </span>
            <span className="text-base sm:text-xl font-bold text-[#d6bd82] mt-1 block">{loc.growthRate}</span>
          </div>
          <div>
            <span className="text-[10px] sm:text-xs uppercase font-semibold text-[#b89658] block flex items-center gap-1">
              <Train size={12} /> Metro Status
            </span>
            <span className="text-xs sm:text-sm font-semibold text-white mt-1 block truncate">{loc.metroStatus}</span>
          </div>
          <div>
            <span className="text-[10px] sm:text-xs uppercase font-semibold text-[#b89658] block flex items-center gap-1">
              <Plane size={12} /> Airport Distance
            </span>
            <span className="text-xs sm:text-sm font-semibold text-white mt-1 block">{loc.airportDistance}</span>
          </div>
        </div>
      </section>

      {/* Available Properties in this Location */}
      <section className="section-shell py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#b89658]">Featured Listings</p>
            <h2 className="font-[var(--font-display)] text-3xl font-bold text-[#171717]">
              Properties in {loc.name}
            </h2>
          </div>
          <Link
            href={`/properties?location=${encodeURIComponent(loc.name)}`}
            className="text-xs font-semibold text-[#b89658] hover:underline flex items-center gap-1"
          >
            View all matching properties <ArrowRight size={13} />
          </Link>
        </div>

        {locationProperties.length === 0 ? (
          <div className="rounded-2xl border border-black/8 bg-white p-8 text-center luxury-shadow">
            <Building2 size={36} className="mx-auto text-[#b89658] mb-3" />
            <h3 className="font-semibold text-lg text-[#171717]">Exclusive Off-Market Inventory Available</h3>
            <p className="mt-1 text-sm text-[#68625a] max-w-lg mx-auto">
              We have confidential luxury pre-launches &amp; private seller inventory in {loc.name}. Contact our advisory desk for private viewings.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <a
                href="tel:+919006206309"
                className="inline-flex items-center gap-2 rounded-xl bg-[#b89658] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#a38347] transition"
              >
                <Phone size={14} /> Call Sales Desk
              </a>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {locationProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>

      {/* Market Overview & Investment Highlights */}
      <section className="section-shell py-12 border-t border-black/8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="font-[var(--font-display)] text-3xl font-bold text-[#171717]">
              Why Invest in {loc.name}?
            </h2>
            <p className="mt-4 text-base text-[#4f4942] leading-8">
              {loc.description}
            </p>

            <h3 className="mt-8 font-semibold text-lg text-[#171717] flex items-center gap-2">
              <Sparkles size={18} className="text-[#b89658]" /> Location Advantages
            </h3>
            <ul className="mt-4 grid gap-3">
              {loc.highlights.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-[#4f4942] leading-6 bg-white p-3.5 rounded-xl border border-black/5 luxury-shadow">
                  <CheckCircle2 size={18} className="text-[#b89658] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sidebar Advisory Card */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 border border-black/8 luxury-shadow">
              <h3 className="font-[var(--font-display)] text-xl font-bold text-[#171717]">
                Connect with a {loc.name} Real Estate Advisor
              </h3>
              <p className="mt-2 text-xs text-[#68625a] leading-5">
                Speak directly with our senior Bangalore advisors for market trends, price negotiations, and verified property walkthroughs.
              </p>

              <div className="mt-5 space-y-3">
                <a
                  href="tel:+918045678900"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#171717] px-4 py-3 text-xs font-semibold text-white hover:bg-[#2a2a2a] transition w-full"
                >
                  <Phone size={14} className="text-[#b89658]" /> Call +91 804 567 8900
                </a>
                <a
                  href="mailto:hello@bricksnbeyond.in"
                  className="flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-neutral-50 px-4 py-3 text-xs font-semibold text-[#171717] hover:bg-white transition w-full"
                >
                  <Mail size={14} /> Request Callback
                </a>
              </div>
            </div>

            {/* Key Landmarks */}
            <div className="rounded-2xl bg-[#f7f4ee] p-6 border border-black/8">
              <h4 className="text-xs uppercase font-semibold tracking-wider text-[#b89658] mb-3">
                Key Landmarks &amp; Hubs
              </h4>
              <div className="flex flex-wrap gap-2">
                {loc.topAttractions.map((spot, i) => (
                  <span key={i} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-[#4f4942] border border-black/5 shadow-2xs">
                    {spot}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Other Locations */}
      {otherLocations.length > 0 && (
        <section className="section-shell py-14 border-t border-black/8 bg-neutral-50">
          <h2 className="font-[var(--font-display)] text-2xl font-bold text-[#171717] mb-6">
            Explore Other Bangalore Corridors
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {otherLocations.map((other) => (
              <Link
                key={other.slug}
                href={`/locations/${other.slug}`}
                className="group flex items-center justify-between p-4 rounded-xl bg-white border border-black/5 luxury-shadow hover:border-[#b89658]/40 transition"
              >
                <div>
                  <h3 className="font-semibold text-sm text-[#171717] group-hover:text-[#b89658] transition">
                    {other.name}
                  </h3>
                  <span className="text-[11px] text-[#8c8275]">{other.region}</span>
                </div>
                <ArrowRight size={15} className="text-[#b89658] transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
