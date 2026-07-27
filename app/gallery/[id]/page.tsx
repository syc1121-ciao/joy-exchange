import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type AlbumPlace = {
  id: string;
  city: string;
  country: string;
  slug: string;
};

type AlbumImage = {
  id: string;
  image_url: string;
  storage_path: string | null;
  sort_order: number;
};

type Album = {
  id: string;
  title: string;
  caption: string | null;
  taken_at: string | null;
  cover_image_url: string | null;
  place: AlbumPlace | AlbumPlace[] | null;
  images: AlbumImage[] | null;
};

export default async function GalleryAlbumPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("gallery_albums")
    .select(
      `
        id,
        title,
        caption,
        taken_at,
        cover_image_url,
        place:places (
          id,
          city,
          country,
          slug
        ),
        images:gallery_images (
          id,
          image_url,
          storage_path,
          sort_order
        )
      `,
    )
    .eq("id", id)
    .order("sort_order", {
      referencedTable: "gallery_images",
      ascending: true,
    })
    .maybeSingle();

  if (error) {
    console.error("Failed to load gallery album:", error);

    return (
      <main className="min-h-screen bg-[#faf8f5] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          無法讀取相簿：{error.message}
        </div>
      </main>
    );
  }

  if (!data) {
    notFound();
  }

  const album = data as Album;

  const place = Array.isArray(album.place)
    ? album.place[0] ?? null
    : album.place;

  const images = [...(album.images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return (
    <main className="min-h-screen bg-[#faf8f5] text-neutral-900">
      <section className="border-b border-neutral-200 px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/gallery"
            className="text-sm text-neutral-500 transition hover:text-neutral-900"
          >
            ← Back to Gallery
          </Link>

          <div className="mt-10 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.28em] text-neutral-400">
              Photo Album
            </p>

            <h1 className="mt-4 font-serif text-4xl font-medium tracking-tight sm:text-6xl">
              {album.title}
            </h1>

            {place && (
              <Link
                href={`/travel/${place.slug}`}
                className="mt-4 inline-flex text-sm font-medium text-neutral-500 transition hover:text-neutral-900"
              >
                {place.city}, {place.country} →
              </Link>
            )}

            {album.taken_at && (
              <p className="mt-3 text-sm text-neutral-400">
                {formatDate(album.taken_at)}
              </p>
            )}

            {album.caption && (
              <p className="mt-6 max-w-2xl text-base leading-8 text-neutral-600">
                {album.caption}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          {images.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-neutral-300 bg-white/60 p-12 text-center text-neutral-500">
              這個相簿目前沒有照片。
            </div>
          ) : (
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
              {images.map((image) => (
                <figure
                  key={image.id}
                  className="relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100"
                >
                  <Image
                    src={image.image_url}
                    alt={album.title}
                    width={1400}
                    height={1050}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="h-auto w-full object-cover"
                  />
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}