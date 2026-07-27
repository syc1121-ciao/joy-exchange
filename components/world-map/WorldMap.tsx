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

import { regions } from "./regions";

import {
  MAP_HEIGHT,
  MAP_WIDTH,
  projectPlaces,
} from "./projection";

import type {
  Continent,
  Place,
} from "./types";

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;

export type PublicPlace = {
  id: string;

  city: string;
  country: string;
  continent: string;

  slug: string;

  description: string | null;
  image: string | null;
  icon: string;

  place_type:
    | "home"
    | "visited"
    | "dream"
    | "wishlist";

  longitude: number;
  latitude: number;
};

type WorldMapProps = {
  places: PublicPlace[];
};

type PanPosition = {
  x: number;
  y: number;
};

type GeographyData = Record<
  string,
  unknown
>;

function clamp(
  value: number,
  min: number,
  max: number,
) {
  return Math.min(
    Math.max(value, min),
    max,
  );
}

function normalizeContinent(
  value: string,
): Continent | null {
  const normalized = value
    .trim()
    .toLowerCase()
    .replaceAll("_", "-")
    .replace(/\s+/g, "-");

  if (
    normalized === "europe" ||
    normalized === "asia" ||
    normalized === "north-america"
  ) {
    return normalized;
  }

  return null;
}

export default function WorldMap({
  places: publicPlaces,
}: WorldMapProps) {
  const [
    selectedContinent,
    setSelectedContinent,
  ] = useState<Continent | null>(
    null,
  );

  const selectedRegion =
    selectedContinent
      ? regions[selectedContinent]
      : null;

  const [geoData, setGeoData] =
    useState<GeographyData | null>(
      null,
    );

  const [
    isMapLoading,
    setIsMapLoading,
  ] = useState(false);

  const [mapError, setMapError] =
    useState<string | null>(null);

  const [zoom, setZoom] =
    useState(1);

  const [pan, setPan] =
    useState<PanPosition>({
      x: 0,
      y: 0,
    });

  const [
    activePlaceId,
    setActivePlaceId,
  ] = useState<string | null>(
    null,
  );

  const [
    hoveredPlaceId,
    setHoveredPlaceId,
  ] = useState<string | null>(
    null,
  );

  const mapContainerRef =
    useRef<HTMLDivElement>(null);

  const dragStartRef =
    useRef<PanPosition | null>(
      null,
    );

  const panStartRef =
    useRef<PanPosition>({
      x: 0,
      y: 0,
    });

  const hasDraggedRef =
    useRef(false);

  const places = useMemo<Place[]>(() => {
    return publicPlaces.flatMap(
      (place) => {
        const continent =
          normalizeContinent(
            place.continent,
          );

        if (!continent) {
          return [];
        }

        return [
          {
            id: place.id,

            name: place.city,
            country: place.country,
            continent,

            longitude:
              place.longitude,

            latitude:
              place.latitude,

            icon:
              place.icon || "📍",

            image:
              place.image ?? "",

            date:
              place.place_type ===
              "visited"
                ? "Visited"
                : place.place_type ===
                    "home"
                  ? "Home"
                  : place.place_type ===
                      "dream"
                    ? "Dream destination"
                    : "Wishlist",

            description:
              place.description ??
              `${place.city}, ${place.country}`,

            href: `/travel/${place.slug}`,

            status:
              place.place_type,
          },
        ];
      },
    );
  }, [publicPlaces]);

  const projectedPlaces =
    useMemo(() => {
      if (!selectedRegion) {
        return [];
      }

      return projectPlaces(
        places,
        selectedRegion,
      );
    }, [
      places,
      selectedRegion,
    ]);

  useEffect(() => {
    if (!selectedRegion) {
      setGeoData(null);
      setMapError(null);
      setIsMapLoading(false);

      return;
    }

    const region =
      selectedRegion;

    const controller =
      new AbortController();

    async function loadMap() {
      try {
        setIsMapLoading(true);
        setGeoData(null);
        setMapError(null);

        const response =
          await fetch(
            region.mapPath,
            {
              signal:
                controller.signal,
            },
          );

        if (!response.ok) {
          throw new Error(
            `Failed to load ${region.name} map`,
          );
        }

        const data =
          (await response.json()) as GeographyData;

        if (
          !controller.signal.aborted
        ) {
          setGeoData(data);
        }
      } catch (error) {
        if (
          error instanceof
            DOMException &&
          error.name ===
            "AbortError"
        ) {
          return;
        }

        console.error(error);

        if (
          !controller.signal.aborted
        ) {
          setMapError(
            `Unable to load the ${region.name} map.`,
          );
        }
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setIsMapLoading(false);
        }
      }
    }

    void loadMap();

    return () => {
      controller.abort();
    };
  }, [selectedRegion]);

  function resetMap() {
    setZoom(1);

    setPan({
      x: 0,
      y: 0,
    });

    setActivePlaceId(null);
    setHoveredPlaceId(null);
  }

  function handleSelectContinent(
    continent: Continent,
  ) {
    resetMap();
    setSelectedContinent(
      continent,
    );
  }

  function handleBackToContinents() {
    resetMap();
    setGeoData(null);
    setMapError(null);
    setSelectedContinent(null);
  }

  function changeZoom(
    requestedZoom: number,
    origin?: PanPosition,
  ) {
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

    const zoomOrigin =
      origin ?? {
        x:
          container.clientWidth /
          2,

        y:
          container.clientHeight /
          2,
      };

    const zoomRatio =
      nextZoom / zoom;

    setPan((currentPan) => ({
      x:
        zoomOrigin.x -
        (zoomOrigin.x -
          currentPan.x) *
          zoomRatio,

      y:
        zoomOrigin.y -
        (zoomOrigin.y -
          currentPan.y) *
          zoomRatio,
    }));

    setZoom(nextZoom);
  }

  function handleWheel(
    event: ReactWheelEvent<HTMLDivElement>,
  ) {
    event.preventDefault();

    const container =
      mapContainerRef.current;

    if (!container) {
      return;
    }

    const rect =
      container.getBoundingClientRect();

    const pointerPosition = {
      x:
        event.clientX -
        rect.left,

      y:
        event.clientY -
        rect.top,
    };

    const zoomFactor =
      event.deltaY < 0
        ? 1.18
        : 1 / 1.18;

    changeZoom(
      zoom * zoomFactor,
      pointerPosition,
    );
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
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
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    const dragStart =
      dragStartRef.current;

    if (!dragStart) {
      return;
    }

    const deltaX =
      event.clientX -
      dragStart.x;

    const deltaY =
      event.clientY -
      dragStart.y;

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
  }

  function handlePointerEnd(
    event: ReactPointerEvent<HTMLDivElement>,
  ) {
    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId,
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId,
      );
    }

    dragStartRef.current =
      null;
  }

  return (
    <section>
      <header className="mb-6 text-center sm:mb-9">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500 sm:text-sm">
          My Journey
        </p>

        <h2 className="mt-3 font-serif text-3xl leading-tight text-slate-900 sm:text-4xl lg:text-5xl">
          {selectedRegion
            ? `Explore ${selectedRegion.name}.`
            : "Choose your next adventure."}
        </h2>

        <p className="mx-auto mt-3 max-w-xl px-2 text-sm leading-6 text-slate-500 sm:mt-4 sm:text-base">
          {selectedRegion
            ? "Zoom, drag, and select a marker to discover each destination."
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
            "touch-none select-none",
            "rounded-[1.5rem] sm:rounded-[2rem]",
            "border border-black/5",
            "bg-[#eeeae4]",
          ].join(" ")}
          style={{
            aspectRatio:
              `${MAP_WIDTH} / ${MAP_HEIGHT}`,

            minHeight: "360px",
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
            if (
              !hasDraggedRef.current
            ) {
              setActivePlaceId(null);
            }
          }}
        >
          <button
            type="button"
            className={[
              "absolute left-3 top-3 z-50",
              "rounded-full",
              "border border-white/70",
              "bg-white/90",
              "px-3 py-2",
              "text-xs font-medium",
              "text-slate-700",
              "shadow-sm",
              "backdrop-blur-md",
              "transition hover:bg-white",
              "sm:left-5 sm:top-5",
              "sm:px-4 sm:text-sm",
            ].join(" ")}
            onPointerDown={(
              event,
            ) => {
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
              <div className="rounded-full border border-white/60 bg-white/90 px-4 py-2 text-xs text-slate-500 shadow-sm backdrop-blur-md sm:px-5 sm:py-3 sm:text-sm">
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

          {geoData &&
            !mapError && (
              <div
                className="absolute left-0 top-0 h-full w-full"
                style={{
                  transform:
                    `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,

                  transformOrigin:
                    "0 0",
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
                    {({
                      geographies,
                    }) =>
                      geographies.map(
                        (
                          geo,
                          index,
                        ) => (
                          <Geography
                            key={`${geo.id ?? "country"}-${index}`}
                            geography={geo}
                            fill="#d8d3cb"
                            stroke="#f7f5f2"
                            strokeWidth={
                              0.8 /
                              zoom
                            }
                            tabIndex={
                              -1
                            }
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
                        key={
                          place.id
                        }
                        place={
                          place
                        }
                        zoom={
                          zoom
                        }
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
                            (
                              currentId,
                            ) =>
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

          {geoData &&
            !mapError && (
              <MapControls
                zoom={zoom}
                minZoom={
                  MIN_ZOOM
                }
                maxZoom={
                  MAX_ZOOM
                }
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
                onReset={
                  resetMap
                }
              />
            )}

          {geoData &&
            !mapError && (
              <div className="pointer-events-none absolute bottom-3 left-3 z-40 rounded-full border border-white/50 bg-white/80 px-3 py-1.5 text-[11px] text-slate-600 backdrop-blur-md sm:bottom-5 sm:left-5 sm:px-4 sm:py-2 sm:text-xs">
                {Math.round(
                  zoom * 100,
                )}
                %
              </div>
            )}

          {!isMapLoading &&
            geoData &&
            projectedPlaces.length ===
              0 && (
              <div className="pointer-events-none absolute bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 text-center text-xs text-slate-600 shadow-sm backdrop-blur-md sm:w-auto sm:rounded-full sm:px-5 sm:text-sm">
                尚未新增這個大洲的已發布地點
              </div>
            )}
        </div>
      )}
    </section>
  );
}