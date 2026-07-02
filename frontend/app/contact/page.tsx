"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Phone, CalendarDays, MessageSquare } from "lucide-react";
import { SiteVisitRequestForm } from "@/components/property/site-visit-request-form";
import { GeneralEnquiryForm } from "@/components/property/general-enquiry-form";

function ContactContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<"enquiry" | "visit">("enquiry");

  useEffect(() => {
    if (searchParams.get("tab") === "visit") {
      setActiveTab("visit");
    } else {
      setActiveTab("enquiry");
    }
  }, [searchParams]);

  return (
    <main className="section-shell grid gap-10 pt-12 lg:grid-cols-[0.8fr_1.2fr] pb-20">
      {/* Left info panel */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Contact sales</p>
        <h1 className="mt-2 font-[var(--font-display)] text-5xl">Get in touch with us</h1>
        <p className="mt-5 text-lg leading-8 text-[#68625a]">
          Request a callback from our sales advisors, or schedule a site visit at a time that suits you. We respond within the hour during business hours.
        </p>
        <div className="mt-8 grid gap-4">
          <p className="flex items-center gap-3 text-[#292520]"><Phone size={18} className="text-[#b89658]" /> +91 72096 69981</p>
          <p className="flex items-center gap-3 text-[#292520]"><CalendarDays size={18} className="text-[#b89658]" /> Daily site visits from 10:00 am to 10:00 pm</p>
        </div>
      </div>

      {/* Right form panel */}
      <div>
        {/* Tab switcher */}
        <div className="flex rounded-xl border border-black/10 bg-[#f7f4ee] p-1 mb-6 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("enquiry")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              activeTab === "enquiry"
                ? "bg-white shadow-sm text-[#171717] border border-black/8"
                : "text-[#68625a] hover:text-[#171717]"
            }`}
          >
            <MessageSquare size={15} />
            Request Callback
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("visit")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              activeTab === "visit"
                ? "bg-white shadow-sm text-[#171717] border border-black/8"
                : "text-[#68625a] hover:text-[#171717]"
            }`}
          >
            <CalendarDays size={15} />
            Book Site Visit
          </button>
        </div>

        {/* Forms */}
        {activeTab === "enquiry" ? (
          <GeneralEnquiryForm />
        ) : (
          <SiteVisitRequestForm />
        )}
      </div>
    </main>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="section-shell pt-12 pb-20 text-[#68625a]">Loading...</div>}>
      <ContactContent />
    </Suspense>
  );
}
