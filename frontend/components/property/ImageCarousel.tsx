"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ImageCarouselProps {
  gallery: string[];
  title: string;
}

export function ImageCarousel({ gallery, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Touch swipe refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  if (!gallery || gallery.length === 0) return null;

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCurrentIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 35) {
      handleNext();
    } else if (distance < -35) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div 
      className="relative w-full aspect-video md:h-[550px] overflow-hidden rounded-xl border border-black/5 bg-[#171717] group luxury-shadow select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Blurred matched background to fill empty spaces */}
      <div className="absolute inset-0 select-none pointer-events-none overflow-hidden blur-2xl opacity-25 scale-105">
        <Image
          src={gallery[currentIndex]}
          alt=""
          fill
          className="object-cover"
        />
      </div>

      {/* Horizontal Sliding Track */}
      <div 
        className="flex h-full w-full transition-transform duration-500 ease-out relative z-0"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {gallery.map((imgUrl, idx) => (
          <div key={idx} className="relative h-full w-full flex-shrink-0 flex items-center justify-center">
            <Image
              src={imgUrl}
              alt={`${title} view ${idx + 1}`}
              fill
              priority={idx === 0}
              fetchPriority={idx === 0 ? "high" : "low"}
              quality={75}
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 85vw"
            />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {gallery.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-2.5 rounded-full bg-white/90 text-black shadow-lg hover:bg-white active:scale-95 transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center cursor-pointer"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-2.5 rounded-full bg-white/90 text-black shadow-lg hover:bg-white active:scale-95 transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-center cursor-pointer"
            aria-label="Next image"
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </>
      )}

      {/* Bottom Status Counter */}
      <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-sm z-10">
        <span className="text-xs font-semibold text-white/90 tracking-wider">
          {currentIndex + 1} / {gallery.length}
        </span>
      </div>

      {/* Dynamic Dots Navigation */}
      {gallery.length > 1 && (
        <div className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 flex items-center gap-1.5 z-10 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
          {gallery.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-5 bg-[#b89658]" : "w-1.5 bg-white/50 hover:bg-white"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
