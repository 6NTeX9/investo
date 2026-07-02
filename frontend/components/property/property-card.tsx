import Image from "next/image";
import Link from "next/link";
import { BedDouble, MapPin, Timer, Maximize } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function PropertyCard({ property }: { property: any }) {
  const heroImage = property.heroImage || property.images?.[0]?.url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85";
  const categoryName = typeof property.category === "string" ? property.category : property.category?.name || "Premium Property";
  const priceLabel = property.priceLabel || formatCurrency(property.price);
  const bedrooms = property.bedrooms || 0;
  const typeLabel = typeof property.type === "string" ? property.type : "Apartment";
  const statusLabel = typeof property.status === "string" ? property.status : "ONGOING";

  return (
    <Link href={`/properties/${property.slug}`} className="group overflow-hidden rounded-lg bg-white border border-black/5 luxury-shadow flex flex-col h-full transition duration-300">
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image src={heroImage} alt={property.title} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 33vw, 100vw" />
        <span className="absolute left-3 top-3 rounded bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-[#171717] tracking-wider uppercase shadow-sm">
          {categoryName}
        </span>
      </div>
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold leading-snug text-[#171717]">{property.title}</h3>
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
      </div>
    </Link>
  );
}
