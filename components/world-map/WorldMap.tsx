"use client";
import geoData from "../../public/maps/countries-50m.json";
import {
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";

import {
  ComposableMap,
  Geographies,
  Geography,
  createCoordinates,
} from "@vnedyalk0v/react19-simple-maps";

import MapControls from "./MapControls";
import Marker from "./Marker";
import { places } from "./places";
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  projectPlaces,
} from "./projection";



const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

type PanPosition = {
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function WorldMap() {
  const projectedPlaces = useMemo(
    () => projectPlaces(places),
    [],
  );

  const mapContainerRef = useRef<HTMLDivElement>(null);

  const dragStartRef = useRef<PanPosition | null>(null);
  const panStartRef = useRef<PanPosition>({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<PanPosition>({
    x: 0,
    y: 0,
  });

  const [activePlaceId, setActivePlaceId] =
    useState<string | null>(null);

  const [hoveredPlaceId, setHoveredPlaceId] =
    useState<string | null>(null);

  const changeZoom = (
    requestedZoom: number,
    origin?: PanPosition,
  ) => {
    const nextZoom = clamp(
      requestedZoom,
      MIN_ZOOM,
      MAX_ZOOM,
    );

    if (nextZoom === zoom) {
      return;
    }

    const container = mapContainerRef.current;

    if (!container) {
      setZoom(nextZoom);
      return;
    }

    const zoomOrigin = origin ?? {
      x: container.clientWidth / 2,
      y: container.clientHeight / 2,
    };

    const zoomRatio = nextZoom / zoom;

    // 以滑鼠位置或地圖中心為縮放中心
    setPan((currentPan) => ({
      x:
        zoomOrigin.x -
        (zoomOrigin.x - currentPan.x) * zoomRatio,
      y:
        zoomOrigin.y -
        (zoomOrigin.y - currentPan.y) * zoomRatio,
    }));

    setZoom(nextZoom);
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

    const zoomFactor =
      event.deltaY < 0 ? 1.18 : 1 / 1.18;

    changeZoom(zoom * zoomFactor, pointerPosition);
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
    if (
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    }

    dragStartRef.current = null;
  };

  const resetMap = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setActivePlaceId(null);
    setHoveredPlaceId(null);
  };

  return (
    <section className="bg-[#f7f5f2] px-5 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
            My Journey
          </p>

          <h2 className="mt-4 font-serif text-4xl text-slate-900 md:text-5xl">
            Places I want to explore.
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500">
            Scroll to zoom, drag to explore, and select a
            star.
          </p>
        </header>

        <div
          ref={mapContainerRef}
          className={[
            "relative w-full overflow-hidden",
            "touch-none select-none rounded-3xl",
            "border border-black/5 bg-[#eeeae4]",
            "cursor-grab active:cursor-grabbing",
          ].join(" ")}
          style={{
            aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}`,
          }}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onClick={() => {
            if (!hasDraggedRef.current) {
              setActivePlaceId(null);
            }
          }}
        >
          {/* 地圖和 HTML Marker 共用同一個 transform */}
          <div
            className="absolute inset-0"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "top left",
              willChange: "transform",
            }}
          >
            <ComposableMap
              projection="geoEqualEarth"
              projectionConfig={{
                scale: 147,
                center: createCoordinates(0, 0),
              }}
              width={MAP_WIDTH}
              height={MAP_HEIGHT}
              className="absolute inset-0 h-full w-full"
            >
              <Geographies geography={geoData}>
                {({ geographies }) =>
                  geographies.map((geo, index) => (
                    <Geography
                      key={`${geo.id ?? "country"}-${index}`}
                      geography={geo}
                      fill="#d8d3cb"
                      stroke="#f7f5f2"
                      strokeWidth={0.6 / zoom}
                      style={{
                        default: {
                          outline: "none",
                        },
                        hover: {
                          fill: "#c5beb4",
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

            <div className="pointer-events-none absolute inset-0">
              {projectedPlaces.map((place) => (
                <Marker
                  key={place.id}
                  place={place}
                  zoom={zoom}
                  isActive={activePlaceId === place.id}
                  isHovered={hoveredPlaceId === place.id}
                  onActivate={() => {
                    setActivePlaceId((currentId) =>
                      currentId === place.id
                        ? null
                        : place.id,
                    );
                  }}
                  onHover={(hovered: boolean) => {
                    setHoveredPlaceId(
                      hovered ? place.id : null,
                    );
                  }}
                />
              ))}
            </div>
          </div>

          <MapControls
            zoom={zoom}
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            onZoomIn={() => {
              changeZoom(zoom * 1.4);
            }}
            onZoomOut={() => {
              changeZoom(zoom / 1.4);
            }}
            onReset={resetMap}
          />

          <div className="pointer-events-none absolute bottom-5 left-5 z-40 rounded-full border border-white/50 bg-white/75 px-4 py-2 text-xs text-slate-600 backdrop-blur-md">
            {Math.round(zoom * 100)}%
          </div>
        </div>
      </div>
    </section>
  );
}