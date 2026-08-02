import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Building2, Award, Users, MapPin, ArrowRight } from "lucide-react";
import { LinkButton } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About Us | BricksNBeyond",
  description: "BricksNBeyond is a premium real estate advisory firm helping clients find luxury residential and commercial properties across India's top cities.",
  alternates: {
    canonical: "https://www.bricksnbeyond.in/about"
  }
};

const stats = [
  { label: "Properties Listed", value: "200+" },
  { label: "Happy Clients", value: "1,000+" },
  { label: "Cities Covered", value: "10+" },
  { label: "Years of Experience", value: "8+" }
];

const values = [
  {
    icon: Award,
    title: "Curated Excellence",
    body: "Every listing on BricksNBeyond is hand-picked and verified. We work only with trusted builders and offer only properties that meet our quality benchmark."
  },
  {
    icon: Users,
    title: "Client-First Advisory",
    body: "We don't just sell properties — we guide you through the entire journey, from shortlisting to site visits, negotiations, and legal documentation."
  },
  {
    icon: MapPin,
    title: "Deep Local Expertise",
    body: "Our advisors have on-the-ground knowledge of micro-markets across Mumbai, Pune, Bengaluru, and other top cities — giving you an edge in every deal."
  },
  {
    icon: Building2,
    title: "Trusted by Builders",
    body: "We partner directly with India's leading developers, giving our clients access to pre-launch pricing, exclusive inventory, and priority allotments."
  }
];

export default function AboutPage() {
  return (
    <main>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="section-shell pt-16 pb-16 grid gap-10 lg:grid-cols-2 items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Who we are</p>
          <h1 className="mt-3 font-[var(--font-display)] text-5xl lg:text-6xl leading-[1.1]">
            India&apos;s premium real estate advisory
          </h1>
          <p className="mt-6 text-lg text-[#4f4942] leading-8 max-w-lg">
            BricksNBeyond was founded with a single mission — to make luxury real estate accessible, transparent, and stress-free for every Indian family and investor.
          </p>
          <div className="mt-8 flex gap-3 flex-wrap">
            <LinkButton href="/properties" className="gap-2">
              Browse properties
              <ArrowRight size={16} />
            </LinkButton>
            <LinkButton href="/contact" variant="ghost">
              Get in touch
            </LinkButton>
          </div>
        </div>

        <div className="relative h-80 lg:h-[460px] overflow-hidden rounded-2xl">
          <Image
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1200&q=85"
            alt="BricksNBeyond office"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────────── */}
      <section className="bg-[#171717] text-white">
        <div className="section-shell py-14 grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-[var(--font-display)] text-5xl text-[#b89658]">{s.value}</p>
              <p className="mt-2 text-sm text-white/60 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Our Values ──────────────────────────────────────────── */}
      <section className="section-shell py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Why choose us</p>
        <h2 className="mt-2 font-[var(--font-display)] text-4xl">Built on trust &amp; transparency</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="rounded-xl border border-black/5 bg-white p-7 luxury-shadow">
              <span className="inline-grid h-11 w-11 place-items-center rounded-lg bg-[#b89658]/10 text-[#b89658]">
                <v.icon size={22} />
              </span>
              <h3 className="mt-4 font-semibold text-lg text-[#171717]">{v.title}</h3>
              <p className="mt-2 text-sm text-[#68625a] leading-6">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Story ───────────────────────────────────────────────── */}
      <section className="section-shell pb-20 grid gap-10 lg:grid-cols-2 items-center">
        <div className="relative h-72 lg:h-96 overflow-hidden rounded-2xl order-last lg:order-first">
          <Image
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=85"
            alt="Our story"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Our story</p>
          <h2 className="mt-2 font-[var(--font-display)] text-4xl">Started with a vision, driven by passion</h2>
          <p className="mt-5 text-[#4f4942] leading-7">
            What started as a small boutique advisory in Mumbai has grown into one of India&apos;s most trusted luxury real estate platforms. Over the years, we have helped thousands of clients — from first-time homebuyers to seasoned investors — make confident, well-informed property decisions.
          </p>
          <p className="mt-4 text-[#4f4942] leading-7">
            Our team of experienced advisors, combined with our carefully curated portfolio of premium properties, ensures that every client receives personalised attention and unmatched market intelligence.
          </p>
          <Link href="/agents" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#b89658] hover:underline">
            Meet our advisors <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="bg-[#f7f4ee] border-t border-black/5">
        <div className="section-shell py-16 flex flex-col items-center text-center gap-5">
          <h2 className="font-[var(--font-display)] text-4xl">Ready to find your dream property?</h2>
          <p className="text-[#68625a] max-w-md">Browse our curated portfolio or speak with an advisor today.</p>
          <div className="flex gap-3 flex-wrap justify-center">
            <LinkButton href="/properties" className="gap-2">
              View properties <ArrowRight size={16} />
            </LinkButton>
            <LinkButton href="/contact" variant="ghost">Contact us</LinkButton>
          </div>
        </div>
      </section>
    </main>
  );
}
