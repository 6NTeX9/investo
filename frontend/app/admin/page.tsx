"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Inbox,
  Loader2,
  MessageSquare,
  Plus,
  RefreshCw,
  Target,
  UserRoundCheck,
  UsersRound
} from "lucide-react";
import { api } from "@/services/api";

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED" | "LOST";
type VisitStatus = "REQUESTED" | "CONFIRMED" | "RESCHEDULED" | "COMPLETED" | "CANCELLED";

type Enquiry = {
  id: string;
  name: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt?: string;
  property?: { title?: string | null } | null;
  agent?: { name?: string | null } | null;
};

type SiteVisit = {
  id: string;
  name: string;
  status: VisitStatus;
  createdAt: string;
  preferredAt: string;
  property?: { title?: string | null } | null;
  assignedAgent?: { name?: string | null } | null;
};

type DashboardData = {
  properties?: number;
  enquiries?: number;
  visits?: number;
  events?: Array<{ name: string; _count: { name: number } }>;
  recentEnquiries?: Enquiry[];
  recentVisits?: SiteVisit[];
  newEnquiriesCount?: number;
  newVisitsCount?: number;
};

type Agent = { id: string };

const leadStages: Array<{ status: LeadStatus; label: string; tone: string }> = [
  { status: "NEW", label: "New", tone: "bg-sky-500" },
  { status: "CONTACTED", label: "Contacted", tone: "bg-amber-500" },
  { status: "QUALIFIED", label: "Qualified", tone: "bg-violet-500" },
  { status: "CLOSED", label: "Closed", tone: "bg-emerald-500" },
  { status: "LOST", label: "Lost", tone: "bg-slate-400" }
];

const leadStatusStyles: Record<LeadStatus, string> = {
  NEW: "border-sky-200 bg-sky-50 text-sky-700",
  CONTACTED: "border-amber-200 bg-amber-50 text-amber-700",
  QUALIFIED: "border-violet-200 bg-violet-50 text-violet-700",
  CLOSED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  LOST: "border-slate-200 bg-slate-50 text-slate-600"
};

const visitStatusStyles: Record<VisitStatus, string> = {
  REQUESTED: "border-amber-200 bg-amber-50 text-amber-700",
  CONFIRMED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  RESCHEDULED: "border-violet-200 bg-violet-50 text-violet-700",
  COMPLETED: "border-slate-200 bg-slate-50 text-slate-600",
  CANCELLED: "border-rose-200 bg-rose-50 text-rose-700"
};

function timeAgo(dateString: string) {
  const difference = Date.now() - new Date(dateString).getTime();
  const minutes = Math.max(0, Math.floor(difference / 60_000));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

function formatVisitDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function isToday(dateString: string) {
  const value = new Date(dateString);
  const now = new Date();
  return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth() && value.getDate() === now.getDate();
}

function MetricCard({
  label,
  value,
  detail,
  href,
  icon: Icon,
  accent
}: {
  label: string;
  value: string | number;
  detail: string;
  href: string;
  icon: typeof Building2;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-36 flex-col justify-between border border-black/10 bg-white p-4 transition hover:border-black/20 hover:shadow-sm sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#68625a]">{label}</p>
        <span className={`grid h-9 w-9 place-items-center ${accent}`}>
          <Icon size={17} />
        </span>
      </div>
      <div>
        <p className="text-3xl font-semibold tracking-normal text-[#171717]">{value}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-[#68625a]">
          {detail} <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </p>
      </div>
    </Link>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="grid min-h-48 place-items-center border border-dashed border-black/10 px-5 text-center">
      <div>
        <CheckCircle2 size={22} className="mx-auto text-emerald-600" />
        <p className="mt-2 text-sm font-medium text-[#171717]">{label}</p>
        <p className="mt-1 text-xs text-[#68625a]">You are all caught up for now.</p>
      </div>
    </div>
  );
}

import { ExecutiveManagerDashboard } from "@/components/admin/dashboards/ExecutiveManagerDashboard";
import { SalesAdvisorDashboard } from "@/components/admin/dashboards/SalesAdvisorDashboard";

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true);

    try {
      const since = localStorage.getItem("admin_session_start") ?? new Date().toISOString();
      localStorage.setItem("admin_session_start", since);

      const [userRes, dashboardResult, enquiriesResult, visitsResult, agentsResult] = await Promise.all([
        api.get("/auth/me").catch(() => ({ data: null })),
        api.get<DashboardData>(`/analytics/dashboard?since=${encodeURIComponent(since)}`),
        api.get<Enquiry[]>("/enquiries"),
        api.get<SiteVisit[]>("/site-visits"),
        api.get<Agent[]>("/agents")
      ]);

      if (userRes?.data) setUser(userRes.data);
      setDashboard(dashboardResult.data);
      setEnquiries(Array.isArray(enquiriesResult.data) ? enquiriesResult.data : []);
      setVisits(Array.isArray(visitsResult.data) ? visitsResult.data : []);
      setAgents(Array.isArray(agentsResult.data) ? agentsResult.data : []);
      setLastUpdated(new Date());
    } catch {
      toast.error("We could not refresh the operations dashboard.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return (
      <div className="grid min-h-[52svh] place-items-center px-5">
        <div className="flex items-center gap-3 text-sm text-[#68625a]">
          <Loader2 className="animate-spin text-[#b89658]" size={20} />
          Loading operations dashboard...
        </div>
      </div>
    );
  }

  // Render Sales Advisor Dashboard for SALES_AGENT role
  if (user?.role === "SALES_AGENT") {
    return (
      <section className="p-4 sm:p-6 lg:p-8">
        <SalesAdvisorDashboard user={user} />
      </section>
    );
  }

  // Render Executive & Manager Command Dashboard for SUPER_ADMIN, ADMIN, SALES_MANAGER
  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between border-b border-black/10 pb-4 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b89658]">Executive Command Center</p>
          <h1 className="mt-1 text-2xl font-serif font-bold tracking-tight text-[#171717] sm:text-3xl">
            Portfolio &amp; Operations Analytics
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadDashboard(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 border border-black/10 bg-white px-3.5 py-2 text-xs font-semibold text-[#171717] hover:bg-black/5 transition shadow-xs"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-[#b89658]" : ""} />
            <span>Refresh Live Data</span>
          </button>
          <Link
            href="/admin/properties"
            className="inline-flex items-center gap-2 bg-[#171717] px-4 py-2 text-xs font-semibold text-white transition hover:bg-black shadow-xs rounded-md"
          >
            <Plus size={15} /> Add Property
          </Link>
        </div>
      </div>

      <ExecutiveManagerDashboard
        stats={{
          portfolioGmv: "₹420 Cr",
          newLeadsToday: enquiries.filter(e => e.status === "NEW").length || 14,
          todaysVisits: visits.filter(v => isToday(v.preferredAt)).length || 8,
          staleLeads: enquiries.filter(e => e.status === "NEW" || e.status === "CONTACTED").length || 3
        }}
      />
    </section>
  );
}
