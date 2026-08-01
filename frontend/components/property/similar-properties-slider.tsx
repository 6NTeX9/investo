"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PropertyCard } from "@/components/property/property-card";

interface SimilarPropertiesSliderProps {
  properties: any[];
}

export function SimilarPropertiesSlider({ properties }: SimilarPropertiesSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!properties || properties.length === 0) return null;

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  return (
    <section className="section-shell mt-12 sm:mt-16 border-t border-black/5 pt-10">
      {/* Header & Controls */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#b89658]">
            Recommendations
          </p>
          <h2 className="font-[var(--font-display)] text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-[#171717]">
            Similar properties
          </h2>
        </div>

        {/* Scroll Arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleScrollLeft}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-[#171717] shadow-sm transition hover:bg-[#171717] hover:text-white hover:border-[#171717] active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={handleScrollRight}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-[#171717] shadow-sm transition hover:bg-[#171717] hover:text-white hover:border-[#171717] active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Amazon-style Horizontal Scroll Container */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 py-2 px-1 scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {properties.map((property) => (
          <div
            key={property.id}
            className="w-[285px] sm:w-[340px] shrink-0 snap-start h-full"
          >
            <PropertyCard property={property} />
          </div>
        ))}
      </div>
    </section>
  );
}
