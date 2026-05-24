"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  gallery: string[];
  title: string;
}

export function ImageCarousel({ gallery, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!gallery || gallery.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full aspect-video md:h-[550px] overflow-hidden rounded-xl border border-black/5 bg-[#171717] group luxury-shadow flex items-center justify-center">
      {/* Blurred matched background to fill empty spaces around mismatched aspect ratios */}
      <div className="absolute inset-0 select-none pointer-events-none overflow-hidden blur-2xl opacity-25 scale-105">
        <Image
          src={gallery[currentIndex]}
          alt=""
          fill
          className="object-cover"
        />
      </div>

      {/* Main Image (object-contain ensures the image is NEVER trimmed/cropped) */}
      <div className="relative w-full h-full flex items-center justify-center z-0">
        <Image
          src={gallery[currentIndex]}
          alt={`${title} view ${currentIndex + 1}`}
          fill
          priority
          className="object-contain transition-all duration-300"
          sizes="100vw"
        />
      </div>

      {/* Navigation Arrows (Visible on hover) */}
      {gallery.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/90 text-black shadow-lg hover:bg-white active:scale-95 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2.5 rounded-full bg-white/90 text-black shadow-lg hover:bg-white active:scale-95 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight size={22} strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* Bottom status indicators */}
      <div className="absolute bottom-5 left-5 flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm z-10">
        <span className="text-xs font-semibold text-white/90 tracking-wider">
          {currentIndex + 1} / {gallery.length}
        </span>
      </div>

      {/* Dynamic Dots Navigation */}
      {gallery.length > 1 && (
        <div className="absolute bottom-5 right-5 flex items-center gap-1.5 z-10 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm">
          {gallery.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-4 bg-[#b89658]" : "w-1.5 bg-white/50 hover:bg-white"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
