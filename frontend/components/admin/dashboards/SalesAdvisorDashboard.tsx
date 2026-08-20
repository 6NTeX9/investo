"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Target,
  Calendar,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileText,
  UserCheck,
  Send,
  Star,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

export function SalesAdvisorDashboard({
  user,
  myVisits = [
    { id: "1", name: "Gouravv Singh", phone: "+919876543210", property: "Altus Residences (3BHK)", time: "10:00 AM Today", status: "CONFIRMED", driver: "Driver: Ramesh (KA-01-MJ-4210)", notes: "Requested high-floor 3BHK viewings." },
    { id: "2", name: "Ankit Mehta", phone: "+919876543211", property: "Sobha Neopolis (4BHK)", time: "11:45 AM Today", status: "IN_TRANSIT", driver: "Self-drive", notes: "Developer rep notified for keys." },
    { id: "3", name: "Meera Reddy", phone: "+919876543212", property: "Prestige Kingfisher (Penthouse)", time: "Tomorrow 02:30 PM", status: "SCHEDULED", driver: "Driver: Suresh (KA-05-MN-9921)", notes: "Confidential private seller inventory." },
    { id: "4", name: "Kavita Sharma", phone: "+919876543213", property: "Assetz Marq (3BHK)", time: "22 Aug 04:00 PM", status: "SCHEDULED", driver: "Chauffeur Pending", notes: "Client traveling from Mumbai." }
  ],
  myEnquiries = [
    { id: "e1", name: "Gouravv Singh", phone: "+919876543210", email: "gouravv@gmail.com", property: "Altus Residences", status: "NEW", date: "Today, 09:15 AM" },
    { id: "e2", name: "Ananya Kapoor", phone: "+919876543214", email: "ananya.k@gmail.com", property: "Sobha Neopolis", status: "CONTACTED", date: "Yesterday, 04:30 PM" },
    { id: "e3", name: "Rahul Verma", phone: "+919876543215", email: "rahul.v@gmail.com", property: "Prestige Villa", status: "QUALIFIED", date: "17 Aug, 02:10 PM" }
  ]
}: {
  user?: any;
  myVisits?: any[];
  myEnquiries?: any[];
}) {
  const [selectedEnquiry, setSelectedEnquiry] = useState<string>(myEnquiries[0]?.id || "");
  const [noteText, setNoteText] = useState("");
  const [newStatus, setNewStatus] = useState("CONTACTED");
  const [isSaving, setIsSaving] = useState(false);

  // Post-visit feedback form state
  const [feedbackLead, setFeedbackLead] = useState("Gouravv Singh");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackIntent, setFeedbackIntent] = useState("High");

  const handleSaveNote = async () => {
    if (!selectedEnquiry) return;
    setIsSaving(true);
    try {
      await api.patch(`/enquiries/${selectedEnquiry}/notes`, { notes: noteText });
      await api.patch(`/enquiries/${selectedEnquiry}/status`, { status: newStatus });
      toast.success("Walkthrough note & lead status updated successfully!");
      setNoteText("");
    } catch {
      toast.error("Note saved locally.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Target Progress & Performance Meter ───────────────────────────── */}
      <div className="rounded-xl border border-[#b89658]/30 bg-gradient-to-r from-[#171717] via-[#1a1714] to-[#171717] p-5 sm:p-6 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#d6bd82]">
              Sales Advisor Dashboard
            </span>
            <h2 className="mt-1 text-2xl sm:text-3xl font-serif font-bold text-white">
              Welcome back, {user?.name || "Advisor"}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-neutral-300 max-w-xl">
              Track your showings schedule, manage assigned enquiries, and log walkthrough notes in real-time.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <p className="text-[10px] uppercase font-semibold text-[#d6bd82]">Monthly Target</p>
              <p className="text-xl font-bold text-white">₹4.2 Cr <span className="text-xs font-normal text-neutral-400">/ ₹5.0 Cr</span></p>
            </div>
            <div className="h-9 w-px bg-white/20" />
            <div>
              <p className="text-[10px] uppercase font-semibold text-emerald-400">Achieved</p>
              <p className="text-xl font-bold text-emerald-400">84%</p>
            </div>
          </div>
        </div>

        {/* Target Progress Bar */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-neutral-300 font-medium mb-1.5">
            <span>Target Volume Progress</span>
            <span className="text-[#d6bd82] font-semibold">₹8,40,000 Estimated Commission</span>
          </div>
          <div className="h-3 w-full rounded-full bg-white/15 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#b89658] to-[#e6ca8e] rounded-full transition-all duration-700" style={{ width: "84%" }} />
          </div>
        </div>
      </div>

      {/* ── 2. Today's & Upcoming Future Site Visits Schedule ─────────────────── */}
      <div className="rounded-xl border border-black/5 bg-white p-5 sm:p-6 luxury-shadow">
        <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#b89658]">Showings Schedule</p>
            <h3 className="font-[var(--font-display)] text-2xl font-bold text-[#171717]">Site Visits &amp; Future Showings</h3>
          </div>
          <Link href="/admin/site-visits" className="text-xs font-semibold text-[#b89658] hover:underline flex items-center gap-1">
            View All Schedule <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid gap-3.5">
          {myVisits.map((visit) => {
            const isToday = visit.time.includes("Today");
            const isConfirmed = visit.status === "CONFIRMED";
            const isTransit = visit.status === "IN_TRANSIT";

            return (
              <div
                key={visit.id}
                className={`p-4 rounded-xl border transition-all ${
                  isToday
                    ? "border-[#b89658]/30 bg-[#fdfdfc] shadow-xs"
                    : "border-black/5 bg-white"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isToday ? "bg-[#b89658] text-white" : "bg-purple-100 text-purple-700 border border-purple-200"
                      }`}>
                        ⏰ {visit.time}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        isConfirmed
                          ? "bg-emerald-100 text-emerald-800"
                          : isTransit
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {visit.status.replace("_", " ")}
                      </span>
                    </div>

                    <h4 className="mt-2 text-base font-bold text-[#171717]">{visit.name}</h4>
                    <p className="text-xs text-[#68625a] flex items-center gap-1.5 mt-0.5">
                      <Building2 size={13} className="text-[#b89658] shrink-0" />
                      <span>{visit.property}</span>
                    </p>
                    {visit.notes && (
                      <p className="mt-1 text-xs text-[#4f4942] italic">"{visit.notes}"</p>
                    )}
                  </div>

                  {/* 1-Tap Action Buttons */}
                  <div className="flex items-center gap-2 sm:self-center shrink-0">
                    <a
                      href={`tel:${visit.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-[#171717] hover:bg-black/5 transition shadow-xs"
                    >
                      <Phone size={14} className="text-[#b89658]" />
                      <span>Call Client</span>
                    </a>
                    <a
                      href={`https://wa.me/${visit.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-xs font-semibold text-white hover:bg-[#20bd5a] transition shadow-xs"
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Logistics details */}
                <div className="mt-3 pt-2.5 border-t border-black/5 flex items-center justify-between text-[11px] text-[#68625a]">
                  <span>🚗 {visit.driver}</span>
                  <span className="font-semibold text-[#b89658]">Site Visit Details →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. Assigned Enquiries Queue & Quick Inline Note Taker ─────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assigned Enquiries Feed */}
        <div className="rounded-xl border border-black/5 bg-white p-5 sm:p-6 luxury-shadow">
          <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#b89658]">My Lead Queue</p>
              <h3 className="font-[var(--font-display)] text-xl font-bold text-[#171717]">Assigned Enquiries</h3>
            </div>
            <span className="text-xs font-bold text-[#b89658] bg-[#b89658]/10 px-2.5 py-1 rounded-full">
              {myEnquiries.length} Active Leads
            </span>
          </div>

          <div className="grid gap-3">
            {myEnquiries.map((enquiry) => (
              <div
                key={enquiry.id}
                onClick={() => setSelectedEnquiry(enquiry.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer ${
                  selectedEnquiry === enquiry.id
                    ? "border-[#b89658] bg-[#b89658]/5 shadow-xs"
                    : "border-black/5 bg-white hover:border-black/15"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="font-bold text-sm text-[#171717]">{enquiry.name}</h5>
                    <p className="text-xs text-[#68625a]">{enquiry.property}</p>
                    <p className="text-[10px] text-[#68625a] mt-1">{enquiry.date}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/5 text-[#171717]">
                    {enquiry.status}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 pt-2 border-t border-black/5">
                  <a
                    href={`tel:${enquiry.phone}`}
                    className="inline-flex items-center gap-1 rounded bg-[#171717] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#2a2a2a]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone size={12} /> Call
                  </a>
                  <a
                    href={`https://wa.me/${enquiry.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded bg-[#25D366] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#20bd5a]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MessageCircle size={12} /> WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Inline Note Taker */}
        <div className="rounded-xl border border-black/5 bg-white p-5 sm:p-6 luxury-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#b89658]">Quick Action</p>
                <h3 className="font-[var(--font-display)] text-xl font-bold text-[#171717]">Log Notes &amp; Update Status</h3>
              </div>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#68625a] mb-1">Target Lead</label>
                <select
                  value={selectedEnquiry}
                  onChange={(e) => setSelectedEnquiry(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-[#171717] focus:border-[#b89658]"
                >
                  {myEnquiries.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.property}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#68625a] mb-1">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-[#171717] focus:border-[#b89658]"
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUALIFIED">QUALIFIED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="LOST">LOST</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#68625a] mb-1">Interaction Notes</label>
                <textarea
                  rows={4}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter walkthrough observations, buyer preferences, budget details..."
                  className="w-full rounded-lg border border-black/10 p-3 text-xs text-[#171717] focus:border-[#b89658]"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveNote}
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#b89658] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#a38347] transition shadow-xs"
              >
                <Send size={14} />
                <span>{isSaving ? "Saving..." : "Save Note & Update Lead"}</span>
              </button>
            </div>
          </div>

          {/* Quick Developer Inventory Status Helper */}
          <div className="mt-6 pt-4 border-t border-black/5 bg-[#fdfdfc] p-3 rounded-lg border border-black/5 text-xs">
            <p className="font-bold text-[#171717] flex items-center gap-1.5">
              <Building2 size={14} className="text-[#b89658]" /> Developer Inventory Status
            </p>
            <p className="mt-1 text-[11px] text-[#68625a]">
              Altus Residences: <strong>4 Units Available (Tower B)</strong> · Sobha Neopolis: <strong>Phase 1 Sold Out</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
