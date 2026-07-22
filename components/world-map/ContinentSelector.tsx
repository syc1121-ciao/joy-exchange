"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  ComposableMap,
  Geographies,
  Geography,
  createCoordinates,
} from "@vnedyalk0v/react19-simple-maps";

import type { Continent } from "./types";

type ContinentSelectorProps = {
  onSelect: (continent: Continent) => void;
};

type GeographyData = Record<string, unknown>;

type ContinentName =
  | "Europe"
  | "Asia"
  | "North America"
  | "South America"
  | "Africa"
  | "Oceania"
  | "Antarctica";

const selectableContinents: Partial<
  Record<ContinentName, Continent>
> = {
  Europe: "europe",
  Asia: "asia",
  "North America": "north-america",
};

const continentLabels: Record<
  ContinentName,
  string
> = {
  Europe: "Explore Europe",
  Asia: "Explore Asia",
  "North America": "Explore North America",
  "South America": "Coming soon",
  Africa: "Coming soon",
  Oceania: "Coming soon",
  Antarctica: "Coming soon",
};

function getContinentName(
  properties: Record<string, unknown>,
): ContinentName | null {
  const value =
    properties.CONTINENT ??
    properties.continent ??
    properties.NAME ??
    properties.name;

  if (typeof value !== "string") {
    return null;
  }

  const validNames: ContinentName[] = [
    "Europe",
    "Asia",
    "North America",
    "South America",
    "Africa",
    "Oceania",
    "Antarctica",
  ];

  return validNames.includes(
    value as ContinentName,
  )
    ? (value as ContinentName)
    : null;
}

export default function ContinentSelector({
  onSelect,
}: ContinentSelectorProps) {
  const [geoData, setGeoData] =
    useState<GeographyData | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [
    highlightedContinent,
    setHighlightedContinent,
  ] = useState<ContinentName | null>(null);

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadContinents() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          "/maps/continents-110m.json",
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load continent map",
          );
        }

        const data =
          (await response.json()) as GeographyData;

        if (!controller.signal.aborted) {
          setGeoData(data);
        }
      } catch (loadError) {
        if (
          loadError instanceof DOMException &&
          loadError.name === "AbortError"
        ) {
          return;
        }

        console.error(loadError);

        if (!controller.signal.aborted) {
          setError(
            "The continent map could not be loaded.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadContinents();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] border border-black/5 bg-[#eeeae4] md:rounded-[2rem]">
      <div className="relative z-20 border-b border-black/5 bg-white/55 px-4 py-4 backdrop-blur-md md:absolute md:left-5 md:top-5 md:border-0 md:bg-white/80 md:px-4 md:py-2">
        <div className="flex items-center justify-between gap-4 md:block">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400 md:text-xs">
              Choose a continent
            </p>

            <p className="mt-1 text-sm font-medium text-slate-700 md:hidden">
              Tap an available region
            </p>
          </div>

          <span className="rounded-full bg-white/80 px-3 py-1.5 text-[11px] text-slate-500 md:hidden">
            3 available
          </span>
        </div>
      </div>

      <div className="relative aspect-[4/5] sm:aspect-[4/3] md:aspect-[5/3]">
        {isLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="rounded-full bg-white/90 px-5 py-3 text-sm text-slate-500 shadow-sm backdrop-blur-md">
              Loading continents…
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="rounded-3xl bg-white/90 p-6 text-center shadow-sm">
              <p className="font-medium text-slate-800">
                Map unavailable
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {error}
              </p>
            </div>
          </div>
        )}

        {geoData && !error && (
          <ComposableMap
            projection="geoEqualEarth"
            projectionConfig={{
              scale: 165,
              center: createCoordinates(8, 12),
            }}
            width={800}
            height={560}
            className="block h-full w-full"
          >
            <Geographies geography={geoData}>
              {({ geographies }) =>
                geographies.map(
                  (geo, index) => {
                    const properties =
                      geo.properties as Record<
                        string,
                        unknown
                      >;

                    const continentName =
                      getContinentName(
                        properties,
                      );

                    const regionId =
                      continentName
                        ? selectableContinents[
                            continentName
                          ]
                        : undefined;

                    const isSelectable =
                      Boolean(regionId);

                    const isHighlighted =
                      highlightedContinent ===
                      continentName;

                    return (
                      <Geography
                        key={`${geo.id ?? "continent"}-${index}`}
                        geography={geo}
                        tabIndex={
                          isSelectable ? 0 : -1
                        }
                        role={
                          isSelectable
                            ? "button"
                            : undefined
                        }
                        aria-label={
                          continentName
                            ? continentLabels[
                                continentName
                              ]
                            : undefined
                        }
                        fill={
                          isSelectable
                            ? isHighlighted
                              ? "#9f9486"
                              : "#c3baae"
                            : "#ddd8d1"
                        }
                        stroke="#f7f5f2"
                        strokeWidth={1.3}
                        className={
                          isSelectable
                            ? "cursor-pointer outline-none transition-colors duration-200"
                            : "cursor-default outline-none"
                        }
                        style={{
                          default: {
                            outline: "none",
                          },
                          hover: {
                            outline: "none",
                          },
                          pressed: {
                            outline: "none",
                          },
                        }}
                        onMouseEnter={() => {
                          if (
                            continentName
                          ) {
                            setHighlightedContinent(
                              continentName,
                            );
                          }
                        }}
                        onMouseLeave={() => {
                          setHighlightedContinent(
                            null,
                          );
                        }}
                        onFocus={() => {
                          if (
                            continentName
                          ) {
                            setHighlightedContinent(
                              continentName,
                            );
                          }
                        }}
                        onBlur={() => {
                          setHighlightedContinent(
                            null,
                          );
                        }}
                        onClick={() => {
                          if (!continentName) {
                            return;
                          }

                          if (regionId) {
                            onSelect(regionId);
                            return;
                          }

                          setHighlightedContinent(
                            continentName,
                          );
                        }}
                        onKeyDown={(event) => {
                          if (
                            !regionId ||
                            (event.key !==
                              "Enter" &&
                              event.key !== " ")
                          ) {
                            return;
                          }

                          event.preventDefault();
                          onSelect(regionId);
                        }}
                      />
                    );
                  },
                )
              }
            </Geographies>
          </ComposableMap>
        )}

        {highlightedContinent && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 w-[calc(100%-2rem)] -translate-x-1/2 rounded-2xl border border-white/70 bg-slate-900/90 px-4 py-3 text-center text-sm text-white shadow-lg backdrop-blur-md sm:w-auto sm:rounded-full sm:px-5">
            <span className="font-medium">
              {highlightedContinent}
            </span>

            <span className="ml-2 text-white/60">
              {
                continentLabels[
                  highlightedContinent
                ]
              }
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 border-t border-black/5 bg-white/45 px-4 py-4 backdrop-blur-md md:absolute md:bottom-5 md:right-5 md:z-20 md:flex md:w-auto md:rounded-full md:border md:border-white/60 md:bg-white/75 md:px-4 md:py-2">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#c3baae]" />
          <span>Available</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#ddd8d1]" />
          <span>Coming soon</span>
        </div>
      </div>
    </div>
  );
}