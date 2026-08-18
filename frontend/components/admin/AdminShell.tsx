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
  const [hasNewEnquiriesAlert, setHasNewEnquiriesAlert] = useState(false);

  useEffect(() => {
    // Enforce light theme
    document.documentElement.classList.remove("dark");
  }, []);

  // Web Audio Chime Sound for live alerts
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch {
      // Audio context blocked by browser policy until user interaction
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

  // Live background polling for NEW client enquiries (every 12 seconds)
  useEffect(() => {
    if (!verified) return;

    let initialCheck = true;
    let seenIds = new Set<string>();

    const pollNewEnquiries = async () => {
      try {
        const res = await api.get("/enquiries?status=NEW");
        const newEnquiries: any[] = res.data || [];
        
        if (initialCheck) {
          newEnquiries.forEach(e => seenIds.add(e.id));
          initialCheck = false;
          return;
        }

        const freshArrivals = newEnquiries.filter(e => !seenIds.has(e.id));
        if (freshArrivals.length > 0) {
          freshArrivals.forEach(e => seenIds.add(e.id));
          setHasNewEnquiriesAlert(true);
          playChime();

          const latest = freshArrivals[0];
          toast.info(`🔔 New Client Enquiry! ${latest.name} (${latest.phone})`, {
            duration: 8000,
            action: {
              label: "View Lead",
              onClick: () => router.push("/admin/enquiries"),
            },
          });
        }
      } catch {
        // Silent catch for background poll
      }
    };

    pollNewEnquiries();
    const interval = setInterval(pollNewEnquiries, 12000);
    return () => clearInterval(interval);
  }, [verified, router]);

  // Reset alert indicator when navigating to enquiries page
  useEffect(() => {
    if (pathname === "/admin/enquiries") {
      setHasNewEnquiriesAlert(false);
    }
  }, [pathname]);

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
    <main className="w-full max-w-7xl mx-auto px-2 sm:px-6 pt-4 sm:pt-8 pb-12">
      <div className="grid min-h-[72svh] overflow-hidden rounded-xl bg-white luxury-shadow lg:grid-cols-[260px_1fr] border border-black/5">
        
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-black/10 px-4 py-3.5 lg:hidden bg-white">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-base sm:text-lg tracking-wide text-[#171717]">BricksNBeyond CMS</p>
            {hasNewEnquiriesAlert && (
              <span className="animate-pulse rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                NEW LEAD
              </span>
            )}
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-[#68625a] hover:bg-black/5 rounded-md transition"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
        </div>

        {/* Desktop Sidebar (Hidden on mobile) */}
        <aside className="hidden lg:flex lg:flex-col lg:justify-between border-r border-black/10 p-5 bg-white">
          <div>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-lg tracking-wide text-[#171717]">BricksNBeyond CMS</p>
            </div>
            <nav className="mt-6 grid gap-1">
              {allowedNavItems.map((item) => {
                const isActive = pathname === item.href;
                const isEnquiryItem = item.name === "Enquiries";
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                      isActive 
                        ? "bg-[#f7f4ee] text-[#171717] font-semibold" 
                        : "text-[#68625a] hover:bg-[#f7f4ee]/50 hover:text-[#171717]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={16} className={isActive ? "text-[#b89658]" : "text-[#68625a]"} />
                      <span>{item.name}</span>
                    </div>
                    {isEnquiryItem && hasNewEnquiriesAlert && (
                      <span className="animate-pulse rounded-full bg-red-500 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                        New
                      </span>
                    )}
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
                    <p className="font-semibold text-lg tracking-wide text-[#171717]">BricksNBeyond CMS</p>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 text-[#68625a] hover:bg-black/5 rounded-full transition"
                      aria-label="Close menu"
                    >
                      <X size={18} />
                    </button>
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
        <section className="bg-[#faf9f6] min-w-0 overflow-x-hidden">
          {children}
        </section>

      </div>

    </main>
  );
}
