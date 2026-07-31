"use client";

import { useEffect, useState } from "react";
import { PropertyCard } from "@/components/property/property-card";
import { api } from "@/services/api";
import { Loader2 } from "lucide-react";

export function ClientPropertyLoader() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await api.get("/properties?limit=200");
      const raw = res.data?.items ?? (Array.isArray(res.data) ? res.data : []);
      setProperties(raw);
    } catch (err) {
      console.error("Client Property Fetch attempt failed:", err);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <div className="mt-8 grid place-items-center py-16 rounded-xl border border-black/5 bg-white luxury-shadow text-center">
        <Loader2 className="animate-spin text-[#b89658]" size={32} />
        <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#68625a]">
          Waking up backend server...
        </p>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center p-6 rounded-xl border border-amber-200 bg-amber-50 text-center">
        <p className="text-sm font-semibold text-amber-900">
          The backend server is starting up.
        </p>
        <button
          onClick={fetchProperties}
          className="mt-3 rounded-md bg-[#171717] px-4 py-2 text-xs font-semibold text-white hover:bg-[#2a2a2a] transition"
        >
          Retry Loading Properties
        </button>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-black/5 bg-white p-8 text-center text-sm text-[#68625a]">
        No published properties found. Add properties in the admin panel to show them here.
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
