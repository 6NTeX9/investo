"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/services/api";
import {
  Users, Download, CheckCircle2,
  Calendar, Inbox, Award, Loader2, ChevronDown, ChevronUp,
  BarChart2, FileText, TrendingUp, Eye, X, Clock,
  UserCheck, ChevronRight, Activity, Star
} from "lucide-react";

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED" | "LOST";
type VisitStatus = "REQUESTED" | "CONFIRMED" | "RESCHEDULED" | "COMPLETED" | "CANCELLED";

interface AgentReport {
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
  recentEnquiries?: any[];
  recentVisits?: any[];
}

const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string; bar: string }> = {
  NEW:       { label: "New",       color: "text-blue-700",    bg: "bg-blue-50 border-blue-100",     bar: "bg-blue-400" },
  CONTACTED: { label: "Contacted", color: "text-indigo-700",  bg: "bg-indigo-50 border-indigo-100", bar: "bg-indigo-400" },
  QUALIFIED: { label: "Qualified", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-100", bar: "bg-emerald-500" },
  CLOSED:    { label: "Closed",    color: "text-teal-700",    bg: "bg-teal-50 border-teal-100",     bar: "bg-teal-500" },
  LOST:      { label: "Lost",      color: "text-red-700",     bg: "bg-red-50 border-red-100",       bar: "bg-red-400" }
};

const VISIT_STATUS_CONFIG: Record<VisitStatus, { label: string; dot: string }> = {
  REQUESTED:   { label: "Requested",   dot: "bg-blue-400" },
  CONFIRMED:   { label: "Confirmed",   dot: "bg-emerald-500" },
  RESCHEDULED: { label: "Rescheduled", dot: "bg-indigo-400" },
  COMPLETED:   { label: "Completed",   dot: "bg-teal-500" },
  CANCELLED:   { label: "Cancelled",   dot: "bg-red-400" }
};

function getInitials(name: string) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function ConversionBadge({ rate }: { rate: number }) {
  const color =
    rate >= 50 ? "text-emerald-700 bg-emerald-50 border-emerald-100" :
    rate >= 25 ? "text-indigo-700 bg-indigo-50 border-indigo-100" :
    "text-[#68625a] bg-[#f7f4ee] border-black/10";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${color}`}>
      <Award size={11} /> {rate}% conversion
    </span>
  );
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 rounded-full bg-black/5 h-1.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold text-[#68625a] w-6 text-right">{value}</span>
    </div>
  );
}

// ── Agent Progress Modal ─────────────────────────────────────────────────────
function AgentProgressModal({ report, onClose }: { report: AgentReport; onClose: () => void }) {
  const { agent, enquiryStats, visitStats, conversionRate, recentEnquiries = [], recentVisits = [] } = report;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-[#faf9f6] rounded-2xl shadow-2xl w-full max-w-3xl my-8 overflow-hidden border border-black/5">

        {/* Modal Header */}
        <div className="flex items-center justify-between bg-white border-b border-black/5 px-6 py-4">
          <div className="flex items-center gap-3">
            {agent.avatarUrl ? (
              <img src={agent.avatarUrl} alt={agent.name} className="h-10 w-10 rounded-full object-cover border border-black/10" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[#b89658]/10 flex items-center justify-center font-bold text-[#b89658]">
                {getInitials(agent.name)}
              </div>
            )}
            <div>
              <p className="font-semibold text-[#171717]">{agent.name}</p>
              <p className="text-xs text-[#68625a]">{agent.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-[#b89658]/20 bg-[#fdf9f2] px-4 py-2">
              <Award size={16} className="text-[#b89658]" />
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#68625a]">Conversion</p>
                <p className="text-lg font-bold text-[#b89658] leading-none">{conversionRate}%</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-[#68625a] hover:bg-black/5 transition">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Inbox,        label: "Total Leads",    value: enquiryStats.total },
              { icon: CheckCircle2, label: "Closed",         value: enquiryStats.CLOSED, highlight: true },
              { icon: Calendar,     label: "Site Visits",    value: visitStats.total },
              { icon: Star,         label: "Completed Visits", value: visitStats.COMPLETED }
            ].map(({ icon: Icon, label, value, highlight }) => (
              <div key={label} className={`rounded-xl border p-4 bg-white flex flex-col gap-1.5 luxury-shadow ${highlight ? "border-[#b89658]/30" : "border-black/5"}`}>
                <div className="flex items-center gap-1.5">
                  <Icon size={13} className={highlight ? "text-[#b89658]" : "text-[#68625a]"} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#68625a]">{label}</span>
                </div>
                <p className={`text-2xl font-bold ${highlight ? "text-[#b89658]" : "text-[#171717]"}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Pipeline + Visits */}
          <div className="grid gap-5 sm:grid-cols-2">

            {/* Lead pipeline */}
            <div className="rounded-xl border border-black/5 bg-white p-5 luxury-shadow">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} className="text-[#b89658]" />
                <h3 className="font-semibold text-sm text-[#171717]">Lead Pipeline</h3>
              </div>
              <div className="space-y-3">
                {(["NEW","CONTACTED","QUALIFIED","CLOSED","LOST"] as LeadStatus[]).map((s) => (
                  <div key={s}>
                    <div className="flex justify-between mb-1">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${LEAD_STATUS_CONFIG[s].bg} ${LEAD_STATUS_CONFIG[s].color}`}>
                        {LEAD_STATUS_CONFIG[s].label}
                      </span>
                    </div>
                    <ProgressBar value={enquiryStats[s]} max={enquiryStats.total} color={LEAD_STATUS_CONFIG[s].bar} />
                  </div>
                ))}
              </div>
            </div>

            {/* Visit status */}
            <div className="rounded-xl border border-black/5 bg-white p-5 luxury-shadow">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={15} className="text-[#b89658]" />
                <h3 className="font-semibold text-sm text-[#171717]">Visit Status</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {(["REQUESTED","CONFIRMED","RESCHEDULED","COMPLETED","CANCELLED"] as VisitStatus[]).map((s) => (
                  <div key={s} className="flex items-center gap-2 rounded-lg border border-black/5 p-2.5">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${VISIT_STATUS_CONFIG[s].dot}`} />
                    <div>
                      <p className="text-[10px] font-semibold text-[#68625a]">{VISIT_STATUS_CONFIG[s].label}</p>
                      <p className="text-lg font-bold text-[#171717]">{visitStats[s]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent leads */}
          <div className="rounded-xl border border-black/5 bg-white luxury-shadow overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/5">
              <div className="flex items-center gap-2">
                <Activity size={14} className="text-[#b89658]" />
                <h3 className="font-semibold text-sm text-[#171717]">Recent Leads</h3>
              </div>
              <span className="text-[11px] text-[#68625a]">Last 10 updated</span>
            </div>
            {recentEnquiries.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[#68625a]">No enquiries assigned.</p>
            ) : (
              <div className="divide-y divide-black/5">
                {recentEnquiries.map((enq: any) => {
                  const cfg = LEAD_STATUS_CONFIG[enq.status as LeadStatus];
                  return (
                    <div key={enq.id} className="flex items-center justify-between px-5 py-3 hover:bg-black/[0.015] transition">
                      <div className="flex items-center gap-2 min-w-0">
                        <UserCheck size={13} className="text-[#b89658] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#171717] truncate">{enq.name}</p>
                          <p className="text-xs text-[#68625a] truncate">{enq.property?.title ?? "No property"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cfg?.bg} ${cfg?.color}`}>
                          {cfg?.label}
                        </span>
                        <span className="text-[11px] text-[#68625a]">
                          {new Date(enq.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent visits */}
          <div className="rounded-xl border border-black/5 bg-white luxury-shadow overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/5">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-[#b89658]" />
                <h3 className="font-semibold text-sm text-[#171717]">Recent Site Visits</h3>
              </div>
              <span className="text-[11px] text-[#68625a]">Last 5</span>
            </div>
            {recentVisits.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-[#68625a]">No site visits assigned.</p>
            ) : (
              <div className="divide-y divide-black/5">
                {recentVisits.map((visit: any) => {
                  const cfg = VISIT_STATUS_CONFIG[visit.status as VisitStatus];
                  return (
                    <div key={visit.id} className="flex items-center justify-between px-5 py-3 hover:bg-black/[0.015] transition">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`h-2 w-2 rounded-full shrink-0 ${cfg?.dot}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#171717] truncate">{visit.name}</p>
                          <p className="text-xs text-[#68625a] truncate">{visit.property?.title ?? "No property"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-[#68625a]">{cfg?.label}</span>
                        <span className="text-[11px] text-[#68625a]">
                          {new Date(visit.preferredAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AgentReportsPage() {
  const [reports, setReports] = useState<AgentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingAll, setExportingAll] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [progressAgent, setProgressAgent] = useState<AgentReport | null>(null);
  const [loadingProgressId, setLoadingProgressId] = useState<string | null>(null);

  useEffect(() => {
    api.get("/agents/report/all")
      .then((res) => setReports(res.data))
      .catch(() => toast.error("Failed to load agent reports."))
      .finally(() => setLoading(false));
  }, []);

  // Open progress modal — fetches full stats for that agent
  const handleViewProgress = async (agentId: string) => {
    setLoadingProgressId(agentId);
    try {
      const res = await api.get(`/agents/report/all`);
      const found = (res.data as AgentReport[]).find((r) => r.agent.id === agentId);
      if (found) setProgressAgent(found);
      else toast.error("Agent data not found.");
    } catch {
      toast.error("Failed to load agent progress.");
    } finally {
      setLoadingProgressId(null);
    }
  };

  // ── Export all agents CSV ─────────────────────────────────────────────────
  const handleExportAll = async () => {
    if (reports.length === 0) { toast.error("No agent data to export."); return; }
    setExportingAll(true);
    try {
      const headers = [
        "Agent Name", "Email", "Phone", "Member Since",
        "Total Leads", "New", "Contacted", "Qualified", "Closed", "Lost",
        "Conversion Rate (%)",
        "Total Visits", "Requested", "Confirmed", "Rescheduled", "Completed", "Cancelled",
        "Last Activity At"
      ];

      const rows = reports.map((r) => [
        `"${r.agent.name}"`,
        r.agent.email,
        r.agent.phone,
        new Date(r.agent.memberSince).toISOString(),
        r.enquiryStats.total,
        r.enquiryStats.NEW,
        r.enquiryStats.CONTACTED,
        r.enquiryStats.QUALIFIED,
        r.enquiryStats.CLOSED,
        r.enquiryStats.LOST,
        r.conversionRate,
        r.visitStats.total,
        r.visitStats.REQUESTED,
        r.visitStats.CONFIRMED,
        r.visitStats.RESCHEDULED,
        r.visitStats.COMPLETED,
        r.visitStats.CANCELLED,
        r.lastActivityAt ? new Date(r.lastActivityAt).toISOString() : "N/A"
      ]);

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      downloadCSV(csv, `all_agents_report_${today()}.csv`);
      toast.success("All-agents CSV exported!");
    } catch {
      toast.error("Failed to export CSV.");
    } finally {
      setExportingAll(false);
    }
  };

  // ── Export one agent detailed CSV ─────────────────────────────────────────
  const handleExportAgent = async (agentId: string, agentName: string) => {
    setExportingId(agentId);
    try {
      const res = await api.get(`/agents/${agentId}/report`);
      const { agent, enquiries, visits, activities } = res.data;

      const rowHeaders = ["Type", "Client Name", "Client Phone", "Client Email", "Property", "Status", "Scheduled / Received At", "Last Updated At"];
      const enqRows = enquiries.map((e: any) => [
        "Enquiry", `"${e.name}"`, e.phone, e.email || "",
        `"${e.property?.title ?? "N/A"}"`, e.status,
        new Date(e.createdAt).toISOString(), new Date(e.updatedAt).toISOString()
      ]);
      const visitRows = visits.map((v: any) => [
        "Site Visit", `"${v.name}"`, v.phone, v.email || "",
        `"${v.property?.title ?? "N/A"}"`, v.status,
        new Date(v.preferredAt).toISOString(), new Date(v.createdAt).toISOString()
      ]);

      const actHeaders = ["Timestamp", "Action", "Previous Status", "New Status"];
      const actRows = activities.map((a: any) => [
        new Date(a.createdAt).toISOString(), a.action,
        (a.metadata as any)?.previousStatus ?? "", (a.metadata as any)?.newStatus ?? ""
      ]);

      const agentInfo = [
        ["Agent Report", ""], ["Name", agent.name], ["Email", agent.email],
        ["Phone", agent.phone], ["Report Generated", new Date().toISOString()], ["", ""]
      ];

      const sections = [
        ...agentInfo.map((r) => r.join(",")),
        "--- ENQUIRIES & SITE VISITS ---",
        rowHeaders.join(","),
        ...[...enqRows, ...visitRows].map((r: any[]) => r.join(",")),
        "",
        "--- STATUS CHANGE LOG ---",
        actHeaders.join(","),
        ...actRows.map((r: any[]) => r.join(","))
      ];

      downloadCSV(sections.join("\n"), `agent_${agentName.toLowerCase().replace(/\s+/g, "_")}_${today()}.csv`);
      toast.success(`Detailed report for ${agentName} exported!`);
    } catch {
      toast.error("Failed to export agent report.");
    } finally {
      setExportingId(null);
    }
  };

  function downloadCSV(csv: string, filename: string) {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", filename);
    a.style.visibility = "hidden";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function today() {
    return new Date().toISOString().split("T")[0];
  }

  return (
    <>
      {/* Progress Modal */}
      {progressAgent && (
        <AgentProgressModal report={progressAgent} onClose={() => setProgressAgent(null)} />
      )}

      <section className="p-6 md:p-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Performance Overview</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#171717]">Agent Reports</h1>
            <p className="mt-1 text-sm text-[#68625a]">Review each agent's progress and download detailed performance reports.</p>
          </div>
          <button
            id="export-all-agents-btn"
            onClick={handleExportAll}
            disabled={exportingAll || loading}
            className="flex items-center gap-2 rounded-lg border border-[#b89658] px-5 py-2.5 text-sm font-semibold text-[#b89658] hover:bg-[#b89658]/5 transition bg-white luxury-shadow disabled:opacity-50 shrink-0"
          >
            {exportingAll
              ? <><Loader2 size={15} className="animate-spin" /><span>Exporting...</span></>
              : <><Download size={15} /><span>Export All Agents CSV</span></>}
          </button>
        </div>

        {/* ── Summary strip ── */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-xl border border-black/5 bg-white p-4 sm:p-5 luxury-shadow">
              <div className="flex items-center gap-2 mb-1">
                <Users size={15} className="text-[#b89658]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#68625a]">Total Agents</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[#171717]">{reports.length}</p>
            </div>
            <div className="rounded-xl border border-black/5 bg-white p-4 sm:p-5 luxury-shadow">
              <div className="flex items-center gap-2 mb-1">
                <Inbox size={15} className="text-[#b89658]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#68625a]">Total Leads</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[#171717]">{reports.reduce((s, r) => s + r.enquiryStats.total, 0)}</p>
            </div>
            <div className="rounded-xl border border-black/5 bg-white p-4 sm:p-5 luxury-shadow">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 size={15} className="text-[#b89658]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#68625a]">Total Closed</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-[#171717]">{reports.reduce((s, r) => s + r.enquiryStats.CLOSED, 0)}</p>
            </div>
          </div>
        )}

        {/* ── Agent cards ── */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse h-36 rounded-xl bg-black/5" />
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="grid place-items-center py-20 rounded-xl bg-white border border-black/5 luxury-shadow text-center">
            <Users size={48} className="text-[#b89658]/40" />
            <h3 className="mt-4 font-semibold text-lg">No agents found</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const isExpanded = expandedId === report.agent.id;
              const isExporting = exportingId === report.agent.id;
              const isLoadingProgress = loadingProgressId === report.agent.id;
              const { agent, enquiryStats, visitStats, conversionRate, lastActivityAt } = report;

              return (
                <div key={agent.id} className="rounded-xl border border-black/5 bg-white luxury-shadow overflow-hidden transition hover:border-[#b89658]/20">

                  {/* Card header */}
                  <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4 p-4 sm:p-5">

                    {/* Avatar + info */}
                    <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                      {agent.avatarUrl ? (
                        <img src={agent.avatarUrl} alt={agent.name} className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border border-black/10 shrink-0" />
                      ) : (
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#b89658]/10 flex items-center justify-center shrink-0 font-bold text-[#b89658] text-sm sm:text-lg">
                          {getInitials(agent.name)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#171717] text-base leading-snug">{agent.name}</p>
                        <p className="text-xs text-[#68625a] break-all sm:break-normal sm:truncate">{agent.email} · {agent.phone}</p>
                        <div className="mt-1 flex items-center gap-2 flex-wrap">
                          <ConversionBadge rate={conversionRate} />
                          {lastActivityAt && (
                            <span className="text-[10px] sm:text-[11px] text-[#68625a]">
                              Last active: {new Date(lastActivityAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Quick stats grid (3-cols on mobile) */}
                    <div className="grid grid-cols-3 gap-2 bg-[#f7f4ee]/60 p-2.5 rounded-lg text-center w-full md:w-auto md:bg-transparent md:p-0 md:flex md:items-center md:gap-6 shrink-0 border border-black/5 md:border-none">
                      <div className="text-center">
                        <p className="text-lg sm:text-2xl font-bold text-[#171717]">{enquiryStats.total}</p>
                        <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#68625a]">Leads</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg sm:text-2xl font-bold text-teal-600">{enquiryStats.CLOSED}</p>
                        <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#68625a]">Closed</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg sm:text-2xl font-bold text-[#171717]">{visitStats.total}</p>
                        <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#68625a]">Visits</p>
                      </div>
                    </div>

                    {/* Actions (3-cols on mobile) */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full md:w-auto md:flex md:items-center shrink-0 pt-1 md:pt-0">
                      {/* View Progress button */}
                      <button
                        id={`view-progress-${agent.id}`}
                        onClick={() => handleViewProgress(agent.id)}
                        disabled={isLoadingProgress}
                        className="flex items-center justify-center gap-1 rounded-lg bg-[#171717] px-2 py-2 text-[11px] sm:text-xs font-semibold text-white hover:bg-[#2a2a2a] transition disabled:opacity-50"
                      >
                        {isLoadingProgress
                          ? <Loader2 size={11} className="animate-spin" />
                          : <Eye size={11} />}
                        <span>View Progress</span>
                      </button>
                      {/* Export CSV */}
                      <button
                        id={`export-agent-${agent.id}`}
                        onClick={() => handleExportAgent(agent.id, agent.name)}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-1 rounded-lg border border-[#b89658]/30 px-2 py-2 text-[11px] sm:text-xs font-semibold text-[#b89658] hover:bg-[#b89658]/5 transition disabled:opacity-50 bg-white"
                      >
                        {isExporting ? <Loader2 size={11} className="animate-spin" /> : <FileText size={11} />}
                        <span>Export CSV</span>
                      </button>
                      {/* Expand details */}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : agent.id)}
                        className="flex items-center justify-center gap-1 rounded-lg border border-black/10 px-2 py-2 text-[11px] sm:text-xs font-semibold text-[#68625a] hover:bg-black/5 transition bg-white"
                      >
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        <span>{isExpanded ? "Hide" : "Stats"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Expandable stat panel */}
                  {isExpanded && (
                    <div className="border-t border-black/5 p-4 sm:p-5 bg-[#faf9f6]">
                      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">

                        {/* Lead pipeline */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#68625a] mb-3 flex items-center gap-1.5">
                            <BarChart2 size={13} className="text-[#b89658]" /> Lead Breakdown
                          </p>
                          <div className="space-y-2">
                            {(["NEW","CONTACTED","QUALIFIED","CLOSED","LOST"] as LeadStatus[]).map((s) => {
                              const val = enquiryStats[s];
                              const pct = enquiryStats.total > 0 ? Math.round((val / enquiryStats.total) * 100) : 0;
                              return (
                                <div key={s} className="flex items-center gap-2 sm:gap-3">
                                  <span className="text-xs text-[#68625a] w-16 sm:w-20 font-medium truncate">{LEAD_STATUS_CONFIG[s].label}</span>
                                  <div className="flex-1 rounded-full bg-black/5 h-1.5 overflow-hidden">
                                    <div className={`h-full rounded-full ${LEAD_STATUS_CONFIG[s].bar}`} style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-xs font-semibold text-[#171717] w-5 text-right">{val}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Visit breakdown */}
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-[#68625a] mb-3 flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#b89658]" /> Visit Breakdown
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {(["CONFIRMED","COMPLETED","CANCELLED","REQUESTED","RESCHEDULED"] as VisitStatus[]).map((s) => (
                              <div key={s} className="flex flex-col items-center rounded-lg border border-black/5 bg-white p-2 gap-1">
                                <span className={`h-2 w-2 rounded-full ${VISIT_STATUS_CONFIG[s].dot}`} />
                                <p className="text-lg sm:text-xl font-bold text-[#171717]">{visitStats[s]}</p>
                                <p className="text-[10px] text-[#68625a] text-center font-medium leading-tight">{VISIT_STATUS_CONFIG[s].label}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </section>
    </>
  );
}
