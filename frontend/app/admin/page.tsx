"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import {
  Building2, Inbox, CalendarCheck, Users, BarChart3, Loader2,
  Newspaper, ArrowRight, MessageSquare, Calendar, Clock,
  TrendingUp, CheckCircle2, AlertCircle, Home
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs  < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

const statusColors: Record<string, string> = {
  NEW:         "bg-blue-50 text-blue-700 border-blue-100",
  CONTACTED:   "bg-yellow-50 text-yellow-700 border-yellow-100",
  QUALIFIED:   "bg-purple-50 text-purple-700 border-purple-100",
  CLOSED:      "bg-green-50 text-green-700 border-green-100",
  LOST:        "bg-red-50 text-red-600 border-red-100",
  REQUESTED:   "bg-orange-50 text-orange-700 border-orange-100",
  CONFIRMED:   "bg-green-50 text-green-700 border-green-100",
  COMPLETED:   "bg-gray-50 text-gray-600 border-gray-100",
  CANCELLED:   "bg-red-50 text-red-600 border-red-100",
  RESCHEDULED: "bg-indigo-50 text-indigo-700 border-indigo-100",
};

export default function AdminPage() {
  const [stats, setStats]   = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        let since = localStorage.getItem("admin_session_start");
        if (!since) {
          since = new Date().toISOString();
          localStorage.setItem("admin_session_start", since);
        }
        const res = await api.get(`/analytics/dashboard?since=${since}`);
        setStats(res.data);
      } catch {
        toast.error("Failed to load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="grid min-h-[50svh] place-items-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="animate-spin text-[#b89658]" size={32} />
          <p className="text-sm text-[#68625a]">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const newEnquiries  = stats?.newEnquiriesCount ?? 0;
  const newVisits     = stats?.newVisitsCount ?? 0;
  const recentEnquiries: any[] = stats?.recentEnquiries ?? [];
  const recentVisits:   any[] = stats?.recentVisits ?? [];

  // Merge and sort combined feed
  const activityFeed = [
    ...recentEnquiries.map((e: any) => ({ type: "enquiry", ...e })),
    ...recentVisits.map((v: any) => ({ type: "visit", ...v })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   .slice(0, 8);

  return (
    <section className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Dashboard overview</p>
          <h1 className="mt-2 text-3xl font-semibold">Property operations</h1>
        </div>
        <p className="text-xs text-[#68625a]">
          Last updated: {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
        </p>
      </div>

      {/* Alert banners for unread activity */}
      {(newEnquiries > 0 || newVisits > 0) && (
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          {newEnquiries > 0 && (
            <Link
              href="/admin/enquiries"
              className="group flex flex-1 items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 transition hover:border-blue-300 hover:bg-blue-100"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white">
                  <MessageSquare size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    {newEnquiries} new {newEnquiries === 1 ? "enquiry" : "enquiries"} received
                  </p>
                  <p className="text-xs text-blue-600">Tap to review and respond</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-blue-500 transition group-hover:translate-x-1" />
            </Link>
          )}
          {newVisits > 0 && (
            <Link
              href="/admin/site-visits"
              className="group flex flex-1 items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 transition hover:border-orange-300 hover:bg-orange-100"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-orange-800">
                    {newVisits} site {newVisits === 1 ? "visit" : "visits"} awaiting confirmation
                  </p>
                  <p className="text-xs text-orange-600">Tap to confirm or reschedule</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-orange-500 transition group-hover:translate-x-1" />
            </Link>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          { icon: Building2,    label: "Properties",     value: stats?.properties ?? 0,   href: "/admin/properties" },
          { icon: Inbox,        label: "Fresh enquiries", value: stats?.enquiries ?? 0,   href: "/admin/enquiries",  badge: newEnquiries },
          { icon: CalendarCheck,label: "Active visits",  value: stats?.visits ?? 0,        href: "/admin/site-visits", badge: newVisits },
          { icon: Users,        label: "Sales agents",   value: "—",                       href: "/admin/agents" },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="relative rounded-lg border border-black/10 bg-white p-3.5 sm:p-5 luxury-shadow hover:border-[#b89658]/40 hover:shadow-md transition duration-300 block"
          >
            {item.badge > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {item.badge}
              </span>
            )}
            <item.icon size={18} className="text-[#b89658]" />
            <p className="mt-3 sm:mt-5 text-xl sm:text-3xl font-semibold">{item.value}</p>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#68625a]">{item.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mt-4 rounded-lg border border-[#b89658]/20 bg-[#fdf9f2] p-4 luxury-shadow">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#b89658]">Quick Operations</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { href: "/admin/properties", icon: Building2,    label: "Manage Properties" },
            { href: "/admin/site-visits", icon: CalendarCheck, label: "Book Showing" },
            { href: "/admin/blogs",      icon: Newspaper,    label: "Write Article" },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className="flex items-center justify-center gap-2 rounded-md bg-white border border-black/10 py-2 text-xs font-semibold text-[#171717] hover:bg-[#fcfbfa] hover:border-[#b89658]/40 transition">
              <Icon size={13} className="text-[#b89658]" />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">

        {/* Enquiry stats chart (placeholder bars) */}
        <div className="rounded-lg border border-black/10 bg-white p-6 luxury-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-[#b89658]" />
              <h2 className="font-semibold">Enquiry statistics</h2>
            </div>
            <Link href="/admin/enquiries" className="text-xs text-[#b89658] font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="mt-6 grid h-48 grid-cols-7 items-end gap-2">
            {[32, 46, 38, 61, 54, 70, 58].map((height, i) => (
              <div key={i} className="group relative flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-md bg-[#b89658]/80 hover:bg-[#b89658] transition-colors cursor-default"
                  style={{ height: `${height}%` }}
                />
                <p className="text-[9px] text-[#68625a]">
                  {["M", "T", "W", "T", "F", "S", "S"][i]}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Live activity feed */}
        <div className="rounded-lg border border-black/10 bg-white p-6 luxury-shadow flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent activity</h2>
            <Clock size={14} className="text-[#68625a]" />
          </div>

          {activityFeed.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 py-8 text-center">
              <TrendingUp size={28} className="text-[#b89658]/40" />
              <p className="text-sm text-[#68625a]">No recent activity yet.</p>
              <p className="text-xs text-[#68625a]/70">Activity will appear here as enquiries and visits come in.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-0 divide-y divide-black/5">
              {activityFeed.map((item: any) => {
                const isEnquiry = item.type === "enquiry";
                const href = isEnquiry ? "/admin/enquiries" : "/admin/site-visits";
                const icon = isEnquiry ? MessageSquare : Calendar;
                const Icon = icon;
                const statusClass = statusColors[item.status] ?? "bg-gray-50 text-gray-600 border-gray-100";

                return (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={href}
                    className="group flex items-start gap-3 py-3 hover:bg-[#fdf9f2] -mx-6 px-6 transition-colors rounded"
                  >
                    {/* Icon dot */}
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isEnquiry ? "bg-blue-50 text-blue-600" : "bg-orange-50 text-orange-600"}`}>
                      <Icon size={13} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#171717] truncate">{item.name}</p>
                        <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusClass}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#68625a] truncate mt-0.5">
                        {isEnquiry ? "Enquiry" : "Site visit"}{item.property?.title ? ` · ${item.property.title}` : ""}
                      </p>
                      {!isEnquiry && item.preferredAt && (
                        <p className="text-[10px] text-[#68625a]/70 mt-0.5">
                          📅 Preferred: {new Date(item.preferredAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
                        </p>
                      )}
                    </div>

                    {/* Time */}
                    <p className="shrink-0 text-[10px] text-[#68625a]/60 mt-0.5">{timeAgo(item.createdAt)}</p>
                  </Link>
                );
              })}
            </div>
          )}

          {activityFeed.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-black/5 pt-4">
              <Link href="/admin/enquiries" className="flex items-center justify-center gap-1.5 rounded-md border border-black/10 py-2 text-xs font-semibold text-[#171717] hover:border-[#b89658]/40 hover:bg-[#fdf9f2] transition">
                <MessageSquare size={11} className="text-[#b89658]" /> All enquiries
              </Link>
              <Link href="/admin/site-visits" className="flex items-center justify-center gap-1.5 rounded-md border border-black/10 py-2 text-xs font-semibold text-[#171717] hover:border-[#b89658]/40 hover:bg-[#fdf9f2] transition">
                <Calendar size={11} className="text-[#b89658]" /> All visits
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
