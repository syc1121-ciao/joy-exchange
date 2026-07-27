"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigationItems = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Journal",
    href: "/journal",
  },
    {
    label: "Destinations",
    href: "/destinations",
  },
  // {
  //   label: "Memo",
  //   href: "/memo",
  // },
  {
    label: "Gallery",
    href: "/gallery",
  },
  // {
  //   label: "About Me",
  //   href: "/about",
  // },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function isActiveLink(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  }

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#faf8f5]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-10">
        <Link
          href="/"
          onClick={closeMenu}
          className="relative z-50 flex flex-col"
        >
          <span className="font-serif text-xl font-semibold tracking-tight text-neutral-950">
            CIAO&apos;s
          </span>

          <span className="-mt-1 text-[9px] uppercase tracking-[0.28em] text-neutral-400">
            Exchange Adventure
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navigationItems.map((item) => {
            const active = isActiveLink(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "relative py-2 text-sm transition",
                  active
                    ? "text-neutral-950"
                    : "text-neutral-500 hover:text-neutral-950",
                ].join(" ")}
              >
                {item.label}

                <span
                  className={[
                    "absolute inset-x-0 -bottom-1 mx-auto h-px bg-neutral-900 transition-all duration-300",
                    active
                      ? "w-full opacity-100"
                      : "w-0 opacity-0",
                  ].join(" ")}
                />
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Link
            href="/dashboard"
            className="inline-flex rounded-full border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
          >
            Dashboard
          </Link>
        </div>

        <button
          type="button"
          aria-label={
            isMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={isMenuOpen}
          onClick={() => {
            setIsMenuOpen((current) => !current);
          }}
          className="relative z-50 flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white md:hidden"
        >
          <span className="sr-only">Menu</span>

          <span className="relative block h-4 w-5">
            <span
              className={[
                "absolute left-0 top-0 h-px w-5 bg-neutral-900 transition duration-300",
                isMenuOpen
                  ? "translate-y-[7px] rotate-45"
                  : "",
              ].join(" ")}
            />

            <span
              className={[
                "absolute left-0 top-[7px] h-px w-5 bg-neutral-900 transition duration-300",
                isMenuOpen
                  ? "opacity-0"
                  : "opacity-100",
              ].join(" ")}
            />

            <span
              className={[
                "absolute left-0 top-[14px] h-px w-5 bg-neutral-900 transition duration-300",
                isMenuOpen
                  ? "-translate-y-[7px] -rotate-45"
                  : "",
              ].join(" ")}
            />
          </span>
        </button>
      </div>

      <div
        className={[
          "overflow-hidden border-t bg-[#faf8f5] transition-all duration-300 md:hidden",
          isMenuOpen
            ? "max-h-[500px] border-black/5 opacity-100"
            : "max-h-0 border-transparent opacity-0",
        ].join(" ")}
      >
        <nav className="mx-auto flex max-w-7xl flex-col px-4 py-5 sm:px-6">
          {navigationItems.map((item) => {
            const active = isActiveLink(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMenu}
                className={[
                  "border-b border-neutral-200 py-4 text-base transition",
                  active
                    ? "font-medium text-neutral-950"
                    : "text-neutral-500 hover:text-neutral-950",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/dashboard"
            onClick={closeMenu}
            className="mt-5 inline-flex w-fit rounded-full bg-neutral-900 px-6 py-3 text-sm text-white"
          >
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}