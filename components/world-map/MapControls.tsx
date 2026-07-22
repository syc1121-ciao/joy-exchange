"use client";

type MapControlsProps = {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export default function MapControls({
  zoom,
  minZoom,
  maxZoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: MapControlsProps) {
  return (
    <div
      className={[
        "absolute bottom-5 right-5 z-50",
        "flex flex-col overflow-hidden",
        "rounded-2xl border border-black/10",
        "bg-white/90 shadow-lg backdrop-blur-md",
      ].join(" ")}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <button
        type="button"
        onClick={onZoomIn}
        disabled={zoom >= maxZoom}
        className={[
          "flex h-11 w-11 items-center justify-center",
          "border-b border-black/10 text-xl",
          "transition hover:bg-slate-100",
          "disabled:cursor-not-allowed disabled:opacity-30",
        ].join(" ")}
        aria-label="Zoom in"
      >
        +
      </button>

      <button
        type="button"
        onClick={onZoomOut}
        disabled={zoom <= minZoom}
        className={[
          "flex h-11 w-11 items-center justify-center",
          "border-b border-black/10 text-xl",
          "transition hover:bg-slate-100",
          "disabled:cursor-not-allowed disabled:opacity-30",
        ].join(" ")}
        aria-label="Zoom out"
      >
        −
      </button>

      <button
        type="button"
        onClick={onReset}
        className="flex h-11 w-11 items-center justify-center text-base transition hover:bg-slate-100"
        aria-label="Reset map"
      >
        ⌂
      </button>
    </div>
  );
}