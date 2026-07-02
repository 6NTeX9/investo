import Image from "next/image";
import { BadgeCheck, Building, CalendarDays, MessageSquareText } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { SearchPanel } from "@/components/home/search-panel";
import { PropertyCard } from "@/components/property/property-card";
import { testimonials } from "@/lib/data";
import { getLiveProperties } from "@/lib/live-properties";
import { FadeUp, StaggerContainer, StaggerItem, Parallax, Float } from "@/components/ui/scroll-animation";

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
    <main className="overflow-x-hidden">
      <section className="relative min-h-[calc(100svh-80px)]">
        {/* Parallax hero image — moves slower than scroll for depth */}
        <div className="absolute inset-0 overflow-hidden">
          <Parallax speed={0.25} className="absolute inset-0 h-[120%] -top-[10%]">
            <Image
              src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=2400&q=85"
              alt="Luxury skyline residences"
              fill
              priority
              className="object-cover"
            />
          </Parallax>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/20" />
        </div>
        <div className="section-shell relative flex min-h-[calc(100svh-80px)] flex-col justify-end pb-12 pt-24 md:pt-20 text-white">
          <StaggerContainer delayChildren={0.15} staggerChildren={0.12}>
            <StaggerItem>
              <p className="mb-4 text-xs sm:text-sm font-semibold uppercase tracking-[0.24em] text-[#d6bd82]">Prime city real estate advisory</p>
            </StaggerItem>
            <StaggerItem>
              <h1 className="max-w-4xl font-[var(--font-display)] text-4xl sm:text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] md:leading-none">
                Investo Properties
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-5 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-white/80">
                Browse curated residences, commercial assets, and investment projects with a sales team built for serious property decisions.
              </p>
            </StaggerItem>
            <StaggerItem className="mt-8 max-w-5xl">
              <SearchPanel properties={allList.map((property) => ({ city: property.city, location: property.location }))} />
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>


      <section className="section-shell mt-16 md:mt-24">
        <StaggerContainer className="grid gap-4 grid-cols-3 md:gap-6 text-center sm:text-left">
          {[
            ["420+", "Curated listings"],
            ["38", "Developer partners"],
            ["24h", "Visit scheduling"]
          ].map(([value, label], index) => (
            <StaggerItem key={label} className="border-b border-black/10 pb-4 sm:pb-6 hover:border-[#b89658]/40 transition-colors duration-300">
              <p className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-[#171717]">{value}</p>
              <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm text-[#68625a] font-medium leading-tight">{label}</p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      <section className="section-shell mt-16 md:mt-24">
        <FadeUp>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-black/5 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">All listed properties</p>
              </div>
              <h2 className="mt-2 font-[var(--font-display)] text-3xl md:text-4xl tracking-tight">Every property available to visitors</h2>
            </div>
            <p className="text-xs sm:text-sm text-[#68625a] font-medium">{allList.length} published listings</p>
          </div>
        </FadeUp>
        {loadError ? (
          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
            Live properties could not be loaded. Please check that the backend API is running.
          </div>
        ) : allList.length === 0 ? (
          <div className="mt-8 rounded-lg border border-black/10 bg-white p-6 text-sm text-[#68625a]">
            No published properties are available yet. Add and publish a property from the admin panel to show it here.
          </div>
        ) : (
          <StaggerContainer className="mt-8 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 properties-grid">
            {allList.map((property) => (
              <StaggerItem key={property.id} className="h-full property-card-wrapper">
                <PropertyCard property={property} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      <section className="mt-20 md:mt-28 bg-[#fdfdfc] py-16 md:py-24 border-y border-black/5">
        <div className="section-shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <FadeUp className="flex flex-col justify-center">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Project pipeline</p>
            <h2 className="mt-2 font-[var(--font-display)] text-3xl md:text-4xl tracking-tight leading-tight">Upcoming, ongoing, and ready homes in one clear view</h2>
          </FadeUp>
          <StaggerContainer className="grid gap-3 grid-cols-3 md:gap-4">
            {[
              { icon: CalendarDays, label: "Upcoming", count: upcoming.length, statusVal: "UPCOMING" },
              { icon: Building, label: "Ongoing", count: ongoing.length, statusVal: "ONGOING" },
              { icon: BadgeCheck, label: "Ready to move", count: readyCount, statusVal: "READY_TO_MOVE" }
            ].map((item, index) => (
              <StaggerItem key={item.label} className="h-full">
                <Float delay={index * 0.3} duration={5} yDelta={5} className="h-full">
                  <a href={`/projects/${item.statusVal}`} className="block h-full rounded-lg border border-black/10 p-3 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#b89658]/30 bg-white text-center sm:text-left">
                    <item.icon size={20} className="text-[#b89658] mx-auto sm:mx-0" />
                    <p className="mt-3 sm:mt-5 text-2xl sm:text-3xl font-semibold tracking-tight">{item.count}</p>
                    <p className="mt-1 sm:mt-2 text-[10px] sm:text-xs md:text-sm text-[#68625a] font-medium leading-tight">
                      {item.label} <span className="hidden sm:inline">projects</span>
                    </p>
                  </a>
                </Float>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="section-shell mt-16 md:mt-24 grid gap-8 grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] pb-20">
        <FadeUp className="h-full">
          <div className="rounded-lg bg-[#171717] p-8 text-white md:p-12 h-full flex flex-col justify-between">
            <div>
              <MessageSquareText size={28} className="text-[#d6bd82]" />
              <h2 className="mt-6 md:mt-8 max-w-2xl font-[var(--font-display)] text-3xl md:text-4xl tracking-tight leading-tight">Need a sharper shortlist before the weekend?</h2>
              <p className="mt-4 max-w-2xl text-xs sm:text-sm md:text-base text-white/70 leading-relaxed">Tell us your budget, target location, and preferred visit window. A sales advisor will build the first shortlist and coordinate direct developer access.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/contact" variant="gold" className="transition-transform active:scale-95 duration-200">Request callback</LinkButton>
              <LinkButton href="/contact?tab=visit" variant="ghost" className="transition-transform active:scale-95 duration-200 !border-white/25 !text-white !bg-white/10 hover:!bg-white/20">Book site visit</LinkButton>
            </div>
          </div>
        </FadeUp>
        <StaggerContainer className="grid gap-4 h-fit">
          {testimonials.map((quote) => (
            <StaggerItem key={quote}>
              <blockquote className="rounded-lg bg-white p-6 text-sm sm:text-base md:text-lg leading-relaxed md:leading-8 luxury-shadow border border-black/5 hover:border-[#b89658]/20 transition-colors duration-300">
                “{quote}”
              </blockquote>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>
    </main>
  );
}

