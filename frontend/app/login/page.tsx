"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/services/api";
import { Loader2, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { accessToken, user } = response.data;

      // Save token to localStorage
      localStorage.setItem("admin_token", accessToken);
      localStorage.setItem("admin_user", JSON.stringify(user));

      toast.success(`Welcome back, ${user.name}!`);
      
      // Redirect to admin dashboard
      router.push("/admin");
    } catch (err: any) {
      console.error("Login error:", err);
      const message = err.response?.data?.message ?? "An unexpected error occurred. Please try again.";
      const displayMessage = Array.isArray(message) ? message[0] : message;
      setError(displayMessage);
      toast.error(displayMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="section-shell grid min-h-[70svh] place-items-center pt-12">
      <div className="w-full max-w-md rounded-xl bg-white p-8 luxury-shadow border border-black/5">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">
            <Lock size={14} />
            <span>Secure admin</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-[#171717]">Sign in</h1>
          <p className="mt-2 text-sm text-[#68625a]">Enter your credentials to access Aurum CMS.</p>

          {error && (
            <div className="mt-6 rounded-md bg-red-50 border border-red-200/50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6 grid gap-4">
            <div className="grid gap-1">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#68625a]">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm transition-all focus:border-[#b89658]/50 disabled:opacity-60"
                placeholder="admin@aurumestate.com"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#68625a]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                disabled={loading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-ring rounded-md border border-black/10 px-4 py-3 text-sm transition-all focus:border-[#b89658]/50 disabled:opacity-60"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 rounded-md bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a2a2a] active:bg-black disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Login</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

