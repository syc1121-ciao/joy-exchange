"use client";

import {
  useEffect,
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

import ContinentSelector from "./ContinentSelector";
import MapControls from "./MapControls";
import Marker from "./Marker";

import { places } from "./places";
import { regions } from "./regions";

import {
  MAP_HEIGHT,
  MAP_WIDTH,
  projectPlaces,
} from "./projection";

import type { Continent } from "./types";

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

type PanPosition = {
  x: number;
  y: number;
};

type GeographyData = Record<string, unknown>;

function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(Math.max(value, min), max);
}

export default function WorldMap() {
  const [selectedContinent, setSelectedContinent] =
    useState<Continent | null>(null);

  const selectedRegion = selectedContinent
    ? regions[selectedContinent]
    : null;

  const [geoData, setGeoData] =
    useState<GeographyData | null>(null);

  const [isMapLoading, setIsMapLoading] =
    useState(false);

  const [mapError, setMapError] =
    useState<string | null>(null);

  const [zoom, setZoom] = useState(1);

  const [pan, setPan] = useState<PanPosition>({
    x: 0,
    y: 0,
  });

  const [activePlaceId, setActivePlaceId] =
    useState<string | null>(null);

  const [hoveredPlaceId, setHoveredPlaceId] =
    useState<string | null>(null);

  const mapContainerRef =
    useRef<HTMLDivElement>(null);

  const dragStartRef =
    useRef<PanPosition | null>(null);

  const panStartRef =
    useRef<PanPosition>({
      x: 0,
      y: 0,
    });

  const hasDraggedRef =
    useRef(false);

  const projectedPlaces = useMemo(() => {
    if (!selectedRegion) {
      return [];
    }

    return projectPlaces(
      places,
      selectedRegion,
    );
  }, [selectedRegion]);

  useEffect(() => {
  if (!selectedRegion) {
    setGeoData(null);
    setMapError(null);
    setIsMapLoading(false);
    return;
  }

  // 固定這次 effect 使用的大洲資料
  const region = selectedRegion;
  const controller = new AbortController();

  async function loadMap() {
    try {
      setIsMapLoading(true);
      setGeoData(null);
      setMapError(null);

      const response = await fetch(region.mapPath, {
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to load ${region.name} map`,
        );
      }

      const data =
        (await response.json()) as GeographyData;

      if (!controller.signal.aborted) {
        setGeoData(data);
      }
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      console.error(error);

      if (!controller.signal.aborted) {
        setMapError(
          `Unable to load the ${region.name} map.`,
        );
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsMapLoading(false);
      }
    }
  }

  void loadMap();

  return () => {
    controller.abort();
  };
}, [selectedRegion]);

  const resetMap = () => {
    setZoom(1);

    setPan({
      x: 0,
      y: 0,
    });

    setActivePlaceId(null);
    setHoveredPlaceId(null);
  };

  const handleSelectContinent = (
    continent: Continent,
  ) => {
    resetMap();
    setSelectedContinent(continent);
  };

  const handleBackToContinents = () => {
    resetMap();
    setGeoData(null);
    setMapError(null);
    setSelectedContinent(null);
  };

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

    const container =
      mapContainerRef.current;

    if (!container) {
      setZoom(nextZoom);
      return;
    }

    const zoomOrigin = origin ?? {
      x: container.clientWidth / 2,
      y: container.clientHeight / 2,
    };

    const zoomRatio =
      nextZoom / zoom;

    setPan((currentPan) => ({
      x:
        zoomOrigin.x -
        (zoomOrigin.x - currentPan.x) *
          zoomRatio,

      y:
        zoomOrigin.y -
        (zoomOrigin.y - currentPan.y) *
          zoomRatio,
    }));

    setZoom(nextZoom);
  };

  const handleWheel = (
    event: ReactWheelEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    const container =
      mapContainerRef.current;

    if (!container) {
      return;
    }

    const rect =
      container.getBoundingClientRect();

    const pointerPosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    const zoomFactor =
      event.deltaY < 0
        ? 1.18
        : 1 / 1.18;

    changeZoom(
      zoom * zoomFactor,
      pointerPosition,
    );
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (event.button !== 0) {
      return;
    }

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );

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
    const dragStart =
      dragStartRef.current;

    if (!dragStart) {
      return;
    }

    const deltaX =
      event.clientX - dragStart.x;

    const deltaY =
      event.clientY - dragStart.y;

    if (
      Math.abs(deltaX) > 3 ||
      Math.abs(deltaY) > 3
    ) {
      hasDraggedRef.current = true;
    }

    setPan({
      x:
        panStartRef.current.x +
        deltaX,

      y:
        panStartRef.current.y +
        deltaY,
    });
  };

  const handlePointerEnd = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId,
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    }

    dragStartRef.current = null;
  };

  return (
    <section className="bg-[#f7f5f2] px-5 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
            My Journey
          </p>

          <h2 className="mt-4 font-serif text-4xl text-slate-900 md:text-5xl">
            {selectedRegion
              ? `Explore ${selectedRegion.name}.`
              : "Choose your next adventure."}
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-500">
            {selectedRegion
              ? "Scroll to zoom, drag to explore, and select a star."
              : "Select a continent to discover the places on my travel list."}
          </p>
        </header>

        {!selectedRegion && (
          <ContinentSelector
            onSelect={
              handleSelectContinent
            }
          />
        )}

        {selectedRegion && (
          <div
            ref={mapContainerRef}
            className={[
              "relative w-full overflow-hidden",
              "touch-none select-none rounded-3xl",
              "border border-black/5 bg-[#eeeae4]",
              "cursor-default",
            ].join(" ")}
            style={{
              aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}`,
            }}
            onWheel={handleWheel}
            onPointerDown={
              handlePointerDown
            }
            onPointerMove={
              handlePointerMove
            }
            onPointerUp={
              handlePointerEnd
            }
            onPointerCancel={
              handlePointerEnd
            }
            onClick={() => {
              if (!hasDraggedRef.current) {
                setActivePlaceId(null);
              }
            }}
          >
            <button
              type="button"
              className={[
                "absolute left-5 top-5 z-50",
                "rounded-full border border-white/70",
                "bg-white/90 px-4 py-2",
                "text-sm text-slate-700",
                "shadow-sm backdrop-blur-md",
                "transition hover:bg-white",
              ].join(" ")}
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                handleBackToContinents();
              }}
            >
              ← Continents
            </button>

            {isMapLoading && (
              <div className="absolute inset-0 z-30 flex items-center justify-center">
                <div className="rounded-full border border-white/60 bg-white/85 px-5 py-3 text-sm text-slate-500 shadow-sm backdrop-blur-md">
                  Loading{" "}
                  {selectedRegion.name}
                  …
                </div>
              </div>
            )}

            {mapError && (
              <div className="absolute inset-0 z-30 flex items-center justify-center px-5">
                <div className="max-w-sm rounded-3xl border border-black/5 bg-white/90 p-6 text-center shadow-lg backdrop-blur-md">
                  <p className="font-medium text-slate-800">
                    Map unavailable
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {mapError}
                  </p>

                  <button
                    type="button"
                    className="mt-4 rounded-full bg-slate-900 px-5 py-2 text-sm text-white"
                    onClick={
                      handleBackToContinents
                    }
                  >
                    Return
                  </button>
                </div>
              </div>
            )}

            {geoData && !mapError && (
              <div
                className="absolute left-0 top-0 h-full w-full"
                style={{
                  transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
                  transformOrigin: "0 0",
                }}
              >
                <ComposableMap
                  projection="geoEqualEarth"
                  projectionConfig={{
                    scale:
                      selectedRegion.scale,

                    center:
                      createCoordinates(
                        selectedRegion
                          .center[0],

                        selectedRegion
                          .center[1],
                      ),
                  }}
                  width={MAP_WIDTH}
                  height={MAP_HEIGHT}
                  className="block h-full w-full"
                >
                  <Geographies
                    geography={geoData}
                  >
                    {({ geographies }) =>
                      geographies.map(
                        (geo, index) => (
                          <Geography
                            key={`${geo.id ?? "country"}-${index}`}
                            geography={geo}
                            fill="#d8d3cb"
                            stroke="#f7f5f2"
                            strokeWidth={
                              0.8 / zoom
                            }
                            tabIndex={-1}
                            className="outline-none"
                            style={{
                              default: {
                                outline:
                                  "none",
                              },

                              hover: {
                                fill:
                                  "#c5beb4",

                                outline:
                                  "none",
                              },

                              pressed: {
                                fill:
                                  "#bbb4aa",

                                outline:
                                  "none",
                              },
                            }}
                          />
                        ),
                      )
                    }
                  </Geographies>
                </ComposableMap>

                <div className="pointer-events-none absolute inset-0">
                  {projectedPlaces.map(
                    (place) => (
                      <Marker
                        key={place.id}
                        place={place}
                        zoom={zoom}
                        isActive={
                          activePlaceId ===
                          place.id
                        }
                        isHovered={
                          hoveredPlaceId ===
                          place.id
                        }
                        onActivate={() => {
                          setActivePlaceId(
                            (currentId) =>
                              currentId ===
                              place.id
                                ? null
                                : place.id,
                          );
                        }}
                        onHover={(
                          hovered,
                        ) => {
                          setHoveredPlaceId(
                            hovered
                              ? place.id
                              : null,
                          );
                        }}
                      />
                    ),
                  )}
                </div>
              </div>
            )}

            {geoData && !mapError && (
              <MapControls
                zoom={zoom}
                minZoom={MIN_ZOOM}
                maxZoom={MAX_ZOOM}
                onZoomIn={() => {
                  changeZoom(
                    zoom * 1.4,
                  );
                }}
                onZoomOut={() => {
                  changeZoom(
                    zoom / 1.4,
                  );
                }}
                onReset={resetMap}
              />
            )}

            {geoData && !mapError && (
              <div className="pointer-events-none absolute bottom-5 left-5 z-40 rounded-full border border-white/50 bg-white/75 px-4 py-2 text-xs text-slate-600 backdrop-blur-md">
                {Math.round(
                  zoom * 100,
                )}
                %
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}