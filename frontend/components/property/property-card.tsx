"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BedDouble, MapPin, Timer, Maximize, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function PropertyCard({ property }: { property: any }) {
  // Extract ONLY real images associated with this property
  const realImages: string[] = [];

  if (property.heroImage) {
    realImages.push(property.heroImage);
  }
  
  if (Array.isArray(property.images)) {
    property.images.forEach((img: any) => {
      const url = typeof img === "string" ? img : img?.url;
      if (url && !realImages.includes(url)) {
        realImages.push(url);
      }
    });
  }

  // Fallback placeholder ONLY if no images exist in database at all
  const imagesList = realImages.length > 0 
    ? realImages 
    : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85"];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 35;
    const isRightSwipe = distance < -35;

    if (isLeftSwipe) {
      setCurrentIndex((prev) => (prev === imagesList.length - 1 ? 0 : prev + 1));
    }
    if (isRightSwipe) {
      setCurrentIndex((prev) => (prev === 0 ? imagesList.length - 1 : prev - 1));
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const categoryName = typeof property.category === "string" 
    ? property.category 
    : property.category?.name || "Premium Property";

  const priceLabel = property.priceLabel || formatCurrency(property.price);
  const bedrooms = property.bedrooms || 0;
  const typeLabel = typeof property.type === "string" ? property.type : "Apartment";
  const statusLabel = typeof property.status === "string" ? property.status : "ONGOING";

  return (
    <div className="group overflow-hidden rounded-xl bg-white border border-black/5 luxury-shadow flex flex-col h-full w-full max-w-md mx-auto transition duration-300">
      
      {/* Interactive Carousel Box with Animated Horizontal Sliding */}
      <div 
        className="relative aspect-[16/10] overflow-hidden bg-neutral-900 group/image select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Link href={`/properties/${property.slug}`} className="block h-full w-full relative overflow-hidden">
          {/* Animated Slider Track */}
          <div 
            className="flex h-full w-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {imagesList.map((imgUrl, idx) => (
              <div key={idx} className="relative h-full w-full flex-shrink-0">
                <Image 
                  src={imgUrl} 
                  alt={`${property.title} - Image ${idx + 1}`} 
                  fill 
                  className="object-cover" 
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  priority={idx === 0}
                  fetchPriority={idx === 0 ? "high" : "low"}
                  quality={70}
                />
              </div>
            ))}
          </div>
        </Link>

        {/* Category Badge */}
        <span className="absolute left-3 top-3 pointer-events-none rounded bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-[#171717] tracking-wider uppercase shadow-sm z-10">
          {categoryName}
        </span>

        {/* Image Counter Badge (Only shown if multiple real images exist) */}
        {imagesList.length > 1 && (
          <span className="absolute right-3 top-3 pointer-events-none rounded bg-black/65 backdrop-blur-sm px-2 py-0.5 text-[10px] font-medium text-white shadow-sm z-10">
            {currentIndex + 1}/{imagesList.length}
          </span>
        )}

        {/* Left Arrow Slide Button */}
        {imagesList.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-black/50 text-white backdrop-blur-md flex items-center justify-center opacity-95 sm:opacity-0 sm:group-hover/image:opacity-100 transition-opacity hover:bg-black/75 active:scale-95"
            aria-label="Previous Image"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Right Arrow Slide Button */}
        {imagesList.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-black/50 text-white backdrop-blur-md flex items-center justify-center opacity-95 sm:opacity-0 sm:group-hover/image:opacity-100 transition-opacity hover:bg-black/75 active:scale-95"
            aria-label="Next Image"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* Bottom Slide Pagination Dots */}
        {imagesList.length > 1 && (
          <div className="absolute bottom-2.5 inset-x-0 z-20 flex justify-center items-center gap-1.5 pointer-events-auto">
            {imagesList.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleDotClick(e, idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx 
                    ? "w-5 bg-white shadow-sm" 
                    : "w-1.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Property Details Body */}
      <Link href={`/properties/${property.slug}`} className="p-4 flex flex-col justify-between flex-grow">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold leading-snug text-[#171717] group-hover:text-[#b89658] transition-colors">{property.title}</h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-[#68625a]">
              <MapPin size={13} className="text-[#b89658] shrink-0" />
              <span className="truncate">
                <span className="capitalize font-medium text-[#171717]">{typeLabel.toLowerCase()}</span> in {property.location}
              </span>
            </p>
          </div>
          <p className="whitespace-nowrap text-sm font-semibold text-[#b89658]">{priceLabel}</p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-black/10 pt-3 text-[11px] text-[#68625a]">
          <span className="flex items-center gap-1.5">
            <BedDouble size={13} className="text-[#b89658] shrink-0" />
            <span>{bedrooms ? `${bedrooms} BHK` : typeLabel === "COMMERCIAL" ? "Office" : "Plot"}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize size={13} className="text-[#b89658] shrink-0" />
            <span className="truncate">{property.siteArea || "1,200 sqft"}</span>
          </span>
          <span className="flex items-center gap-1.5 justify-end">
            <Timer size={13} className="text-[#b89658] shrink-0" />
            <span className="truncate">{statusLabel.replaceAll("_", " ").toLowerCase()}</span>
          </span>
        </div>
      </Link>
    </div>
  );
}
