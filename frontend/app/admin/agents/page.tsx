"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { api } from "@/services/api";
import axios from "axios";
import { uploadFiles } from "@/lib/uploadthing";
import { 
  Users, Plus, Edit, Trash2, X, Loader2, Phone, Mail, 
  UploadCloud, AlertTriangle, Sparkles, Search, MessageSquareCode 
} from "lucide-react";

interface Property {
  id: string;
  title: string;
  slug: string;
  status: string;
}

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  properties?: Property[];
  user?: { role: string } | null;
}

export default function AdminAgentsPage() {
  // State
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Drawer Form State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [manualAvatarUrl, setManualAvatarUrl] = useState("");

  // Delete Confirm State
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // File Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auth & Load
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/agents");
      setAgents(res.data);
    } catch (err) {
      console.error("Failed to fetch agents list:", err);
      toast.error("Failed to load agents database.");
    } finally {
      setLoading(false);
    }
  };

  // Open Create Drawer
  const handleOpenCreate = () => {
    setEditingAgent(null);
    setName("");
    setEmail("");
    setPhone("");
    setWhatsapp("");
    setBio("");
    setAvatarUrl("");
    setManualAvatarUrl("");
    setDrawerOpen(true);
  };

  // Open Edit Drawer
  const handleOpenEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setName(agent.name);
    setEmail(agent.email);
    setPhone(agent.phone);
    setWhatsapp(agent.whatsapp || "");
    setBio(agent.bio || "");
    setAvatarUrl(agent.avatarUrl || "");
    setManualAvatarUrl("");
    setDrawerOpen(true);
  };

  // Avatar UploadThing Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      // Direct upload to UploadThing using our typed helper
      const res = await uploadFiles("imageUploader", {
        files: [file]
      });

      if (!res || res.length === 0) {
        throw new Error("No files returned from UploadThing");
      }

      const uploadedFile = res[0];

      setAvatarUrl(uploadedFile.url);
      toast.success("Avatar image uploaded successfully via UploadThing.");
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      toast.error("Upload failed. Please use direct URL input fallback below.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddManualAvatar = () => {
    if (!manualAvatarUrl) return;
    if (!manualAvatarUrl.startsWith("http://") && !manualAvatarUrl.startsWith("https://")) {
      toast.error("Please enter a valid HTTP or HTTPS image URL.");
      return;
    }
    setAvatarUrl(manualAvatarUrl);
    setManualAvatarUrl("");
    toast.success("Avatar URL applied.");
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    const payload = {
      name,
      email,
      phone,
      whatsapp: whatsapp || undefined,
      bio: bio || undefined,
      avatarUrl: avatarUrl || undefined
    };

    try {
      if (editingAgent) {
        await api.patch(`/agents/${editingAgent.id}`, payload);
        toast.success("Agent profile updated successfully!");
      } else {
        await api.post("/agents", payload);
        toast.success("Agent profile created successfully!");
      }
      setDrawerOpen(false);
      fetchAgents();
    } catch (err: any) {
      console.error("Failed to save agent details:", err);
      const message = err.response?.data?.message ?? "Failed to save agent.";
      const displayMessage = Array.isArray(message) ? message[0] : message;
      toast.error(displayMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Agent
  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await api.delete(`/agents/${deleteConfirmId}`);
      toast.success("Agent profile deleted successfully.");
      setDeleteConfirmId(null);
      fetchAgents();
    } catch (err: any) {
      console.error("Error deleting agent:", err);
      toast.error(err.response?.data?.message ?? "Failed to delete agent.");
    } finally {
      setDeleting(false);
    }
  };

  // Filter agents locally based on search query
  const filteredAgents = agents.filter(agent => {
    const term = search.toLowerCase();
    return (
      agent.name.toLowerCase().includes(term) ||
      agent.email.toLowerCase().includes(term) ||
      agent.phone.includes(term) ||
      (agent.bio && agent.bio.toLowerCase().includes(term))
    );
  });

  return (
    <section className="p-6 md:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">BricksNBeyond representatives</p>
          <h1 className="mt-2 text-3xl font-semibold">Sales Agents</h1>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 rounded-md bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] active:bg-black"
        >
          <Plus size={16} />
          <span>Add Agent</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="mt-8 relative max-w-md">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#68625a]" />
        <input
          type="text"
          placeholder="Search agents by name, email, phone or bio..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full focus-ring rounded-md border border-black/10 py-2.5 pl-10 pr-4 text-sm bg-white luxury-shadow"
        />
      </div>

      {/* Agents Grid */}
      <div className="mt-8">
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border border-black/5 bg-white p-6 h-72" />
            ))}
          </div>
        ) : filteredAgents.length === 0 ? (
          <div className="grid place-items-center py-20 text-center rounded-lg bg-white border border-black/5 luxury-shadow">
            <Users size={48} className="text-[#b89658]/40" />
            <h3 className="mt-4 font-semibold text-lg">No agents found</h3>
            <p className="mt-1 text-sm text-[#68625a]">Try clearing the search box or add a new agent record.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <div key={agent.id} className="rounded-xl border border-black/5 bg-white p-6 luxury-shadow flex flex-col justify-between hover:border-[#b89658]/30 transition group">
                
                {/* Advisor Profile Card Header */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-full border border-black/5 bg-black/5 flex-shrink-0">
                      {agent.avatarUrl ? (
                        <img 
                          src={agent.avatarUrl} 
                          alt={agent.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-[#f7f4ee] text-[#b89658]">
                          <Users size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-[#171717]">{agent.name}</h3>
                      <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-semibold tracking-wider uppercase mt-1 ${
                        agent.user?.role === "SALES_MANAGER"
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : "bg-[#f7f4ee] text-[#b89658]"
                      }`}>
                        {agent.user?.role === "SALES_MANAGER" ? "Sales Manager" : "Sales Agent"}
                      </span>
                    </div>
                  </div>

                  {agent.bio && (
                    <p className="text-xs text-[#68625a] leading-relaxed line-clamp-3 italic">
                      "{agent.bio}"
                    </p>
                  )}
                </div>

                {/* Contact and Metrics Footer */}
                <div className="mt-6 pt-4 border-t border-black/5 space-y-4">
                  <div className="grid gap-1.5 text-xs text-[#68625a] font-medium">
                    <a href={`tel:${agent.phone}`} className="flex items-center gap-2 hover:text-[#171717] transition">
                      <Phone size={13} className="text-[#b89658]" />
                      <span>{agent.phone}</span>
                    </a>
                    <a href={`mailto:${agent.email}`} className="flex items-center gap-2 hover:text-[#171717] transition truncate">
                      <Mail size={13} className="text-[#b89658]" />
                      <span className="truncate">{agent.email}</span>
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <div />
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(agent)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#b89658] border border-[#b89658]/20 px-3 py-1.5 rounded-md hover:bg-[#b89658]/5 transition"
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(agent.id)}
                        className="inline-flex items-center p-1.5 text-xs font-semibold text-red-600 border border-red-200/40 rounded-md hover:bg-red-50 hover:border-red-200 transition"
                        title="Delete Agent"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      {/* Slide-out Drawer Panel for Add/Edit */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${drawerOpen ? "visible" : "invisible"}`}>
        {/* Backdrop */}
        <div 
          onClick={() => !submitting && setDrawerOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0"}`} 
        />
        
        {/* Panel Container */}
        <div className={`absolute bottom-0 right-0 top-0 w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/10 p-5">
            <div>
              <h2 className="text-xl font-semibold text-[#171717]">
                {editingAgent ? `Edit Advisor: ${editingAgent.name}` : "Add Sales Advisor"}
              </h2>
              <p className="text-xs text-[#68625a] mt-0.5">Manage advisor directories for CMS listings.</p>
            </div>
            <button 
              disabled={submitting}
              onClick={() => setDrawerOpen(false)} 
              className="p-1 text-[#68625a] hover:bg-black/5 rounded-full transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Scroll Container */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-[#68625a]">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                placeholder="Sarah Jenkins"
              />
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-[#68625a]">Email Address *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                placeholder="sarah.j@bricksnbeyond.com"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                  placeholder="+971553182991"
                />
              </div>
              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">Whatsapp Number</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                  placeholder="+971553182991"
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <label className="text-xs font-semibold text-[#68625a]">Biography</label>
              <textarea
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="focus-ring rounded border border-black/10 px-3 py-2 text-sm focus:border-[#b89658]/50"
                placeholder="Brief bio highlighting areas of focus, language skills, or experience..."
              />
            </div>

            {/* Avatar Uploader Section */}
            <div className="space-y-4 pt-2">
              <label className="text-xs font-semibold text-[#68625a] block">Avatar Image</label>
              
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 overflow-hidden rounded-full border border-black/5 bg-black/5 shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#f7f4ee] text-[#b89658]">
                      <Users size={20} />
                    </div>
                  )}
                </div>

                <div className="flex-1 rounded-lg border-2 border-dashed border-black/10 p-4 text-center hover:bg-[#fcfbfa] transition-colors relative">
                  <input
                    type="file"
                    id="avatarUpload"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <label htmlFor="avatarUpload" className="flex flex-col items-center gap-1 cursor-pointer">
                    {uploadingAvatar ? (
                      <Loader2 className="animate-spin text-[#b89658]" size={20} />
                    ) : (
                      <UploadCloud className="text-[#68625a]" size={20} />
                    )}
                    <span className="text-xs font-semibold text-[#171717]">
                      {uploadingAvatar ? "Uploading..." : "Upload avatar picture"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Avatar Direct Url Fallback */}
              <div className="flex gap-2 items-end">
                <div className="grid gap-1.5 flex-1">
                  <label className="text-[10px] font-semibold text-[#68625a]">
                    Avatar Image URL Fallback
                  </label>
                  <input
                    type="text"
                    value={manualAvatarUrl}
                    onChange={(e) => setManualAvatarUrl(e.target.value)}
                    className="focus-ring rounded border border-black/10 px-3 py-1.5 text-xs focus:border-[#b89658]/50"
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddManualAvatar}
                  className="rounded border border-[#b89658] px-3 py-1.5 text-xs font-semibold text-[#b89658] hover:bg-[#b89658]/5 transition h-8 shrink-0"
                >
                  Apply
                </button>
              </div>
            </div>

          </form>

          {/* Footer Actions */}
          <div className="border-t border-black/10 p-5 bg-[#fcfbfa] flex justify-end gap-3 shrink-0">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setDrawerOpen(false)}
              className="rounded-md border border-black/10 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-md bg-[#171717] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] active:bg-black disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Advisor</span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => !deleting && setDeleteConfirmId(null)}
            className="absolute inset-0 bg-black/40" 
          />
          <div className="relative bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl border border-black/5">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle size={24} />
              <h3 className="font-semibold text-lg">Confirm Deletion</h3>
            </div>
            <p className="mt-3 text-sm text-[#68625a] leading-relaxed">
              Are you sure you want to permanently delete this agent profile? This will unassign this agent from any associated properties, enquiries, and site visits.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                disabled={deleting}
                onClick={() => setDeleteConfirmId(null)}
                className="rounded border border-black/10 px-4 py-2 text-sm font-semibold hover:bg-black/5 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDelete}
                className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
