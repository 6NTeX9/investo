"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Inbox, Phone, Mail, Calendar, User, UserPlus, Loader2, Sparkles, Download } from "lucide-react";

type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "CLOSED" | "LOST";

interface Property {
  id: string;
  title: string;
  slug: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
}

interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  status: LeadStatus;
  propertyId: string | null;
  property: Property | null;
  agentId: string | null;
  agent: Agent | null;
  createdAt: string;
  notes: string | null;
}

const statusOptions: { label: string; value: LeadStatus; color: string }[] = [
  { label: "New", value: "NEW", color: "bg-blue-50 text-blue-700 border-blue-100" },
  { label: "Contacted", value: "CONTACTED", color: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  { label: "Qualified", value: "QUALIFIED", color: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { label: "Closed", value: "CLOSED", color: "bg-teal-50 text-teal-700 border-teal-100" },
  { label: "Lost", value: "LOST", color: "bg-red-50 text-red-700 border-red-100" }
];

export default function AdminEnquiriesPage() {
  // State
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("NEW");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load metadata on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [agentsRes, meRes] = await Promise.all([
          api.get("/agents"),
          api.get("/auth/me")
        ]);
        setAgents(agentsRes.data);
        setCurrentUser(meRes.data);
      } catch (err) {
        console.error("Failed to load metadata:", err);
        toast.error("Failed to load agents database.");
      }
    };

    loadMetadata();
  }, []);

  // Fetch updated list on filter change
  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const url = statusFilter ? `/enquiries?status=${statusFilter}` : "/enquiries";
      const res = await api.get(url);
      setEnquiries(res.data);
    } catch (err) {
      console.error("Failed to fetch enquiries:", err);
      toast.error("Failed to load enquiries queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  // Handle status/agent update
  const handleUpdate = async (id: string, newStatus: LeadStatus, newAgentId?: string | null) => {
    setSavingId(id);
    try {
      await api.patch(`/enquiries/${id}/status`, {
        status: newStatus,
        agentId: newAgentId || undefined
      });
      toast.success("Lead enquiry updated successfully.");
      
      // Update local state
      setEnquiries(prev => prev.map(enq => {
        if (enq.id === id) {
          const selectedAgent = agents.find(ag => ag.id === newAgentId) || null;
          return {
            ...enq,
            status: newStatus,
            agentId: newAgentId || null,
            agent: selectedAgent
          };
        }
        return enq;
      }));
    } catch (err: any) {
      console.error("Failed to update enquiry:", err);
      toast.error(err.response?.data?.message ?? "Failed to save updates.");
    } finally {
      setSavingId(null);
    }
  };

  const handleExportCSV = () => {
    if (enquiries.length === 0) {
      toast.error("No enquiries to export.");
      return;
    }

    try {
      const headers = [
        "Enquiry ID",
        "Client Name",
        "Phone",
        "Email",
        "Message",
        "Status",
        "Assigned Agent Name",
        "Assigned Agent Email",
        "Created Date"
      ];

      const rows = enquiries.map((enq) => {
        const escapedMessage = enq.message 
          ? `"${enq.message.replace(/"/g, '""')}"` 
          : "";
        const agentName = enq.agent?.name || "Unassigned";
        const agentEmail = enq.agent?.email || "N/A";
        const createdDate = new Date(enq.createdAt).toISOString();

        return [
          enq.id,
          `"${enq.name.replace(/"/g, '""')}"`,
          enq.phone,
          enq.email || "",
          escapedMessage,
          enq.status,
          `"${agentName.replace(/"/g, '""')}"`,
          agentEmail,
          createdDate
        ];
      });

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `enquiries_export_${new Date().toISOString().split("T")[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Spreadsheet CSV exported successfully!");
    } catch (err) {
      console.error("CSV Export failed:", err);
      toast.error("Failed to generate CSV export.");
    }
  };

  return (
    <section className="p-6 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Client requests</p>
          <h1 className="mt-2 text-3xl font-semibold">Enquiries</h1>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 items-center">
          {currentUser?.role !== "SALES_AGENT" && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 rounded-md border border-[#b89658] px-4 py-2.5 text-sm font-semibold text-[#b89658] hover:bg-[#b89658]/5 transition bg-white luxury-shadow"
            >
              <Download size={15} /> Export CSV
            </button>
          )}
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="focus-ring rounded-md border border-black/10 px-4 py-2.5 text-sm bg-white luxury-shadow font-semibold"
          >
            <option value="">All Leads</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="CLOSED">Closed</option>
            <option value="LOST">Lost</option>
          </select>
        </div>
      </div>

      {/* Enquiries List */}
      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border border-black/5 bg-white p-6 h-40" />
            ))}
          </div>
        ) : enquiries.length === 0 ? (
          <div className="grid place-items-center py-20 text-center rounded-lg bg-white border border-black/5 luxury-shadow">
            <Inbox size={48} className="text-[#b89658]/40" />
            <h3 className="mt-4 font-semibold text-lg">No enquiries found</h3>
            <p className="mt-1 text-sm text-[#68625a]">No client requests match the current status filter.</p>
          </div>
        ) : (
          enquiries.map((enq) => {
            const currentOption = statusOptions.find(o => o.value === enq.status) || statusOptions[0];
            return (
              <div 
                key={enq.id} 
                className={`relative rounded-xl border bg-white p-6 luxury-shadow transition border-black/5 hover:border-[#b89658]/30 flex flex-col md:grid md:grid-cols-[1fr_240px] gap-6 items-start ${
                  savingId === enq.id ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                {/* Loader Overlay for single row saving */}
                {savingId === enq.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 rounded-xl">
                    <Loader2 className="animate-spin text-[#b89658]" size={24} />
                  </div>
                )}

                {/* Left Side: Client & Enquiry Details */}
                <div className="space-y-3 w-full">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1 text-base font-semibold text-[#171717]">
                      <User size={16} className="text-[#b89658]" />
                      {enq.name}
                    </span>
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${currentOption.color}`}>
                      {currentOption.label}
                    </span>
                    {enq.property && (
                      <span className="inline-flex items-center gap-1 rounded bg-[#f7f4ee] px-2 py-0.5 text-xs font-semibold text-[#b89658]">
                        <Sparkles size={11} />
                        Property: {enq.property.title}
                      </span>
                    )}
                  </div>

                  {enq.message && (
                    <p className="text-sm text-[#68625a] leading-relaxed italic bg-black/[0.01] p-3 rounded-md border border-black/5">
                      "{enq.message}"
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#68625a] font-medium pt-1">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5">
                        <Phone size={13} />
                        {enq.phone}
                      </span>
                      {/* Actions for Call & WhatsApp */}
                      <a 
                        href={`tel:${enq.phone}`}
                        className="inline-flex items-center justify-center p-1 rounded bg-[#f7f4ee] hover:bg-[#b89658]/10 text-[#b89658] border border-[#b89658]/20 transition"
                        title="Call Client"
                      >
                        <Phone size={11} />
                      </a>
                      <a 
                        href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, "").length === 10 ? `91${enq.phone.replace(/[^0-9]/g, "")}` : enq.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-1 rounded bg-[#ecfdf5] hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition"
                        title="WhatsApp Client"
                      >
                        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.233-1.371a9.936 9.936 0 0 0 4.777 1.217h.005c5.505 0 9.99-4.478 9.99-9.986 0-2.67-1.037-5.18-2.92-7.061A9.925 9.925 0 0 0 12.012 2zm5.72 14.12c-.244.688-1.22 1.259-1.68 1.32-.46.06-1.065.11-3.04-.7-2.525-1.035-4.155-3.605-4.28-3.77-.125-.165-1.11-1.475-1.11-2.81 0-1.335.7-1.99.95-2.25.25-.26.545-.33.725-.33h.52c.15 0 .35.05.51.435.17.41.58 1.41.63 1.51.05.1.08.22.01.36-.07.14-.11.23-.22.36-.11.13-.23.29-.33.39-.115.115-.235.24-.1.45.135.21.6 1.01.87 1.25.35.31.62.4.87.525.25.125.4.1.55-.075.15-.175.65-.75.82-.99.17-.25.35-.2.58-.11.235.09 1.485.7 1.74.825.255.125.425.19.49.3.06.11.06.63-.18 1.32z"/>
                        </svg>
                      </a>
                    </div>
                    {enq.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail size={13} />
                        {enq.email}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar size={13} />
                      Received {new Date(enq.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                  </div>

                  {/* Notes / Comments Section */}
                  <div className="border-t border-black/5 pt-3.5 mt-3 space-y-2">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#68625a] block">
                      Agent Notes / Comments
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        defaultValue={enq.notes || ""}
                        id={`notes-${enq.id}`}
                        rows={1}
                        placeholder="Add a comment or follow-up note..."
                        className="flex-1 focus-ring rounded border border-black/10 px-3 py-1.5 text-xs focus:border-[#b89658]/50 resize-y min-h-[32px] bg-white text-black"
                      />
                      <button
                        onClick={async () => {
                          const textareaElement = document.getElementById(`notes-${enq.id}`) as HTMLTextAreaElement;
                          const notesVal = textareaElement?.value || "";
                          try {
                            setSavingId(enq.id);
                            await api.patch(`/enquiries/${enq.id}/notes`, { notes: notesVal });
                            toast.success("Enquiry notes updated successfully!");
                            // Update local state
                            setEnquiries(prev => prev.map(item => item.id === enq.id ? { ...item, notes: notesVal } : item));
                          } catch (err: any) {
                            console.error("Failed to save note:", err);
                            toast.error("Failed to save enquiry note.");
                          } finally {
                            setSavingId(null);
                          }
                        }}
                        className="rounded bg-[#171717] hover:bg-[#2a2a2a] px-3.5 py-1.5 text-xs font-semibold text-white transition h-max shrink-0 self-end"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Side: Assignment Controls */}
                <div className="w-full border-t border-black/5 pt-4 md:border-t-0 md:pt-0 space-y-4 shrink-0">
                  {/* Status Dropdown */}
                  <div className="grid gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#68625a]">
                      Lead Status
                    </label>
                    <select
                      value={enq.status}
                      onChange={(e) => handleUpdate(enq.id, e.target.value as LeadStatus, enq.agentId)}
                      className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm bg-white text-[#171717]"
                    >
                      {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Assign Agent Dropdown */}
                  <div className="grid gap-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#68625a] flex items-center gap-1">
                      <UserPlus size={12} />
                      Assignee
                    </label>
                    <select
                      value={enq.agentId || ""}
                      onChange={(e) => handleUpdate(enq.id, enq.status, e.target.value || null)}
                      disabled={currentUser?.role === "SALES_AGENT"}
                      className="focus-ring rounded-md border border-black/10 px-3 py-2 text-sm bg-white text-[#171717] disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-[#fcfbfa]"
                    >
                      <option value="">Unassigned</option>
                      {agents.map(ag => (
                        <option key={ag.id} value={ag.id}>{ag.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

    </section>
  );
}
