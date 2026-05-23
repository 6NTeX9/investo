import { notFound } from "next/navigation";
import { PropertyCard } from "@/components/property/property-card";
import { properties } from "@/lib/data";
import type { ProjectStatus } from "@/types/property";

const labels: Record<ProjectStatus, string> = {
  UPCOMING: "Upcoming projects",
  ONGOING: "Ongoing projects",
  READY_TO_MOVE: "Ready-to-move projects"
};

type Params = Promise<{ status: ProjectStatus }>;

export default async function ProjectStatusPage({ params }: { params: Params }) {
  const { status } = await params;
  if (!labels[status]) notFound();
  const items = properties.filter((property) => property.status === status);

  return (
    <main className="section-shell pt-12">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Project category</p>
      <h1 className="mt-2 font-[var(--font-display)] text-5xl">{labels[status]}</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </main>
  );
}
