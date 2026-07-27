"use client";

import {
  useRef,
  useState,
} from "react";

import Map, {
  Marker,
  NavigationControl,
  type MapLayerMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

export type SelectedLocation = {
  city: string;
  country: string;
  longitude: number;
  latitude: number;
  displayName?: string;
};

type SearchResult = {
  id: string;
  city: string;
  country: string;
  displayName: string;
  longitude: number;
  latitude: number;
  type: string;
};

type PlacePickerMapProps = {
  value: SelectedLocation | null;
  onChange: (
    location: SelectedLocation,
  ) => void;
};

type ApiError = {
  error?: string;
};

type SearchResponse = {
  results?: SearchResult[];
  error?: string;
};

type ReverseResponse = {
  location?: SelectedLocation;
  error?: string;
};

const initialViewState = {
  longitude: 10,
  latitude: 47,
  zoom: 3.3,
};

async function readJsonSafely<T>(
  response: Response,
): Promise<T> {
  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  if (
    !contentType.includes(
      "application/json",
    )
  ) {
    const text =
      await response.text();

    throw new Error(
      text ||
        `Request failed (${response.status})`,
    );
  }

  return response.json() as Promise<T>;
}

export default function PlacePickerMap({
  value,
  onChange,
}: PlacePickerMapProps) {
  const mapRef =
    useRef<MapRef | null>(null);

  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState<SearchResult[]>([]);

  const [isSearching, setIsSearching] =
    useState(false);

  const [isLocating, setIsLocating] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSearch() {
    const trimmedQuery =
      query.trim();

    if (trimmedQuery.length < 2) {
      setError(
        "請至少輸入兩個字元。",
      );

      return;
    }

    try {
      setIsSearching(true);
      setError("");
      setResults([]);

      const response =
        await fetch(
          `/api/geocode?q=${encodeURIComponent(
            trimmedQuery,
          )}`,
        );

      const data =
        await readJsonSafely<SearchResponse>(
          response,
        );

      if (!response.ok) {
        throw new Error(
          data.error ??
            "搜尋地點失敗。",
        );
      }

      setResults(
        data.results ?? [],
      );

      if (
        !data.results ||
        data.results.length === 0
      ) {
        setError(
          "找不到符合的城市。",
        );
      }
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : "搜尋地點失敗。",
      );
    } finally {
      setIsSearching(false);
    }
  }

  function selectResult(
    result: SearchResult,
  ) {
    const location: SelectedLocation =
      {
        city: result.city,
        country: result.country,
        longitude:
          result.longitude,
        latitude:
          result.latitude,
        displayName:
          result.displayName,
      };

    onChange(location);
    setResults([]);
    setQuery(
      `${result.city}, ${result.country}`,
    );
    setError("");

    mapRef.current?.flyTo({
      center: [
        result.longitude,
        result.latitude,
      ],
      zoom: 10,
      duration: 1600,
    });
  }

  async function handleMapClick(
    event: MapLayerMouseEvent,
  ) {
    const longitude =
      event.lngLat.lng;

    const latitude =
      event.lngLat.lat;

    try {
      setIsLocating(true);
      setError("");
      setResults([]);

      const response =
        await fetch(
          `/api/geocode?lat=${encodeURIComponent(
            latitude,
          )}&lon=${encodeURIComponent(
            longitude,
          )}`,
        );

      const data =
        await readJsonSafely<ReverseResponse>(
          response,
        );

      if (!response.ok) {
        throw new Error(
          data.error ??
            "無法辨識這個位置。",
        );
      }

      const location =
        data.location;

      if (!location) {
        throw new Error(
          "無法辨識這個位置。",
        );
      }

      onChange({
        city:
          location.city ||
          "Unknown place",
        country:
          location.country ||
          "Unknown country",
        longitude,
        latitude,
        displayName:
          location.displayName,
      });

      setQuery(
        [
          location.city,
          location.country,
        ]
          .filter(Boolean)
          .join(", "),
      );
    } catch (clickError) {
      setError(
        clickError instanceof Error
          ? clickError.message
          : "無法辨識這個位置。",
      );

      onChange({
        city: "",
        country: "",
        longitude,
        latitude,
      });
    } finally {
      setIsLocating(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative z-20">
        <div className="flex gap-3">
          <input
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value,
              )
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter"
              ) {
                event.preventDefault();
                void handleSearch();
              }
            }}
            placeholder="Search Munich, Paris, Prague..."
            className="min-w-0 flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-[#17324d]"
          />

          <button
            type="button"
            disabled={isSearching}
            onClick={() =>
              void handleSearch()
            }
            className="rounded-2xl bg-[#17324d] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#244666] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSearching
              ? "Searching..."
              : "Search"}
          </button>
        </div>

        {results.length > 0 && (
          <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] max-h-80 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl">
            {results.map(
              (result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() =>
                    selectResult(
                      result,
                    )
                  }
                  className="block w-full rounded-xl px-4 py-3 text-left transition hover:bg-neutral-100"
                >
                  <span className="block font-medium text-neutral-900">
                    {result.city ||
                      result.displayName}
                  </span>

                  <span className="mt-1 block text-sm text-neutral-500">
                    {result.displayName}
                  </span>
                </button>
              ),
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="relative overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-100">
        <Map
          ref={mapRef}
          initialViewState={
            initialViewState
          }
          mapStyle="https://demotiles.maplibre.org/style.json"
          style={{
            width: "100%",
            height: 520,
          }}
          cursor="crosshair"
          onClick={(event) =>
            void handleMapClick(event)
          }
        >
          <NavigationControl
            position="top-right"
            showCompass={false}
          />

          {value && (
            <Marker
              longitude={
                value.longitude
              }
              latitude={
                value.latitude
              }
              anchor="bottom"
            >
              <div className="flex -translate-y-1 flex-col items-center">
                <div className="rounded-full bg-[#17324d] px-3 py-1.5 text-xs font-medium text-white shadow-lg">
                  {value.city ||
                    "Selected place"}
                </div>

                <div className="text-4xl leading-none drop-shadow-lg">
                  📍
                </div>
              </div>
            </Marker>
          )}
        </Map>

        {isLocating && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/55 backdrop-blur-[2px]">
            <div className="rounded-full bg-white px-5 py-3 text-sm font-medium text-neutral-700 shadow-lg">
              Finding location...
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-neutral-500">
        <p>
          搜尋城市，或直接點擊地圖選擇位置。
        </p>

        <p>
          Map data © OpenStreetMap contributors
        </p>
      </div>
    </div>
  );
}