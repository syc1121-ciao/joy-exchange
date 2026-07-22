export type Place = {
  name: string;
  country: string;
  longitude: number;
  latitude: number;
  icon: string;
  image: string;
  date: string;
  href: string;
  status: "visited" | "dream" | "home";
};

export const places: Place[] = [
  {
    name: "Taipei",
    country: "Taiwan",
    longitude: 121.5654,
    latitude: 25.033,
    icon: "🧋",
    image: "/images/cities/taipei.jpg",
    date: "My starting point",
    href: "/journal/taipei",
    status: "home",
  },
  {
    name: "Paris",
    country: "France",
    longitude: 2.3522,
    latitude: 48.8566,
    icon: "🗼",
    image: "/images/cities/paris.jpg",
    date: "Dream city",
    href: "/journal/paris",
    status: "dream",
  },
  {
    name: "Munich",
    country: "Germany",
    longitude: 11.582,
    latitude: 48.1351,
    icon: "🥨",
    image: "/images/cities/munich.jpg",
    date: "Dream city",
    href: "/journal/munich",
    status: "dream",
  },
  {
    name: "Cambridge",
    country: "United Kingdom",
    longitude: 0.1218,
    latitude: 52.2053,
    icon: "🎓",
    image: "/images/cities/cambridge.jpg",
    date: "Dream city",
    href: "/journal/cambridge",
    status: "dream",
  },
];