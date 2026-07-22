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

const continentLabels: Partial<
  Record<ContinentName, string>
> = {
  Europe: "Europe",
  Asia: "Asia",
  "North America": "North America",
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

  const [hoveredContinent, setHoveredContinent] =
    useState<ContinentName | null>(null);

  useEffect(() => {
    const controller = new AbortController();

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
    <div className="relative overflow-hidden rounded-[2rem] border border-black/5 bg-[#eeeae4]">
      <div className="pointer-events-none absolute left-5 top-5 z-20 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs text-slate-600 backdrop-blur-md">
        Select an available continent
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="rounded-full bg-white/85 px-5 py-3 text-sm text-slate-500 shadow-sm backdrop-blur-md">
            Loading continents…
          </div>
        </div>
      )}

      {error && (
        <div className="flex aspect-[5/3] items-center justify-center px-6">
          <div className="rounded-3xl bg-white/85 p-6 text-center shadow-sm">
            <p className="font-medium text-slate-800">
              Map unavailable
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>
          </div>
        </div>
      )}

      {geoData && !error && (
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{
            scale: 147,
            center: createCoordinates(0, 0),
          }}
          width={800}
          height={480}
          className="block h-auto w-full"
        >
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo, index) => {
                const properties =
                  geo.properties as Record<
                    string,
                    unknown
                  >;

                const continentName =
                  getContinentName(properties);

                const regionId = continentName
                  ? selectableContinents[
                      continentName
                    ]
                  : undefined;

                const isSelectable =
                  Boolean(regionId);

                const isHovered =
                  hoveredContinent ===
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
                        ? isSelectable
                          ? `Explore ${continentName}`
                          : `${continentName} is not available yet`
                        : undefined
                    }
                    fill={
                      isSelectable
                        ? isHovered
                          ? "#a79e92"
                          : "#c9c2b8"
                        : "#ded9d2"
                    }
                    stroke="#f7f5f2"
                    strokeWidth={1.5}
                    className={
                      isSelectable
                        ? "cursor-pointer outline-none transition-colors"
                        : "cursor-not-allowed outline-none"
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
                        setHoveredContinent(
                          continentName,
                        );
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredContinent(
                        null,
                      );
                    }}
                    onClick={() => {
                      if (regionId) {
                        onSelect(regionId);
                      }
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
              })
            }
          </Geographies>
        </ComposableMap>
      )}

      {hoveredContinent && (
        <div className="pointer-events-none absolute bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-full border border-white/70 bg-slate-900/90 px-5 py-3 text-sm text-white shadow-lg backdrop-blur-md">
          <span className="font-medium">
            {hoveredContinent}
          </span>

          <span className="ml-2 text-white/60">
            {continentLabels[
              hoveredContinent
            ]}
          </span>
        </div>
      )}

      <div className="pointer-events-none absolute bottom-5 right-5 z-20 flex items-center gap-4 rounded-full border border-white/60 bg-white/75 px-4 py-2 text-xs text-slate-600 backdrop-blur-md">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#c9c2b8]" />
          Available
        </span>

        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ded9d2]" />
          Coming soon
        </span>
      </div>
    </div>
  );
}