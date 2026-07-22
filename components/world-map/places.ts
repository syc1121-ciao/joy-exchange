import type { Place } from "./types";

export const places: Place[] = [
  {
    id: "taipei",
    name: "Taipei",
    country: "Taiwan",
    continent: "asia",

    longitude: 121.5654,
    latitude: 25.033,

    icon: "🏠",
    image: "/images/cities/taipei.jpg",
    date: "Home",
    description: "Where the journey begins.",
    href: "/travel/taipei",
    status: "home",
  },
  {
    id: "munich",
    name: "Munich",
    country: "Germany",
    continent: "europe",

    longitude: 11.582,
    latitude: 48.1351,

    icon: "🥨",
    image: "/images/cities/munich.jpg",
    date: "Dream destination",
    description: "A new chapter in Germany.",
    href: "/travel/munich",
    status: "dream",
  },
  {
    id: "paris",
    name: "Paris",
    country: "France",
    continent: "europe",

    longitude: 2.3522,
    latitude: 48.8566,

    icon: "🥐",
    image: "/images/cities/paris.jpg",
    date: "Wishlist",
    description: "Art, cafés and slow afternoons.",
    href: "/travel/paris",
    status: "wishlist",
  },
];
