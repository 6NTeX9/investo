"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { Building2, Inbox, CalendarCheck, Users, BarChart3, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get("/analytics/dashboard");
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load dashboard metrics:", err);
        toast.error("Failed to load live dashboard statistics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-[50svh] place-items-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-[#b89658]" size={32} />
          <p className="text-sm text-[#68625a]">Loading statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="p-6 md:p-8">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Dashboard overview</p>
          <h1 className="mt-2 text-3xl font-semibold">Property operations</h1>
        </div>
      </div>
      
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: Building2, label: "Properties", value: stats?.properties ?? 0 },
          { icon: Inbox, label: "Open enquiries", value: stats?.enquiries ?? 0 },
          { icon: CalendarCheck, label: "Site visits", value: stats?.visits ?? 0 },
          { icon: Users, label: "Sales agents", value: "1" } // Local mockup or agent count if available
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-black/10 bg-white p-5 luxury-shadow">
            <item.icon size={22} className="text-[#b89658]" />
            <p className="mt-5 text-3xl font-semibold">{item.value}</p>
            <p className="mt-1 text-sm text-[#68625a]">{item.label}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-black/10 bg-white p-6 luxury-shadow">
          <div className="flex items-center gap-2">
            <BarChart3 size={20} />
            <h2 className="font-semibold">Enquiry statistics</h2>
          </div>
          <div className="mt-6 grid h-64 grid-cols-7 items-end gap-3">
            {[32, 46, 38, 61, 54, 70, 58].map((height, index) => (
              <div key={index} className="rounded-t-md bg-[#b89658]" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-black/10 bg-white p-6 luxury-shadow">
          <h2 className="font-semibold">Recent activity</h2>
          <div className="mt-5 grid gap-4 text-sm text-[#68625a]">
            <p>Altus Residences gallery updated.</p>
            <p>New site visit requested for Marina Gate Villas.</p>
            <p>Elena Rossi assigned to One Park Commercial Tower.</p>
            <p>Market outlook article published.</p>
          </div>
        </div>
      </div>
    </section>
  );
}


