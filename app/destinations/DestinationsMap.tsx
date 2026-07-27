"use client";

import {
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import Map, {
  Marker,
  NavigationControl,
  Popup,
} from "react-map-gl/maplibre";

import "maplibre-gl/dist/maplibre-gl.css";

export type PublicPlace = {
  id: string;
  city: string;
  country: string;
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

type DestinationsMapProps = {
  places: PublicPlace[];
};

const placeTypeLabels = {
  home: "Home",
  visited: "Visited",
  dream: "Dream",
  wishlist: "Wishlist",
} as const;

export default function DestinationsMap({
  places,
}: DestinationsMapProps) {
  const [
    selectedPlace,
    setSelectedPlace,
  ] = useState<PublicPlace | null>(
    null,
  );

  const initialViewState =
    useMemo(() => {
      const home =
        places.find(
          (place) =>
            place.place_type ===
            "home",
        );

      return {
        longitude:
          home?.longitude ?? 15,
        latitude:
          home?.latitude ?? 45,
        zoom: home ? 3 : 2.5,
      };
    }, [places]);

  return (
    <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-neutral-100 shadow-sm">
      <Map
        initialViewState={
          initialViewState
        }
        mapStyle="https://demotiles.maplibre.org/style.json"
        style={{
          width: "100%",
          height: 650,
        }}
      >
        <NavigationControl
          position="top-right"
          showCompass={false}
        />

        {places.map((place) => (
          <Marker
            key={place.id}
            longitude={
              place.longitude
            }
            latitude={
              place.latitude
            }
            anchor="bottom"
            onClick={(event) => {
              event.originalEvent.stopPropagation();

              setSelectedPlace(
                place,
              );
            }}
          >
            <button
              type="button"
              aria-label={`Open ${place.city}`}
              className="group flex flex-col items-center"
            >
              <span className="mb-1 max-w-40 scale-95 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-neutral-800 opacity-0 shadow-md transition group-hover:scale-100 group-hover:opacity-100">
                {place.city}
              </span>

              <span className="text-4xl leading-none drop-shadow-lg transition group-hover:-translate-y-1 group-hover:scale-110">
                {place.icon}
              </span>
            </button>
          </Marker>
        ))}

        {selectedPlace && (
          <Popup
            longitude={
              selectedPlace.longitude
            }
            latitude={
              selectedPlace.latitude
            }
            anchor="bottom"
            offset={48}
            closeOnClick={false}
            onClose={() =>
              setSelectedPlace(
                null,
              )
            }
            maxWidth="320px"
          >
            <div className="w-64 overflow-hidden rounded-xl bg-white">
              {selectedPlace.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={
                    selectedPlace.image
                  }
                  alt={
                    selectedPlace.city
                  }
                  className="h-32 w-full object-cover"
                />
              )}

              <div className="p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-neutral-400">
                  {
                    placeTypeLabels[
                      selectedPlace
                        .place_type
                    ]
                  }
                </p>

                <h2 className="mt-1 text-xl font-semibold text-neutral-900">
                  {
                    selectedPlace.icon
                  }{" "}
                  {
                    selectedPlace.city
                  }
                </h2>

                <p className="mt-1 text-sm text-neutral-500">
                  {
                    selectedPlace.country
                  }
                </p>

                {selectedPlace.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">
                    {
                      selectedPlace.description
                    }
                  </p>
                )}

                <Link
                  href={`/destinations/${selectedPlace.slug}`}
                  className="mt-4 inline-flex text-sm font-medium text-[#17324d]"
                >
                  View destination →
                </Link>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}