import { SlidersHorizontal } from "lucide-react";
import { PropertyCard } from "@/components/property/property-card";
import { properties } from "@/lib/data";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata = {
  title: "Properties",
  description: "Search luxury residential and commercial properties by city, budget, type, status, and amenities."
};

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const city = typeof params.city === "string" ? params.city : "";
  const location = typeof params.location === "string" ? params.location : "";
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : 0;

  const filtered = properties.filter((property) => {
    if (city && property.city !== city) return false;
    if (location && property.location !== location) return false;
    if (maxPrice && property.price > maxPrice) return false;
    return true;
  });

  return (
    <main className="section-shell pt-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Property search</p>
          <h1 className="mt-2 font-[var(--font-display)] text-5xl">Available properties</h1>
        </div>
        <p className="text-sm text-[#68625a]">{filtered.length} curated listings</p>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-lg bg-white p-5 luxury-shadow">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
            <SlidersHorizontal size={18} />
          </div>
          <form className="mt-5 grid gap-4">
            {["City", "Location", "Budget range", "Property type", "Bedrooms/BHK", "Project status", "Amenities"].map((label) => (
              <label key={label} className="grid gap-2 text-sm font-medium">
                {label}
                <input className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm" placeholder={`Any ${label.toLowerCase()}`} />
              </label>
            ))}
            <button className="rounded-md bg-[#171717] px-4 py-3 text-sm font-semibold text-white">Apply filters</button>
          </form>
        </aside>
        <section>
          <div className="mb-5 flex flex-col justify-between gap-3 rounded-lg bg-white p-4 md:flex-row md:items-center">
            <input className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm md:min-w-80" placeholder="Search by project, builder, landmark" />
            <select className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm">
              <option>Newest listings</option>
              <option>Price low to high</option>
              <option>Price high to low</option>
            </select>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
