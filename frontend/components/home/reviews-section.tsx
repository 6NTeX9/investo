"use client";

import Image from "next/image";
import { Star, CheckCircle2, Quote, MessageSquareText } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeUp } from "@/components/ui/scroll-animation";

interface Review {
  id: string;
  name: string;
  role: string;
  location: string;
  avatar: string;
  rating: number;
  date: string;
  quote: string;
  propertyBought?: string;
}

const reviewsList: Review[] = [
  {
    id: "rev-1",
    name: "Anand & Priya Sharma",
    role: "Verified Homebuyer",
    location: "Whitefield, Bangalore",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    date: "July 2026",
    quote: "BricksNBeyond shortlisted homes that matched our budget and investment horizon with unusual precision. They organized private luxury site visits, verified builder legalities, and negotiated direct pricing. Truly world-class advisory!",
    propertyBought: "3BHK Luxury Residence"
  },
  {
    id: "rev-2",
    name: "Vikramaditya Rao",
    role: "NRI Tech Executive",
    location: "Singapore / Sarjapur Road",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    date: "June 2026",
    quote: "Being based overseas in Singapore, finding an advisory firm I could trust was critical. BricksNBeyond handled site visits, video walkthroughs, and RERA verification with extreme transparency. Exceptional peace of mind.",
    propertyBought: "4BHK Independent Villa"
  },
  {
    id: "rev-3",
    name: "Meera & Rajesh Kulkarni",
    role: "Senior Business Consultant",
    location: "Indiranagar, Bangalore",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    date: "May 2026",
    quote: "BricksNBeyond helped us compare rental yield, location fundamentals, and exit scenarios before we committed. Site visits, paperwork, and builder negotiations were handled with a level of calm we did not expect.",
    propertyBought: "Penthouse Apartment"
  }
];

export function ReviewsSection() {
  return (
    <section className="section-shell mt-12 sm:mt-16 pb-16">
      {/* Section Header */}
      <FadeUp>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-black/5 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquareText size={16} className="text-[#b89658]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#b89658]">
                Client Reviews &amp; Testimonials
              </span>
            </div>
            <h2 className="mt-1 font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#171717]">
              What Homebuyers &amp; Investors Say
            </h2>
          </div>

          {/* Overall Star Rating Banner */}
          <div className="flex items-center gap-3 bg-white p-3 px-4 rounded-xl border border-black/8 luxury-shadow shrink-0">
            <div className="text-center">
              <span className="text-2xl font-bold font-serif text-[#171717]">4.9</span>
              <span className="text-xs text-neutral-400 font-serif"> / 5</span>
            </div>
            <div className="h-8 w-px bg-black/10" />
            <div>
              <div className="flex items-center gap-0.5 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-[11px] text-[#68625a] font-medium mt-0.5">
                450+ Verified Client Reviews
              </p>
            </div>
          </div>
        </div>
      </FadeUp>

      {/* Reviews Grid */}
      <StaggerContainer className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {reviewsList.map((rev) => (
          <StaggerItem key={rev.id} className="h-full">
            <div className="h-full flex flex-col justify-between rounded-2xl bg-white p-6 border border-black/8 luxury-shadow hover:border-[#b89658]/40 transition-all duration-300 relative group">
              <Quote size={32} className="absolute top-5 right-5 text-[#b89658]/10 group-hover:text-[#b89658]/20 transition-colors pointer-events-none" />

              <div>
                {/* 5-Star Rating Icons */}
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-2 text-xs font-serif text-neutral-400 font-medium">{rev.date}</span>
                </div>

                {/* Review Text */}
                <blockquote className="text-xs sm:text-sm text-[#4f4942] leading-relaxed italic font-serif">
                  &ldquo;{rev.quote}&rdquo;
                </blockquote>
              </div>

              {/* Client Profile Footer */}
              <div className="mt-6 pt-4 border-t border-black/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#b89658]/30 shrink-0">
                    <Image
                      src={rev.avatar}
                      alt={rev.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-serif font-bold text-sm text-[#171717]">
                        {rev.name}
                      </h4>
                      <CheckCircle2 size={13} className="text-emerald-600 fill-emerald-100 shrink-0" title="Verified Homebuyer" />
                    </div>
                    <p className="text-[11px] text-[#68625a] font-medium">
                      {rev.role} · <span className="text-[#b89658]">{rev.location.split(",")[0]}</span>
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </section>
  );
}
