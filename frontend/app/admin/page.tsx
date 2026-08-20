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

export default function AdminPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true);

    try {
      const since = localStorage.getItem("admin_session_start") ?? new Date().toISOString();
      localStorage.setItem("admin_session_start", since);

      const [dashboardResult, enquiriesResult, visitsResult, agentsResult] = await Promise.all([
        api.get<DashboardData>(`/analytics/dashboard?since=${encodeURIComponent(since)}`),
        api.get<Enquiry[]>("/enquiries"),
        api.get<SiteVisit[]>("/site-visits"),
        api.get<Agent[]>("/agents")
      ]);

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

  const view = useMemo(() => {
    const leadCount = enquiries.length;
    const byLeadStatus = leadStages.reduce<Record<LeadStatus, number>>((counts, stage) => {
      counts[stage.status] = enquiries.filter((enquiry) => enquiry.status === stage.status).length;
      return counts;
    }, { NEW: 0, CONTACTED: 0, QUALIFIED: 0, CLOSED: 0, LOST: 0 });

    const actionLeads = enquiries
      .filter((enquiry) => enquiry.status === "NEW" || enquiry.status === "CONTACTED")
      .sort((first, second) => new Date(second.updatedAt ?? second.createdAt).getTime() - new Date(first.updatedAt ?? first.createdAt).getTime());
    const unassignedLeads = enquiries.filter((enquiry) => !enquiry.agent?.name);
    const pendingVisits = visits
      .filter((visit) => ["REQUESTED", "CONFIRMED", "RESCHEDULED"].includes(visit.status))
      .filter((visit) => new Date(visit.preferredAt).getTime() >= Date.now() - 24 * 60 * 60 * 1000)
      .sort((first, second) => new Date(first.preferredAt).getTime() - new Date(second.preferredAt).getTime());
    const activity = [
      ...enquiries.map((enquiry) => ({ kind: "lead" as const, ...enquiry })),
      ...visits.map((visit) => ({ kind: "visit" as const, ...visit }))
    ]
      .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime())
      .slice(0, 6);

    return {
      leadCount,
      byLeadStatus,
      actionLeads,
      unassignedLeads,
      pendingVisits,
      activity,
      todayVisits: pendingVisits.filter((visit) => isToday(visit.preferredAt)).length,
      closeRate: leadCount ? Math.round((byLeadStatus.CLOSED / leadCount) * 100) : 0,
      openPipeline: byLeadStatus.NEW + byLeadStatus.CONTACTED + byLeadStatus.QUALIFIED
    };
  }, [enquiries, visits]);

  if (isLoading) {
    return (
      <div className="grid min-h-[52svh] place-items-center px-5">
        <div className="flex items-center gap-3 text-sm text-[#68625a]">
          <Loader2 className="animate-spin text-[#b89658]" size={20} />
          Loading operations dashboard
        </div>
      </div>
    );
  }

  const freshLeadCount = dashboard?.newEnquiriesCount ?? view.byLeadStatus.NEW;
  const requestedVisitCount = dashboard?.newVisitsCount ?? visits.filter((visit) => visit.status === "REQUESTED").length;
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <section className="p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-5 border-b border-black/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b89658]">Operations dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-[#171717] sm:text-3xl">
            {greeting}, keep the pipeline moving.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68625a]">
            Focus on fresh enquiries, requested site visits, and leads that need a follow-up.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start lg:self-auto">
          <span className="hidden items-center gap-2 border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 sm:inline-flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Live data
          </span>
          <button
            type="button"
            onClick={() => void loadDashboard(true)}
            disabled={isRefreshing}
            className="grid h-10 w-10 place-items-center border border-black/10 bg-white text-[#68625a] transition hover:border-black/20 hover:text-[#171717] disabled:cursor-wait"
            aria-label="Refresh dashboard"
            title="Refresh dashboard"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </button>
          <Link
            href="/admin/properties"
            className="inline-flex h-10 items-center gap-2 bg-[#171717] px-3.5 text-xs font-semibold text-white transition hover:bg-black"
          >
            <Plus size={15} /> Add property
          </Link>
        </div>
      </header>

      {(freshLeadCount > 0 || requestedVisitCount > 0) && (
        <div className="mt-5 grid gap-px overflow-hidden border border-black/10 bg-black/10 md:grid-cols-2">
          {freshLeadCount > 0 && (
            <Link href="/admin/enquiries" className="group flex items-center justify-between gap-3 bg-sky-50 px-4 py-3.5 transition hover:bg-sky-100">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-sky-600 text-white"><MessageSquare size={16} /></span>
                <div>
                  <p className="text-sm font-semibold text-sky-900">{freshLeadCount} fresh {freshLeadCount === 1 ? "enquiry" : "enquiries"}</p>
                  <p className="mt-0.5 text-xs text-sky-700">Review and assign them now.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-sky-700 transition group-hover:translate-x-0.5" />
            </Link>
          )}
          {requestedVisitCount > 0 && (
            <Link href="/admin/site-visits" className="group flex items-center justify-between gap-3 bg-amber-50 px-4 py-3.5 transition hover:bg-amber-100">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-500 text-white"><CalendarCheck2 size={16} /></span>
                <div>
                  <p className="text-sm font-semibold text-amber-900">{requestedVisitCount} {requestedVisitCount === 1 ? "visit" : "visits"} awaiting action</p>
                  <p className="mt-0.5 text-xs text-amber-700">Confirm a time and assign an advisor.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-amber-700 transition group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      )}

      <div className="mt-5 grid gap-px overflow-hidden border border-black/10 bg-black/10 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Published portfolio" value={dashboard?.properties ?? 0} detail="Manage properties" href="/admin/properties" icon={Building2} accent="bg-[#f4ead6] text-[#8d6b31]" />
        <MetricCard label="Open pipeline" value={view.openPipeline} detail="Review enquiries" href="/admin/enquiries" icon={Inbox} accent="bg-sky-100 text-sky-700" />
        <MetricCard label="Visits today" value={view.todayVisits} detail="Open calendar" href="/admin/site-visits" icon={CalendarCheck2} accent="bg-amber-100 text-amber-700" />
        <MetricCard label="Close rate" value={`${view.closeRate}%`} detail={`${agents.length} active advisors`} href="/admin/agent-reports" icon={Target} accent="bg-emerald-100 text-emerald-700" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <section className="border border-black/10 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-4 sm:px-5">
            <div>
              <p className="text-sm font-semibold text-[#171717]">Lead pipeline</p>
              <p className="mt-1 text-xs text-[#68625a]">Current distribution across every enquiry.</p>
            </div>
            <Link href="/admin/enquiries" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8d6b31] hover:text-[#171717]">
              Open leads <ArrowRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-black/5 px-4 sm:px-5">
            {leadStages.map((stage) => {
              const count = view.byLeadStatus[stage.status];
              const progress = view.leadCount ? Math.round((count / view.leadCount) * 100) : 0;
              return (
                <div key={stage.status} className="grid grid-cols-[94px_1fr_42px] items-center gap-3 py-3.5 sm:grid-cols-[110px_1fr_46px]">
                  <span className="text-xs font-medium text-[#4f4942]">{stage.label}</span>
                  <div className="h-2 overflow-hidden bg-[#eeeae2]" aria-label={`${stage.label}: ${count} leads`}>
                    <div className={`h-full ${stage.tone} transition-[width] duration-500`} style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-right text-sm font-semibold tabular-nums text-[#171717]">{count}</span>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 border-t border-black/10 bg-[#fcfbf8] text-center">
            <div className="border-r border-black/10 px-4 py-3">
              <p className="text-lg font-semibold tabular-nums">{view.leadCount}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-[#68625a]">Total leads</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-lg font-semibold tabular-nums">{view.byLeadStatus.QUALIFIED}</p>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-[#68625a]">Ready for a visit</p>
            </div>
          </div>
        </section>

        <section className="border border-black/10 bg-white">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-4 sm:px-5">
            <div>
              <p className="text-sm font-semibold text-[#171717]">Action queue</p>
              <p className="mt-1 text-xs text-[#68625a]">Work that needs a decision.</p>
            </div>
            <CircleAlert size={18} className="text-[#b89658]" />
          </div>
          <div className="divide-y divide-black/5">
            {[
              { label: "Fresh leads to respond to", value: freshLeadCount, href: "/admin/enquiries", icon: MessageSquare, tone: "text-sky-700 bg-sky-50" },
              { label: "Leads without an advisor", value: view.unassignedLeads.length, href: "/admin/enquiries", icon: UserRoundCheck, tone: "text-violet-700 bg-violet-50" },
              { label: "Visits awaiting confirmation", value: requestedVisitCount, href: "/admin/site-visits", icon: CalendarCheck2, tone: "text-amber-700 bg-amber-50" }
            ].map(({ label, value, href, icon: Icon, tone }) => (
              <Link key={label} href={href} className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-[#fcfbf8] sm:px-5">
                <span className={`grid h-8 w-8 place-items-center rounded-full ${tone}`}><Icon size={14} /></span>
                <span className="min-w-0 flex-1 text-sm text-[#4f4942]">{label}</span>
                <span className="text-sm font-semibold tabular-nums text-[#171717]">{value}</span>
                <ChevronRight size={15} className="text-[#68625a] transition group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
          <div className="border-t border-black/10 bg-[#fcfbf8] px-4 py-3 sm:px-5">
            <Link href="/admin/site-visits" className="inline-flex items-center gap-2 text-xs font-semibold text-[#8d6b31] hover:text-[#171717]">
              <Plus size={14} /> Schedule a site visit
            </Link>
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <section className="border border-black/10 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-4 py-4 sm:px-5">
            <div>
              <p className="text-sm font-semibold text-[#171717]">Upcoming site visits</p>
              <p className="mt-1 text-xs text-[#68625a]">Next confirmed, requested, or rescheduled appointments.</p>
            </div>
            <Link href="/admin/site-visits" className="text-xs font-semibold text-[#8d6b31] hover:text-[#171717]">View calendar</Link>
          </div>
          {view.pendingVisits.length === 0 ? (
            <EmptyState label="No upcoming site visits" />
          ) : (
            <div className="divide-y divide-black/5">
              {view.pendingVisits.slice(0, 5).map((visit) => (
                <Link key={visit.id} href="/admin/site-visits" className="group grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3.5 transition hover:bg-[#fcfbf8] sm:px-5">
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-sm font-semibold text-[#171717]">{visit.name}</p>
                      <span className={`shrink-0 border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${visitStatusStyles[visit.status]}`}>{visit.status}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-[#68625a]">{visit.property?.title ?? "General site visit"}{visit.assignedAgent?.name ? ` · ${visit.assignedAgent.name}` : " · Unassigned"}</p>
                  </div>
                  <time className="self-center text-right text-xs font-medium text-[#4f4942]">{formatVisitDate(visit.preferredAt)}</time>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="border border-black/10 bg-white">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-4 sm:px-5">
            <div>
              <p className="text-sm font-semibold text-[#171717]">Latest activity</p>
              <p className="mt-1 text-xs text-[#68625a]">New client activity across the CRM.</p>
            </div>
            <Clock3 size={17} className="text-[#68625a]" />
          </div>
          {view.activity.length === 0 ? (
            <EmptyState label="No activity recorded yet" />
          ) : (
            <div className="divide-y divide-black/5">
              {view.activity.map((item) => {
                const isLead = item.kind === "lead";
                const Icon = isLead ? MessageSquare : CalendarCheck2;
                const href = isLead ? "/admin/enquiries" : "/admin/site-visits";
                const statusClass = isLead
                  ? leadStatusStyles[item.status as LeadStatus]
                  : visitStatusStyles[item.status as VisitStatus];
                return (
                  <Link key={`${item.kind}-${item.id}`} href={href} className="group flex gap-3 px-4 py-3.5 transition hover:bg-[#fcfbf8] sm:px-5">
                    <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${isLead ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700"}`}><Icon size={14} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-[#171717]">{item.name}</p>
                        <span className={`shrink-0 border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.08em] ${statusClass}`}>{item.status}</span>
                      </div>
                      <p className="mt-1 truncate text-xs text-[#68625a]">{isLead ? "New enquiry" : "Site visit"}{item.property?.title ? ` · ${item.property.title}` : ""}</p>
                    </div>
                    <span className="shrink-0 pt-0.5 text-[11px] text-[#68625a]">{timeAgo(item.createdAt)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <footer className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-[#68625a]">
        <span>{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}` : "Dashboard data unavailable"}</span>
        <Link href="/admin/agent-reports" className="inline-flex items-center gap-1.5 font-medium text-[#8d6b31] hover:text-[#171717]">
          <UsersRound size={13} /> Open agent reports
        </Link>
      </footer>
    </section>
  );
}
