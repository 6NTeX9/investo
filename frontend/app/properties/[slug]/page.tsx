import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Download, MapPin, MessageCircle, Phone } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { PropertyCard } from "@/components/property/property-card";
import { EnquiryForm } from "@/components/property/enquiry-form";
import { ImageCarousel } from "@/components/property/ImageCarousel";
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
  return {
    title: property.title,
    description: property.description,
    openGraph: {
      title: property.title,
      description: property.description,
      images: [property.heroImage]
    }
  };
}

export default async function PropertyDetailsPage({ params }: { params: Params }) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const similar = await getSimilarProperties(property.id);

  return (
    <main>
      <section className="section-shell pt-10">
        <ImageCarousel gallery={property.gallery} title={property.title} />
      </section>

      <section className="section-shell mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <article>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">{property.category}</p>
          <h1 className="mt-2 font-[var(--font-display)] text-5xl">{property.title}</h1>
          <p className="mt-4 flex items-center gap-2 text-[#68625a]">
            <MapPin size={18} />
            {property.address}
          </p>
          <p className="mt-6 text-2xl font-semibold">{property.priceLabel}</p>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#4f4942] whitespace-pre-wrap">{property.description}</p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["Status", property.status.replaceAll("_", " ")],
              ["Site area", property.siteArea],
              ["Builder", property.builder]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white p-5 border border-black/5 luxury-shadow">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#68625a]">{label}</p>
                <p className="mt-2 font-semibold capitalize">{value?.toLowerCase()}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-semibold">Amenities</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {property.amenities.map((amenity: string) => (
              <span key={amenity} className="rounded-md bg-white border border-black/5 px-4 py-2 text-sm luxury-shadow">{amenity}</span>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-semibold">Plans and landmarks</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-black/10 bg-white p-6 luxury-shadow flex flex-col justify-between">
              <div>
                <p className="font-semibold">Floor plans and master plan</p>
                <p className="mt-2 text-sm leading-6 text-[#68625a]">
                  {property.brochureUrl || property.floorPlanUrl || property.masterPlanUrl
                    ? "Download the files directly to view plans, plates, and detailed features."
                    : "Brochures, floor plates, and master plans are managed through the admin dashboard."}
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {property.brochureUrl ? (
                  <LinkButton href={property.brochureUrl} target="_blank" rel="noopener noreferrer" variant="ghost" className="gap-2">
                    <Download size={17} />
                    Download brochure
                  </LinkButton>
                ) : (
                  <LinkButton href="/contact" variant="ghost" className="gap-2">
                    <Download size={17} />
                    Request brochure
                  </LinkButton>
                )}

                {property.floorPlanUrl && (
                  <LinkButton href={property.floorPlanUrl} target="_blank" rel="noopener noreferrer" variant="gold" className="gap-2">
                    View Floor Plan
                  </LinkButton>
                )}

                {property.masterPlanUrl && (
                  <LinkButton href={property.masterPlanUrl} target="_blank" rel="noopener noreferrer" variant="gold" className="gap-2">
                    View Master Plan
                  </LinkButton>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-black/10 bg-white p-6 luxury-shadow">
              <p className="font-semibold">Nearby landmarks</p>
              <ul className="mt-3 grid gap-2 text-sm text-[#68625a] list-disc list-inside">
                {property.nearby.map((landmark: string) => (
                  <li key={landmark}>{landmark}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 overflow-hidden rounded-lg border border-black/10 bg-white luxury-shadow">
            {property.mapEmbedUrl ? (
              <iframe
                title={`${property.title} map`}
                className="h-80 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={property.mapEmbedUrl}
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-[#68625a] text-sm gap-2">
                <span>📍</span>
                <span>{property.address}</span>
              </div>
            )}
          </div>
        </article>

        <aside className="h-fit rounded-lg bg-white p-6 luxury-shadow lg:sticky lg:top-28 border border-black/5">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-black/10">
              <Image src={property.agent.avatar} alt={property.agent.name} fill className="object-cover" />
            </div>
            <div>
              <p className="font-semibold">{property.agent.name}</p>
              <p className="text-sm text-[#68625a]">Assigned representative</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <LinkButton href={`tel:${property.agent.phone}`} variant="primary" className="gap-2 justify-center">
              <Phone size={17} />
              Call agent
            </LinkButton>
            <LinkButton href={`https://wa.me/${property.agent.phone.replace(/\D/g, "")}`} variant="gold" className="gap-2 justify-center">
              <MessageCircle size={17} />
              WhatsApp
            </LinkButton>
          </div>
          
          <EnquiryForm propertyId={property.id} />
          
          <LinkButton href="/contact" variant="ghost" className="mt-3 w-full gap-2 justify-center">
            <CalendarDays size={17} />
            Schedule site visit
          </LinkButton>
        </aside>
      </section>

      <section className="section-shell mt-20 pb-20">
        <h2 className="font-[var(--font-display)] text-4xl">Similar properties</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {similar.map((item: any) => (
            <PropertyCard key={item.id} property={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
