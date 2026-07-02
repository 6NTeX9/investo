"use client";

/** Generic skeleton shimmer box */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-md ${className}`}
    />
  );
}

/** Full property card skeleton — matches PropertyCard layout */
export function PropertyCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white luxury-shadow">
      {/* Image area */}
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 grid gap-3">
        {/* Title + price */}
        <div className="flex justify-between items-start gap-4">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-16" />
        </div>
        {/* Location */}
        <Skeleton className="h-3.5 w-1/2" />
        {/* Divider */}
        <div className="border-t border-black/5 pt-3 flex justify-between">
          <Skeleton className="h-3.5 w-20" />
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-3.5 w-20" />
        </div>
      </div>
    </div>
  );
}

/** Grid of property card skeletons */
export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** Blog card skeleton */
export function BlogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 bg-white luxury-shadow">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-5 grid gap-3">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

/** Inline spinner for buttons / form submits */
export function Spinner({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
      aria-label="Loading"
    >
      <circle
        cx="12" cy="12" r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="48"
        strokeDashoffset="36"
        className="opacity-30"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Full-page loading overlay */
export function PageLoader() {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#f7f4ee]/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size={36} className="text-[#b89658]" />
        <p className="text-sm font-medium text-[#68625a] animate-pulse">Loading…</p>
      </div>
    </div>
  );
}
