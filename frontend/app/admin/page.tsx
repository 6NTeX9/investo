import { BarChart3, Building2, CalendarCheck, Inbox, Users } from "lucide-react";

const nav = ["Dashboard", "Properties", "Media", "Enquiries", "Site visits", "Agents", "Blogs", "Users"];

export const metadata = {
  title: "Admin Dashboard"
};

export default function AdminPage() {
  return (
    <main className="section-shell pt-8">
      <div className="grid min-h-[72svh] overflow-hidden rounded-lg bg-white luxury-shadow lg:grid-cols-[260px_1fr]">
        <aside className="border-b border-black/10 p-5 lg:border-b-0 lg:border-r">
          <p className="font-semibold">Aurum CMS</p>
          <nav className="mt-6 grid gap-1">
            {nav.map((item) => (
              <a key={item} className="rounded-md px-3 py-2 text-sm text-[#68625a] transition hover:bg-[#f7f4ee] hover:text-[#171717]" href="#">
                {item}
              </a>
            ))}
          </nav>
        </aside>
        <section className="p-6 md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b89658]">Dashboard overview</p>
              <h1 className="mt-2 text-3xl font-semibold">Property operations</h1>
            </div>
            <button className="rounded-md bg-[#171717] px-4 py-3 text-sm font-semibold text-white">Add property</button>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: Building2, label: "Properties", value: "420" },
              { icon: Inbox, label: "Open enquiries", value: "86" },
              { icon: CalendarCheck, label: "Site visits", value: "31" },
              { icon: Users, label: "Sales agents", value: "14" }
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-black/10 p-5">
                <item.icon size={22} className="text-[#b89658]" />
                <p className="mt-5 text-3xl font-semibold">{item.value}</p>
                <p className="mt-1 text-sm text-[#68625a]">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-lg border border-black/10 p-6">
              <div className="flex items-center gap-2">
                <BarChart3 size={20} />
                <h2 className="font-semibold">Enquiry statistics</h2>
              </div>
              <div className="mt-6 grid h-64 grid-cols-7 items-end gap-3">
                {[32, 46, 38, 61, 54, 70, 58].map((height, index) => (
                  <div key={index} className="rounded-t-md bg-[#b89658]" style={{ height: `${height}%` }} />
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-black/10 p-6">
              <h2 className="font-semibold">Recent activity</h2>
              <div className="mt-5 grid gap-4 text-sm text-[#68625a]">
                <p>Altus Residences gallery updated.</p>
                <p>New site visit requested for Marina Gate Villas.</p>
                <p>Elena Rossi assigned to One Park Commercial Tower.</p>
                <p>Market outlook article published.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
