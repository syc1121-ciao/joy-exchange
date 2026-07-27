import Link from "next/link";
import {
  notFound,
} from "next/navigation";

import {
  getSupabaseAdmin,
} from "@/lib/supabaseAdmin";

type DestinationPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const typeLabels = {
  home: "Home",
  visited: "Visited",
  dream: "Dream",
  wishlist: "Wishlist",
} as const;

export default async function DestinationPage({
  params,
}: DestinationPageProps) {
  const { slug } =
    await params;

  const supabase =
    getSupabaseAdmin();

  const {
    data: place,
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
        status,
        place_type,
        longitude,
        latitude
      `,
    )
    .eq("slug", slug)
    .eq(
      "status",
      "published",
    )
    .maybeSingle();

  if (error) {
    throw new Error(
      error.message,
    );
  }

  if (!place) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-16 sm:px-8">
      <Link
        href="/destinations"
        className="text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
      >
        ← Back to destinations
      </Link>

      <article className="mt-8 overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
        <div className="relative h-[420px] bg-gradient-to-br from-[#dce6eb] to-[#f3ede5]">
          {place.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={place.image}
              alt={place.city}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-8xl">
              {place.icon}
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-8 text-white sm:p-12">
            <p className="text-sm uppercase tracking-[0.2em] text-white/75">
              {
                typeLabels[
                  place.place_type as keyof typeof typeLabels
                ]
              }
            </p>

            <h1 className="mt-3 font-serif text-5xl font-semibold sm:text-6xl">
              {place.icon}{" "}
              {place.city}
            </h1>

            <p className="mt-3 text-lg text-white/80">
              {place.country}
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-12">
          {place.description ? (
            <p className="max-w-3xl text-lg leading-9 text-neutral-700">
              {place.description}
            </p>
          ) : (
            <p className="text-neutral-500">
              No description yet.
            </p>
          )}

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-neutral-100 p-5">
              <p className="text-xs uppercase tracking-wider text-neutral-400">
                Latitude
              </p>

              <p className="mt-2 font-medium text-neutral-800">
                {place.latitude}
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-100 p-5">
              <p className="text-xs uppercase tracking-wider text-neutral-400">
                Longitude
              </p>

              <p className="mt-2 font-medium text-neutral-800">
                {place.longitude}
              </p>
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}