import {
  getSupabaseAdmin,
} from "@/lib/supabaseAdmin";

import DestinationsMap, {
  type PublicPlace,
} from "./DestinationsMap";
// import WorldMap, {
//   type PublicPlace,
// } from "@components/world-map/WorldMap";
export const dynamic =
  "force-dynamic";

export default async function DestinationsPage() {
  const supabase =
    getSupabaseAdmin();

  const {
    data,
    error,
  } = await supabase
    .from("places")
    .select(
      `
        id,
        city,
        country,
        slug,
        description,
        image,
        icon,
        place_type,
        longitude,
        latitude
      `,
    )
    .eq(
      "status",
      "published",
    )
    .not(
      "longitude",
      "is",
      null,
    )
    .not(
      "latitude",
      "is",
      null,
    )
    .order(
      "created_at",
      {
        ascending: true,
      },
    );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  const places: PublicPlace[] =
    (data ?? []).map(
      (place) => ({
        id: place.id,
        city: place.city,
        country:
          place.country,
        slug: place.slug,
        description:
          place.description,
        image: place.image,
        icon:
          place.icon ?? "📍",
        place_type:
          place.place_type,
        longitude:
          Number(
            place.longitude,
          ),
        latitude:
          Number(
            place.latitude,
          ),
      }),
    );

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
      <header className="mb-10 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.24em] text-neutral-400">
          Joy&apos;s Exchange Adventure
        </p>

        <h1 className="mt-4 font-serif text-5xl font-semibold tracking-tight text-neutral-900 sm:text-6xl">
          Destinations
        </h1>

        <p className="mt-5 text-base leading-8 text-neutral-600">
          一張記錄夢想、願望與旅行足跡的世界地圖。
        </p>
      </header>

      {places.length > 0 ? (
        <DestinationsMap
          places={places}
        />
      ) : (
        <section className="rounded-[2rem] border border-dashed border-neutral-300 bg-white px-6 py-20 text-center">
          <div className="text-6xl">
            🌍
          </div>

          <h2 className="mt-5 text-2xl font-semibold text-neutral-900">
            The map is waiting
          </h2>

          <p className="mt-2 text-neutral-500">
            尚未新增已發布的夢想地點。
          </p>
        </section>
      )}
    </main>
  );
}