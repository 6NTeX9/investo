"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  CalendarDays,
  AlertTriangle,
  Building2,
  Phone,
  MessageCircle,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Clock,
  UserCheck,
  Briefcase
} from "lucide-react";
import {
  MonthlyRevenueChart,
  CorridorPerformanceChart,
  PipelineDistributionChart
} from "./DashboardCharts";

export function ExecutiveManagerDashboard({
  agentsData = [
    { name: "Maya Kapoor", email: "maya@bricksnbeyond.com", closed: 5, totalEnquiries: 12, completedVisits: 8, futureVisits: 3, avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80" },
    { name: "Sarah Jenkins", email: "sarah.j@bricksnbeyond.com", closed: 4, totalEnquiries: 10, completedVisits: 6, futureVisits: 4, avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80" },
    { name: "Alexander Wright", email: "alexander.w@bricksnbeyond.com", closed: 2, totalEnquiries: 8, completedVisits: 5, futureVisits: 2, avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80" },
    { name: "Elena Rossi", email: "elena.r@bricksnbeyond.com", closed: 3, totalEnquiries: 9, completedVisits: 4, futureVisits: 5, avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80" }
  ],
  stats = {
    portfolioGmv: "₹420 Cr",
    newLeadsToday: 14,
    todaysVisits: 8,
    staleLeads: 3
  }
}: {
  agentsData?: any[];
  stats?: {
    portfolioGmv: string;
    newLeadsToday: number;
    todaysVisits: number;
    staleLeads: number;
  };
}) {
  const [activeTab, setActiveTab] = useState<"kanban" | "agents">("kanban");

  return (
    <div className="space-y-6">
      {/* ── 1. Top-Line KPI Summary Bar ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-black/5 bg-white p-4 sm:p-5 luxury-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#68625a]">Portfolio GMV</span>
            <div className="rounded-full bg-[#b89658]/10 p-2 text-[#b89658]">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-[#171717]">
            {stats.portfolioGmv}
          </p>
          <p className="mt-1 text-[11px] font-medium text-[#16a34a] flex items-center gap-1">
            <ArrowUpRight size={12} /> 42 Luxury Properties Managed
          </p>
        </div>

        <div className="rounded-xl border border-black/5 bg-white p-4 sm:p-5 luxury-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#68625a]">New Leads Today</span>
            <div className="rounded-full bg-blue-500/10 p-2 text-blue-600">
              <Users size={18} />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-[#171717]">
            {stats.newLeadsToday}
          </p>
          <p className="mt-1 text-[11px] font-medium text-[#68625a]">
            Incoming buyer & investor enquiries
          </p>
        </div>

        <div className="rounded-xl border border-black/5 bg-white p-4 sm:p-5 luxury-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#68625a]">Today's Visits</span>
            <div className="rounded-full bg-purple-500/10 p-2 text-purple-600">
              <CalendarDays size={18} />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-[#171717]">
            {stats.todaysVisits}
          </p>
          <p className="mt-1 text-[11px] font-medium text-[#68625a]">
            Scheduled property walkthroughs
          </p>
        </div>

        <div className="rounded-xl border border-black/5 bg-white p-4 sm:p-5 luxury-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#68625a]">Stale Leads (&gt;24h)</span>
            <div className="rounded-full bg-amber-500/10 p-2 text-amber-600">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-[#171717]">
            {stats.staleLeads}
          </p>
          <p className="mt-1 text-[11px] font-medium text-amber-700 font-semibold">
            Action required by team
          </p>
        </div>
      </div>

      {/* ── 2. Interactive Charts Grid (Revenue, Corridors, Pipeline) ──────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue & GMV Trend */}
        <div className="rounded-xl border border-black/5 bg-white p-5 sm:p-6 luxury-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#b89658]">Portfolio Performance</p>
                <h3 className="font-[var(--font-display)] text-xl font-bold text-[#171717]">Monthly Closed Volume Trend</h3>
              </div>
              <span className="text-xs font-semibold text-[#68625a] bg-[#f7f4ee] px-2.5 py-1 rounded-md border border-black/5">
                Last 6 Months
              </span>
            </div>
            <div className="mt-4">
              <MonthlyRevenueChart />
            </div>
          </div>
        </div>

        {/* Bangalore Corridor Performance */}
        <div className="rounded-xl border border-black/5 bg-white p-5 sm:p-6 luxury-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-black/5 pb-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#b89658]">Micro-Market Analytics</p>
                <h3 className="font-[var(--font-display)] text-xl font-bold text-[#171717]">Bangalore Corridor Performance</h3>
              </div>
              <span className="text-xs font-semibold text-[#68625a] bg-[#f7f4ee] px-2.5 py-1 rounded-md border border-black/5">
                Lead vs Win Rate
              </span>
            </div>
            <div className="mt-4">
              <CorridorPerformanceChart />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Pipeline Distribution & Agent Performance Grid ─────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline Distribution Chart */}
        <div className="rounded-xl border border-black/5 bg-white p-5 sm:p-6 luxury-shadow">
          <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#b89658]">Funnel Overview</p>
              <h3 className="font-[var(--font-display)] text-xl font-bold text-[#171717]">Lead Status Distribution</h3>
            </div>
          </div>
          <PipelineDistributionChart />
        </div>

        {/* Agent Activity & Performance Breakdown */}
        <div className="rounded-xl border border-black/5 bg-white p-5 sm:p-6 luxury-shadow">
          <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#b89658]">Team Performance</p>
              <h3 className="font-[var(--font-display)] text-xl font-bold text-[#171717]">Agent Enquiries & Visits Status</h3>
            </div>
            <Link href="/admin/agent-reports" className="text-xs font-semibold text-[#b89658] hover:underline flex items-center gap-1">
              Full Reports <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid gap-3">
            {agentsData.map((agent) => (
              <div key={agent.email} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-black/5 bg-[#fdfdfc] hover:bg-[#f7f4ee]/60 transition">
                <div className="flex items-center gap-3">
                  <div className="relative size-10 rounded-full overflow-hidden border border-black/10 shrink-0">
                    <img src={agent.avatar} alt={agent.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#171717]">{agent.name}</p>
                    <p className="text-[11px] text-[#68625a]">
                      Enquiries: <strong className="text-[#b89658] font-bold">{agent.closed}/{agent.totalEnquiries} Closed</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md border border-emerald-200 text-xs font-semibold">
                    <span>{agent.completedVisits} Visits Done</span>
                  </div>
                  <div className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md border border-purple-200 text-xs font-semibold">
                    <span>🔮 {agent.futureVisits} Future Visits</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 4. Urgent Action Queue ──────────────────────────────────────────── */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-amber-600" size={18} />
            <h3 className="font-bold text-sm text-[#171717]">Urgent Attention Needed</h3>
          </div>
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded">
            Immediate Actions
          </span>
        </div>
        <div className="grid gap-2.5 text-xs text-[#4f4942]">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-amber-500/20">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-amber-600 shrink-0" />
              <span><strong>3 New Enquiries</strong> uncontacted for more than 24 hours.</span>
            </div>
            <Link href="/admin/enquiries?status=NEW" className="text-[#b89658] font-semibold hover:underline">
              View Leads →
            </Link>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-amber-500/20">
            <div className="flex items-center gap-2">
              <CalendarDays size={14} className="text-purple-600 shrink-0" />
              <span><strong>2 Site Visits</strong> unconfirmed for tomorrow.</span>
            </div>
            <Link href="/admin/site-visits" className="text-[#b89658] font-semibold hover:underline">
              Check Schedule →
            </Link>
          </div>
        </div>
      </div>

      {/* ── 5. Quick Pipeline & Quick Navigation Actions ─────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-[#171717] p-5 text-white shadow-lg">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#d6bd82]">Management Shortcut</span>
          <h4 className="mt-0.5 text-lg font-serif font-bold">Manage Enquiries &amp; Site Visit Schedule</h4>
          <p className="text-xs text-neutral-300">View responsive lead grid, filter counts, or update visit confirmations.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <Link href="/admin/enquiries" className="rounded-lg bg-[#b89658] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#a38347] transition">
            Enquiries Board
          </Link>
          <Link href="/admin/site-visits" className="rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition">
            Showings Calendar
          </Link>
        </div>
      </div>
    </div>
  );
}
