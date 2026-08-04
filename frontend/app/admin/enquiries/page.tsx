"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";
import { 
  Inbox, 
  Phone, 
  Mail, 
  UserPlus, 
  Loader2, 
  Upload, 
  Download, 
  X, 
  FileSpreadsheet, 
  CheckCircle2, 
  ChevronDown 
} from "lucide-react";

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

const statusOptions: { label: string; value: LeadStatus; colorClass: string }[] = [
  { label: "New", value: "NEW", colorClass: "text-blue-600 font-bold" },
  { label: "Contacted", value: "CONTACTED", colorClass: "text-indigo-600 font-bold" },
  { label: "Qualified", value: "QUALIFIED", colorClass: "text-emerald-600 font-bold" },
  { label: "Closed", value: "CLOSED", colorClass: "text-teal-600 font-bold" },
  { label: "Lost", value: "LOST", colorClass: "text-red-600 font-bold" }
];

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export default function AdminEnquiriesPage() {
  // State
  const [allEnquiries, setAllEnquiries] = useState<Enquiry[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPastedData, setImportPastedData] = useState("");
  const [parsedLeads, setParsedLeads] = useState<{ name: string; phone: string; email?: string; message?: string }[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load agents and user info on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [agentsRes, meRes] = await Promise.all([
          api.get("/agents"),
          api.get("/auth/me")
        ]);
        setAgents(agentsRes.data || []);
        setCurrentUser(meRes.data || null);
      } catch (err) {
        console.error("Failed to load metadata:", err);
      }
    };

    loadMetadata();
  }, []);

  // Fetch ALL enquiries to compute exact counts per status tab
  const fetchAllEnquiries = async () => {
    setLoading(true);
    try {
      const res = await api.get("/enquiries");
      setAllEnquiries(res.data || []);
    } catch (err) {
      console.error("Failed to fetch enquiries:", err);
      toast.error("Failed to load enquiries queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllEnquiries();
  }, []);

  // Compute Live Counts for Each Status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: allEnquiries.length,
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      CLOSED: 0,
      LOST: 0,
    };

    for (const enq of allEnquiries) {
      if (counts[enq.status] !== undefined) {
        counts[enq.status]++;
      }
    }

    return counts;
  }, [allEnquiries]);

  // Filtered list based on statusFilter state
  const filteredEnquiries = useMemo(() => {
    if (!statusFilter) return allEnquiries;
    return allEnquiries.filter((enq) => enq.status === statusFilter);
  }, [allEnquiries, statusFilter]);

  // Handle status/agent update
  const handleUpdate = async (id: string, newStatus: LeadStatus, newAgentId?: string | null) => {
    setSavingId(id);
    try {
      await api.patch(`/enquiries/${id}/status`, {
        status: newStatus,
        agentId: newAgentId || undefined
      });
      toast.success("Lead enquiry updated.");
      
      // Update local state
      setAllEnquiries(prev => prev.map(enq => {
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

  // Export CSV
  const handleExportCSV = () => {
    if (filteredEnquiries.length === 0) {
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
        "Assigned Agent",
        "Created Date"
      ];

      const rows = filteredEnquiries.map((enq) => {
        const escapedMessage = enq.message ? `"${enq.message.replace(/"/g, '""')}"` : "";
        const agentName = enq.agent?.name || "Unassigned";
        const createdDate = new Date(enq.createdAt).toISOString();

        return [
          enq.id,
          `"${enq.name.replace(/"/g, '""')}"`,
          enq.phone,
          enq.email || "",
          escapedMessage,
          enq.status,
          `"${agentName.replace(/"/g, '""')}"`,
          createdDate
        ];
      });

      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `enquiries_export_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV Exported successfully!");
    } catch (err) {
      console.error("CSV Export failed:", err);
      toast.error("Failed to generate CSV export.");
    }
  };

  // CSV / Sheet Data Parser
  const parseCSVText = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length === 0) return [];

    const results: { name: string; phone: string; email?: string; message?: string }[] = [];

    const firstLineLower = lines[0].toLowerCase();
    const hasHeader = firstLineLower.includes("name") || firstLineLower.includes("phone") || firstLineLower.includes("mobile") || firstLineLower.includes("email");
    
    const dataLines = hasHeader ? lines.slice(1) : lines;

    for (const line of dataLines) {
      const parts = line.includes("\t") ? line.split("\t") : line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
      const cleanParts = parts.map(p => p.trim().replace(/^"|"$/g, ''));

      if (cleanParts.length >= 2) {
        const name = cleanParts[0] || "Unknown";
        const phone = cleanParts[1] || "";
        const email = cleanParts[2] && cleanParts[2].includes("@") ? cleanParts[2] : undefined;
        const message = cleanParts[3] || (cleanParts[2] && !cleanParts[2].includes("@") ? cleanParts[2] : undefined);

        if (name && phone) {
          results.push({ name, phone, email, message });
        }
      }
    }

    return results;
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setImportPastedData(content);
        const parsed = parseCSVText(content);
        setParsedLeads(parsed);
        if (parsed.length === 0) {
          toast.error("Could not parse leads. Format: Name, Phone, Email, Message");
        } else {
          toast.success(`Found ${parsed.length} leads in file.`);
        }
      }
    };
    reader.readAsText(file);
  };

  // Handle Text Paste Input
  const handlePastedDataChange = (text: string) => {
    setImportPastedData(text);
    const parsed = parseCSVText(text);
    setParsedLeads(parsed);
  };

  // Execute Bulk Import
  const handleExecuteImport = async () => {
    if (parsedLeads.length === 0) {
      toast.error("No valid leads to import.");
      return;
    }

    setIsImporting(true);
    let successCount = 0;

    for (const lead of parsedLeads) {
      try {
        await api.post("/enquiries", {
          name: lead.name,
          phone: lead.phone,
          email: lead.email || undefined,
          message: lead.message || undefined
        });
        successCount++;
      } catch (err) {
        console.error("Failed to import lead row:", lead, err);
      }
    }

    setIsImporting(false);
    toast.success(`Successfully imported ${successCount} leads!`);
    setIsImportModalOpen(false);
    setImportPastedData("");
    setParsedLeads([]);
    fetchAllEnquiries();
  };

  return (
    <main className="min-h-screen bg-[#f8f6f0] p-3 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-7xl mx-auto">
        
        {/* Header Section & Top Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-black/5 pb-4 sm:pb-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#b89658] font-serif block">
              CLIENT REQUESTS
            </span>
            <h1 className="mt-0.5 font-serif text-2xl sm:text-4xl font-bold text-[#171717]">
              Enquiries
            </h1>
          </div>

          {/* Desktop Top Action Bar (UNTOUCHED FOR DESKTOP) */}
          <div className="hidden md:flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#c5a667]/80 bg-white/90 backdrop-blur-xs py-2 px-4 text-sm font-serif font-bold text-[#b89658] hover:bg-[#b89658]/5 transition shadow-xs"
            >
              <Upload size={15} className="text-[#b89658]" /> Export
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-[#c5a667]/80 bg-white/90 backdrop-blur-xs py-2 px-4 text-sm font-serif font-bold text-[#b89658] hover:bg-[#b89658]/5 transition shadow-xs"
            >
              <Download size={15} className="text-[#b89658]" /> Import
            </button>

            {/* Desktop Status Dropdown */}
            <div className="relative shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none rounded-xl border border-black/10 bg-white px-4 py-2 pr-9 text-sm font-serif font-semibold text-[#171717] shadow-xs cursor-pointer focus:outline-none focus:border-[#b89658]"
              >
                <option value="">All Statuses ({statusCounts.ALL})</option>
                <option value="NEW">New ({statusCounts.NEW})</option>
                <option value="CONTACTED">Contacted ({statusCounts.CONTACTED})</option>
                <option value="QUALIFIED">Qualified ({statusCounts.QUALIFIED})</option>
                <option value="CLOSED">Closed ({statusCounts.CLOSED})</option>
                <option value="LOST">Lost ({statusCounts.LOST})</option>
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500" />
            </div>
          </div>

          {/* Mobile Top Action Row (Export & Import) */}
          <div className="grid grid-cols-2 gap-2 w-full md:hidden">
            <button
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#c5a667]/80 bg-white py-2 px-3 text-xs font-serif font-bold text-[#b89658] active:bg-[#b89658]/10 transition shadow-xs"
            >
              <Upload size={14} className="text-[#b89658]" /> Export
            </button>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#c5a667]/80 bg-white py-2 px-3 text-xs font-serif font-bold text-[#b89658] active:bg-[#b89658]/10 transition shadow-xs"
            >
              <Download size={14} className="text-[#b89658]" /> Import
            </button>
          </div>
        </div>

        {/* Horizontal Slide Bar for Mobile & Desktop Tabs */}
        <div className="w-full overflow-x-auto flex items-center gap-2 pb-3 mb-6 scrollbar-none touch-pan-x flex-nowrap -mx-1 px-1">
          <button
            onClick={() => setStatusFilter("")}
            className={`shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-serif font-bold transition whitespace-nowrap border ${
              statusFilter === ""
                ? "bg-[#171717] text-white border-[#171717] shadow-xs"
                : "bg-white text-neutral-700 border-black/10 hover:bg-neutral-50"
            }`}
          >
            All Statuses
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-sans font-bold ${
              statusFilter === "" ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
            }`}>
              {statusCounts.ALL}
            </span>
          </button>

          {statusOptions.map((opt) => {
            const isSelected = statusFilter === opt.value;
            const count = statusCounts[opt.value] || 0;
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-serif font-bold transition whitespace-nowrap border ${
                  isSelected
                    ? "bg-[#171717] text-white border-[#171717] shadow-xs"
                    : "bg-white text-neutral-700 border-black/10 hover:bg-neutral-50"
                }`}
              >
                {opt.label}
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-sans font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Enquiries Multi-Column Responsive Grid */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-black/5 bg-white p-6 h-64 shadow-xs" />
            ))
          ) : filteredEnquiries.length === 0 ? (
            <div className="col-span-full grid place-items-center py-16 sm:py-20 text-center rounded-2xl bg-white border border-black/5 shadow-xs">
              <Inbox size={44} className="text-[#b89658]/40" />
              <h3 className="mt-3 font-serif font-semibold text-lg text-[#171717]">No enquiries found</h3>
              <p className="mt-1 text-xs text-[#68625a]">No client requests match the current status filter.</p>
            </div>
          ) : (
            filteredEnquiries.map((enq) => {
              const currentStatusOpt = statusOptions.find(s => s.value === enq.status) || statusOptions[0];
              const cleanPhone = enq.phone.replace(/[^0-9]/g, "");
              const formattedPhoneForWhatsapp = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

              return (
                <div
                  key={enq.id}
                  className={`relative rounded-2xl border border-black/8 bg-white p-3.5 sm:p-5 shadow-sm transition hover:shadow-md ${
                    savingId === enq.id ? "opacity-60 pointer-events-none" : ""
                  }`}
                >
                  {/* Saving Loader Overlay */}
                  {savingId === enq.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-2xl z-10 backdrop-blur-xs">
                      <Loader2 className="animate-spin text-[#b89658]" size={24} />
                    </div>
                  )}

                  {/* Header Row: Client Name + NEW Badge + Date */}
                  <div className="flex items-center justify-between text-sm sm:text-base mb-2.5">
                    <div className="flex items-center gap-2 font-serif font-bold text-[#171717] min-w-0">
                      <span className="truncate">{enq.name}</span>
                      <span className={`text-[11px] sm:text-xs uppercase tracking-wider ${currentStatusOpt.colorClass} font-sans shrink-0`}>
                        {enq.status}
                      </span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-serif text-neutral-500 shrink-0 ml-2">
                      {formatDate(enq.createdAt)}
                    </span>
                  </div>

                  {/* Client Message Quote Box */}
                  <div className="mb-3 rounded-xl bg-[#eceae6] p-2.5 sm:p-3 text-xs sm:text-sm font-serif italic text-neutral-700 leading-relaxed border border-black/5 break-words">
                    &quot;{enq.message || "No specific requirement message provided."}&quot;
                  </div>

                  {/* Contact Info & Action Bar (Fully Responsive) */}
                  <div className="mb-3 flex items-center justify-between rounded-xl bg-[#eceae6] p-2 sm:p-2.5 px-3 text-xs sm:text-sm font-sans text-neutral-700 border border-black/5 gap-1">
                    <div className="flex items-center gap-1.5 font-medium shrink-0">
                      <Phone size={13} className="text-neutral-500 shrink-0" />
                      <span className="text-xs sm:text-sm font-sans">{enq.phone}</span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 text-neutral-400 shrink-0">
                      {/* Email Icon */}
                      {enq.email ? (
                        <a
                          href={`mailto:${enq.email}`}
                          title={`Email ${enq.email}`}
                          className="hover:opacity-80 transition"
                        >
                          <Mail size={15} className="text-neutral-900 fill-neutral-900 sm:w-4 sm:h-4" />
                        </a>
                      ) : (
                        <Mail size={15} className="text-neutral-400 opacity-40 cursor-not-allowed sm:w-4 sm:h-4" title="No email captured" />
                      )}

                      <span className="text-neutral-300 font-light">|</span>

                      {/* WhatsApp Icon */}
                      <a
                        href={`https://wa.me/${formattedPhoneForWhatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Chat on WhatsApp"
                        className="hover:scale-110 transition shrink-0"
                      >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#25D366]" viewBox="0 0 24 24">
                          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.233-1.371a9.936 9.936 0 0 0 4.777 1.217h.005c5.505 0 9.99-4.478 9.99-9.986 0-2.67-1.037-5.18-2.92-7.061A9.925 9.925 0 0 0 12.012 2zm5.72 14.12c-.244.688-1.22 1.259-1.68 1.32-.46.06-1.065.11-3.04-.7-2.525-1.035-4.155-3.605-4.28-3.77-.125-.165-1.11-1.475-1.11-2.81 0-1.335.7-1.99.95-2.25.25-.26.545-.33.725-.33h.52c.15 0 .35.05.51.435.17.41.58 1.41.63 1.51.05.1.08.22.01.36-.07.14-.11.23-.22.36-.11.13-.23.29-.33.39-.115.115-.235.24-.1.45.135.21.6 1.01.87 1.25.35.31.62.4.87.525.25.125.4.1.55-.075.15-.175.65-.75.82-.99.17-.25.35-.2.58-.11.235.09 1.485.7 1.74.825.255.125.425.19.49.3.06.11.06.63-.18 1.32z"/>
                        </svg>
                      </a>

                      <span className="text-neutral-300 font-light">|</span>

                      {/* Call Phone Receiver Icon */}
                      <a
                        href={`tel:${enq.phone}`}
                        title="Call Client"
                        className="hover:opacity-80 transition"
                      >
                        <Phone size={14} className="text-neutral-900 fill-neutral-900 sm:w-3.5 sm:h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Agent Notes Container */}
                  <div className="mb-3">
                    <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-serif font-bold text-neutral-600 block mb-1">
                      AGENT NOTES
                    </span>
                    <div className="relative rounded-xl bg-[#eceae6] p-2.5 pb-10 border border-black/5">
                      <textarea
                        defaultValue={enq.notes || ""}
                        id={`notes-${enq.id}`}
                        rows={2}
                        placeholder="Add client interaction or follow-up note..."
                        className="w-full bg-transparent border-0 text-xs sm:text-sm font-serif text-neutral-800 focus:outline-none resize-none placeholder:text-neutral-400 placeholder:italic"
                      />
                      <button
                        onClick={async () => {
                          const textareaElement = document.getElementById(`notes-${enq.id}`) as HTMLTextAreaElement;
                          const notesVal = textareaElement?.value || "";
                          try {
                            setSavingId(enq.id);
                            await api.patch(`/enquiries/${enq.id}/notes`, { notes: notesVal });
                            toast.success("Enquiry note saved!");
                            setAllEnquiries(prev => prev.map(item => item.id === enq.id ? { ...item, notes: notesVal } : item));
                          } catch (err: any) {
                            console.error("Failed to save note:", err);
                            toast.error("Failed to save enquiry note.");
                          } finally {
                            setSavingId(null);
                          }
                        }}
                        className="absolute right-2 bottom-2 rounded-md bg-[#171717] px-2.5 py-1 text-xs font-serif font-bold text-white hover:bg-black transition shadow-xs"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>

                  {/* Status & Assignee Controls Row */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    {/* Status Picker */}
                    <div>
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-serif font-bold text-neutral-600 block mb-1">
                        STATUS
                      </span>
                      <div className="relative">
                        <select
                          value={enq.status}
                          onChange={(e) => handleUpdate(enq.id, e.target.value as LeadStatus, enq.agentId)}
                          className="w-full appearance-none rounded-xl border border-black/10 bg-white px-2.5 py-1.5 sm:py-2 text-xs sm:text-sm font-serif font-semibold text-[#171717] focus:outline-none focus:border-[#b89658] cursor-pointer pr-6 shadow-2xs truncate"
                        >
                          {statusOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                      </div>
                    </div>

                    {/* Assignee Picker */}
                    <div>
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-serif font-bold text-neutral-600 flex items-center gap-1 mb-1 truncate">
                        <UserPlus size={10} className="text-neutral-500 shrink-0" /> ASSIGNEE
                      </span>
                      <div className="relative">
                        <select
                          value={enq.agentId || ""}
                          onChange={(e) => handleUpdate(enq.id, enq.status, e.target.value || null)}
                          disabled={currentUser?.role === "SALES_AGENT"}
                          className="w-full appearance-none rounded-xl border border-black/10 bg-white px-2.5 py-1.5 sm:py-2 text-xs sm:text-sm font-serif font-semibold text-[#171717] focus:outline-none focus:border-[#b89658] cursor-pointer pr-6 shadow-2xs disabled:opacity-70 disabled:cursor-not-allowed truncate"
                        >
                          <option value="">Unassigned</option>
                          {agents.map(ag => (
                            <option key={ag.id} value={ag.id}>{ag.name}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                      </div>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Import Sheet / CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-black/10">
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-4 right-4 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-[#b89658] font-serif font-bold text-lg mb-1">
              <FileSpreadsheet size={22} />
              Import Leads from Sheet / CSV
            </div>
            <p className="text-xs text-neutral-500 mb-4 font-sans">
              Upload a <code>.csv</code> file or paste rows directly from Google Sheets or Excel. Expected columns: <strong>Name, Phone, Email, Message</strong>.
            </p>

            {/* File Upload Trigger */}
            <div className="mb-4">
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#b89658]/40 bg-[#fbf9f5] py-4 text-xs font-serif font-bold text-[#b89658] hover:bg-[#b89658]/10 transition"
              >
                <Upload size={16} /> Choose CSV File from Device
              </button>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-neutral-200" />
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-neutral-400">or paste sheet text</span>
              <div className="flex-grow border-t border-neutral-200" />
            </div>

            {/* Textarea for pasted data */}
            <div className="mt-2 mb-4">
              <textarea
                value={importPastedData}
                onChange={(e) => handlePastedDataChange(e.target.value)}
                rows={4}
                placeholder={`Gouravv, 9876543210, gouravv@gmail.com, Looking for 3BHK in Whitefield\nRishi, 9988776655, rishi@gmail.com, Need villa in Sarjapur`}
                className="w-full rounded-xl border border-black/10 p-3 text-xs font-mono text-neutral-800 focus:outline-none focus:border-[#b89658] bg-neutral-50"
              />
            </div>

            {/* Preview Summary */}
            {parsedLeads.length > 0 && (
              <div className="mb-4 rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between font-serif">
                <span className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Ready to import {parsedLeads.length} valid lead{parsedLeads.length > 1 ? "s" : ""}
                </span>
                <span className="text-[11px] text-emerald-600">
                  Preview: {parsedLeads[0].name} ({parsedLeads[0].phone})
                </span>
              </div>
            )}

            {/* Modal Action Buttons */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-serif font-bold text-neutral-600 hover:bg-neutral-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteImport}
                disabled={parsedLeads.length === 0 || isImporting}
                className="flex items-center gap-2 rounded-xl bg-[#171717] px-5 py-2 text-xs font-serif font-bold text-white hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Importing...
                  </>
                ) : (
                  <>Import Leads Now</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
