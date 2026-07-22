"use client";

import Link from "next/link";
import type { Place } from "@/components/data/places";

type CityMarkerProps = {
  place: Place;
  x: number;
  y: number;
  zoom: number;
  isActive: boolean;
  isHovered: boolean;
  onActivate: () => void;
  onHover: (hovered: boolean) => void;
};

export default function CityMarker({
  place,
  x,
  y,
  zoom,
  isActive,
  isHovered,
  onActivate,
  onHover,
}: CityMarkerProps) {
  const isExpanded = isHovered || isActive;

  return (
    <div
      className="pointer-events-none absolute"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {/*
        外層位置會跟著地圖放大。
        內層用 1 / zoom 抵消縮放，因此視覺大小固定。
      */}
      <div
        className="relative"
        style={{
          transform: `translate(-50%, -50%) scale(${1 / zoom})`,
          transformOrigin: "center",
        }}
      >
        <button
          type="button"
          className="pointer-events-auto relative flex items-center justify-center focus:outline-none"
          aria-label={`Open ${place.name}`}
          aria-expanded={isActive}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
            onActivate();
          }}
          onMouseEnter={() => onHover(true)}
          onMouseLeave={() => onHover(false)}
        >
          {/* 平常的小星星 */}
          <span
            className={[
              "absolute flex h-8 w-8 items-center justify-center",
              "rounded-full border border-slate-700/30",
              "bg-white/80 text-base text-slate-800",
              "shadow-sm backdrop-blur-md",
              "transition duration-300",
              isExpanded
                ? "scale-75 opacity-0"
                : "scale-100 opacity-100",
            ].join(" ")}
          >
            ✦
          </span>

          {/* Hover 後的城市地標 */}
          <span
            className={[
              "flex min-w-12 items-center gap-2 rounded-full",
              "border border-white/70 bg-slate-900/90",
              "px-3 py-2 text-white shadow-lg backdrop-blur-md",
              "transition duration-300",
              isExpanded
                ? "translate-y-0 scale-100 opacity-100"
                : "translate-y-1 scale-75 opacity-0",
            ].join(" ")}
          >
            <span className="text-base">{place.icon}</span>

            <span className="whitespace-nowrap text-xs font-medium">
              {place.name}
            </span>
          </span>
        </button>

        {/* 點擊後出現的玻璃卡片 */}
        <div
          className={[
            "pointer-events-auto absolute bottom-14 left-1/2",
            "w-64 -translate-x-1/2 overflow-hidden",
            "rounded-3xl border border-white/60",
            "bg-white/85 shadow-2xl backdrop-blur-xl",
            "transition duration-300",
            isActive
              ? "visible translate-y-0 scale-100 opacity-100"
              : "invisible translate-y-3 scale-95 opacity-0",
          ].join(" ")}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <div
            className="relative h-28 bg-slate-200 bg-cover bg-center"
            style={{
              backgroundImage: `
                linear-gradient(
                  to top,
                  rgba(15, 23, 42, 0.55),
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
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs text-slate-600">
                {place.date}
              </span>

              <span className="text-lg">{place.icon}</span>
            </div>

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
      </div>
    </div>
  );
}