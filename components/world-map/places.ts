import type { Place } from "./types";

export const places: Place[] = [
  {
    id: "taipei",
    name: "Taipei",
    country: "Taiwan",

    longitude: 121.5654,
    latitude: 25.033,

    icon: "🧋",
    image: "/images/cities/taipei.jpg",

    date: "My starting point",
    description: "The beginning of every adventure.",
    href: "/journal/taipei",

    status: "home",
  },

  {
    id: "munich",
    name: "Munich",
    country: "Germany",

    longitude: 11.582,
    latitude: 48.1351,

    icon: "🥨",
    image: "/images/cities/munich.jpg",

    date: "Exchange destination",
    description: "A new chapter in Germany.",
    href: "/journal/munich",

    status: "dream",
  },

  {
    id: "paris",
    name: "Paris",
    country: "France",

    longitude: 2.3522,
    latitude: 48.8566,

    icon: "🗼",
    image: "/images/cities/paris.jpg",

    date: "Dream destination",
    description: "Collecting moments along the Seine.",
    href: "/journal/paris",

    status: "wishlist",
  },

  {
    id: "prague",
    name: "Prague",
    country: "Czech Republic",

    longitude: 14.4378,
    latitude: 50.0755,

    icon: "🏰",
    image: "/images/cities/prague.jpg",

    date: "Dream destination",
    description: "A fairytale city waiting to be explored.",
    href: "/journal/prague",

    status: "wishlist",
  },

  {
    id: "vienna",
    name: "Vienna",
    country: "Austria",

    longitude: 16.3738,
    latitude: 48.2082,

    icon: "🎻",
    image: "/images/cities/vienna.jpg",

    date: "Dream destination",
    description: "Music, cafés and elegant streets.",
    href: "/journal/vienna",

    status: "wishlist",
  },
];