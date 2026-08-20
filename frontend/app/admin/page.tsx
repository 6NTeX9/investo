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
  UsersRound,
  TrendingUp
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

const leadStages: Array<{ status: LeadStatus; label: string; tone: string; textTone: string }> = [
  { status: "NEW", label: "New Leads", tone: "bg-sky-500", textTone: "text-sky-700 bg-sky-50 border-sky-200" },
  { status: "CONTACTED", label: "Contacted", tone: "bg-amber-500", textTone: "text-amber-700 bg-amber-50 border-amber-200" },
  { status: "QUALIFIED", label: "Qualified", tone: "bg-violet-500", textTone: "text-violet-700 bg-violet-50 border-violet-200" },
  { status: "CLOSED", label: "Closed / Won", tone: "bg-emerald-500", textTone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { status: "LOST", label: "Lost", tone: "bg-slate-400", textTone: "text-slate-600 bg-slate-50 border-slate-200" }
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
      className="group flex flex-col justify-between rounded-xl border border-black/5 bg-white p-5 luxury-shadow transition-all duration-300 hover:-translate-y-0.5 hover:border-[#b89658]/40"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#68625a]">{label}</p>
        <span className={`grid size-9 place-items-center rounded-lg ${accent}`}>
          <Icon size={18} />
        </span>
      </div>
      <div className="mt-4">
        <p className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold tracking-tight text-[#171717]">{value}</p>
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#b89658] group-hover:text-[#171717] transition">
          <span>{detail}</span>
          <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
        </p>
      </div>
    </Link>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-black/10 p-6 text-center">
      <div>
        <CheckCircle2 size={24} className="mx-auto text-emerald-600" />
        <p className="mt-2 text-sm font-semibold text-[#171717]">{label}</p>
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
        <div className="flex items-center gap-3 text-sm font-medium text-[#68625a]">
          <Loader2 className="animate-spin text-[#b89658]" size={22} />
          Loading operations dashboard...
        </div>
      </div>
    );
  }

  const freshLeadCount = dashboard?.newEnquiriesCount ?? view.byLeadStatus.NEW;
  const requestedVisitCount = dashboard?.newVisitsCount ?? visits.filter((visit) => visit.status === "REQUESTED").length;
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";

  return (
    <section className="space-y-6">
      {/* CMS Standard Header */}
      <header className="flex flex-col gap-4 border-b border-black/5 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#b89658]">Operations Dashboard</p>
          <h1 className="mt-1 font-[var(--font-display)] text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#171717]">
            {greeting}, keep the pipeline moving
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#68625a]">
            Focus on fresh enquiries, requested site visits, and leads that need a follow-up.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => void loadDashboard(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-[#4f4942] transition hover:bg-black/5 hover:text-[#171717] disabled:cursor-wait luxury-shadow"
            aria-label="Refresh dashboard"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin text-[#b89658]" : "text-[#b89658]"} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/properties"
            className="flex items-center gap-2 rounded-md bg-[#171717] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2a2a2a] shadow-xs"
          >
            <Plus size={15} />
            <span>Add Property</span>
          </Link>
        </div>
      </header>

      {/* Urgent Action Banners */}
      {(freshLeadCount > 0 || requestedVisitCount > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {freshLeadCount > 0 && (
            <Link
              href="/admin/enquiries"
              className="group flex items-center justify-between rounded-xl border border-sky-200/80 bg-sky-50/70 p-4 luxury-shadow transition-all duration-300 hover:border-sky-300 hover:bg-sky-50"
            >
              <div className="flex items-center gap-3.5">
                <span className="grid size-10 place-items-center rounded-lg bg-sky-600 text-white shadow-xs">
                  <MessageSquare size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-sky-950">
                    {freshLeadCount} fresh {freshLeadCount === 1 ? "enquiry" : "enquiries"}
                  </p>
                  <p className="mt-0.5 text-xs text-sky-700">Review and assign to advisory desk now.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-sky-700 transition group-hover:translate-x-1" />
            </Link>
          )}
          {requestedVisitCount > 0 && (
            <Link
              href="/admin/site-visits"
              className="group flex items-center justify-between rounded-xl border border-amber-200/80 bg-amber-50/70 p-4 luxury-shadow transition-all duration-300 hover:border-amber-300 hover:bg-amber-50"
            >
              <div className="flex items-center gap-3.5">
                <span className="grid size-10 place-items-center rounded-lg bg-amber-500 text-white shadow-xs">
                  <CalendarCheck2 size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-amber-950">
                    {requestedVisitCount} {requestedVisitCount === 1 ? "site visit" : "site visits"} awaiting action
                  </p>
                  <p className="mt-0.5 text-xs text-amber-700">Confirm time slot &amp; assign sales agent.</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-amber-700 transition group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      )}

      {/* Top Key Metrics Grid */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Published Portfolio"
          value={dashboard?.properties ?? 0}
          detail="Manage properties"
          href="/admin/properties"
          icon={Building2}
          accent="bg-[#f7f4ee] text-[#b89658]"
        />
        <MetricCard
          label="Open Pipeline"
          value={view.openPipeline}
          detail="Review enquiries"
          href="/admin/enquiries"
          icon={Inbox}
          accent="bg-sky-50 text-sky-700"
        />
        <MetricCard
          label="Visits Scheduled Today"
          value={view.todayVisits}
          detail="Open calendar"
          href="/admin/site-visits"
          icon={CalendarCheck2}
          accent="bg-amber-50 text-amber-700"
        />
        <MetricCard
          label="Conversion Close Rate"
          value={`${view.closeRate}%`}
          detail={`${agents.length} active advisors`}
          href="/admin/agent-reports"
          icon={Target}
          accent="bg-emerald-50 text-emerald-700"
        />
      </div>

      {/* Pipeline Progress & Action Queue */}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Lead Pipeline */}
        <section className="rounded-xl border border-black/5 bg-white p-5 sm:p-6 luxury-shadow">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#b89658]">Pipeline Health</p>
              <h2 className="mt-0.5 font-[var(--font-display)] text-xl font-bold tracking-tight text-[#171717]">
                Lead Pipeline Distribution
              </h2>
            </div>
            <Link href="/admin/enquiries" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b89658] hover:text-[#171717] transition">
              <span>View all leads</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="mt-4 divide-y divide-black/5">
            {leadStages.map((stage) => {
              const count = view.byLeadStatus[stage.status];
              const progress = view.leadCount ? Math.round((count / view.leadCount) * 100) : 0;
              return (
                <div key={stage.status} className="grid grid-cols-[100px_1fr_48px] items-center gap-4 py-3 sm:grid-cols-[120px_1fr_54px]">
                  <span className="text-xs font-semibold text-[#4f4942]">{stage.label}</span>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#f4f1ea]">
                    <div className={`h-full rounded-full ${stage.tone} transition-all duration-500`} style={{ width: `${progress}%` }} />
                  </div>
                  <span className="text-right text-xs font-bold tabular-nums text-[#171717]">{count}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid grid-cols-2 rounded-lg border border-black/5 bg-[#faf9f6] p-3 text-center">
            <div className="border-r border-black/5 px-2">
              <p className="font-[var(--font-display)] text-2xl font-bold text-[#171717] tabular-nums">{view.leadCount}</p>
              <p className="mt-0.5 text-[10px] uppercase font-semibold tracking-wider text-[#68625a]">Total Enquiries</p>
            </div>
            <div className="px-2">
              <p className="font-[var(--font-display)] text-2xl font-bold text-[#171717] tabular-nums">{view.byLeadStatus.QUALIFIED}</p>
              <p className="mt-0.5 text-[10px] uppercase font-semibold tracking-wider text-[#68625a]">Visit Ready</p>
            </div>
          </div>
        </section>

        {/* Action Queue */}
        <section className="rounded-xl border border-black/5 bg-white p-5 sm:p-6 luxury-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#b89658]">Pending Tasks</p>
                <h2 className="mt-0.5 font-[var(--font-display)] text-xl font-bold tracking-tight text-[#171717]">
                  Action Queue
                </h2>
              </div>
              <CircleAlert size={18} className="text-[#b89658]" />
            </div>

            <div className="mt-3 divide-y divide-black/5">
              {[
                { label: "Fresh leads to respond to", value: freshLeadCount, href: "/admin/enquiries", icon: MessageSquare, tone: "text-sky-700 bg-sky-50" },
                { label: "Leads without an advisor", value: view.unassignedLeads.length, href: "/admin/enquiries", icon: UserRoundCheck, tone: "text-violet-700 bg-violet-50" },
                { label: "Visits awaiting confirmation", value: requestedVisitCount, href: "/admin/site-visits", icon: CalendarCheck2, tone: "text-amber-700 bg-amber-50" }
              ].map(({ label, value, href, icon: Icon, tone }) => (
                <Link key={label} href={href} className="group flex items-center gap-3 py-3 transition hover:opacity-80">
                  <span className={`grid size-8 place-items-center rounded-lg ${tone} shrink-0`}><Icon size={14} /></span>
                  <span className="min-w-0 flex-1 text-xs font-semibold text-[#4f4942]">{label}</span>
                  <span className="text-xs font-bold tabular-nums text-[#171717] bg-[#f7f4ee] px-2 py-0.5 rounded border border-black/5">{value}</span>
                  <ChevronRight size={15} className="text-[#68625a] transition group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 border-t border-black/5 pt-4">
            <Link href="/admin/site-visits" className="flex items-center justify-center gap-2 rounded-md border border-[#b89658] px-4 py-2.5 text-xs font-semibold text-[#b89658] hover:bg-[#b89658]/5 transition">
              <Plus size={14} />
              <span>Schedule Site Visit</span>
            </Link>
          </div>
        </section>
      </div>

      {/* Upcoming Site Visits & Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Visits */}
        <section className="rounded-xl border border-black/5 bg-white p-5 sm:p-6 luxury-shadow">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#b89658]">Appointments</p>
              <h2 className="mt-0.5 font-[var(--font-display)] text-xl font-bold tracking-tight text-[#171717]">
                Upcoming Site Visits
              </h2>
            </div>
            <Link href="/admin/site-visits" className="text-xs font-semibold text-[#b89658] hover:text-[#171717] transition">
              View Calendar
            </Link>
          </div>

          {view.pendingVisits.length === 0 ? (
            <div className="mt-4">
              <EmptyState label="No upcoming site visits" />
            </div>
          ) : (
            <div className="mt-2 divide-y divide-black/5">
              {view.pendingVisits.slice(0, 5).map((visit) => (
                <Link key={visit.id} href="/admin/site-visits" className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 transition hover:opacity-80">
                  <div className="min-w-0">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="truncate text-xs font-bold text-[#171717]">{visit.name}</p>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${visitStatusStyles[visit.status]}`}>{visit.status}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-[#68625a]">
                      {visit.property?.title ?? "General Site Visit"}
                      {visit.assignedAgent?.name ? ` · Advisor: ${visit.assignedAgent.name}` : " · Unassigned"}
                    </p>
                  </div>
                  <time className="shrink-0 text-right text-xs font-semibold text-[#b89658]">{formatVisitDate(visit.preferredAt)}</time>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Latest Activity */}
        <section className="rounded-xl border border-black/5 bg-white p-5 sm:p-6 luxury-shadow">
          <div className="flex items-center justify-between border-b border-black/5 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#b89658]">Audit Feed</p>
              <h2 className="mt-0.5 font-[var(--font-display)] text-xl font-bold tracking-tight text-[#171717]">
                Latest Activity
              </h2>
            </div>
            <Clock3 size={17} className="text-[#b89658]" />
          </div>

          {view.activity.length === 0 ? (
            <div className="mt-4">
              <EmptyState label="No activity recorded yet" />
            </div>
          ) : (
            <div className="mt-2 divide-y divide-black/5">
              {view.activity.map((item) => {
                const isLead = item.kind === "lead";
                const Icon = isLead ? MessageSquare : CalendarCheck2;
                const href = isLead ? "/admin/enquiries" : "/admin/site-visits";
                const statusClass = isLead
                  ? leadStatusStyles[item.status as LeadStatus]
                  : visitStatusStyles[item.status as VisitStatus];
                return (
                  <Link key={`${item.kind}-${item.id}`} href={href} className="group flex items-center gap-3 py-3 transition hover:opacity-80">
                    <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${isLead ? "bg-sky-50 text-sky-700" : "bg-amber-50 text-amber-700"}`}><Icon size={14} /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <p className="truncate text-xs font-bold text-[#171717]">{item.name}</p>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${statusClass}`}>{item.status}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-[#68625a]">
                        {isLead ? "New Enquiry" : "Site Visit"}
                        {item.property?.title ? ` · ${item.property.title}` : ""}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] font-semibold text-[#68625a]">{timeAgo(item.createdAt)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Footer Meta */}
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-4 text-xs text-[#68625a]">
        <span>{lastUpdated ? `Last synchronized ${lastUpdated.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}` : "Dashboard data unavailable"}</span>
        <Link href="/admin/agent-reports" className="inline-flex items-center gap-1.5 font-semibold text-[#b89658] hover:text-[#171717] transition">
          <UsersRound size={14} />
          <span>Open Agent Performance Reports</span>
        </Link>
      </footer>
    </section>
  );
}
