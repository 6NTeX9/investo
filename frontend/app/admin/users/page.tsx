"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/services/api";
import {
  UserCheck, Plus, X, Loader2, Shield, Mail, Phone,
  Eye, EyeOff, Trash2, AlertTriangle, Pencil, Save
} from "lucide-react";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "SALES_MANAGER" | "SALES_AGENT";
type UserStatus = "ACTIVE" | "ON_LEAVE" | "INACTIVE" | "SUSPENDED";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  isActive: boolean;
  createdAt: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  SALES_MANAGER: "Sales Manager",
  SALES_AGENT: "Sales Agent",
};

const ROLE_DESC: Record<UserRole, string> = {
  SUPER_ADMIN: "Full system access including user management.",
  ADMIN: "Can manage properties, blogs, enquiries and users.",
  SALES_MANAGER: "Can view leads, site visits and agent reports.",
  SALES_AGENT: "Can view and update assigned leads and site visits.",
};

/** Derive a display status from isActive (we store multiple statuses server-side via isActive flag) */
function isActiveToStatus(isActive: boolean): UserStatus {
  return isActive ? "ACTIVE" : "INACTIVE";
}

const STATUS_CONFIG: Record<UserStatus, { label: string; dot: string; badge: string }> = {
  ACTIVE:    { label: "Active",    dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  ON_LEAVE:  { label: "On Leave",  dot: "bg-amber-400",   badge: "bg-amber-50 text-amber-700 border-amber-100" },
  INACTIVE:  { label: "Inactive",  dot: "bg-[#68625a]",   badge: "bg-[#f7f4ee] text-[#68625a] border-black/10" },
  SUSPENDED: { label: "Suspended", dot: "bg-red-500",      badge: "bg-red-50 text-red-700 border-red-100" },
};

function RoleBadge({ role }: { role: UserRole }) {
  const styles: Record<UserRole, string> = {
    SUPER_ADMIN:   "bg-[#171717] text-white",
    ADMIN:         "bg-[#b89658]/15 text-[#b89658] border border-[#b89658]/30",
    SALES_MANAGER: "bg-blue-50 text-blue-700 border border-blue-100",
    SALES_AGENT:   "bg-indigo-50 text-indigo-700 border border-indigo-100",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[role]}`}>
      <Shield size={9} />
      {ROLE_LABELS[role]}
    </span>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function AdminUsersPage() {
  const router = useRouter();

  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Drawer mode: "create" | "edit"
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [drawerMode, setDrawerMode]   = useState<"create" | "edit">("create");
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [submitting, setSubmitting]   = useState(false);

  // Delete state
  const [deleteId, setDeleteId]         = useState<string | null>(null);
  const [deleteUserName, setDeleteUserName] = useState("");
  const [deleting, setDeleting]         = useState(false);

  // Form fields
  const [fName,     setFName]     = useState("");
  const [fEmail,    setFEmail]    = useState("");
  const [fPassword, setFPassword] = useState("");
  const [fPhone,    setFPhone]    = useState("");
  const [fRole,     setFRole]     = useState<UserRole>("SALES_AGENT");
  const [fStatus,   setFStatus]   = useState<UserStatus>("ACTIVE");
  const [showPass,  setShowPass]  = useState(false);

  useEffect(() => {
    Promise.all([fetchUsers(), api.get("/auth/me").then((r) => setCurrentUser(r.data))])
      .catch(() => {});
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : res.data.items ?? []);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  // ── Open Create drawer ─────────────────────────────────────────────────────
  const openCreate = () => {
    setDrawerMode("create");
    setEditingUser(null);
    setFName(""); setFEmail(""); setFPassword(""); setFPhone("");
    setFRole("SALES_AGENT"); setFStatus("ACTIVE"); setShowPass(false);
    setDrawerOpen(true);
  };

  // ── Open Edit drawer ───────────────────────────────────────────────────────
  const openEdit = (user: AdminUser) => {
    setDrawerMode("edit");
    setEditingUser(user);
    setFName(user.name);
    setFEmail(user.email);
    setFPassword("");
    setFPhone(user.phone ?? "");
    setFRole(user.role);
    // Derive status: we read isActive; if it was previously set to a named status it'll come back via the server label
    setFStatus(user.isActive ? "ACTIVE" : "INACTIVE");
    setShowPass(false);
    setDrawerOpen(true);
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName || !fEmail) { toast.error("Name and email are required."); return; }
    if (drawerMode === "create" && !fPassword) { toast.error("Password is required."); return; }
    if (drawerMode === "create" && fPassword.length < 8) { toast.error("Password must be at least 8 characters."); return; }

    setSubmitting(true);
    try {
      if (drawerMode === "create") {
        const payload: any = { name: fName, email: fEmail, password: fPassword, role: fRole };
        if (fPhone.trim()) payload.phone = fPhone.trim();
        await api.post("/users", payload);
        toast.success("User created successfully!");
      } else if (editingUser) {
        const payload: any = { name: fName, email: fEmail, role: fRole, status: fStatus };
        payload.phone = fPhone.trim() || null;
        if (fPassword && fPassword.length >= 8) payload.password = fPassword;
        await api.patch(`/users/${editingUser.id}`, payload);
        toast.success("User updated successfully!");
      }
      setDrawerOpen(false);
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Operation failed.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/users/${deleteId}`);
      toast.success("User deleted successfully.");
      setDeleteId(null); setDeleteUserName("");
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? "Failed to delete user.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setDeleting(false);
    }
  };

  const canEdit = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN" || currentUser?.role === "SALES_MANAGER";
  const canCreate = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN";
  const canDelete = currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "ADMIN";

  return (
    <section className="p-6 md:p-8">

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">BricksNBeyond Admin</p>
          <h1 className="mt-2 text-3xl font-semibold">Users</h1>
        </div>
        {canCreate && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-md bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2a2a]"
          >
            <Plus size={16} /> Add User
          </button>
        )}
      </div>

      {/* Table */}
      <div className="mt-8 overflow-hidden rounded-lg bg-white border border-black/5 luxury-shadow">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex animate-pulse items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-black/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 rounded bg-black/5" />
                  <div className="h-3 w-1/3 rounded bg-black/5" />
                </div>
                <div className="h-6 w-20 rounded-full bg-black/5" />
                <div className="h-6 w-16 rounded bg-black/5" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="grid place-items-center py-20 text-center">
            <UserCheck size={48} className="text-[#b89658]/40" />
            <h3 className="mt-4 font-semibold text-lg">No users found</h3>
            <p className="mt-1 text-sm text-[#68625a]">Add your first admin user to get started.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table view */}
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-left border-collapse text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-black/5 bg-[#f7f4ee] font-semibold text-[#68625a] text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 w-44">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3 w-36">Phone</th>
                    <th className="px-4 py-3 w-32">Role</th>
                    <th className="px-4 py-3 w-28 text-center">Status</th>
                    <th className="px-4 py-3 w-20 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {users.map((user) => {
                    return (
                      <tr key={user.id} className="hover:bg-[#fcfbfa] transition-colors">

                        {/* Name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-full bg-[#b89658]/15 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-[#b89658]">{user.name?.charAt(0).toUpperCase() ?? "?"}</span>
                            </div>
                            <p className="font-semibold text-[#171717] text-sm truncate max-w-[120px]">{user.name}</p>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-3 max-w-[200px]">
                          <div className="flex items-center gap-1.5 text-[#68625a] min-w-0">
                            <Mail size={12} className="flex-shrink-0" />
                            <span className="text-xs truncate">{user.email}</span>
                          </div>
                        </td>

                        {/* Phone */}
                        <td className="px-4 py-3">
                          {user.phone ? (
                            <div className="flex items-center gap-1.5 text-[#68625a]">
                              <Phone size={12} className="flex-shrink-0" />
                              <span className="text-xs">{user.phone}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-[#68625a]/40">—</span>
                          )}
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3">
                          <RoleBadge role={user.role} />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={user.status ?? (user.isActive ? "ACTIVE" : "INACTIVE")} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center">
                            {canEdit && (
                              <button
                                onClick={() => openEdit(user)}
                                className="flex items-center gap-1 rounded px-2.5 py-1.5 text-xs font-semibold text-[#68625a] border border-black/10 hover:bg-[#f7f4ee] hover:text-[#171717] transition"
                                title="Edit user"
                              >
                                <Pencil size={11} /> Edit
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card view */}
            <div className="block md:hidden divide-y divide-black/5 bg-white">
              {users.map((user) => (
                <div key={user.id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#b89658]/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[#b89658]">
                        {user.name?.charAt(0).toUpperCase() ?? "?"}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm text-[#171717] truncate">{user.name}</h3>
                      <div className="flex items-center gap-1 text-[#68625a] mt-0.5 text-xs truncate">
                        <Mail size={10} className="flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-black/5 pt-2 text-xs">
                    <div className="flex flex-col gap-1">
                      {user.phone ? (
                        <div className="flex items-center gap-1 text-[#68625a]">
                          <Phone size={10} className="flex-shrink-0" />
                          <span>{user.phone}</span>
                        </div>
                      ) : (
                        <span className="text-[#68625a]/40">—</span>
                      )}
                      <div className="flex items-center gap-2 mt-0.5">
                        <RoleBadge role={user.role} />
                        <StatusBadge status={user.status ?? (user.isActive ? "ACTIVE" : "INACTIVE")} />
                      </div>
                    </div>

                    {canEdit && (
                      <button
                        onClick={() => openEdit(user)}
                        className="flex items-center gap-1 rounded border border-black/10 px-2.5 py-1 text-xs font-semibold text-[#68625a] hover:bg-[#f7f4ee] hover:text-[#171717] transition"
                        title="Edit user"
                      >
                        <Pencil size={11} />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Create / Edit Drawer ─────────────────────────────────────────────── */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${drawerOpen ? "visible" : "invisible"}`}>
        <div
          onClick={() => !submitting && setDrawerOpen(false)}
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0"}`}
        />
        <div className={`absolute bottom-0 right-0 top-0 w-full max-w-lg bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}>

          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-black/10 p-5">
            <div>
              <h2 className="text-xl font-semibold text-[#171717]">
                {drawerMode === "create" ? "Add New User" : `Edit — ${editingUser?.name}`}
              </h2>
              <p className="text-xs text-[#68625a] mt-0.5">
                {drawerMode === "create"
                  ? "Create a new user account with a specific role."
                  : "Update the user's details, role, or status."}
              </p>
            </div>
            <button disabled={submitting} onClick={() => setDrawerOpen(false)} className="p-1 text-[#68625a] hover:bg-black/5 rounded-full transition">
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Section 1: Personal */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1">Personal Details</h3>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">Full Name *</label>
                <input type="text" required value={fName} onChange={(e) => setFName(e.target.value)}
                  className="focus-ring rounded border border-black/10 px-3 py-2 text-sm" placeholder="e.g. Ravi Sharma" />
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">Email Address *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#68625a]" />
                  <input type="email" required value={fEmail} onChange={(e) => setFEmail(e.target.value)}
                    className="focus-ring w-full rounded border border-black/10 pl-9 pr-3 py-2 text-sm" placeholder="ravi@bricksnbeyond.com" />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">Phone (optional)</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#68625a]" />
                  <input type="text" value={fPhone} onChange={(e) => setFPhone(e.target.value)}
                    className="focus-ring w-full rounded border border-black/10 pl-9 pr-3 py-2 text-sm" placeholder="+91 98765 43210" />
                </div>
              </div>
            </div>

            {/* Section 2: Password (create only) */}
            {drawerMode === "create" && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1">Credentials</h3>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Password *</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} required value={fPassword}
                      onChange={(e) => setFPassword(e.target.value)} minLength={8}
                      className="focus-ring w-full rounded border border-black/10 px-3 pr-10 py-2 text-sm" placeholder="Minimum 8 characters" />
                    <button type="button" onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#68625a] hover:text-[#171717] transition">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#68625a]">Must be at least 8 characters.</p>
                </div>
              </div>
            )}

            {/* Password Reset — SUPER_ADMIN only, edit mode */}
            {drawerMode === "edit" && currentUser?.role === "SUPER_ADMIN" && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1">Reset Password</h3>
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">New Password (optional)</label>
                  <div className="relative">
                    <input type={showPass ? "text" : "password"} value={fPassword}
                      onChange={(e) => setFPassword(e.target.value)} minLength={8}
                      className="focus-ring w-full rounded border border-black/10 px-3 pr-10 py-2 text-sm" placeholder="Leave empty to keep current" />
                    <button type="button" onClick={() => setShowPass((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#68625a] hover:text-[#171717] transition">
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#68625a]">Only Super Admin can reset passwords. Min 8 characters if set.</p>
                </div>
              </div>
            )}

            {/* Section 3: Role & Status */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#b89658] border-b border-black/5 pb-1">Role & Status</h3>

              <div className="grid gap-1.5">
                <label className="text-xs font-semibold text-[#68625a]">Role *</label>
                <select value={fRole} onChange={(e) => setFRole(e.target.value as UserRole)}
                  className="focus-ring rounded border border-black/10 px-3 py-2 text-sm bg-white">
                  <option value="SALES_AGENT">Sales Agent</option>
                  <option value="SALES_MANAGER">Sales Manager</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
                <p className="text-[11px] text-[#68625a]">{ROLE_DESC[fRole]}</p>
              </div>

              {/* Role preview */}
              <div className="flex items-center gap-2 rounded border border-black/5 bg-[#fcfbfa] p-3">
                <span className="text-xs text-[#68625a] font-medium">Access level:</span>
                <RoleBadge role={fRole} />
              </div>

              {/* Status (edit mode only) */}
              {drawerMode === "edit" && (
                <div className="grid gap-1.5">
                  <label className="text-xs font-semibold text-[#68625a]">Status</label>
                  <select value={fStatus} onChange={(e) => setFStatus(e.target.value as UserStatus)}
                    className="focus-ring rounded border border-black/10 px-3 py-2 text-sm bg-white">
                    <option value="ACTIVE">Active — Fully operational</option>
                    <option value="ON_LEAVE">On Leave — Temporarily away</option>
                    <option value="INACTIVE">Inactive — Not currently working</option>
                    <option value="SUSPENDED">Suspended — Access revoked</option>
                  </select>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={fStatus} />
                    <span className="text-[11px] text-[#68625a]">
                      {fStatus === "ACTIVE"    ? "User can log in and perform their role."           :
                       fStatus === "ON_LEAVE"  ? "Login is disabled; user is temporarily away."      :
                       fStatus === "INACTIVE"  ? "Login disabled; user no longer active."            :
                                                 "Login blocked; access suspended by admin."}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="border-t border-black/10 p-5 bg-[#fcfbfa] shrink-0">
            {/* Delete danger zone — edit mode only */}
            {drawerMode === "edit" && canDelete && editingUser && (
              <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-red-700">Delete this user</p>
                  <p className="text-[11px] text-red-500 mt-0.5">This will permanently revoke their access.</p>
                </div>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => { setDeleteId(editingUser.id); setDeleteUserName(editingUser.name); setDrawerOpen(false); }}
                  className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
                >
                  <Trash2 size={12} /> Delete User
                </button>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button type="button" disabled={submitting} onClick={() => setDrawerOpen(false)}
                className="rounded-md border border-black/10 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 transition disabled:opacity-50">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-md bg-[#171717] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#2a2a2a] disabled:opacity-50 transition">
                {submitting
                  ? <><Loader2 size={15} className="animate-spin" /><span>{drawerMode === "create" ? "Creating..." : "Saving..."}</span></>
                  : drawerMode === "create"
                    ? <><UserCheck size={15} /><span>Create User</span></>
                    : <><Save size={15} /><span>Save Changes</span></>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => !deleting && setDeleteId(null)} className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl border border-black/5">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle size={22} />
              <h3 className="font-semibold text-lg">Delete User</h3>
            </div>
            <p className="mt-3 text-sm text-[#68625a] leading-relaxed">
              Are you sure you want to permanently delete <span className="font-semibold text-[#171717]">{deleteUserName}</span>?
              This will revoke their access immediately and cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button disabled={deleting} onClick={() => { setDeleteId(null); setDeleteUserName(""); }}
                className="rounded border border-black/10 px-4 py-2 text-sm font-semibold hover:bg-black/5 transition disabled:opacity-50">
                Cancel
              </button>
              <button disabled={deleting} onClick={handleDelete}
                className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition">
                {deleting
                  ? <><Loader2 size={13} className="animate-spin" /><span>Deleting...</span></>
                  : <><Trash2 size={13} /><span>Delete user</span></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
