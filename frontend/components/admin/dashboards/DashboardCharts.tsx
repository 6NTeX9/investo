"use client";

import React from "react";

// ── 1. Monthly Revenue & Closed GMV Trend Chart (Bar & Line Combo) ─────────────
export function MonthlyRevenueChart({
  data = [
    { month: "Mar", volume: 4.2, revenue: 8.4 },
    { month: "Apr", volume: 5.8, revenue: 11.6 },
    { month: "May", volume: 7.1, revenue: 14.2 },
    { month: "Jun", volume: 6.4, revenue: 12.8 },
    { month: "Jul", volume: 8.9, revenue: 17.8 },
    { month: "Aug (Proj)", volume: 10.4, revenue: 20.8 }
  ]
}: {
  data?: { month: string; volume: number; revenue: number }[];
}) {
  const maxVal = Math.max(...data.map((d) => d.volume), 12);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-[#68625a] mb-3">
        <span className="font-semibold uppercase tracking-wider">Closed GMV (₹ Cr)</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="inline-block size-2.5 rounded-sm bg-[#b89658]" />
            Closed Volume
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="inline-block size-2.5 rounded-full bg-[#171717]" />
            Advisory Trend
          </span>
        </div>
      </div>

      <div className="relative h-44 w-full flex items-end justify-between gap-2 pt-6 border-b border-black/10 pb-2">
        {data.map((item) => {
          const heightPct = (item.volume / maxVal) * 100;
          return (
            <div key={item.month} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip */}
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#171717] text-white text-[10px] py-1 px-2 rounded shadow-md pointer-events-none z-10 whitespace-nowrap">
                ₹{item.volume} Cr Closed
              </div>

              {/* Bar */}
              <div
                className="w-full max-w-[36px] bg-[#b89658]/80 group-hover:bg-[#b89658] transition-all rounded-t-sm"
                style={{ height: `${heightPct}%` }}
              />
              <span className="mt-2 text-[11px] font-medium text-[#68625a] group-hover:text-[#171717]">
                {item.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 2. Bangalore Corridor Performance Graph (Horizontal Stacked Bar) ─────────
export function CorridorPerformanceChart({
  corridors = [
    { name: "Whitefield", total: 45, closed: 14 },
    { name: "Sarjapur Rd", total: 32, closed: 11 },
    { name: "Indiranagar", total: 22, closed: 9 },
    { name: "Hebbal", total: 18, closed: 5 },
    { name: "Koramangala", total: 12, closed: 4 }
  ]
}: {
  corridors?: { name: string; total: number; closed: number }[];
}) {
  const maxLeads = Math.max(...corridors.map((c) => c.total), 50);

  return (
    <div className="grid gap-3.5">
      {corridors.map((item) => {
        const totalPct = (item.total / maxLeads) * 100;
        const conversionPct = Math.round((item.closed / item.total) * 100);

        return (
          <div key={item.name} className="group">
            <div className="flex justify-between text-xs font-semibold text-[#171717] mb-1">
              <span>{item.name}</span>
              <span className="text-[#68625a]">
                {item.total} Leads · <strong className="text-[#b89658]">{item.closed} Closed ({conversionPct}%)</strong>
              </span>
            </div>
            <div className="h-3.5 w-full rounded-full bg-black/5 overflow-hidden flex">
              <div
                className="h-full bg-[#b89658] transition-all duration-500 group-hover:bg-[#a38347]"
                style={{ width: `${(item.closed / maxLeads) * 100}%` }}
                title={`${item.closed} Closed`}
              />
              <div
                className="h-full bg-[#b89658]/20 transition-all duration-500"
                style={{ width: `${((item.total - item.closed) / maxLeads) * 100}%` }}
                title={`${item.total - item.closed} In Progress`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 3. Lead Status Pipeline Distribution Chart (Donut / Progress Bar) ─────────
export function PipelineDistributionChart({
  distribution = [
    { label: "New Leads", count: 14, color: "#3b82f6" },
    { label: "Contacted", count: 24, color: "#f59e0b" },
    { label: "Qualified", count: 16, color: "#8b5cf6" },
    { label: "Visit Done", count: 8, color: "#10b981" },
    { label: "Closed Deal", count: 4, color: "#b89658" }
  ]
}: {
  distribution?: { label: string; count: number; color: string }[];
}) {
  const total = distribution.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="grid gap-4">
      {/* Segmented Stacked Progress Bar */}
      <div className="h-4 w-full rounded-full bg-black/5 overflow-hidden flex">
        {distribution.map((item) => {
          const pct = total > 0 ? (item.count / total) * 100 : 0;
          return (
            <div
              key={item.label}
              className="h-full transition-all duration-300"
              style={{ width: `${pct}%`, backgroundColor: item.color }}
              title={`${item.label}: ${item.count} (${Math.round(pct)}%)`}
            />
          );
        })}
      </div>

      {/* Legend Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
        {distribution.map((item) => {
          const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
          return (
            <div key={item.label} className="flex items-center gap-2 p-2 rounded-lg bg-black/[0.02] border border-black/5">
              <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <div className="truncate">
                <p className="text-[11px] font-medium text-[#68625a] truncate">{item.label}</p>
                <p className="text-xs font-bold text-[#171717]">
                  {item.count} <span className="text-[10px] font-normal text-[#68625a]">({pct}%)</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
