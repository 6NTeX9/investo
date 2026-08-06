"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

const faqData: FAQItem[] = [
  {
    question: "What makes BricksNBeyond different from traditional real estate brokers in Bangalore?",
    answer: "BricksNBeyond operates as an exclusive property discovery and investment advisory firm. Rather than pushing single developer inventories, we perform independent legal diligence, check RERA timelines, analyze micro-market rental yields, and present unbiased property shortlists tailored to your financial goals.",
    category: "About Advisory"
  },
  {
    question: "Which areas in Bangalore offer the highest capital appreciation for luxury apartments?",
    answer: "Key growth hubs with strong capital appreciation include North Bangalore (around Yelahanka and Airport Corridor due to aerospace and tech parks), East Bangalore (Whitefield and ITPL for high rental yields), and South Bangalore (Sarjapur Road and Koramangala for premium lifestyle residences).",
    category: "Locations & Yields"
  },
  {
    question: "How do I book a site visit with BricksNBeyond?",
    answer: "You can request a direct site visit by browsing our curated property listings, clicking 'Book Site Visit', or contacting our sales team. We arrange private luxury transport, direct developer walkthroughs, and assist with pricing negotiations at zero advisory fee to buyers.",
    category: "Site Visits"
  },
  {
    question: "Are all listed projects RERA registered and legally verified?",
    answer: "Yes, every residential apartment, luxury villa project, and commercial development hosted on BricksNBeyond is verified against Karnataka RERA regulations, builder title deeds, and bank approval status before publication.",
    category: "Legal & RERA"
  },
  {
    question: "Do you charge home buyers any commission or consultation fees?",
    answer: "No. Our advisory, property shortlisting, site visit arrangements, and negotiation support services are 100% free for home buyers and investors. We are compensated directly by developer partners upon successful booking.",
    category: "About Advisory"
  },
  {
    question: "Can BricksNBeyond assist NRI buyers with home loans and legal power of attorney?",
    answer: "Yes, we specialize in NRI real estate transactions in Bangalore. Our legal team assists with NRE/NRO banking setup, home loan sanctions from major Indian banks, and drafting compliant Power of Attorney (POA) documentation for seamless remote purchases.",
    category: "NRI Services"
  }
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="rounded-2xl bg-white p-6 sm:p-8 md:p-10 border border-black/5 luxury-shadow">
      <div className="max-w-4xl">
        <div className="flex items-center gap-2">
          <HelpCircle size={16} className="text-[#b89658]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#b89658]">
            Frequently Asked Questions
          </span>
        </div>
        
        <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#171717]">
          Real Estate Investment &amp; Buying Guide in Bangalore
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#68625a]">
          Find quick answers to common questions about buying luxury homes, site visit coordination, RERA legalities, and market appreciation.
        </p>

        <div className="mt-8 space-y-3.5">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-[#b89658]/40 bg-[#fdfdfa] shadow-xs"
                    : "border-black/8 bg-white hover:border-black/20"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 pr-4">
                    {item.category && (
                      <span className="hidden sm:inline-block rounded-md bg-[#f7f4ee] px-2.5 py-1 text-[10px] font-semibold tracking-wider text-[#b89658] uppercase shrink-0">
                        {item.category}
                      </span>
                    )}
                    <h3 className="font-semibold text-sm sm:text-base text-[#171717] leading-snug">
                      {item.question}
                    </h3>
                  </div>
                  <div className={`p-1.5 rounded-full transition-transform duration-300 shrink-0 ${
                    isOpen ? "rotate-180 bg-[#b89658]/10 text-[#b89658]" : "bg-neutral-100 text-neutral-500"
                  }`}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 pt-0 text-xs sm:text-sm leading-relaxed text-[#4f4942] border-t border-black/5 animate-fadeIn">
                    <p className="pt-3">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
