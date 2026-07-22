export type Continent =
  | "europe"
  | "asia"
  | "north-america";

export type PlaceStatus =
  | "home"
  | "visited"
  | "dream"
  | "wishlist";

export type Place = {
  id: string;
  name: string;
  country: string;
  continent: Continent;

  longitude: number;
  latitude: number;

  icon: string;
  image: string;

  date: string;
  description: string;
  href: string;

  status: PlaceStatus;
};

export type ProjectedPlace = Place & {
  x: number;
  y: number;
};

export type MapPosition = {
  x: number;
  y: number;
};

export type MapTransform = {
  zoom: number;
  pan: MapPosition;
};