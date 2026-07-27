import Link from "next/link";

const dashboardLinks = [
  {
    label: "Overview",
    href: "/dashboard",
  },
  {
    label: "Places",
    href: "/dashboard/places",
  },
  {
    label: "Journal",
    href: "/dashboard/journal",
  },
  {
    label: "Flights",
    href: "/dashboard/flights",
  },
  {
    label: "Gallery",
    href: "/dashboard/gallery",
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
  },
];

export default function DashboardSidebar() {
  return (
    <aside className="h-fit rounded-[2rem] bg-slate-950 p-6 text-white lg:sticky lg:top-6">
      <p className="text-xs uppercase tracking-[0.25em] text-white/40">
        Joy Exchange
      </p>

      <h2 className="mt-3 font-serif text-3xl">
        Dashboard
      </h2>

      <nav className="mt-8 space-y-2">
        {dashboardLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-2xl px-4 py-3 text-sm text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Link
        href="/"
        className="mt-8 block border-t border-white/10 pt-6 text-xs uppercase tracking-[0.15em] text-white/50"
      >
        ← View website
      </Link>
    </aside>
  );
}