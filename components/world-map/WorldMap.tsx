"use client";

import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

import { geoEqualEarth } from "d3-geo";

import {
  ComposableMap,
  Geographies,
  Geography,
} from "@vnedyalk0v/react19-simple-maps";

import CityMarker from "@/components/world-map/Marker";
import { places } from "@/components/data/places";

const geoUrl = "/maps/countries-110m.json";

const MAP_WIDTH = 800;
const MAP_HEIGHT = 480;

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

type Point = {
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function WorldMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const dragStartRef = useRef<Point | null>(null);
  const panStartRef = useRef<Point>({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });

  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  /*
    必須和 ComposableMap 使用相同設定：
    width: 800
    height: 480
    projection: geoEqualEarth
    scale: 147
  */
  const projection = useMemo(() => {
    return geoEqualEarth()
      .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2])
      .scale(147)
      .center([0, 0]);
  }, []);

  const projectedPlaces = useMemo(() => {
    return places
      .map((place) => {
        const position = projection([
          place.longitude,
          place.latitude,
        ]);

        if (!position) {
          return null;
        }

        return {
          ...place,
          x: position[0],
          y: position[1],
        };
      })
      .filter(
        (
          place,
        ): place is (typeof places)[number] & {
          x: number;
          y: number;
        } => place !== null,
      );
  }, [projection]);

  const zoomTo = (
    nextZoom: number,
    origin?: {
      x: number;
      y: number;
    },
  ) => {
    const boundedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);

    if (boundedZoom === zoom) {
      return;
    }

    const container = mapContainerRef.current;

    if (!container) {
      setZoom(boundedZoom);
      return;
    }

    const defaultOrigin = {
      x: container.clientWidth / 2,
      y: container.clientHeight / 2,
    };

    const zoomOrigin = origin ?? defaultOrigin;
    const ratio = boundedZoom / zoom;

    /*
      讓地圖以游標或畫面中心為中心縮放，
      而不是永遠從左上角放大。
    */
    setPan((currentPan) => ({
      x:
        zoomOrigin.x -
        (zoomOrigin.x - currentPan.x) * ratio,
      y:
        zoomOrigin.y -
        (zoomOrigin.y - currentPan.y) * ratio,
    }));

    setZoom(boundedZoom);
  };

  const handleWheel = (
    event: ReactWheelEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    const container = mapContainerRef.current;

    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();

    const pointerPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const zoomFactor = event.deltaY < 0 ? 1.2 : 1 / 1.2;

    zoomTo(zoom * zoomFactor, pointerPosition);
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);

    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    panStartRef.current = pan;
    hasDraggedRef.current = false;
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const dragStart = dragStartRef.current;

    if (!dragStart) {
      return;
    }

    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;

    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      hasDraggedRef.current = true;
    }

    setPan({
      x: panStartRef.current.x + deltaX,
      y: panStartRef.current.y + deltaY,
    });
  };

  const handlePointerEnd = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    dragStartRef.current = null;
  };

  const resetMap = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActiveCity(null);
    setHoveredCity(null);
  };

  return (
    <section className="bg-[#f7f5f2] px-5 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
            My Journey
          </p>

          <h2 className="mt-4 font-serif text-4xl text-slate-900 md:text-5xl">
            Places I have been.
          </h2>

          <p className="mt-4 text-sm text-slate-500">
            Scroll to zoom, drag to explore, and select a star.
          </p>
        </header>

        <div
          ref={mapContainerRef}
          className={[
            "relative aspect-[5/3] w-full overflow-hidden",
            "touch-none select-none rounded-3xl",
            "border border-black/5 bg-[#eeeae4]",
            "cursor-grab active:cursor-grabbing",
          ].join(" ")}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onClick={() => {
            if (!hasDraggedRef.current) {
              setActiveCity(null);
            }
          }}
        >
          {/*
            world layer：
            SVG 地圖和 Marker 定位層共用完全相同的 transform。
          */}
          <div
            className="absolute inset-0"
            style={{
              transform: `
                translate(${pan.x}px, ${pan.y}px)
                scale(${zoom})
              `,
              transformOrigin: "top left",
              willChange: "transform",
            }}
          >
            <ComposableMap
              projection="geoEqualEarth"
              projectionConfig={{
                scale: 147,
              }}
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              className="absolute inset-0 h-full w-full"
            >
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.id}
                      geography={geo}
                      fill="#d8d3cb"
                      stroke="#f7f5f2"
                      strokeWidth={0.6}
                      style={{
                        default: {
                          outline: "none",
                        },
                        hover: {
                          fill: "#c2bbb1",
                          outline: "none",
                        },
                        pressed: {
                          outline: "none",
                        },
                      }}
                    />
                  ))
                }
              </Geographies>
            </ComposableMap>

            {/*
              Marker Layer 是 HTML，不在 SVG 裡。
              位置使用和地圖相同的 800 × 480 座標系。
            */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                width: MAP_WIDTH,
                height: MAP_HEIGHT,
                transform: `
                  scale(
                    calc(100% / ${MAP_WIDTH}),
                    calc(100% / ${MAP_HEIGHT})
                  )
                `,
              }}
            />

            <div
              className="pointer-events-none absolute inset-0"
              style={{
                width: "100%",
                height: "100%",
              }}
            >
              {projectedPlaces.map((place) => (
                <CityMarker
                  key={place.name}
                  place={place}
                  x={place.x}
                  y={place.y}
                  zoom={zoom}
                  isActive={activeCity === place.name}
                  isHovered={hoveredCity === place.name}
                  onActivate={() => {
                    if (hasDraggedRef.current) {
                      return;
                    }

                    setActiveCity((current) =>
                      current === place.name ? null : place.name,
                    );
                  }}
                  onHover={(hovered:boolean) => {
                    setHoveredCity(hovered ? place.name : null);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Zoom 控制 */}
          <div
            className={[
              "absolute bottom-5 right-5 z-40 flex flex-col",
              "overflow-hidden rounded-2xl border border-black/10",
              "bg-white/90 shadow-lg backdrop-blur-md",
            ].join(" ")}
            onPointerDown={(event) => {
              event.stopPropagation();
            }}
          >
            <button
              type="button"
              onClick={() => zoomTo(zoom * 1.4)}
              className={[
                "flex h-11 w-11 items-center justify-center",
                "border-b border-black/10 text-xl",
                "transition hover:bg-slate-100",
              ].join(" ")}
              aria-label="Zoom in"
            >
              +
            </button>

            <button
              type="button"
              onClick={() => zoomTo(zoom / 1.4)}
              className={[
                "flex h-11 w-11 items-center justify-center",
                "border-b border-black/10 text-xl",
                "transition hover:bg-slate-100",
              ].join(" ")}
              aria-label="Zoom out"
            >
              −
            </button>

            <button
              type="button"
              onClick={resetMap}
              className={[
                "flex h-11 w-11 items-center justify-center",
                "text-base transition hover:bg-slate-100",
              ].join(" ")}
              aria-label="Reset map"
            >
              ⌂
            </button>
          </div>

          <div className="pointer-events-none absolute bottom-5 left-5 rounded-full bg-white/75 px-4 py-2 text-xs text-slate-600 backdrop-blur">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>
    </section>
  );
}