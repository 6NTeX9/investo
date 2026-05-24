import Image from "next/image";
import { BadgeCheck, Building, CalendarDays, MessageSquareText } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { SearchPanel } from "@/components/home/search-panel";
import { PropertyCard } from "@/components/property/property-card";
import { testimonials } from "@/lib/data";
import { getLiveProperties } from "@/lib/live-properties";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let allList: any[] = [];
  let loadError = false;

  try {
    const all = await getLiveProperties({ limit: 200 });
    allList = all.items;
  } catch (error) {
    console.error("Failed to fetch live homepage properties from backend:", error);
    loadError = true;
  }

  const upcoming = allList.filter((property) => property.status === "UPCOMING");
  const ongoing = allList.filter((property) => property.status === "ONGOING");
  const readyCount = allList.length - upcoming.length - ongoing.length;

  return (
    <main>
      <section className="relative min-h-[calc(100svh-80px)] overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2400&q=85"
          alt="Luxury skyline residences"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/10" />
        <div className="section-shell relative flex min-h-[calc(100svh-80px)] flex-col justify-end pb-12 pt-20 text-white">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#d6bd82]">Prime city real estate advisory</p>
          <h1 className="max-w-4xl font-[var(--font-display)] text-5xl leading-tight md:text-7xl">Aurum Estate</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/78">
            Browse curated residences, commercial assets, and investment projects with a sales team built for serious property decisions.
          </p>
          <div className="mt-8 max-w-5xl">
            <SearchPanel properties={allList.map((property) => ({ city: property.city, location: property.location }))} />
          </div>
        </div>
      </section>

      <section className="section-shell mt-20 grid gap-6 md:grid-cols-3">
        {[
          ["420+", "Curated listings"],
          ["38", "Developer partners"],
          ["24h", "Visit scheduling"]
        ].map(([value, label]) => (
          <div key={label} className="border-b border-black/10 pb-6">
            <p className="text-4xl font-semibold">{value}</p>
            <p className="mt-2 text-sm text-[#68625a]">{label}</p>
          </div>
        ))}
      </section>

      <section className="section-shell mt-20">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">All listed properties</p>
            </div>
            <h2 className="mt-2 font-[var(--font-display)] text-4xl">Every property available to visitors</h2>
          </div>
          <p className="text-sm text-[#68625a]">{allList.length} published listings</p>
        </div>
        {loadError ? (
          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            Live properties could not be loaded. Please check that the backend API is running.
          </div>
        ) : allList.length === 0 ? (
          <div className="mt-8 rounded-lg border border-black/10 bg-white p-6 text-sm text-[#68625a]">
            No published properties are available yet. Add and publish a property from the admin panel to show it here.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {allList.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-24 bg-white py-20">
        <div className="section-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Project pipeline</p>
            <h2 className="mt-2 font-[var(--font-display)] text-4xl">Upcoming, ongoing, and ready homes in one clear view</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: CalendarDays, label: "Upcoming", count: upcoming.length, statusVal: "UPCOMING" },
              { icon: Building, label: "Ongoing", count: ongoing.length, statusVal: "ONGOING" },
              { icon: BadgeCheck, label: "Ready to move", count: readyCount, statusVal: "READY_TO_MOVE" }
            ].map((item) => (
              <a key={item.label} href={`/projects/${item.statusVal}`} className="rounded-lg border border-black/10 p-6 transition hover:-translate-y-1 hover:shadow-xl">
                <item.icon size={24} className="text-[#b89658]" />
                <p className="mt-5 text-3xl font-semibold">{item.count}</p>
                <p className="mt-2 text-sm text-[#68625a]">{item.label} projects</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell mt-20 grid gap-8 lg:grid-cols-[1fr_0.8fr] pb-20">
        <div className="rounded-lg bg-[#171717] p-8 text-white md:p-12">
          <MessageSquareText size={28} className="text-[#d6bd82]" />
          <h2 className="mt-8 max-w-2xl font-[var(--font-display)] text-4xl">Need a sharper shortlist before the weekend?</h2>
          <p className="mt-4 max-w-2xl text-white/70">Tell us your budget, target location, and preferred visit window. A sales advisor will build the first shortlist and coordinate direct developer access.</p>
          <LinkButton href="/contact" variant="gold" className="mt-8">Request callback</LinkButton>
        </div>
        <div className="grid gap-4">
          {testimonials.map((quote) => (
            <blockquote key={quote} className="rounded-lg bg-white p-6 text-lg leading-8 luxury-shadow">
              “{quote}”
            </blockquote>
          ))}
        </div>
      </section>
    </main>
  );
}
