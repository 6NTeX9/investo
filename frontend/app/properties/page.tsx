import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { PropertyCard } from "@/components/property/property-card";
import { SortSelect } from "@/components/property/sort-select";
import { getLiveProperties } from "@/lib/live-properties";
import { FilterSidebar } from "@/components/property/filter-sidebar";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const metadata = {
  title: "Properties",
  description: "Search luxury residential and commercial properties by city, budget, type, status, and amenities."
};

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  
  const q = typeof params.q === "string" ? params.q : "";
  const city = typeof params.city === "string" ? params.city : "";
  const location = typeof params.location === "string" ? params.location : "";
  const minPrice = typeof params.minPrice === "string" ? Number(params.minPrice) : 0;
  const maxPrice = typeof params.maxPrice === "string" ? Number(params.maxPrice) : 0;
  const minArea = typeof params.minArea === "string" ? Number(params.minArea) : 0;
  const type = typeof params.type === "string" ? params.type : "";
  const status = typeof params.status === "string" ? params.status : "";
  const bedrooms = typeof params.bedrooms === "string" ? Number(params.bedrooms) : 0;
  const sort = typeof params.sort === "string" ? params.sort : "newest";
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const limit = 12;

  let propertiesList: any[] = [];
  let totalCount = 0;
  let totalPages = 1;
  let loadError = false;

  try {
    const apiParams: Record<string, any> = {
      page,
      limit,
      sort
    };
    if (q) apiParams.q = q;
    if (city) apiParams.city = city;
    if (location) apiParams.location = location;
    if (minPrice) apiParams.minPrice = minPrice;
    if (maxPrice) apiParams.maxPrice = maxPrice;
    if (minArea) apiParams.minArea = minArea;
    if (type) apiParams.type = type;
    if (status) apiParams.status = status;
    if (bedrooms) apiParams.bedrooms = bedrooms;

    const res = await getLiveProperties(apiParams);
    propertiesList = res.items;
    totalCount = res.meta.total || 0;
    totalPages = res.meta.pageCount || 1;
  } catch (error) {
    console.error("Failed to fetch live properties from backend:", error);
    loadError = true;
  }

  // Helper to strip page from params for links
  const getQueryWithPage = (pNum: number) => {
    const updated = { ...params, page: pNum.toString() };
    return updated;
  };

  return (
    <main className="section-shell pt-12">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end text-center md:text-left">
        <div className="w-full md:w-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Property search</p>
          <h1 className="mt-2 font-[var(--font-display)] text-4xl md:text-5xl">Available properties</h1>
        </div>
        <div className="w-full md:w-auto text-center md:text-right">
          <p className="text-sm text-[#68625a]">{totalCount} curated listings</p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr] justify-center justify-items-center lg:justify-stretch lg:justify-items-stretch">
        <FilterSidebar
          city={city}
          location={location}
          maxPrice={maxPrice}
          type={type}
          bedrooms={bedrooms}
          status={status}
          minArea={minArea}
          q={q}
          sort={sort}
        />
        <section className="w-full">
          {/* Search and Sort controls */}
          <form method="GET" action="/properties" className="mb-5 flex flex-col justify-between gap-3 rounded-lg bg-white p-4 md:flex-row md:items-center luxury-shadow border border-black/5 w-full max-w-md mx-auto lg:max-w-none">
            {/* Preserving sidebar filters */}
            {city && <input type="hidden" name="city" value={city} />}
            {location && <input type="hidden" name="location" value={location} />}
            {minPrice > 0 && <input type="hidden" name="minPrice" value={minPrice} />}
            {maxPrice > 0 && <input type="hidden" name="maxPrice" value={maxPrice} />}
            {minArea > 0 && <input type="hidden" name="minArea" value={minArea} />}
            {type && <input type="hidden" name="type" value={type} />}
            {bedrooms > 0 && <input type="hidden" name="bedrooms" value={bedrooms} />}
            {status && <input type="hidden" name="status" value={status} />}

            <div className="flex flex-1 items-center gap-2">
              <input 
                name="q" 
                defaultValue={q} 
                className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm md:min-w-80 flex-1 bg-white" 
                placeholder="Search by project, builder, landmark..." 
              />
              <button type="submit" className="rounded-md bg-[#b89658] px-5 py-3 text-sm font-semibold text-white hover:bg-[#a38144] transition">
                Search
              </button>
            </div>
            
            <SortSelect defaultValue={sort} />
          </form>

          {loadError ? (
            <div className="grid place-items-center py-20 text-center rounded-lg bg-amber-50 border border-amber-200 luxury-shadow">
              <SlidersHorizontal size={40} className="text-amber-500/50" />
              <h3 className="mt-4 font-semibold text-lg">Live properties could not be loaded</h3>
              <p className="mt-1 text-sm text-amber-800">Please check that the backend API is running.</p>
            </div>
          ) : propertiesList.length === 0 ? (
            <div className="grid place-items-center py-20 text-center rounded-lg bg-white border border-black/5 luxury-shadow">
              <SlidersHorizontal size={40} className="text-[#b89658]/40" />
              <h3 className="mt-4 font-semibold text-lg">No properties found</h3>
              <p className="mt-1 text-sm text-[#68625a]">Try widening your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 justify-center justify-items-center">
              {propertiesList.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col gap-4 items-center justify-between border-t border-black/5 pt-6 md:flex-row w-full max-w-md mx-auto lg:max-w-none">
              <p className="text-sm text-[#68625a]">
                Showing page <span className="font-semibold text-[#171717]">{page}</span> of <span className="font-semibold text-[#171717]">{totalPages}</span>
              </p>
              <div className="flex gap-2">
                <Link
                  href={{
                    pathname: "/properties",
                    query: getQueryWithPage(page - 1)
                  }}
                  className={`rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-black/5 ${page === 1 ? "pointer-events-none opacity-50" : ""}`}
                >
                  Previous
                </Link>
                <Link
                  href={{
                    pathname: "/properties",
                    query: getQueryWithPage(page + 1)
                  }}
                  className={`rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-black/5 ${page === totalPages ? "pointer-events-none opacity-50" : ""}`}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
