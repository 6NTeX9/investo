import type { Metadata } from "next";
import Image from "next/image";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { api } from "@/services/api";

export const metadata: Metadata = {
  title: "Our Agents | Aurum Estate",
  description: "Meet the Aurum Estate advisory team — experienced real estate professionals dedicated to finding your perfect property."
};

export const dynamic = "force-dynamic";

async function getAgents() {
  try {
    const res = await api.get("/agents");
    return res.data || [];
  } catch {
    return [];
  }
}

export default async function AgentsPage() {
  const agents = await getAgents();

  return (
    <main>
      {/* Hero */}
      <section className="section-shell pt-16 pb-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Our team</p>
        <h1 className="mt-2 font-[var(--font-display)] text-5xl">Meet the advisors</h1>
        <p className="mt-4 max-w-xl text-lg text-[#68625a] leading-7">
          Our agents bring deep local expertise and a client-first approach to every transaction — from first enquiry to final handover.
        </p>
      </section>

      {/* Agents grid */}
      <section className="section-shell pb-24">
        {agents.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="h-16 w-16 rounded-full bg-[#b89658]/10 flex items-center justify-center text-3xl">👤</div>
            <p className="font-semibold text-lg">No agents listed yet</p>
            <p className="text-sm text-[#68625a]">Add agents from the admin panel to display them here.</p>
          </div>
        ) : (
          <div className="agents-grid grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent: any) => {
              const role = agent.user?.role;
              const isManager = role === "SALES_MANAGER";
              return (
                <div
                  key={agent.id}
                  className="agent-card group overflow-hidden rounded-2xl bg-white border border-black/5 luxury-shadow"
                >
                {/* Avatar */}
                <div className="relative h-72 w-full overflow-hidden bg-[#f0ece4]">
                  {agent.avatarUrl ? (
                    <Image
                      src={agent.avatarUrl}
                      alt={agent.name}
                      fill
                      className="object-cover object-top transition duration-500 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-6xl font-semibold text-[#b89658]/40">
                      {agent.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-[#171717]">{agent.name}</h2>
                  <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                    isManager
                      ? "bg-blue-50 text-blue-700 border border-blue-100"
                      : "bg-[#f7f4ee] text-[#b89658]"
                  }`}>
                    {isManager ? "Sales Manager" : "Luxury Advisor"}
                  </span>
                  {agent.bio && (
                    <p className="mt-3 text-sm text-[#68625a] leading-6 line-clamp-3">{agent.bio}</p>
                  )}

                  <div className="mt-5 flex flex-col gap-2">
                    {agent.phone && (
                      <LinkButton href={`tel:${agent.phone}`} variant="primary" className="justify-center gap-2">
                        <Phone size={15} />
                        Call {agent.name.split(" ")[0]}
                      </LinkButton>
                    )}
                    {(agent.whatsapp || agent.phone) && (
                      <LinkButton
                        href={`https://wa.me/${(agent.whatsapp || agent.phone).replace(/\D/g, "")}`}
                        variant="gold"
                        className="justify-center gap-2"
                      >
                        <MessageCircle size={15} />
                        WhatsApp
                      </LinkButton>
                    )}
                    {agent.email && (
                      <LinkButton href={`mailto:${agent.email}`} variant="ghost" className="justify-center gap-2">
                        <Mail size={15} />
                        {agent.email}
                      </LinkButton>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
