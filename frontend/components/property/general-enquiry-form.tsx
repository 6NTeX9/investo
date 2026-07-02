"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Loader2, MessageSquare } from "lucide-react";

export function GeneralEnquiryForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      toast.error("Please fill in your name and phone number.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/enquiries", {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        message: message.trim() || undefined,
      });
      toast.success("Your callback request has been submitted! Our team will reach out shortly.");
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (error: any) {
      const displayMsg = error.response?.data?.message;
      const msg = Array.isArray(displayMsg) ? displayMsg[0] : displayMsg;
      toast.error(msg || "Failed to submit. Please try again.");
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
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priya Mehta"
            className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Phone number *
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium">
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm"
        />
      </label>

      <label className="grid gap-2 text-sm font-medium">
        Message / What are you looking for?
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Tell us your budget, preferred location, property type, or any specific requirements..."
          className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm resize-none"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] disabled:opacity-60"
      >
        {submitting ? (
          <><Loader2 size={16} className="animate-spin" /> Submitting...</>
        ) : (
          <><MessageSquare size={16} /> Request callback</>
        )}
      </button>
    </form>
  );
}
