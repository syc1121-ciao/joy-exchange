"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const menus = [
  {
    name: "Home",
    href: "/",
    icon: "🏡",
  },
  {
    name: "Overview",
    href: "/dashboard",
    icon: "🏠",
  },
  {
    name: "Places",
    href: "/dashboard/places",
    icon: "📍",
  },
  {
    name: "Journal",
    href: "/dashboard/journal",
    icon: "📖",
  },
  {
    name: "Flights",
    href: "/dashboard/flights",
    icon: "✈️",
  },
  {
    name: "Gallery",
    href: "/dashboard/gallery",
    icon: "🖼️",
  },
  {
    name: "Memo",
    href: "/dashboard/memo",
    icon: "📝",
  },
  // {
  //   name: "Settings",
  //   href: "/dashboard/settings",
  //   icon: "⚙️",
  // },
];

export default function DashboardSidebar({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-72 flex-col border-r border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
          Joy Exchange
        </p>

        <h1 className="mt-2 font-serif text-3xl">
          CMS
        </h1>
      </div>

      <nav className="flex-1 space-y-2 p-6">
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
              pathname === menu.href
                ? "bg-neutral-900 text-white"
                : "hover:bg-neutral-100"
            }`}
          >
            <span>{menu.icon}</span>

            {menu.name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-neutral-200 p-6">
        <p className="font-medium">
          {name}
        </p>

        <p className="mt-1 text-xs text-neutral-500">
          {email}
        </p>

        <button
          onClick={() => signOut()}
          className="mt-5 w-full rounded-full bg-neutral-900 py-3 text-sm text-white"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}