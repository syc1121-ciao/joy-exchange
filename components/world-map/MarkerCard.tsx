"use client";

import Link from "next/link";

import type { ProjectedPlace } from "./types";

type MarkerCardProps = {
  place: ProjectedPlace;
};

export default function MarkerCard({
  place,
}: MarkerCardProps) {
  return (
    <div
      className={[
        "pointer-events-auto absolute bottom-14 left-1/2",
        "w-64 -translate-x-1/2 overflow-hidden",
        "rounded-3xl border border-white/60",
        "bg-white/90 shadow-xl backdrop-blur-xl",
      ].join(" ")}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <div
        className="relative h-28 bg-[#d8d3cb] bg-cover bg-center"
        style={{
          backgroundImage: `
            linear-gradient(
              to top,
              rgba(15, 23, 42, 0.65),
              rgba(15, 23, 42, 0.05)
            ),
            url("${place.image}")
          `,
        }}
      >
        <div className="absolute inset-x-0 bottom-0 p-4 text-white">
          <p className="font-serif text-2xl leading-none">
            {place.name}
          </p>

          <p className="mt-1 text-xs text-white/80">
            {place.country}
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {place.status}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {place.date}
            </p>
          </div>

          <span className="text-2xl" aria-hidden="true">
            {place.icon}
          </span>
        </div>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {place.description}
        </p>

        <Link
          href={place.href}
          className={[
            "mt-4 flex w-full items-center justify-between",
            "rounded-full bg-slate-900 px-4 py-3",
            "text-xs font-medium text-white",
            "transition hover:bg-slate-700",
          ].join(" ")}
        >
          <span>View Journal</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}