"use client";

import { useState } from "react";
import { CalendarDays, Loader2 } from "lucide-react";
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
    preferredTime: "10:00",
    message: ""
  });

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
        preferredTime: "10:00",
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
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={form.preferredDate}
            onChange={(event) => update("preferredDate", event.target.value)}
            className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Preferred time *
          <input
            type="time"
            value={form.preferredTime}
            onChange={(event) => update("preferredTime", event.target.value)}
            className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm"
          />
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
