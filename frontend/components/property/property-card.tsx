import Image from "next/image";
import Link from "next/link";
import { BedDouble, MapPin, Timer } from "lucide-react";
import type { Property } from "@/types/property";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link href={`/properties/${property.slug}`} className="group overflow-hidden rounded-lg bg-white luxury-shadow">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={property.heroImage} alt={property.title} fill className="object-cover transition duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 33vw, 100vw" />
        <span className="absolute left-4 top-4 rounded-md bg-white/90 px-3 py-1 text-xs font-semibold text-[#171717]">
          {property.category}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">{property.title}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-[#68625a]">
              <MapPin size={15} />
              {property.location}
            </p>
          </div>
          <p className="whitespace-nowrap text-sm font-semibold text-[#b89658]">{property.priceLabel}</p>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-black/10 pt-4 text-xs text-[#68625a]">
          <span className="flex items-center gap-1">
            <BedDouble size={15} />
            {property.bedrooms || "Office"}
          </span>
          <span>{property.type}</span>
          <span className="flex items-center gap-1">
            <Timer size={15} />
            {property.status.replaceAll("_", " ")}
          </span>
        </div>
      </div>
    </Link>
  );
}
