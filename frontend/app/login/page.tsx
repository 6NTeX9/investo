"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { api } from "@/services/api";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      const response = await api.get("/auth/me");
      const user = response.data;

      toast.success(`Welcome back, ${user.name}!`);
      router.push(searchParams.get("next") ?? "/admin");
      router.refresh();
    } catch (err: any) {
      console.error("Login error:", err);
      const message = err.response?.data?.message ?? err.message ?? "An unexpected error occurred. Please try again.";
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
          <p className="mt-2 text-sm text-[#68625a]">Enter your credentials to access BricksNBeyond CMS.</p>

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
                placeholder="admin@bricksnbeyond.com"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#68625a]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus-ring w-full rounded-md border border-black/10 pl-4 pr-11 py-3 text-sm transition-all focus:border-[#b89658]/50 disabled:opacity-60"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#68625a] hover:text-[#171717] p-1.5 transition rounded-md"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="section-shell grid min-h-[70svh] place-items-center pt-12">
        <div className="flex items-center gap-2 text-sm text-[#68625a]">
          <Loader2 className="animate-spin" size={18} />
          <span>Loading...</span>
        </div>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
