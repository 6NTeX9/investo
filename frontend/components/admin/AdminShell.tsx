"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Loader2, LogOut, LayoutDashboard, Building2, Inbox, Calendar, Users, Newspaper, UserCheck, TrendingUp, BarChart2 } from "lucide-react";

interface AdminShellProps {
  children: React.ReactNode;
}

const navItems = [
  { name: "Dashboard",     href: "/admin",               icon: LayoutDashboard },
  { name: "Properties",    href: "/admin/properties",     icon: Building2 },
  { name: "Enquiries",     href: "/admin/enquiries",      icon: Inbox },
  { name: "Site visits",   href: "/admin/site-visits",    icon: Calendar },
  { name: "My Progress",   href: "/admin/my-progress",    icon: TrendingUp },
  { name: "Agent Reports", href: "/admin/agent-reports",  icon: BarChart2 },
  { name: "Agents",        href: "/admin/agents",          icon: Users },
  { name: "Blogs",         href: "/admin/blogs",           icon: Newspaper },
  { name: "Users",         href: "/admin/users",           icon: UserCheck }
];

export default function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [verified, setVerified] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast.error("Please login to access the admin dashboard.");
        router.push("/login");
        return;
      }

      try {
        const response = await api.get("/auth/me");
        const userData = response.data;
        setUser(userData);
        setVerified(true);
        if (userData.role === "SALES_AGENT" && pathname === "/admin") {
          router.push("/admin/my-progress");
        }
      } catch (err: any) {
        console.error("Auth verification failed:", err);
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_user");
        toast.error("Session expired. Please login again.");
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, pathname]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    toast.success("Successfully logged out.");
    router.push("/login");
  };

  if (!verified) {
    return (
      <main className="grid min-h-[70svh] place-items-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#b89658]" size={36} />
          <p className="text-sm font-medium text-[#68625a]">Verifying session...</p>
        </div>
      </main>
    );
  }

  const allowedNavItems = navItems.filter((item) => {
    if (user?.role === "SALES_AGENT") {
      return ["Properties", "Enquiries", "Site visits", "My Progress"].includes(item.name);
    }
    if (user?.role === "SALES_MANAGER") {
      return ["Dashboard", "Properties", "Enquiries", "Site visits", "Agent Reports", "Blogs"].includes(item.name);
    }
    // ADMIN / SUPER_ADMIN — hide My Progress (it's for agents only)
    return item.name !== "My Progress";
  });

  return (
    <main className="section-shell pt-8">
      <div className="grid min-h-[72svh] overflow-hidden rounded-lg bg-white luxury-shadow lg:grid-cols-[260px_1fr]">
        
        {/* Sidebar */}
        <aside className="flex flex-col justify-between border-b border-black/10 p-5 lg:border-b-0 lg:border-r min-h-[350px] lg:min-h-0">
          <div>
            <p className="font-semibold text-lg tracking-wide text-[#171717]">Aurum CMS</p>
            <nav className="mt-6 grid gap-1">
              {allowedNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition ${
                      isActive 
                        ? "bg-[#f7f4ee] text-[#171717] font-semibold" 
                        : "text-[#68625a] hover:bg-[#f7f4ee]/50 hover:text-[#171717]"
                    }`}
                  >
                    <item.icon size={16} className={isActive ? "text-[#b89658]" : "text-[#68625a]"} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Logout */}
          <div className="border-t border-black/5 pt-4 mt-6">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm font-semibold text-[#171717]">{user?.name}</p>
                <p className="text-xs text-[#68625a] truncate">{user?.email}</p>
                <span className="mt-1.5 inline-block rounded bg-[#f7f4ee] px-2 py-0.5 text-[10px] font-semibold tracking-wider text-[#b89658] uppercase">
                  {user?.role?.replace("_", " ")}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-black/10 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 hover:border-red-100 hover:text-red-700"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Dynamic Content Panel */}
        <section className="bg-[#faf9f6]">
          {children}
        </section>

      </div>
    </main>
  );
}
