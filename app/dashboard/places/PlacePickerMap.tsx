"use client";

import { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  createCoordinates,
} from "@vnedyalk0v/react19-simple-maps";

type Coordinates = {
  longitude: number;
  latitude: number;
};

type SelectedLocation = Coordinates & {
  country: string;
};

type PlacePickerMapProps = {
  value: Coordinates | null;
  onChange: (location: SelectedLocation) => void;
};

const geographyUrl = "/maps/countries-50m.json";

export default function PlacePickerMap({
  value,
  onChange,
}: PlacePickerMapProps) {
  const [hoveredCountry, setHoveredCountry] =
    useState("");

  function handleCountryClick(
    event: React.MouseEvent<SVGPathElement>,
    countryName: string,
  ) {
    event.stopPropagation();

    const svg = event.currentTarget.ownerSVGElement;

    if (!svg) {
      return;
    }

    const rect = svg.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    /*
     * 目前是簡化的畫面座標換算。
     * 可以先用於選點，但不是精準的 Mercator 反投影。
     */
    const longitude =
      (x / rect.width) * 360 - 180;

    const latitude =
      90 - (y / rect.height) * 180;

    onChange({
      longitude: Number(
        longitude.toFixed(5),
      ),
      latitude: Number(
        latitude.toFixed(5),
      ),
      country: countryName,
    });
  }

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-[#e8edf0]">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 140,

            // 不能直接寫 [10, 20]
            center: createCoordinates(
              10,
              20,
            ),
          }}
          style={{
            width: "100%",
            height: "auto",
          }}
        >
          <Geographies
            geography={geographyUrl}
          >
            {({ geographies }) =>
              geographies.map(
                (geo, index) => {
                  const countryName =
                    String(
                      geo.properties
                        ?.name ??
                        geo.properties
                          ?.NAME ??
                        geo.properties
                          ?.ADMIN ??
                        "",
                    );

                  const geographyKey =
                    geo.id != null
                      ? String(geo.id)
                      : `${countryName}-${index}`;

                  return (
                    <Geography
                      key={geographyKey}
                      geography={geo}
                      onClick={(event) =>
                        handleCountryClick(
                          event,
                          countryName,
                        )
                      }
                      onMouseEnter={() =>
                        setHoveredCountry(
                          countryName,
                        )
                      }
                      onMouseLeave={() =>
                        setHoveredCountry(
                          "",
                        )
                      }
                      style={{
                        default: {
                          fill: "#d8dde1",
                          stroke:
                            "#ffffff",
                          strokeWidth:
                            0.4,
                          outline:
                            "none",
                        },
                        hover: {
                          fill: "#bac7d0",
                          stroke:
                            "#ffffff",
                          strokeWidth:
                            0.4,
                          outline:
                            "none",
                          cursor:
                            "pointer",
                        },
                        pressed: {
                          fill: "#9babb6",
                          stroke:
                            "#ffffff",
                          strokeWidth:
                            0.4,
                          outline:
                            "none",
                        },
                      }}
                    />
                  );
                },
              )
            }
          </Geographies>

          {value && (
            <Marker
              coordinates={createCoordinates(
                value.longitude,
                value.latitude,
              )}
            >
              <circle
                r={6}
                fill="#17324d"
                stroke="#ffffff"
                strokeWidth={2}
              />

              <circle
                r={12}
                fill="transparent"
                stroke="#17324d"
                strokeWidth={1}
                opacity={0.5}
              />
            </Marker>
          )}
        </ComposableMap>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-neutral-500">
          點擊國家選擇位置
        </p>

        {hoveredCountry && (
          <p className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700">
            {hoveredCountry}
          </p>
        )}
      </div>

      {value && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-neutral-100 p-4">
            <p className="text-xs text-neutral-500">
              Longitude
            </p>

            <p className="mt-1 font-medium">
              {value.longitude}
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-100 p-4">
            <p className="text-xs text-neutral-500">
              Latitude
            </p>

            <p className="mt-1 font-medium">
              {value.latitude}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}