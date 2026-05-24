import { CalendarDays, Phone } from "lucide-react";
import { SiteVisitRequestForm } from "@/components/property/site-visit-request-form";

export const metadata = {
  title: "Contact",
  description: "Submit an enquiry, request a callback, or schedule a site visit."
};

export default function ContactPage() {
  return (
    <main className="section-shell grid gap-10 pt-12 lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Contact sales</p>
        <h1 className="mt-2 font-[var(--font-display)] text-5xl">Plan your next property visit</h1>
        <p className="mt-5 text-lg leading-8 text-[#68625a]">Share what you are looking for. The backend stores enquiries, callbacks, and scheduled visits with property and agent assignment support.</p>
        <div className="mt-8 grid gap-4">
          <p className="flex items-center gap-3"><Phone size={18} /> +91 72096 69981</p>
          <p className="flex items-center gap-3"><CalendarDays size={18} /> Daily site visits from 10:00am  to 10:00pm</p>
        </div>
      </div>
      <SiteVisitRequestForm />
    </main>
  );
}
