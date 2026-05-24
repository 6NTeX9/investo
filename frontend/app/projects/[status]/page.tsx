import { notFound } from "next/navigation";
import { PropertyCard } from "@/components/property/property-card";
import type { ProjectStatus } from "@/types/property";
import { getLiveProperties } from "@/lib/live-properties";

export const dynamic = "force-dynamic";

const labels: Record<ProjectStatus, string> = {
  UPCOMING: "Upcoming projects",
  ONGOING: "Ongoing projects",
  READY_TO_MOVE: "Ready-to-move projects"
};

const emptyMessages: Record<ProjectStatus, string> = {
  UPCOMING: "No upcoming projects at the moment. Check back soon.",
  ONGOING: "No ongoing projects at the moment. Check back soon.",
  READY_TO_MOVE: "No ready-to-move properties listed yet."
};

type Params = Promise<{ status: ProjectStatus }>;

export default async function ProjectStatusPage({ params }: { params: Params }) {
  const { status } = await params;
  if (!labels[status]) notFound();

  let items: any[] = [];
  let error = false;

  try {
    const res = await getLiveProperties({ status, limit: 100 });
    items = res.items;
  } catch (err) {
    console.error(`Failed to fetch properties for status: ${status}`, err);
    error = true;
  }

  return (
    <main className="section-shell pt-12">
      <div className="flex justify-between items-end pb-4 border-b border-black/5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Project category</p>
          <h1 className="mt-2 font-[var(--font-display)] text-5xl">{labels[status]}</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#68625a]">{items.length} {items.length === 1 ? "property" : "properties"}</p>
        </div>
      </div>

      {error ? (
        <div className="mt-20 text-center">
          <p className="text-[#68625a]">Could not load properties. Please try again later.</p>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-20 flex flex-col items-center gap-3 text-center pb-20">
          <div className="h-16 w-16 rounded-full bg-[#b89658]/10 flex items-center justify-center text-3xl">🏗️</div>
          <p className="font-semibold text-lg text-[#171717]">No properties listed yet</p>
          <p className="text-sm text-[#68625a] max-w-sm">{emptyMessages[status]}</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-20">
          {items.map((property: any) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </main>
  );
}
