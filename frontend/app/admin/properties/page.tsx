import { properties } from "@/lib/data";

export default function AdminPropertiesPage() {
  return (
    <main className="section-shell pt-10">
      <h1 className="text-3xl font-semibold">Manage properties</h1>
      <div className="mt-6 overflow-hidden rounded-lg bg-white luxury-shadow">
        {properties.map((property) => (
          <div key={property.id} className="grid gap-3 border-b border-black/10 p-5 md:grid-cols-[1fr_auto_auto] md:items-center">
            <div>
              <p className="font-semibold">{property.title}</p>
              <p className="text-sm text-[#68625a]">{property.location}</p>
            </div>
            <p className="text-sm">{property.status.replaceAll("_", " ")}</p>
            <button className="rounded-md border border-black/10 px-4 py-2 text-sm font-semibold">Edit</button>
          </div>
        ))}
      </div>
    </main>
  );
}
