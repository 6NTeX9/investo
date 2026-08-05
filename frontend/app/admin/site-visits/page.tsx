"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";
import {
  Calendar, Phone, Mail, Clock, User, UserPlus, Loader2,
  Sparkles, AlertCircle, Plus, X, ChevronDown, CheckCircle2, Trash2, Pencil
} from "lucide-react";

type VisitStatus = "REQUESTED" | "CONFIRMED" | "RESCHEDULED" | "COMPLETED" | "CANCELLED";

interface Property { id: string; title: string; slug: string; }
interface Agent { id: string; name: string; email: string; phone?: string; }
interface SiteVisit {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  preferredAt: string;
  status: VisitStatus;
  propertyId: string | null;
  property: Property | null;
  assignedAgentId: string | null;
  assignedAgent: Agent | null;
  createdAt: string;
}

const STATUS_OPTIONS: { label: string; value: VisitStatus; colorClass: string; dot: string }[] = [
  { label: "Requested",   value: "REQUESTED",   colorClass: "text-blue-600 font-bold",     dot: "bg-blue-500" },
  { label: "Confirmed",   value: "CONFIRMED",   colorClass: "text-emerald-600 font-bold", dot: "bg-emerald-500" },
  { label: "Rescheduled", value: "RESCHEDULED", colorClass: "text-indigo-600 font-bold",  dot: "bg-indigo-500" },
  { label: "Completed",   value: "COMPLETED",   colorClass: "text-teal-600 font-bold",      dot: "bg-teal-500" },
  { label: "Cancelled",   value: "CANCELLED",   colorClass: "text-red-600 font-bold",         dot: "bg-red-400" },
];

function formatDateTime(d: string) {
  try {
    return new Date(d).toLocaleString("en-IN", {
      weekday: "short", day: "numeric", month: "short",
      year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  } catch {
    return d;
  }
}

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return d;
  }
}

/** Returns true if two visits are within 1 hour of each other and share the same agent */
function hasTimeClash(a: SiteVisit, b: SiteVisit) {
  if (!a.assignedAgentId || a.assignedAgentId !== b.assignedAgentId) return false;
  if (a.id === b.id) return false;
  const diff = Math.abs(new Date(a.preferredAt).getTime() - new Date(b.preferredAt).getTime());
  return diff < 60 * 60 * 1000; // 1 hour
}

export default function AdminSiteVisitsPage() {
  const [allVisits, setAllVisits]     = useState<SiteVisit[]>([]);
  const [agents, setAgents]           = useState<Agent[]>([]);
  const [properties, setProperties]   = useState<Property[]>([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [savingId, setSavingId]       = useState<string | null>(null);

  // Drawer
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [drawerMode, setDrawerMode]   = useState<"create" | "edit">("create");
  const [editingVisit, setEditingVisit] = useState<SiteVisit | null>(null);

  // Form fields
  const [fName, setFName]             = useState("");
  const [fPhone, setFPhone]           = useState("");
  const [fEmail, setFEmail]           = useState("");
  const [fDate, setFDate]             = useState("");
  const [fTime, setFTime]             = useState("10:00");
  const [fPropertyId, setFPropertyId] = useState("");
  const [fAgentId, setFAgentId]       = useState("");
  const [fMessage, setFMessage]       = useState("");
  const [fStatus, setFStatus]         = useState<VisitStatus>("CONFIRMED");

  // Delete
  const [deleteId, setDeleteId]       = useState<string | null>(null);
  const [deleting, setDeleting]       = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    setLoading(true);
    try {
      const [aRes, pRes, meRes, vRes] = await Promise.all([
        api.get("/agents"),
        api.get("/properties", { params: { limit: 200 } }),
        api.get("/auth/me"),
        api.get("/site-visits"),
      ]);
      setAgents(aRes.data || []);
      setProperties(pRes.data?.items || pRes.data || []);
      setCurrentUser(meRes.data || null);
      setAllVisits(vRes.data || []);
    } catch {
      toast.error("Failed to load site visits data.");
    } finally {
      setLoading(false);
    }
  };

  const reloadVisits = async () => {
    try {
      const res = await api.get("/site-visits");
      setAllVisits(res.data || []);
    } catch {
      console.error("Failed to refresh site visits");
    }
  };

  // Live Status Counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: allVisits.length,
      REQUESTED: 0,
      CONFIRMED: 0,
      RESCHEDULED: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    for (const v of allVisits) {
      if (counts[v.status] !== undefined) {
        counts[v.status]++;
      }
    }

    return counts;
  }, [allVisits]);

  // Filtered Visits
  const filteredVisits = useMemo(() => {
    let list = [...allVisits];
    if (statusFilter) {
      list = list.filter(v => v.status === statusFilter);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allVisits, statusFilter]);

  // Time Clash Detection Set
  const clashSet = useMemo(() => {
    const set = new Set<string>();
    allVisits.forEach(a => allVisits.forEach(b => {
      if (hasTimeClash(a, b)) {
        set.add(a.id);
        set.add(b.id);
      }
    }));
    return set;
  }, [allVisits]);

  const openDrawer = () => {
    setDrawerMode("create");
    setEditingVisit(null);
    setFName(""); setFPhone(""); setFEmail(""); setFDate("");
    setFTime("10:00"); setFPropertyId(""); 
    
    if (currentUser?.role === "SALES_AGENT") {
      const myAgent = agents.find(a => a.email === currentUser?.email);
      setFAgentId(myAgent?.id || "");
    } else {
      setFAgentId("");
    }
    
    setFMessage(""); setFStatus("CONFIRMED");
    setDrawerOpen(true);
  };

  const openEditDrawer = (visit: SiteVisit) => {
    setDrawerMode("edit");
    setEditingVisit(visit);
    setFName(visit.name);
    setFPhone(visit.phone);
    setFEmail(visit.email || "");
    
    const dateObj = new Date(visit.preferredAt);
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    setFDate(`${yyyy}-${mm}-${dd}`);
    
    const hh = String(dateObj.getHours()).padStart(2, "0");
    const min = String(dateObj.getMinutes()).padStart(2, "0");
    setFTime(`${hh}:${min}`);
    
    setFPropertyId(visit.propertyId || "");
    setFAgentId(visit.assignedAgentId || "");
    setFMessage(visit.message || "");
    setFStatus(visit.status);
    setDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName || !fPhone || !fDate || !fTime) {
      toast.error("Client name, phone, date and time are required.");
      return;
    }
    setSubmitting(true);
    try {
      const preferredAt = new Date(`${fDate}T${fTime}`).toISOString();
      const payload = {
        name: fName,
        phone: fPhone,
        email: fEmail || null,
        preferredAt,
        propertyId: fPropertyId || null,
        assignedAgentId: fAgentId || null,
        message: fMessage || null,
        status: fStatus,
      };

      if (drawerMode === "edit" && editingVisit) {
        await api.patch(`/site-visits/${editingVisit.id}`, payload);
        toast.success("Site visit updated successfully!");
      } else {
        await api.post("/site-visits/admin", payload);
        toast.success("Site visit booked successfully!");
      }
      setDrawerOpen(false);
      reloadVisits();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : (msg ?? `Failed to ${drawerMode === "edit" ? "update" : "book"} site visit.`));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (id: string, status: VisitStatus, agentId?: string | null) => {
    setSavingId(id);
    try {
      await api.patch(`/site-visits/${id}/status`, { status, assignedAgentId: agentId ?? null });
      toast.success("Site visit updated.");
      setAllVisits(prev => prev.map(v => {
        if (v.id !== id) return v;
        return {
          ...v,
          status,
          assignedAgentId: agentId || null,
          assignedAgent: agents.find(a => a.id === agentId) || null
        };
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to update site visit.");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/site-visits/${deleteId}`);
      toast.success("Site visit removed.");
      setDeleteId(null);
      setAllVisits(prev => prev.filter(v => v.id !== deleteId));
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f6f0] p-2 sm:p-6 md:p-8 font-sans">
      <div className="w-full max-w-7xl mx-auto">
        
        {/* Header Section & Top Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4 mb-4 md:mb-6 border-b border-black/5 pb-3 md:pb-6">
          <div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[#b89658] font-serif block">
              SHOWINGS SCHEDULE
            </span>
            <h1 className="mt-0.5 font-serif text-2xl sm:text-4xl font-bold text-[#171717]">
              Site Visits
            </h1>
          </div>

          {/* Desktop Top Action Bar (UNTOUCHED FOR DESKTOP) */}
          <div className="hidden md:flex flex-wrap items-center gap-3">
            <button
              onClick={openDrawer}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#171717] py-2 px-5 text-sm font-serif font-bold text-white hover:bg-black transition shadow-xs"
            >
              <Plus size={15} /> Book Visit
            </button>

            {/* Desktop Status Dropdown */}
            <div className="relative shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none rounded-xl border border-black/10 bg-white px-4 py-2 pr-9 text-sm font-serif font-semibold text-[#171717] shadow-xs cursor-pointer focus:outline-none focus:border-[#b89658]"
              >
                <option value="">All Visits ({statusCounts.ALL})</option>
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({statusCounts[opt.value] || 0})
                  </option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500" />
            </div>
          </div>

          {/* Mobile Action Bar: Full Width Book Visit Button */}
          <div className="w-full md:hidden mt-1">
            <button
              onClick={openDrawer}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#171717] py-2.5 px-4 text-xs font-serif font-bold text-white active:bg-black transition shadow-xs"
            >
              <Plus size={14} /> Book Visit
            </button>
          </div>
        </div>

        {/* Horizontal Slide Bar for Status Tabs (Mobile & Desktop) */}
        <div className="w-full overflow-x-auto flex items-center gap-2 pb-3 mb-4 md:mb-6 scrollbar-none touch-pan-x flex-nowrap">
          <button
            onClick={() => setStatusFilter("")}
            className={`shrink-0 flex items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-serif font-bold transition whitespace-nowrap border ${
              statusFilter === ""
                ? "bg-[#171717] text-white border-[#171717] shadow-xs"
                : "bg-white text-neutral-700 border-black/10 hover:bg-neutral-50"
            }`}
          >
            All Visits
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-sans font-bold ${
              statusFilter === "" ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
            }`}>
              {statusCounts.ALL}
            </span>
          </button>

          {STATUS_OPTIONS.map((opt) => {
            const isSelected = statusFilter === opt.value;
            const count = statusCounts[opt.value] || 0;
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`shrink-0 flex items-center gap-1.5 sm:gap-2 rounded-xl px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-serif font-bold transition whitespace-nowrap border ${
                  isSelected
                    ? "bg-[#171717] text-white border-[#171717] shadow-xs"
                    : "bg-white text-neutral-700 border-black/10 hover:bg-neutral-50"
                }`}
              >
                {opt.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-sans font-bold ${
                  isSelected ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Time Clash Alert Banner */}
        {clashSet.size > 0 && (
          <div className="mb-6 flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 p-3 px-4 text-xs sm:text-sm font-semibold text-amber-800 shadow-2xs">
            <AlertCircle size={16} className="shrink-0 text-amber-600" />
            <span>
              <strong>{clashSet.size} visit{clashSet.size > 1 ? "s" : ""}</strong> have a potential time clash with the same assigned agent.
            </span>
          </div>
        )}

        {/* Site Visits Multi-Column Responsive Grid */}
        <div className="grid gap-3 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-black/5 bg-white p-6 h-64 shadow-xs" />
            ))
          ) : filteredVisits.length === 0 ? (
            <div className="col-span-full grid place-items-center py-16 sm:py-20 text-center rounded-2xl bg-white border border-black/5 shadow-xs">
              <Calendar size={44} className="text-[#b89658]/40" />
              <h3 className="mt-3 font-serif font-semibold text-lg text-[#171717]">No site visits found</h3>
              <p className="mt-1 text-xs text-[#68625a]">No showings match the current status filter.</p>
            </div>
          ) : (
            filteredVisits.map((visit) => {
              const currentStatusOpt = STATUS_OPTIONS.find(s => s.value === visit.status) || STATUS_OPTIONS[0];
              const isClash = clashSet.has(visit.id);
              const isSaving = savingId === visit.id;
              const cleanPhone = visit.phone.replace(/[^0-9]/g, "");
              const formattedPhoneForWhatsapp = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

              return (
                <div
                  key={visit.id}
                  className={`relative rounded-xl sm:rounded-2xl border bg-white p-3 sm:p-5 shadow-sm transition hover:shadow-md flex flex-col justify-between ${
                    isClash ? "border-amber-300 bg-amber-50/20" : "border-black/8"
                  } ${isSaving ? "opacity-60 pointer-events-none" : ""}`}
                >
                  {/* Saving Loader Overlay */}
                  {isSaving && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-2xl z-10 backdrop-blur-xs">
                      <Loader2 className="animate-spin text-[#b89658]" size={24} />
                    </div>
                  )}

                  <div>
                    {/* Time Clash Alert Badge */}
                    {isClash && (
                      <div className="mb-2 inline-flex items-center gap-1 rounded-md bg-amber-100 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        ⚠️ Schedule Time Clash
                      </div>
                    )}

                    {/* Header Row: Client Name + Status Badge + Date */}
                    <div className="flex items-center justify-between text-sm sm:text-base mb-2.5">
                      <div className="flex items-center gap-2 font-serif font-bold text-[#171717] min-w-0">
                        <span className="truncate">{visit.name}</span>
                        <span className={`text-[10px] sm:text-xs uppercase tracking-wider ${currentStatusOpt.colorClass} font-sans shrink-0`}>
                          {visit.status}
                        </span>
                      </div>
                      <span className="text-[10px] sm:text-xs font-serif text-neutral-500 shrink-0 ml-1.5">
                        {formatDate(visit.createdAt)}
                      </span>
                    </div>

                    {/* Visit Time Badge */}
                    <div className="mb-2.5 flex items-center gap-2 rounded-xl bg-[#171717] p-2.5 px-3 text-xs font-serif text-white shadow-2xs">
                      <Clock size={14} className="text-[#b89658] shrink-0" />
                      <span className="font-semibold tracking-wide">{formatDateTime(visit.preferredAt)}</span>
                    </div>

                    {/* Property Attached Badge */}
                    {visit.property && (
                      <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-lg bg-[#f7f4ee] px-2.5 py-1 text-xs font-serif font-semibold text-[#b89658] border border-[#b89658]/20 max-w-full truncate">
                        <Sparkles size={11} className="shrink-0" />
                        <span className="truncate">{visit.property.title}</span>
                      </div>
                    )}

                    {/* Client Message / Requirement Quote Box */}
                    {visit.message && (
                      <div className="mb-3 rounded-xl bg-[#eceae6] p-2.5 sm:p-3 text-xs sm:text-sm font-serif italic text-neutral-700 leading-relaxed border border-black/5 break-words">
                        &quot;{visit.message}&quot;
                      </div>
                    )}

                    {/* Contact Info & Action Bar (100% Fit for Mobile) */}
                    <div className="mb-3 flex items-center justify-between rounded-xl bg-[#eceae6] p-2 px-2.5 text-xs sm:text-sm font-sans text-neutral-700 border border-black/5 gap-1">
                      <div className="flex items-center gap-1.5 font-medium shrink-0">
                        <Phone size={13} className="text-neutral-500 shrink-0" />
                        <span className="text-xs sm:text-sm font-sans font-semibold text-neutral-800">{visit.phone}</span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 text-neutral-400 shrink-0">
                        {/* Email Icon */}
                        {visit.email ? (
                          <a
                            href={`mailto:${visit.email}`}
                            title={`Email ${visit.email}`}
                            className="hover:opacity-80 transition p-0.5"
                          >
                            <Mail size={15} className="text-neutral-900 fill-neutral-900" />
                          </a>
                        ) : (
                          <Mail size={15} className="text-neutral-400 opacity-40 cursor-not-allowed p-0.5" title="No email captured" />
                        )}

                        <span className="text-neutral-300 font-light">|</span>

                        {/* WhatsApp Icon */}
                        <a
                          href={`https://wa.me/${formattedPhoneForWhatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Chat on WhatsApp"
                          className="hover:scale-110 transition shrink-0 p-0.5"
                        >
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#25D366]" viewBox="0 0 24 24">
                            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.233-1.371a9.936 9.936 0 0 0 4.777 1.217h.005c5.505 0 9.99-4.478 9.99-9.986 0-2.67-1.037-5.18-2.92-7.061A9.925 9.925 0 0 0 12.012 2zm5.72 14.12c-.244.688-1.22 1.259-1.68 1.32-.46.06-1.065.11-3.04-.7-2.525-1.035-4.155-3.605-4.28-3.77-.125-.165-1.11-1.475-1.11-2.81 0-1.335.7-1.99.95-2.25.25-.26.545-.33.725-.33h.52c.15 0 .35.05.51.435.17.41.58 1.41.63 1.51.05.1.08.22.01.36-.07.14-.11.23-.22.36-.11.13-.23.29-.33.39-.115.115-.235.24-.1.45.135.21.6 1.01.87 1.25.35.31.62.4.87.525.25.125.4.1.55-.075.15-.175.65-.75.82-.99.17-.25.35-.2.58-.11.235.09 1.485.7 1.74.825.255.125.425.19.49.3.06.11.06.63-.18 1.32z"/>
                          </svg>
                        </a>

                        <span className="text-neutral-300 font-light">|</span>

                        {/* Call Phone Receiver Icon */}
                        <a
                          href={`tel:${visit.phone}`}
                          title="Call Client"
                          className="hover:opacity-80 transition p-0.5"
                        >
                          <Phone size={14} className="text-neutral-900 fill-neutral-900" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div>
                    {/* Status & Assignee Controls Row */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-black/5 mb-3">
                      {/* Status Picker */}
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-serif font-bold text-neutral-600 block mb-1">
                          STATUS
                        </span>
                        <div className="relative">
                          <select
                            value={visit.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as VisitStatus;
                              if (newStatus === "RESCHEDULED") {
                                openEditDrawer({ ...visit, status: newStatus });
                              } else {
                                handleUpdate(visit.id, newStatus, visit.assignedAgentId);
                              }
                            }}
                            className="w-full appearance-none rounded-xl border border-black/10 bg-white px-2.5 py-1.5 text-xs sm:text-sm font-serif font-semibold text-[#171717] focus:outline-none focus:border-[#b89658] cursor-pointer pr-6 shadow-2xs truncate"
                          >
                            {STATUS_OPTIONS.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400" />
                        </div>
                      </div>

                      {/* Assignee Picker */}
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-serif font-bold text-neutral-600 flex items-center gap-1 mb-1 truncate">
                          <UserPlus size={10} className="text-neutral-500 shrink-0" /> ASSIGNEE
                        </span>
                        <div className="relative">
                          <select
                            value={visit.assignedAgentId || ""}
                            onChange={(e) => handleUpdate(visit.id, visit.status, e.target.value || null)}
                            disabled={currentUser?.role === "SALES_AGENT"}
                            className="w-full appearance-none rounded-xl border border-black/10 bg-white px-2.5 py-1.5 text-xs sm:text-sm font-serif font-semibold text-[#171717] focus:outline-none focus:border-[#b89658] cursor-pointer pr-6 shadow-2xs disabled:opacity-70 disabled:cursor-not-allowed truncate"
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

                    {/* Action Footer: Edit & Remove */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditDrawer(visit)}
                        className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-black/10 bg-white py-1.5 text-xs font-serif font-bold text-[#171717] hover:bg-neutral-50 transition shadow-2xs"
                      >
                        <Pencil size={12} className="text-[#b89658]" /> Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(visit.id)}
                        className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-red-200 bg-red-50/50 py-1.5 text-xs font-serif font-bold text-red-600 hover:bg-red-100 transition shadow-2xs"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* ── Add / Edit Visit Drawer ────────────────────────────────── */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${drawerOpen ? "visible" : "invisible"}`}>
        <div
          onClick={() => !submitting && setDrawerOpen(false)}
          className={`absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0"}`}
        />
        <div className={`absolute bottom-0 right-0 top-0 w-full max-w-lg bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
          {/* Drawer header */}
          <div className="flex items-center justify-between border-b border-black/10 p-5">
            <div>
              <h2 className="text-xl font-serif font-bold text-[#171717]">
                {drawerMode === "edit" ? "Edit Site Visit" : "Book a Site Visit"}
              </h2>
              <p className="text-xs text-[#68625a] mt-0.5 font-sans">
                {drawerMode === "edit" ? "Modify visit details and schedules." : "Fill in client details and preferred visit time."}
              </p>
            </div>
            <button disabled={submitting} onClick={() => setDrawerOpen(false)} className="p-1 text-[#68625a] hover:bg-black/5 rounded-full transition">
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Client info */}
            <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1">Client Details</h3>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-[#68625a]">Client Name *</label>
              <input
                type="text" required value={fName} onChange={e => setFName(e.target.value)}
                placeholder="e.g. Priya Mehta"
                className="focus-ring rounded-xl border border-black/10 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">Phone Number *</label>
                <input
                  type="tel" required value={fPhone} onChange={e => setFPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="focus-ring rounded-xl border border-black/10 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">Email (optional)</label>
                <input
                  type="email" value={fEmail} onChange={e => setFEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="focus-ring rounded-xl border border-black/10 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Visit details */}
            <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1 pt-2">Visit Schedule</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">Visit Date *</label>
                <input
                  type="date" required value={fDate} onChange={e => setFDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="focus-ring rounded-xl border border-black/10 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">Time *</label>
                <input
                  type="time" required value={fTime} onChange={e => setFTime(e.target.value)}
                  className="focus-ring rounded-xl border border-black/10 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-[#68625a]">Property (optional)</label>
              <select
                value={fPropertyId} onChange={e => setFPropertyId(e.target.value)}
                className="focus-ring rounded-xl border border-black/10 px-3 py-2 text-sm bg-white"
              >
                <option value="">— Select property —</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>

            {/* Assignment */}
            <h3 className="text-xs font-serif font-bold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1 pt-2">Assignment</h3>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-[#68625a]">Assign Sales Person</label>
              <select
                value={fAgentId} onChange={e => setFAgentId(e.target.value)}
                disabled={currentUser?.role === "SALES_AGENT"}
                className="focus-ring rounded-xl border border-black/10 px-3 py-2 text-sm bg-white disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-[#fcfbfa]"
              >
                <option value="">— Unassigned —</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}{a.phone ? ` · ${a.phone}` : ""}</option>)}
              </select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-[#68625a]">Status</label>
              <select
                value={fStatus} onChange={e => setFStatus(e.target.value as VisitStatus)}
                className="focus-ring rounded-xl border border-black/10 px-3 py-2 text-sm bg-white"
              >
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-[#68625a]">Notes / Message (optional)</label>
              <textarea
                value={fMessage} onChange={e => setFMessage(e.target.value)}
                rows={3} placeholder="Any specific requirements or notes..."
                className="focus-ring rounded-xl border border-black/10 px-3 py-2 text-sm resize-none"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-black/10 p-5 bg-[#fcfbfa] flex justify-end gap-3 shrink-0">
            <button
              type="button" disabled={submitting} onClick={() => setDrawerOpen(false)}
              className="rounded-xl border border-black/10 px-5 py-2.5 text-xs font-serif font-bold text-neutral-600 hover:bg-black/5 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-[#171717] px-6 py-2.5 text-xs font-serif font-bold text-white transition hover:bg-black disabled:opacity-50 shadow-xs"
            >
              {submitting
                ? <><Loader2 size={15} className="animate-spin" /><span>{drawerMode === "edit" ? "Saving..." : "Booking..."}</span></>
                : <><CheckCircle2 size={15} /><span>{drawerMode === "edit" ? "Save Changes" : "Book Visit"}</span></>}
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete confirm modal ───────────────────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-black/10">
            <h3 className="font-serif font-bold text-lg text-red-600">Remove Site Visit</h3>
            <p className="mt-2 text-xs text-[#68625a] font-sans">Are you sure you want to remove this site visit? This action cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button disabled={deleting} onClick={() => setDeleteId(null)} className="rounded-xl border border-black/10 px-4 py-2 text-xs font-serif font-bold text-neutral-600 hover:bg-black/5 disabled:opacity-50">
                Cancel
              </button>
              <button disabled={deleting} onClick={handleDelete} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-serif font-bold text-white hover:bg-red-700 disabled:opacity-50 shadow-xs">
                {deleting ? <><Loader2 size={13} className="animate-spin" /><span>Removing...</span></> : <span>Remove Visit</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
