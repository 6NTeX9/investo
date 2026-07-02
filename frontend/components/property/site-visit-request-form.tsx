"use client";

import { useState } from "react";
import { CalendarDays, Loader2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/services/api";

export function SiteVisitRequestForm() {
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    interestedProperty: "",
    preferredDate: "",
    preferredTime: "",
    message: ""
  });

  // Generate next 14 days
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + i);
      
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, "0");
      const dd = String(nextDate.getDate()).padStart(2, "0");
      const value = `${yyyy}-${mm}-${dd}`;
      
      let label = "";
      if (i === 0) {
        label = `Today (${nextDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })})`;
      } else if (i === 1) {
        label = `Tomorrow (${nextDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })})`;
      } else {
        label = nextDate.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
      }
      
      dates.push({ label, value });
    }
    return dates;
  };

  const getAvailableTimes = () => {
    const times = [];
    // From 10:00 AM to 10:00 PM (10:00 to 22:00)
    for (let hour = 10; hour <= 21; hour++) {
      for (let min of ["00", "30"]) {
        const hh = String(hour).padStart(2, "0");
        const value = `${hh}:${min}`;
        
        const displayHour = hour > 12 ? hour - 12 : hour;
        const ampm = hour >= 12 ? "PM" : "AM";
        const label = `${String(displayHour).padStart(2, "0")}:${min} ${ampm}`;
        
        times.push({ label, value });
      }
    }
    times.push({ label: "10:00 PM", value: "22:00" });
    return times;
  };

  const availableDates = getAvailableDates();
  const availableTimes = getAvailableTimes();

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.preferredDate || !form.preferredTime) {
      toast.error("Name, phone, visit date and time are required.");
      return;
    }

    setSubmitting(true);
    try {
      const preferredAt = new Date(`${form.preferredDate}T${form.preferredTime}`).toISOString();
      const messageParts = [
        form.interestedProperty ? `Interested property: ${form.interestedProperty}` : "",
        form.message
      ].filter(Boolean);

      await api.post("/site-visits", {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        preferredAt,
        message: messageParts.join("\n\n") || undefined
      });

      toast.success("Site visit request submitted. Our sales team will confirm the slot.");
      setForm({
        name: "",
        phone: "",
        email: "",
        interestedProperty: "",
        preferredDate: "",
        preferredTime: "",
        message: ""
      });
    } catch (error: any) {
      const message = error.response?.data?.message;
      toast.error(Array.isArray(message) ? message[0] : message ?? "Failed to submit site visit request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-lg bg-white p-6 luxury-shadow">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Name *
          <input
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Phone number *
          <input
            value={form.phone}
            onChange={(event) => update("phone", event.target.value)}
            className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Email
        <input
          type="email"
          value={form.email}
          onChange={(event) => update("email", event.target.value)}
          className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Interested property
        <input
          value={form.interestedProperty}
          onChange={(event) => update("interestedProperty", event.target.value)}
          className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm"
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Preferred visit date *
          <div className="relative">
            <select
              value={form.preferredDate}
              onChange={(event) => update("preferredDate", event.target.value)}
              className="focus-ring w-full rounded-md border border-black/10 px-4 py-3 text-sm bg-white font-medium appearance-none cursor-pointer hover:border-[#b89658]/40 transition"
            >
              <option value="">Select date</option>
              {availableDates.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#68625a]">
              <ChevronDown size={16} />
            </div>
          </div>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Preferred time *
          <div className="relative">
            <select
              value={form.preferredTime}
              onChange={(event) => update("preferredTime", event.target.value)}
              className="focus-ring w-full rounded-md border border-black/10 px-4 py-3 text-sm bg-white font-medium appearance-none cursor-pointer hover:border-[#b89658]/40 transition"
            >
              <option value="">Select time</option>
              {availableTimes.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#68625a]">
              <ChevronDown size={16} />
            </div>
          </div>
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Message
        <textarea
          value={form.message}
          onChange={(event) => update("message", event.target.value)}
          className="focus-ring min-h-32 rounded-md border border-black/10 px-4 py-3 text-sm"
        />
      </label>

      <button
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-[#171717] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {submitting ? <Loader2 size={16} className="animate-spin" /> : <CalendarDays size={16} />}
        {submitting ? "Submitting..." : "Submit site visit request"}
      </button>
    </form>
  );
}
