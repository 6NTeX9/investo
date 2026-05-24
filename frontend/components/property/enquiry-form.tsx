"use client";

import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";

export function EnquiryForm({ propertyId }: { propertyId: string }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Please fill in your name and phone number.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/enquiries", {
        name,
        phone,
        email: email || undefined,
        message: message || undefined,
        propertyId
      });
      toast.success("Your enquiry has been submitted successfully!");
      setName("");
      setPhone("");
      setEmail("");
      setMessage("");
    } catch (error: any) {
      console.error("Failed to submit enquiry:", error);
      const displayMsg = error.response?.data?.message;
      const msg = Array.isArray(displayMsg) ? displayMsg[0] : displayMsg;
      toast.error(msg || "Failed to submit enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-3">
      <input
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm bg-white text-black"
        placeholder="Name *"
      />
      <input
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm bg-white text-black"
        placeholder="Phone number *"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm bg-white text-black"
        placeholder="Email"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="focus-ring min-h-28 rounded-md border border-black/10 px-4 py-3 text-sm bg-white text-black"
        placeholder="Message"
      />
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-[#171717] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit enquiry"}
      </button>
    </form>
  );
}
