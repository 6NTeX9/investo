"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/services/api";
import {
  TrendingUp, Inbox, Calendar, CheckCircle2, XCircle,
  Phone, Clock, Loader2, Activity, Star, UserCheck,
  ChevronRight, Award
} from "lucide-react";

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED" | "LOST";
type VisitStatus = "REQUESTED" | "CONFIRMED" | "RESCHEDULED" | "COMPLETED" | "CANCELLED";

interface RecentEnquiry {
  id: string;
  name: string;
  status: LeadStatus;
  updatedAt: string;
  createdAt: string;
  property: { title: string } | null;
}

interface RecentVisit {
  id: string;
  name: string;
  status: VisitStatus;
  preferredAt: string;
  createdAt: string;
  property: { title: string } | null;
}

interface AgentStats {
  agent: {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatarUrl: string | null;
    memberSince: string;
  };
  enquiryStats: {
    total: number;
    NEW: number;
    CONTACTED: number;
    QUALIFIED: number;
    CLOSED: number;
    LOST: number;
  };
  visitStats: {
    total: number;
    REQUESTED: number;
    CONFIRMED: number;
    RESCHEDULED: number;
    COMPLETED: number;
    CANCELLED: number;
  };
  conversionRate: number;
  lastActivityAt: string | null;
  recentEnquiries: RecentEnquiry[];
  recentVisits: RecentVisit[];
}

const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  NEW:       { label: "New",       color: "text-blue-700",    bg: "bg-blue-50 border-blue-100" },
  CONTACTED: { label: "Contacted", color: "text-indigo-700",  bg: "bg-indigo-50 border-indigo-100" },
  QUALIFIED: { label: "Qualified", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100" },
  CLOSED:    { label: "Closed",    color: "text-teal-700",    bg: "bg-teal-50 border-teal-100" },
  LOST:      { label: "Lost",      color: "text-red-700",     bg: "bg-red-50 border-red-100" }
};

const VISIT_STATUS_CONFIG: Record<VisitStatus, { label: string; dot: string }> = {
  REQUESTED:   { label: "Requested",   dot: "bg-blue-400" },
  CONFIRMED:   { label: "Confirmed",   dot: "bg-emerald-500" },
  RESCHEDULED: { label: "Rescheduled", dot: "bg-indigo-400" },
  COMPLETED:   { label: "Completed",   dot: "bg-teal-500" },
  CANCELLED:   { label: "Cancelled",   dot: "bg-red-400" }
};

function StatCard({
  icon: Icon, label, value, sub, highlight
}: { icon: any; label: string; value: number | string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-2 luxury-shadow bg-white transition hover:shadow-md ${highlight ? "border-[#b89658]/40 bg-[#fdf9f2]" : "border-black/5"}`}>
      <div className="flex items-center gap-2">
        <div className={`rounded-lg p-2 ${highlight ? "bg-[#b89658]/10" : "bg-[#f7f4ee]"}`}>
          <Icon size={16} className={highlight ? "text-[#b89658]" : "text-[#68625a]"} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#68625a]">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${highlight ? "text-[#b89658]" : "text-[#171717]"}`}>{value}</p>
      {sub && <p className="text-xs text-[#68625a]">{sub}</p>}
    </div>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 rounded-full bg-black/5 h-2 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-[#68625a] w-8 text-right">{value}</span>
    </div>
  );
}

export default function MyProgressPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/login"); return; }

    api.get("/agents/report/me")
      .then((res) => setStats(res.data))
      .catch(() => toast.error("Failed to load your progress data."))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <section className="p-6 md:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-black/5 rounded-lg" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-black/5 rounded-xl" />)}
          </div>
          <div className="h-48 bg-black/5 rounded-xl" />
          <div className="h-64 bg-black/5 rounded-xl" />
        </div>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="p-6 md:p-8 grid place-items-center py-20">
        <Inbox size={48} className="text-[#b89658]/40" />
        <h3 className="mt-4 font-semibold text-lg">No data available</h3>
        <p className="mt-1 text-sm text-[#68625a]">Your agent profile might not be linked yet.</p>
      </section>
    );
  }

  const { agent, enquiryStats, visitStats, conversionRate, recentEnquiries, recentVisits } = stats;

  return (
    <section className="p-6 md:p-8 space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">My Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#171717]">My Progress</h1>
          <p className="mt-1 text-sm text-[#68625a]">
            Welcome back, <span className="font-semibold text-[#171717]">{agent.name}</span> · Member since {new Date(agent.memberSince).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-[#b89658]/20 bg-[#fdf9f2] px-5 py-3">
          <Award size={28} className="text-[#b89658] shrink-0" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#68625a]">Conversion Rate</p>
            <p className="text-2xl font-bold text-[#b89658]">{conversionRate}%</p>
          </div>
        </div>
      </div>

      {/* ── Summary KPI Cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Inbox}         label="Total Leads"   value={enquiryStats.total}  sub="Assigned enquiries" />
        <StatCard icon={CheckCircle2}  label="Closed Deals"  value={enquiryStats.CLOSED} sub="Successfully closed" highlight />
        <StatCard icon={Calendar}      label="Site Visits"   value={visitStats.total}    sub="All showings" />
        <StatCard icon={Star}          label="Completed Visits" value={visitStats.COMPLETED} sub="Finished showings" />
      </div>

      {/* ── Lead Status Breakdown ── */}
      <div className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-xl border border-black/5 bg-white p-6 luxury-shadow">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-[#b89658]" />
            <h2 className="font-semibold text-[#171717]">Lead Pipeline</h2>
          </div>
          <div className="space-y-4">
            {(["NEW","CONTACTED","QUALIFIED","CLOSED","LOST"] as LeadStatus[]).map((s) => (
              <div key={s}>
                <div className="flex justify-between mb-1">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${LEAD_STATUS_CONFIG[s].bg} ${LEAD_STATUS_CONFIG[s].color}`}>
                    {LEAD_STATUS_CONFIG[s].label}
                  </span>
                </div>
                <ProgressBar
                  value={enquiryStats[s]}
                  max={enquiryStats.total}
                  color={
                    s === "CLOSED" ? "bg-teal-500" :
                    s === "LOST" ? "bg-red-400" :
                    s === "QUALIFIED" ? "bg-emerald-500" :
                    s === "CONTACTED" ? "bg-indigo-400" : "bg-blue-400"
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Site Visit Status Breakdown */}
        <div className="rounded-xl border border-black/5 bg-white p-6 luxury-shadow">
          <div className="flex items-center gap-2 mb-5">
            <Calendar size={18} className="text-[#b89658]" />
            <h2 className="font-semibold text-[#171717]">Visit Status</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(["REQUESTED","CONFIRMED","RESCHEDULED","COMPLETED","CANCELLED"] as VisitStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-2 rounded-lg border border-black/5 p-3">
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${VISIT_STATUS_CONFIG[s].dot}`} />
                <div>
                  <p className="text-xs font-semibold text-[#68625a]">{VISIT_STATUS_CONFIG[s].label}</p>
                  <p className="text-xl font-bold text-[#171717]">{visitStats[s]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent Enquiries ── */}
      <div className="rounded-xl border border-black/5 bg-white luxury-shadow overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
          <div className="flex items-center gap-2">
            <Activity size={17} className="text-[#b89658]" />
            <h2 className="font-semibold text-[#171717]">My Recent Leads</h2>
          </div>
          <span className="text-xs text-[#68625a]">Last 10 updated</span>
        </div>
        {recentEnquiries.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[#68625a]">No enquiries assigned yet.</div>
        ) : (
          <div className="divide-y divide-black/5">
            {recentEnquiries.map((enq) => {
              const cfg = LEAD_STATUS_CONFIG[enq.status];
              return (
                <div key={enq.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-black/[0.015] transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <UserCheck size={15} className="text-[#b89658] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#171717] truncate">{enq.name}</p>
                      <p className="text-xs text-[#68625a] truncate">{enq.property?.title ?? "No property"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
                      {cfg.label}
                    </span>
                    <span className="text-[11px] text-[#68625a]">
                      {new Date(enq.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </span>
                    <ChevronRight size={13} className="text-[#68625a]/40" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Recent Site Visits ── */}
      <div className="rounded-xl border border-black/5 bg-white luxury-shadow overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
          <div className="flex items-center gap-2">
            <Clock size={17} className="text-[#b89658]" />
            <h2 className="font-semibold text-[#171717]">My Recent Site Visits</h2>
          </div>
          <span className="text-xs text-[#68625a]">Last 5</span>
        </div>
        {recentVisits.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[#68625a]">No site visits assigned yet.</div>
        ) : (
          <div className="divide-y divide-black/5">
            {recentVisits.map((visit) => {
              const cfg = VISIT_STATUS_CONFIG[visit.status];
              return (
                <div key={visit.id} className="flex items-center justify-between px-6 py-3.5 hover:bg-black/[0.015] transition">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#171717] truncate">{visit.name}</p>
                      <p className="text-xs text-[#68625a] truncate">{visit.property?.title ?? "No property"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-semibold text-[#68625a]">{cfg.label}</span>
                    <span className="flex items-center gap-1 text-[11px] text-[#68625a]">
                      <Phone size={10} />
                      {new Date(visit.preferredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                    <ChevronRight size={13} className="text-[#68625a]/40" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </section>
  );
}
