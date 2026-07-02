"use client";

import { useEffect, useState } from "react";
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

const STATUS_OPTIONS: { label: string; value: VisitStatus; color: string; dot: string }[] = [
  { label: "Requested",   value: "REQUESTED",   color: "bg-blue-50 text-blue-700 border-blue-100",     dot: "bg-blue-500" },
  { label: "Confirmed",   value: "CONFIRMED",   color: "bg-emerald-50 text-emerald-700 border-emerald-100", dot: "bg-emerald-500" },
  { label: "Rescheduled", value: "RESCHEDULED", color: "bg-indigo-50 text-indigo-700 border-indigo-100",  dot: "bg-indigo-500" },
  { label: "Completed",   value: "COMPLETED",   color: "bg-teal-50 text-teal-700 border-teal-100",      dot: "bg-teal-500" },
  { label: "Cancelled",   value: "CANCELLED",   color: "bg-red-50 text-red-700 border-red-100",         dot: "bg-red-400" },
];

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-IN", {
    weekday: "short", day: "numeric", month: "short",
    year: "numeric", hour: "2-digit", minute: "2-digit"
  });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/** Returns true if two visits are within 1 hour of each other and share the same agent */
function hasTimeClash(a: SiteVisit, b: SiteVisit) {
  if (!a.assignedAgentId || a.assignedAgentId !== b.assignedAgentId) return false;
  if (a.id === b.id) return false;
  const diff = Math.abs(new Date(a.preferredAt).getTime() - new Date(b.preferredAt).getTime());
  return diff < 60 * 60 * 1000; // 1 hour
}

export default function AdminSiteVisitsPage() {
  const [visits, setVisits]           = useState<SiteVisit[]>([]);
  const [allVisits, setAllVisits]     = useState<SiteVisit[]>([]); // always unfiltered — for stats
  const [agents, setAgents]           = useState<Agent[]>([]);
  const [properties, setProperties]   = useState<Property[]>([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState("REQUESTED");
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

  useEffect(() => { loadVisits(); }, [statusFilter]);

  const loadMetadata = async () => {
    try {
      const [aRes, pRes, meRes, allRes] = await Promise.all([
        api.get("/agents"),
        api.get("/properties", { params: { limit: 200 } }),
        api.get("/auth/me"),
        api.get("/site-visits"),   // unfiltered — powers the stats strip
      ]);
      setAgents(aRes.data);
      setProperties(pRes.data?.items || pRes.data || []);
      setCurrentUser(meRes.data);
      setAllVisits(allRes.data);
    } catch {
      toast.error("Failed to load metadata.");
    }
  };

  const loadVisits = async () => {
    setLoading(true);
    try {
      const [filteredRes, allRes] = await Promise.all([
        api.get(statusFilter ? `/site-visits?status=${statusFilter}` : "/site-visits"),
        api.get("/site-visits"),   // always refresh unfiltered stats too
      ]);
      setVisits(filteredRes.data);
      setAllVisits(allRes.data);
    } catch {
      toast.error("Failed to refresh visits.");
    } finally {
      setLoading(false);
    }
  };

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
        const res = await api.patch(`/site-visits/${editingVisit.id}`, payload);
        toast.success("Site visit updated successfully!");
      } else {
        await api.post("/site-visits/admin", payload);
        toast.success("Site visit booked successfully!");
      }
      setDrawerOpen(false);
      loadVisits();
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
      toast.success("Updated.");
      setVisits(prev => prev.map(v => {
        if (v.id !== id) return v;
        return { ...v, status, assignedAgentId: agentId || null, assignedAgent: agents.find(a => a.id === agentId) || null };
      }));
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to update.");
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
      setVisits(prev => prev.filter(v => v.id !== deleteId));
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  // Group visits by date for the schedule view
  const grouped = visits.reduce<Record<string, SiteVisit[]>>((acc, v) => {
    const day = new Date(v.preferredAt).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(v);
    return acc;
  }, {});

  const clashSet = new Set<string>();
  visits.forEach(a => visits.forEach(b => { if (hasTimeClash(a, b)) { clashSet.add(a.id); clashSet.add(b.id); } }));

  return (
    <section className="p-6 md:p-8">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Showings schedule</p>
          <h1 className="mt-2 text-3xl font-semibold">Site Visits</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="focus-ring rounded-md border border-black/10 px-3 py-2.5 text-sm bg-white font-semibold"
          >
            <option value="">All Visits</option>
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={openDrawer}
            className="flex items-center gap-2 rounded-md bg-[#171717] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a]"
          >
            <Plus size={16} /> Book Visit
          </button>
        </div>
      </div>

      {/* ── Stats strip ────────────────────────────────────────── */}
      {!loading && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {STATUS_OPTIONS.map(opt => {
            const count = allVisits.filter(v => v.status === opt.value).length;
            return (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(statusFilter === opt.value ? "" : opt.value)}
                className={`rounded-lg border p-3 text-center transition hover:shadow-sm ${
                  statusFilter === opt.value ? "ring-2 ring-[#b89658]" : ""
                } ${opt.color}`}
              >
                <p className="text-2xl font-semibold">{count}</p>
                <p className="text-xs font-medium mt-0.5">{opt.label}</p>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Clash alert ────────────────────────────────────────── */}
      {clashSet.size > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm font-semibold text-amber-800">
          <AlertCircle size={16} className="shrink-0" />
          {clashSet.size} visit{clashSet.size > 1 ? "s" : ""} have a potential time clash with the same assigned agent. Review below (highlighted in amber).
        </div>
      )}

      {/* ── Visit list grouped by day ───────────────────────────── */}
      <div className="mt-6 space-y-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-black/5 bg-white h-36" />
            ))}
          </div>
        ) : visits.length === 0 ? (
          <div className="grid place-items-center py-20 text-center rounded-xl bg-white border border-black/5 luxury-shadow">
            <Calendar size={48} className="text-[#b89658]/40" />
            <h3 className="mt-4 font-semibold text-lg">No visits found</h3>
            <p className="mt-1 text-sm text-[#68625a]">Book the first site visit using the button above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...visits]
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(visit => {
                const opt = STATUS_OPTIONS.find(o => o.value === visit.status) || STATUS_OPTIONS[0];
                const isClash = clashSet.has(visit.id);
                const isSaving = savingId === visit.id;
                return (
                  <div
                    key={visit.id}
                    className={`relative rounded-xl border bg-white p-5 luxury-shadow transition flex flex-col md:grid md:grid-cols-[1fr_260px] gap-5 items-start ${
                      isClash ? "border-amber-300 bg-amber-50/30" : "border-black/5 hover:border-[#b89658]/30"
                    } ${isSaving ? "opacity-60 pointer-events-none" : ""}`}
                  >
                    {isSaving && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl z-10">
                        <Loader2 className="animate-spin text-[#b89658]" size={22} />
                      </div>
                    )}

                    {/* ── Left: client details ── */}
                    <div className="space-y-2.5 w-full min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-1.5 font-semibold text-[#171717]">
                          <User size={15} className="text-[#b89658]" />
                          {visit.name}
                        </span>
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${opt.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${opt.dot}`} />
                          {opt.label}
                        </span>
                        {isClash && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                            ⚠️ Time clash
                          </span>
                        )}
                        {visit.property && (
                          <span className="inline-flex items-center gap-1 rounded bg-[#f7f4ee] px-2 py-0.5 text-xs font-semibold text-[#b89658]">
                            <Sparkles size={10} /> {visit.property.title}
                          </span>
                        )}
                      </div>

                      {/* Time block */}
                      <div className="inline-flex items-center gap-2 rounded-md bg-[#171717]/5 px-3 py-2 text-sm">
                        <Clock size={14} className="text-[#b89658] shrink-0" />
                        <span className="font-semibold">{formatDateTime(visit.preferredAt)}</span>
                      </div>

                      {/* Contact row */}
                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[#68625a] font-medium">
                        <span className="flex items-center gap-1.5"><Phone size={12} /> {visit.phone}</span>
                        {visit.email && <span className="flex items-center gap-1.5"><Mail size={12} /> {visit.email}</span>}
                        {visit.assignedAgent && (
                          <span className="flex items-center gap-1.5 text-[#b89658] font-semibold">
                            <UserPlus size={12} /> Assigned: {visit.assignedAgent.name}
                          </span>
                        )}
                      </div>

                      {visit.message && (
                        <p className="text-sm text-[#68625a] italic border-l-2 border-[#b89658]/30 pl-3 leading-relaxed">
                          "{visit.message}"
                        </p>
                      )}

                      <p className="text-[11px] text-[#68625a]/60">
                        Booked on {formatDate(visit.createdAt)}
                      </p>
                    </div>

                    {/* ── Right: controls ── */}
                    <div className="w-full space-y-3 border-t border-black/5 pt-4 md:border-t-0 md:pt-0 shrink-0">
                      <div className="grid gap-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#68625a]">Status</label>
                        <select
                          value={visit.status}
                          onChange={e => {
                            const newStatus = e.target.value as VisitStatus;
                            if (newStatus === "RESCHEDULED") {
                              openEditDrawer({ ...visit, status: newStatus });
                            } else {
                              handleUpdate(visit.id, newStatus, visit.assignedAgentId);
                            }
                          }}
                          className="focus-ring rounded border border-black/10 px-2.5 py-2 text-sm bg-white"
                        >
                          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>

                      <div className="grid gap-1">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-[#68625a] flex items-center gap-1">
                          <UserPlus size={11} /> Assigned Sales Person
                        </label>
                        <select
                          value={visit.assignedAgentId || ""}
                          onChange={e => handleUpdate(visit.id, visit.status, e.target.value || null)}
                          disabled={currentUser?.role === "SALES_AGENT"}
                          className="focus-ring rounded border border-black/10 px-2.5 py-2 text-sm bg-white disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-[#fcfbfa]"
                        >
                          <option value="">— Unassigned —</option>
                          {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditDrawer(visit)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded border border-black/10 py-1.5 text-xs font-semibold text-[#171717] hover:bg-black/5 transition"
                        >
                          <Pencil size={12} className="text-[#b89658]" /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteId(visit.id)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded border border-red-100 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── Add Visit Drawer ─────────────────────────────────────── */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${drawerOpen ? "visible" : "invisible"}`}>
        <div
          onClick={() => !submitting && setDrawerOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0"}`}
        />
        <div className={`absolute bottom-0 right-0 top-0 w-full max-w-lg bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
          {/* Drawer header */}
          <div className="flex items-center justify-between border-b border-black/10 p-5">
            <div>
              <h2 className="text-xl font-semibold text-[#171717]">
                {drawerMode === "edit" ? "Edit Site Visit" : "Book a Site Visit"}
              </h2>
              <p className="text-xs text-[#68625a] mt-0.5">
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
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1">Client Details</h3>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-[#68625a]">Client Name *</label>
              <input
                type="text" required value={fName} onChange={e => setFName(e.target.value)}
                placeholder="e.g. Priya Mehta"
                className="focus-ring rounded border border-black/10 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">Phone Number *</label>
                <input
                  type="tel" required value={fPhone} onChange={e => setFPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="focus-ring rounded border border-black/10 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">Email (optional)</label>
                <input
                  type="email" value={fEmail} onChange={e => setFEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="focus-ring rounded border border-black/10 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Visit details */}
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1 pt-2">Visit Schedule</h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">Visit Date *</label>
                <input
                  type="date" required value={fDate} onChange={e => setFDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="focus-ring rounded border border-black/10 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">Time *</label>
                <input
                  type="time" required value={fTime} onChange={e => setFTime(e.target.value)}
                  className="focus-ring rounded border border-black/10 px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-[#68625a]">Property (optional)</label>
              <select
                value={fPropertyId} onChange={e => setFPropertyId(e.target.value)}
                className="focus-ring rounded border border-black/10 px-3 py-2 text-sm bg-white"
              >
                <option value="">— Select property —</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>

            {/* Assignment */}
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1 pt-2">Assignment</h3>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-[#68625a]">Assign Sales Person</label>
              <select
                value={fAgentId} onChange={e => setFAgentId(e.target.value)}
                disabled={currentUser?.role === "SALES_AGENT"}
                className="focus-ring rounded border border-black/10 px-3 py-2 text-sm bg-white disabled:opacity-75 disabled:cursor-not-allowed disabled:bg-[#fcfbfa]"
              >
                <option value="">— Unassigned —</option>
                {agents.map(a => <option key={a.id} value={a.id}>{a.name}{a.phone ? ` · ${a.phone}` : ""}</option>)}
              </select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-[#68625a]">Status</label>
              <select
                value={fStatus} onChange={e => setFStatus(e.target.value as VisitStatus)}
                className="focus-ring rounded border border-black/10 px-3 py-2 text-sm bg-white"
              >
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-[#68625a]">Notes / Message (optional)</label>
              <textarea
                value={fMessage} onChange={e => setFMessage(e.target.value)}
                rows={3} placeholder="Any specific requirements or notes..."
                className="focus-ring rounded border border-black/10 px-3 py-2 text-sm resize-none"
              />
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-black/10 p-5 bg-[#fcfbfa] flex justify-end gap-3 shrink-0">
            <button
              type="button" disabled={submitting} onClick={() => setDrawerOpen(false)}
              className="rounded-md border border-black/10 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit} disabled={submitting}
              className="flex items-center gap-2 rounded-md bg-[#171717] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => !deleting && setDeleteId(null)} className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl border border-black/5">
            <h3 className="font-semibold text-lg text-red-600">Remove Site Visit</h3>
            <p className="mt-2 text-sm text-[#68625a]">Are you sure you want to remove this site visit? This cannot be undone.</p>
            <div className="mt-5 flex justify-end gap-3">
              <button disabled={deleting} onClick={() => setDeleteId(null)} className="rounded border border-black/10 px-4 py-2 text-sm font-semibold hover:bg-black/5 disabled:opacity-50">
                Cancel
              </button>
              <button disabled={deleting} onClick={handleDelete} className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {deleting ? <><Loader2 size={13} className="animate-spin" /><span>Removing...</span></> : <span>Remove</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
