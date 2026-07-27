"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

type CmsShellProps = {
  children: ReactNode;
};

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: "🏡",
  },
  {
    label: "Overview",
    href: "/dashboard",
    icon: "🏠",
  },
  {
    label: "Places",
    href: "/dashboard/places",
    icon: "📍",
  },
  {
    label: "Journal",
    href: "/dashboard/journal",
    icon: "📖",
  },
  {
    label: "Flights",
    href: "/dashboard/flights",
    icon: "✈️",
  },
  {
    label: "Gallery",
    href: "/dashboard/gallery",
    icon: "🖼️",
  },
  {
    label: "Memo",
    href: "/dashboard/memo",
    icon: "📝",
  },
];

export default function CmsShell({ children }: CmsShellProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // 切換頁面後自動關閉手機選單
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // 開啟手機選單時，禁止背景頁面滾動
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-[#f4f1ec] text-[#1f1f1f]">
      {/* 手機版頂部導覽列 */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-black/10 bg-[#faf8f5]/95 px-4 backdrop-blur-md lg:hidden">
        <Link href="/" className="min-w-0">
          <p className="font-serif text-lg font-semibold tracking-wide text-[#171717]">
            CIAO&apos;S
          </p>

          <p className="truncate text-[8px] uppercase tracking-[0.3em] text-[#7f7a73]">
            Exchange Adventure
          </p>
        </Link>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={menuOpen}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-[#171717] shadow-sm transition hover:bg-[#f3efe9]"
        >
          <span className="text-2xl leading-none">☰</span>
        </button>
      </header>

      {/* 手機版黑色遮罩 */}
      <button
        type="button"
        aria-label="Close navigation menu"
        onClick={() => setMenuOpen(false)}
        className={[
          "fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] transition-opacity lg:hidden",
          menuOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      {/* 側邊欄 */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[min(86vw,320px)] flex-col border-r border-black/10 bg-[#faf8f5] shadow-2xl transition-transform duration-300 ease-out",
          "lg:w-64 lg:translate-x-0 lg:shadow-none",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-black/10 px-6">
          <Link href="/">
            <p className="font-serif text-xl font-semibold tracking-wide text-[#171717]">
              CIAO&apos;S
            </p>

            <p className="text-[8px] uppercase tracking-[0.3em] text-[#7f7a73]">
              Exchange Adventure
            </p>
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-xl text-[#171717] lg:hidden"
          >
            ×
          </button>
        </div>

        {/* CMS 標題 */}
        <div className="px-6 pb-5 pt-7">
          <p className="text-[10px] uppercase tracking-[0.35em] text-[#6f84a6]">
            Joy Exchange
          </p>

          <h1 className="mt-2 font-serif text-4xl font-medium text-[#111111]">
            CMS
          </h1>
        </div>

        {/* 導覽項目 */}
        <nav className="flex-1 overflow-y-auto px-4 pb-6">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isOverview = item.href === "/dashboard";

              const isActive = isOverview
                ? pathname === "/dashboard"
                : item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      "flex min-h-11 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                      isActive
                        ? "bg-[#171717] text-white shadow-sm"
                        : "text-[#262626] hover:bg-black/5",
                    ].join(" ")}
                  >
                    <span
                      aria-hidden="true"
                      className="flex w-5 shrink-0 justify-center"
                    >
                      {item.icon}
                    </span>

                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* 使用者資訊 */}
        <div className="border-t border-black/10 px-6 py-5">
          <p className="font-serif text-base text-[#6f84a6]">Ciao Hsieh</p>

          <a
            href="mailto:syc1121hsieh@gmail.com"
            className="mt-2 block break-all text-xs leading-5 text-[#6f84a6] hover:underline"
          >
            syc1121hsieh@gmail.com
          </a>
        </div>
      </aside>

      {/* 頁面主內容 */}
      <main className="min-w-0 lg:ml-64">
        <div className="min-w-0 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}