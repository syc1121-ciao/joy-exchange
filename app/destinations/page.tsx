import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

import WorldMap, {
  type PublicPlace,
} from "@/components/world-map/WorldMap";

export const dynamic = "force-dynamic";

export default async function DestinationsPage() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("places")
    .select(
      `
        id,
        city,
        country,
        continent,
        slug,
        description,
        image,
        icon,
        place_type,
        longitude,
        latitude
      `,
    )
    .eq("status", "published")
    .not("continent", "is", null)
    .not("longitude", "is", null)
    .not("latitude", "is", null)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const places: PublicPlace[] = (data ?? [])
    .map((place) => ({
      id: String(place.id),

      city: String(place.city ?? ""),
      country: String(place.country ?? ""),
      continent: String(place.continent ?? ""),

      slug: String(place.slug ?? ""),

      description:
        typeof place.description === "string"
          ? place.description
          : null,

      image:
        typeof place.image === "string"
          ? place.image
          : null,

      icon:
        typeof place.icon === "string" && place.icon
          ? place.icon
          : "📍",

      place_type:
        place.place_type === "home" ||
        place.place_type === "visited" ||
        place.place_type === "dream" ||
        place.place_type === "wishlist"
          ? place.place_type
          : "wishlist",

      longitude: Number(place.longitude),
      latitude: Number(place.latitude),
    }))
    .filter(
      (place) =>
        place.city &&
        place.country &&
        place.slug &&
        Number.isFinite(place.longitude) &&
        Number.isFinite(place.latitude),
    );

  return (
    <main className="min-h-screen bg-[#f7f5f2]">
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pb-14 sm:pt-16 lg:px-10 lg:pt-20">
        <header className="mx-auto mb-8 max-w-3xl text-center sm:mb-12">
          <p className="text-xs uppercase tracking-[0.24em] text-neutral-400 sm:text-sm">
            Joy&apos;s Exchange Adventure
          </p>

          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight text-neutral-900 sm:mt-4 sm:text-5xl lg:text-6xl">
            Destinations
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-neutral-600 sm:mt-5 sm:text-base sm:leading-8">
            選擇一個大洲，探索我的旅行足跡、交換生活與夢想清單。
          </p>
        </header>

        {places.length > 0 ? (
          <WorldMap places={places} />
        ) : (
          <section className="rounded-[1.75rem] border border-dashed border-neutral-300 bg-white px-6 py-16 text-center sm:rounded-[2rem] sm:py-20">
            <div className="text-5xl sm:text-6xl">
              🌍
            </div>

            <h2 className="mt-5 text-xl font-semibold text-neutral-900 sm:text-2xl">
              The map is waiting
            </h2>

            <p className="mt-2 text-sm text-neutral-500 sm:text-base">
              尚未新增已發布的旅行地點。
            </p>
          </section>
        )}
      </section>
    </main>
  );
}