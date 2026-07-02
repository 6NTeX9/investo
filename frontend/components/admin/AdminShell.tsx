"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/services/api";
import { createClient } from "@/lib/supabase/client";
import { Loader2, LogOut, LayoutDashboard, Building2, Inbox, Calendar, Users, Newspaper, UserCheck, TrendingUp, BarChart2, Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("crm_theme") as "light" | "dark";
    const currentTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(currentTheme);
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("crm_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get("/auth/me");
        const userData = response.data;
        setUser(userData);
        setVerified(true);
        if (!localStorage.getItem("admin_session_start")) {
          localStorage.setItem("admin_session_start", new Date().toISOString());
        }
        if (userData.role === "SALES_AGENT" && pathname === "/admin") {
          router.push("/admin/my-progress");
        }
      } catch (err: any) {
        console.error("Auth verification failed:", err);
        toast.error("Session expired. Please login again.");
        router.push("/login");
      }
    };

    checkAuth();
  }, [router, pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem("admin_session_start");
    toast.success("Successfully logged out.");
    router.push("/login");
    router.refresh();
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
        
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-black/10 px-5 py-4 lg:hidden bg-white">
          <p className="font-semibold text-lg tracking-wide text-[#171717]">Investo CMS</p>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 text-[#68625a] hover:bg-black/5 rounded-md transition"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={18} className="text-[#b89658]" /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 text-[#68625a] hover:bg-black/5 rounded-md transition"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Desktop Sidebar (Hidden on mobile) */}
        <aside className="hidden lg:flex lg:flex-col lg:justify-between border-r border-black/10 p-5 bg-white">
          <div>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg tracking-wide text-[#171717]">Investo CMS</p>
              <button
                onClick={toggleTheme}
                className="p-2 text-[#68625a] hover:bg-black/5 rounded-md transition"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun size={18} className="text-[#b89658]" /> : <Moon size={18} />}
              </button>
            </div>
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

        {/* Mobile Navigation Drawer Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/40"
              />
              
              {/* Sidebar Drawer */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 top-0 w-72 max-w-[80vw] bg-white p-5 shadow-2xl flex flex-col justify-between border-r border-black/10 z-10"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-lg tracking-wide text-[#171717]">Investo CMS</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={toggleTheme}
                        className="p-1.5 text-[#68625a] hover:bg-black/5 rounded-full transition"
                        aria-label="Toggle theme"
                      >
                        {theme === "dark" ? <Sun size={18} className="text-[#b89658]" /> : <Moon size={18} />}
                      </button>
                      <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-1.5 text-[#68625a] hover:bg-black/5 rounded-full transition"
                        aria-label="Close menu"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <nav className="mt-6 grid gap-1">
                    {allowedNavItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link 
                          key={item.name} 
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
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
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-md border border-black/10 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 hover:border-red-100 hover:text-red-700"
                    >
                      <LogOut size={15} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Dynamic Content Panel */}
        <section className="bg-[#faf9f6]">
          {children}
        </section>

      </div>

    </main>
  );
}
