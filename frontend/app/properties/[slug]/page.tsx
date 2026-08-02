import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Download, MapPin, MessageCircle, Phone, FileText } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { PropertyCard } from "@/components/property/property-card";
import { EnquiryForm } from "@/components/property/enquiry-form";
import { ImageCarousel } from "@/components/property/ImageCarousel";
import { SimilarPropertiesSlider } from "@/components/property/similar-properties-slider";
import { getLiveProperties, getLivePropertyBySlug } from "@/lib/live-properties";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

async function getPropertyBySlug(slug: string) {
  try {
    return await getLivePropertyBySlug(slug);
  } catch (error: any) {
    console.error(`Failed to fetch live property details for slug: ${slug}.`, error);
    return null;
  }
}

async function getSimilarProperties(currentId: string) {
  try {
    const res = await getLiveProperties({ limit: 10 });
    const items = res.items
      .filter((item: any) => item.id !== currentId)
      .slice(0, 3);
    return items;
  } catch (error) {
    console.error("Failed to fetch live similar properties:", error);
  }
  return [];
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return {};
  const canonicalUrl = `https://www.bricksnbeyond.in/properties/${slug}`;
  return {
    title: property.title,
    description: property.description,
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title: property.title,
      description: property.description,
      url: canonicalUrl,
      images: [property.heroImage]
    }
  };
}

export default async function PropertyDetailsPage({ params }: { params: Params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const similar = await getSimilarProperties(property.id);

  const unitsText = property.bedroomsText || (property.bedrooms 
    ? `${property.bedrooms} BHK` 
    : property.type === "COMMERCIAL" ? "Office" : "Plot");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "url": `https://www.bricksnbeyond.in/properties/${slug}`,
    "image": property.heroImage,
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "INR"
    }
  };

  return (
    <main className="bg-[#faf9f6] min-h-screen pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Gallery Section */}
      <section className="section-shell pt-4 sm:pt-8">
        <ImageCarousel gallery={property.gallery} title={property.title} />
      </section>

      {/* Main Content & Sidebar Grid */}
      <section className="section-shell mt-6 sm:mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <article className="min-w-0">
          
          {/* 1. Category Badge */}
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b89658]">
            {property.category || "LUXURY PROPERTIES"}
          </p>

          {/* 2. Title & Price Header */}
          <div className="mt-1 flex items-start justify-between gap-4 flex-wrap">
            <h1 className="font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-normal tracking-tight text-[#171717]">
              {property.title}
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-[#171717] shrink-0">
              {property.priceLabel}
            </p>
          </div>

          {/* 3. Location */}
          <p className="mt-1.5 flex items-center gap-1 text-xs sm:text-sm text-[#68625a]">
            <MapPin size={14} className="text-[#68625a] shrink-0" />
            <span>{property.location || property.address}</span>
          </p>

          {/* 4. Description */}
          <p className="mt-4 text-xs sm:text-sm leading-relaxed text-[#4f4942] whitespace-pre-wrap max-w-3xl">
            {property.description}
          </p>

          {/* 5. Spec Cards Grid (STATUS, SITE AREA, UNIT SIZES, CONSTRUCTION PROGRESS, UNITS) */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="rounded-xl bg-white p-3.5 sm:p-4 border border-black/5 luxury-shadow">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#68625a]">
                STATUS
              </p>
              <p className="mt-1 font-bold text-xs sm:text-sm text-[#171717] capitalize break-words">
                {property.status.replaceAll("_", " ").toLowerCase()}
              </p>
            </div>

            {property.siteArea && (
              <div className="rounded-xl bg-white p-3.5 sm:p-4 border border-black/5 luxury-shadow">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#68625a]">
                  SITE AREA
                </p>
                <p className="mt-1 font-bold text-xs sm:text-sm text-[#171717] break-words">
                  {property.siteArea}
                </p>
              </div>
            )}

            {property.unitSizes && (
              <div className="rounded-xl bg-white p-3.5 sm:p-4 border border-black/5 luxury-shadow">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#68625a]">
                  UNIT SIZES
                </p>
                <p className="mt-1 font-bold text-xs sm:text-sm text-[#171717] break-words">
                  {property.unitSizes}
                </p>
              </div>
            )}

            {property.constructionStatus && (
              <div className="rounded-xl bg-white p-3.5 sm:p-4 border border-black/5 luxury-shadow">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#68625a]">
                  CONSTRUCTION PROGRESS
                </p>
                <p className="mt-1 font-bold text-xs sm:text-sm text-[#171717] break-words">
                  {property.constructionStatus}
                </p>
              </div>
            )}

            {unitsText && (
              <div className="rounded-xl bg-white p-3.5 sm:p-4 border border-black/5 luxury-shadow">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#68625a]">
                  UNITS / CONFIG
                </p>
                <p className="mt-1 font-bold text-xs sm:text-sm text-[#171717] break-words">
                  {unitsText}
                </p>
              </div>
            )}
          </div>

          {/* 6. Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold text-[#171717]">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {property.amenities.map((amenity: string) => (
                  <span 
                    key={amenity} 
                    className="rounded-lg bg-white border border-black/5 px-3.5 py-2 text-xs font-medium text-[#171717] luxury-shadow"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 7. Nearby Landmarks */}
          {property.nearby && property.nearby.length > 0 && (
            <div className="mt-6 rounded-xl border border-black/5 bg-white p-5 luxury-shadow">
              <h3 className="font-bold text-sm text-[#171717] mb-2">Nearby landmarks</h3>
              <ul className="space-y-1.5 text-xs text-[#68625a] list-disc list-inside">
                {property.nearby.map((landmark: string) => (
                  <li key={landmark}>{landmark}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 8. Request Brochure & Floor Plans Section (Comes immediately after Nearby Landmarks) */}
          <div className="mt-6 rounded-xl border border-black/5 bg-white p-5 sm:p-6 luxury-shadow">
            <h3 className="font-bold text-sm text-[#171717]">Floor plans & Brochure</h3>
            <p className="mt-1 text-xs text-[#68625a] leading-relaxed">
              {property.brochureUrl || property.floorPlanUrl || property.masterPlanUrl
                ? "Download floor plans, master plan, and official property documentation."
                : "Request official brochure and floor plan documentation from our sales team."}
            </p>
            
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {property.brochureUrl ? (
                <LinkButton href={property.brochureUrl} target="_blank" rel="noopener noreferrer" variant="primary" className="gap-2 text-xs py-2.5 px-4">
                  <Download size={15} />
                  <span>Download Brochure</span>
                </LinkButton>
              ) : (
                <LinkButton href="/contact" variant="primary" className="gap-2 text-xs py-2.5 px-4">
                  <FileText size={15} />
                  <span>Request Brochure</span>
                </LinkButton>
              )}

              {property.floorPlanUrl && (
                <LinkButton href={property.floorPlanUrl} target="_blank" rel="noopener noreferrer" variant="gold" className="gap-2 text-xs py-2.5 px-4">
                  <span>View Floor Plan</span>
                </LinkButton>
              )}

              {property.masterPlanUrl && (
                <LinkButton href={property.masterPlanUrl} target="_blank" rel="noopener noreferrer" variant="gold" className="gap-2 text-xs py-2.5 px-4">
                  <span>View Master Plan</span>
                </LinkButton>
              )}
            </div>
          </div>

          {/* 9. Interactive Map Embed */}
          <div className="mt-6 overflow-hidden rounded-xl border border-black/5 bg-white luxury-shadow">
            {property.mapEmbedUrl ? (
              <iframe
                title={`${property.title} map`}
                className="h-72 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={property.mapEmbedUrl}
              />
            ) : (
              <div className="h-48 flex items-center justify-center text-[#68625a] text-xs gap-2">
                <MapPin size={16} className="text-[#b89658]" />
                <span>{property.address}</span>
              </div>
            )}
          </div>

        </article>

        {/* Sidebar Representative & Enquiry Form */}
        <aside className="h-fit rounded-xl bg-white p-5 sm:p-6 luxury-shadow lg:sticky lg:top-28 border border-black/5">
          <div className="flex items-center gap-3.5">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-black/10 shrink-0">
              <Image src={property.agent.avatar} alt={property.agent.name} fill className="object-cover" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[#171717]">{property.agent.name}</p>
              <p className="text-xs text-[#68625a]">Assigned representative</p>
            </div>
          </div>
          <div className="mt-5 grid gap-2.5">
            <LinkButton href={`tel:${property.agent.phone}`} variant="primary" className="gap-2 justify-center text-xs py-2.5">
              <Phone size={15} />
              <span>Call Agent</span>
            </LinkButton>
            <LinkButton href={`https://wa.me/${property.agent.phone.replace(/\D/g, "")}`} variant="gold" className="gap-2 justify-center text-xs py-2.5">
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </LinkButton>
          </div>
          
          <div className="mt-6 border-t border-black/5 pt-5">
            <EnquiryForm propertyId={property.id} />
          </div>
          
          <LinkButton href="/contact" variant="ghost" className="mt-3 w-full gap-2 justify-center text-xs py-2">
            <CalendarDays size={15} />
            <span>Schedule Site Visit</span>
          </LinkButton>
        </aside>
      </section>

      {/* Amazon-style Horizontal Similar Properties Slider */}
      <SimilarPropertiesSlider properties={similar} />
    </main>
  );
}
