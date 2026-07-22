import type { Continent } from "./types";

export type RegionConfig = {
  id: Continent;
  name: string;
  subtitle: string;
  icon: string;

  center: [number, number];
  scale: number;

  mapPath: string;
};

export const regions: Record<
  Continent,
  RegionConfig
> = {
  europe: {
    id: "europe",
    name: "Europe",
    subtitle:
      "Old cities, trains and new memories",
    icon: "🏰",

    center: [15, 52],
    scale: 720,

    mapPath:
      "/maps/europe-50m.json",
  },

  asia: {
    id: "asia",
    name: "Asia",
    subtitle:
      "Home and places close to my heart",
    icon: "🏮",

    center: [100, 35],
    scale: 400,

    mapPath:
      "/maps/asia-50m.json",
  },

  "north-america": {
    id: "north-america",
    name: "North America",
    subtitle:
      "Cities, road trips and wide landscapes",
    icon: "🏔️",

    center: [-100, 42],
    scale: 390,

    mapPath:
      "/maps/north-america-50m.json",
  },
};