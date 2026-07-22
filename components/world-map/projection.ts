import { geoEqualEarth } from "d3-geo";

import type {
  Place,
  ProjectedPlace,
} from "./types";

import type { RegionConfig } from "./regions";

export const MAP_WIDTH = 1600;
export const MAP_HEIGHT = 960;

export function projectPlace(
  place: Place,
  region: RegionConfig,
): ProjectedPlace | null {
  const projection = geoEqualEarth()
    .translate([
      MAP_WIDTH / 2,
      MAP_HEIGHT / 2,
    ])
    .scale(region.scale)
    .center(region.center);

  const position = projection([
    place.longitude,
    place.latitude,
  ]);

  if (!position) {
    return null;
  }

  return {
    ...place,
    x:
      (position[0] / MAP_WIDTH) *
      100,

    y:
      (position[1] / MAP_HEIGHT) *
      100,
  };
}

export function projectPlaces(
  allPlaces: Place[],
  region: RegionConfig,
): ProjectedPlace[] {
  return allPlaces
    .filter(
      (place) =>
        place.continent === region.id,
    )
    .map((place) =>
      projectPlace(place, region),
    )
    .filter(
      (
        place,
      ): place is ProjectedPlace =>
        place !== null,
    );
}