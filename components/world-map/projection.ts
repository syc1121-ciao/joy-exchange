import { geoEqualEarth } from "d3-geo";

import type { Place, ProjectedPlace } from "./types";

export const MAP_WIDTH = 1600;
export const MAP_HEIGHT = 960;

export const MAP_SCALE = 294;

const projection = geoEqualEarth()
  .translate([MAP_WIDTH / 2, MAP_HEIGHT / 2])
  .scale(MAP_SCALE)
  .center([0, 0]);

export function projectPlace(
  place: Place,
): ProjectedPlace | null {
  const position = projection([
    place.longitude,
    place.latitude,
  ]);

  if (!position) {
    return null;
  }

  return {
    ...place,
    x: (position[0] / MAP_WIDTH) * 100,
    y: (position[1] / MAP_HEIGHT) * 100,
  };
}

export function projectPlaces(
  places: Place[],
): ProjectedPlace[] {
  return places
    .map(projectPlace)
    .filter(
      (place): place is ProjectedPlace =>
        place !== null,
    );
}