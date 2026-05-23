"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { properties } from "@/lib/data";

export function SearchPanel() {
  const [city, setCity] = useState("Dubai");
  const locations = useMemo(() => [...new Set(properties.filter((property) => property.city === city).map((property) => property.location))], [city]);

  return (
    <form action="/properties" className="glass grid gap-3 rounded-lg p-3 shadow-2xl md:grid-cols-[1fr_1fr_1fr_auto]">
      <label className="grid gap-1 rounded-md bg-white px-4 py-3 text-xs font-semibold text-[#68625a]">
        City
        <select name="city" value={city} onChange={(event) => setCity(event.target.value)} className="bg-transparent text-sm font-medium text-[#171717] outline-none">
          <option>Dubai</option>
        </select>
      </label>
      <label className="grid gap-1 rounded-md bg-white px-4 py-3 text-xs font-semibold text-[#68625a]">
        Location
        <select name="location" className="bg-transparent text-sm font-medium text-[#171717] outline-none">
          <option value="">Any district</option>
          {locations.map((location) => (
            <option key={location}>{location}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 rounded-md bg-white px-4 py-3 text-xs font-semibold text-[#68625a]">
        Budget
        <select name="maxPrice" className="bg-transparent text-sm font-medium text-[#171717] outline-none">
          <option value="">Any budget</option>
          <option value="2000000">Under AED 2M</option>
          <option value="5000000">Under AED 5M</option>
          <option value="10000000">Under AED 10M</option>
        </select>
      </label>
      <Button type="submit" variant="gold" className="gap-2">
        <Search size={18} />
        Search
      </Button>
      <button type="button" className="flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-[#4f4942] md:hidden">
        <SlidersHorizontal size={17} />
        Filters
      </button>
    </form>
  );
}
