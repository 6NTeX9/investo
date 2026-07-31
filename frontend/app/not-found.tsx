import Link from "next/link";
import { Building2, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[75svh] grid place-items-center bg-[#f7f4ee] text-[#151515] px-4 py-16">
      <div className="max-w-md w-full text-center bg-white rounded-2xl p-8 sm:p-10 border border-black/5 luxury-shadow">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171717] text-[#d6bd82]">
          <Building2 size={28} />
        </div>
        
        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-[#b89658]">
          Error 404
        </p>
        <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-[#171717]">
          Page Not Found
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-[#68625a] leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-[#171717] px-6 py-3 text-xs sm:text-sm font-semibold text-white transition hover:bg-[#2a2a2a]"
          >
            <Home size={15} />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/properties"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-6 py-3 text-xs sm:text-sm font-semibold text-[#171717] transition hover:bg-black/5"
          >
            <ArrowLeft size={15} />
            <span>View Properties</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
