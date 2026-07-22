"use client";

import MarkerCard from "./MarkerCard";
import type { ProjectedPlace } from "./types";

type MarkerProps = {
  place: ProjectedPlace;
  zoom: number;
  isActive: boolean;
  isHovered: boolean;
  onActivate: () => void;
  onHover: (hovered: boolean) => void;
};

export default function Marker({
  place,
  zoom,
  isActive,
  isHovered,
  onActivate,
  onHover,
}: MarkerProps) {
  const isExpanded = isHovered || isActive;

  return (
    <div
      className="pointer-events-none absolute z-20"
      style={{
        left: `${place.x}%`,
        top: `${place.y}%`,
      }}
    >
      {/* 抵消地圖縮放，讓 Marker 的畫面尺寸固定 */}
      <div
        className="relative flex items-center justify-center"
        style={{
          transform: `translate(-50%, -50%) scale(${1 / zoom})`,
          transformOrigin: "center",
        }}
      >
        <button
          type="button"
          className="pointer-events-auto relative flex items-center justify-center"
          aria-label={`Open ${place.name}`}
          aria-expanded={isActive}
          onPointerDown={(event) => {
            event.stopPropagation();
          }}
          onClick={(event) => {
            event.stopPropagation();
            onActivate();
          }}
          onMouseEnter={() => {
            onHover(true);
          }}
          onMouseLeave={() => {
            onHover(false);
          }}
        >
          {/* 平常的小星星 */}
          <span
            className={[
              "absolute flex h-8 w-8 items-center justify-center",
              "rounded-full border border-slate-700/20",
              "bg-white/85 text-sm text-slate-800",
              "shadow-sm backdrop-blur-sm",
              "transition-all duration-300",
              isExpanded
                ? "scale-75 opacity-0"
                : "scale-100 opacity-100",
            ].join(" ")}
          >
            ✦
          </span>

          {/* Hover 後的地標和城市名稱 */}
          <span
            className={[
              "flex items-center gap-2 rounded-full",
              "border border-white/70 bg-slate-900/90",
              "px-3 py-2 text-white shadow-lg backdrop-blur-md",
              "transition-all duration-300",
              isExpanded
                ? "translate-y-0 scale-100 opacity-100"
                : "pointer-events-none translate-y-1 scale-75 opacity-0",
            ].join(" ")}
          >
            <span className="text-base" aria-hidden="true">
              {place.icon}
            </span>

            <span className="whitespace-nowrap text-xs font-medium">
              {place.name}
            </span>
          </span>
        </button>

        {isActive && <MarkerCard place={place} />}
      </div>
    </div>
  );
}