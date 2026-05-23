import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Download, MapPin, MessageCircle, Phone } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { PropertyCard } from "@/components/property/property-card";
import { properties } from "@/lib/data";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const property = properties.find((item) => item.slug === slug);
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

export function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }));
}

export default async function PropertyDetailsPage({ params }: { params: Params }) {
  const { slug } = await params;
  const property = properties.find((item) => item.slug === slug);
  if (!property) notFound();

  const similar = properties.filter((item) => item.id !== property.id).slice(0, 3);

  return (
    <main>
      <section className="section-shell pt-10">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="relative min-h-[420px] overflow-hidden rounded-lg">
            <Image src={property.heroImage} alt={property.title} fill priority className="object-cover" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {property.gallery.slice(1).map((image) => (
              <div key={image} className="relative min-h-48 overflow-hidden rounded-lg">
                <Image src={image} alt={property.title} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>
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
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#4f4942]">{property.description}</p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["Status", property.status.replaceAll("_", " ")],
              ["Site area", property.siteArea],
              ["Builder", property.builder]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#68625a]">{label}</p>
                <p className="mt-2 font-semibold">{value}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-semibold">Amenities</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {property.amenities.map((amenity) => (
              <span key={amenity} className="rounded-md bg-white px-4 py-2 text-sm">{amenity}</span>
            ))}
          </div>

          <h2 className="mt-12 text-2xl font-semibold">Plans and landmarks</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-black/10 bg-white p-6">
              <p className="font-semibold">Floor plans and master plan</p>
              <p className="mt-2 text-sm leading-6 text-[#68625a]">Brochures, floor plates, and master plans are managed through the S3 media library in the admin dashboard.</p>
              <LinkButton href="/contact" variant="ghost" className="mt-5 gap-2">
                <Download size={17} />
                Download brochure
              </LinkButton>
            </div>
            <div className="rounded-lg border border-black/10 bg-white p-6">
              <p className="font-semibold">Nearby landmarks</p>
              <ul className="mt-3 grid gap-2 text-sm text-[#68625a]">
                {property.nearby.map((landmark) => (
                  <li key={landmark}>{landmark}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 overflow-hidden rounded-lg border border-black/10 bg-white">
            <iframe
              title={`${property.title} map`}
              className="h-80 w-full"
              loading="lazy"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed`}
            />
          </div>
        </article>

        <aside className="h-fit rounded-lg bg-white p-6 luxury-shadow lg:sticky lg:top-28">
          <div className="flex items-center gap-4">
            <Image src={property.agent.avatar} alt={property.agent.name} width={64} height={64} className="rounded-full object-cover" />
            <div>
              <p className="font-semibold">{property.agent.name}</p>
              <p className="text-sm text-[#68625a]">Assigned sales representative</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            <LinkButton href={`tel:${property.agent.phone}`} variant="primary" className="gap-2">
              <Phone size={17} />
              Call agent
            </LinkButton>
            <LinkButton href={`https://wa.me/${property.agent.phone.replace(/\D/g, "")}`} variant="gold" className="gap-2">
              <MessageCircle size={17} />
              WhatsApp
            </LinkButton>
          </div>
          <form className="mt-6 grid gap-3">
            <input className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm" placeholder="Name" />
            <input className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm" placeholder="Phone number" />
            <input className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm" placeholder="Email" />
            <textarea className="focus-ring min-h-28 rounded-md border border-black/10 px-4 py-3 text-sm" placeholder="Message" />
            <button className="rounded-md bg-[#171717] px-4 py-3 text-sm font-semibold text-white">Submit enquiry</button>
          </form>
          <LinkButton href="/contact" variant="ghost" className="mt-3 w-full gap-2">
            <CalendarDays size={17} />
            Schedule site visit
          </LinkButton>
        </aside>
      </section>

      <section className="section-shell mt-20">
        <h2 className="font-[var(--font-display)] text-4xl">Similar properties</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {similar.map((item) => (
            <PropertyCard key={item.id} property={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
