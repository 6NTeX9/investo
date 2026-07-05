"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface FilterSidebarProps {
  city: string;
  location: string;
  maxPrice: number;
  type: string;
  bedrooms: number;
  status: string;
  minArea: number;
  q: string;
  sort: string;
}

export function FilterSidebar({
  city,
  location,
  maxPrice,
  type,
  bedrooms,
  status,
  minArea,
  q,
  sort,
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <aside className="h-fit rounded-lg bg-white p-4 lg:p-5 luxury-shadow w-full max-w-md lg:max-w-none mx-auto border border-black/5">
      {/* Mobile Toggle Button Header */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between font-semibold text-base text-[#171717] lg:cursor-default"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-[#b89658]" />
          <span>Filters</span>
        </span>
        <span className="lg:hidden text-xs font-semibold text-[#b89658] flex items-center gap-1">
          {isOpen ? "Hide options" : "Show options"}
          {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {/* Collapsible Form Container */}
      <form
        method="GET"
        action="/properties"
        className={`mt-4 grid gap-4 transition-all duration-300 ${
          isOpen ? "block" : "hidden lg:grid"
        }`}
      >
        {/* Hidden fields to preserve search and sort */}
        {q && <input type="hidden" name="q" value={q} />}
        {sort && <input type="hidden" name="sort" value={sort} />}
        {minArea ? <input type="hidden" name="minArea" value={minArea} /> : null}

        <label className="grid gap-1.5 text-xs font-semibold text-[#68625a]">
          City
          <input
            name="city"
            defaultValue={city}
            className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm text-[#171717] bg-white focus:border-[#b89658]/50"
            placeholder="e.g. Mumbai"
          />
        </label>
        
        <label className="grid gap-1.5 text-xs font-semibold text-[#68625a]">
          Location / Community
          <input
            name="location"
            defaultValue={location}
            className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm text-[#171717] bg-white focus:border-[#b89658]/50"
            placeholder="e.g. Worli"
          />
        </label>

        <label className="grid gap-1.5 text-xs font-semibold text-[#68625a]">
          Max Price (₹)
          <input
            type="number"
            name="maxPrice"
            defaultValue={maxPrice || ""}
            className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm text-[#171717] bg-white focus:border-[#b89658]/50"
            placeholder="e.g. 50000000"
          />
        </label>

        <label className="grid gap-1.5 text-xs font-semibold text-[#68625a]">
          Property Type
          <select
            name="type"
            defaultValue={type}
            className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm text-[#171717] bg-white focus:border-[#b89658]/50"
          >
            <option value="">Any Type</option>
            <option value="APARTMENT">Apartment</option>
            <option value="VILLA">Villa</option>
            <option value="PENTHOUSE">Penthouse</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="PLOT">Plot</option>
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-semibold text-[#68625a]">
          Min Bedrooms
          <input
            type="number"
            name="bedrooms"
            defaultValue={bedrooms || ""}
            className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm text-[#171717] bg-white focus:border-[#b89658]/50"
            placeholder="e.g. 3"
          />
        </label>

        <label className="grid gap-1.5 text-xs font-semibold text-[#68625a]">
          Project Status
          <select
            name="status"
            defaultValue={status}
            className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm text-[#171717] bg-white focus:border-[#b89658]/50"
          >
            <option value="">Any Status</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ONGOING">Ongoing</option>
            <option value="READY_TO_MOVE">Ready to Move</option>
          </select>
        </label>

        <label className="grid gap-1.5 text-xs font-semibold text-[#68625a]">
          Min Carpet Area (sqft)
          <select
            name="minArea"
            defaultValue={minArea || ""}
            className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm text-[#171717] bg-white focus:border-[#b89658]/50"
          >
            <option value="">Any Area</option>
            <option value="500">500+ sqft</option>
            <option value="900">900+ sqft</option>
            <option value="1200">1200+ sqft</option>
            <option value="1500">1500+ sqft</option>
            <option value="2000">2000+ sqft</option>
            <option value="3000">3000+ sqft</option>
          </select>
        </label>

        <div className="grid gap-2 pt-2">
          <button
            type="submit"
            className="rounded-md bg-[#171717] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a]"
          >
            Apply filters
          </button>
          <Link
            href="/properties"
            className="rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm font-semibold text-center text-[#171717] hover:bg-black/5 transition"
          >
            Clear Filters
          </Link>
        </div>
      </form>
    </aside>
  );
}
