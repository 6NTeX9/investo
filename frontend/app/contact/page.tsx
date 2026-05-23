import { CalendarDays, Phone } from "lucide-react";

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
          <p className="flex items-center gap-3"><Phone size={18} /> +971 55 210 7788</p>
          <p className="flex items-center gap-3"><CalendarDays size={18} /> Daily site visits from 10:00 to 19:00</p>
        </div>
      </div>
      <form className="grid gap-4 rounded-lg bg-white p-6 luxury-shadow">
        {["Name", "Phone number", "Email", "Interested property", "Preferred visit date/time"].map((label) => (
          <label key={label} className="grid gap-2 text-sm font-medium">
            {label}
            <input className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm" />
          </label>
        ))}
        <label className="grid gap-2 text-sm font-medium">
          Message
          <textarea className="focus-ring min-h-32 rounded-md border border-black/10 px-4 py-3 text-sm" />
        </label>
        <button className="rounded-md bg-[#171717] px-5 py-3 text-sm font-semibold text-white">Submit request</button>
      </form>
    </main>
  );
}
