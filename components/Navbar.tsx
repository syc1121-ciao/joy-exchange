"use client";

import { useState } from "react";
import Link from "next/link";

const navItems = [
  { label: "HOME", href: "/" },
  { label: "DASHBOARD", href: "/dashboard" },
  { label: "TRAVEL", href: "/travel" },
  { label: "JOURNAL", href: "/journal" },
  { label: "GALLERY", href: "/gallery" },
  { label: "MEMO", href: "/memo" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative z-50 border-b border-black/10 bg-[#faf8f5]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-10">
        <Link
          href="/"
          className="font-serif text-xl italic text-slate-900 md:text-2xl"
        >
          Joy&apos;s Journey
        </Link>

        {/* 桌機選單 */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs tracking-[0.16em] text-slate-700 transition hover:text-black"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 手機按鈕 */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 md:hidden"
          aria-label="Toggle navigation"
          aria-expanded={isOpen}
          onClick={() => {
            setIsOpen((current) => !current);
          }}
        >
          <span className="text-xl">
            {isOpen ? "×" : "☰"}
          </span>
        </button>
      </div>

      {/* 手機選單 */}
      {isOpen && (
        <nav className="absolute inset-x-0 top-full border-b border-black/10 bg-[#faf8f5] px-4 py-4 shadow-lg md:hidden">
          <div className="flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="border-b border-black/5 py-4 text-sm tracking-[0.14em] text-slate-700 last:border-0"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}