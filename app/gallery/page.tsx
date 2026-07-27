import Image from "next/image";
import Link from "next/link";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PlaceRelation =
  | {
      city: string;
      country: string;
      slug: string;
    }
  | {
      city: string;
      country: string;
      slug: string;
    }[]
  | null;

type JournalRelation =
  | {
      title: string;
      slug: string;
    }
  | {
      title: string;
      slug: string;
    }[]
  | null;

type GalleryImage = {
  id: string;
  title: string;
  caption: string | null;
  image_url: string;
  taken_at: string | null;
  sort_order: number;
  is_featured: boolean;
  created_at: string;
  place: PlaceRelation;
  journal: JournalRelation;
};

function formatDate(dateString: string | null) {
  if (!dateString) {
    return null;
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default async function PublicGalleryPage() {
  const { data, error } = await supabaseAdmin
    .from("gallery_images")
    .select(`
      id,
      title,
      caption,
      image_url,
      taken_at,
      sort_order,
      is_featured,
      created_at,
      place:places (
        city,
        country,
        slug
      ),
      journal:journals (
        title,
        slug
      )
    `)
    .order("sort_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Public Gallery query error:", error);

    return (
      <main className="min-h-screen bg-[#faf8f5] px-4 py-20 sm:px-6 md:px-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            <h1 className="text-lg font-semibold">
              無法讀取相簿
            </h1>

            <p className="mt-2 text-sm">
              {error.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const images = (data ?? []) as GalleryImage[];

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <section className="px-4 pb-24 pt-14 sm:px-6 md:px-10">
        <div className="mx-auto max-w-7xl">
          <header className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
              Gallery
            </p>

            <h1 className="mt-4 font-serif text-5xl leading-[0.95] text-slate-950 sm:text-6xl md:text-7xl">
              Photos from
              <br />
              the exchange
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-500">
              收藏旅行片段、城市風景，以及交換生活中值得記住的每一個瞬間。
            </p>
          </header>

          {images.length === 0 ? (
            <div className="mt-12 rounded-3xl border border-dashed border-neutral-300 bg-white/70 p-12 text-center">
              <p className="text-lg font-medium text-neutral-900">
                目前尚無相片
              </p>

              <p className="mt-2 text-sm text-neutral-500">
                從 Dashboard 上傳照片後，照片會自動出現在這裡。
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {images.map((image) => {
                const place = Array.isArray(image.place)
                  ? image.place[0]
                  : image.place;

                const journal = Array.isArray(image.journal)
                  ? image.journal[0]
                  : image.journal;

                const displayDate = formatDate(
                  image.taken_at ?? image.created_at,
                );

                return (
                  <article
                    key={image.id}
                    className="group overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)]"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
                      <Image
                        src={image.image_url}
                        alt={image.title}
                        fill
                        priority={image.is_featured}
                        sizes="
                          (max-width: 640px) 100vw,
                          (max-width: 1024px) 50vw,
                          (max-width: 1280px) 33vw,
                          25vw
                        "
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                      {image.is_featured && (
                        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-neutral-800 shadow-sm backdrop-blur">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-neutral-950">
                            {image.title}
                          </h2>

                          {place && (
                            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-neutral-400">
                              {place.city}, {place.country}
                            </p>
                          )}
                        </div>

                        <span className="shrink-0 text-xs text-neutral-300">
                          {String(image.sort_order).padStart(2, "0")}
                        </span>
                      </div>

                      {image.caption && (
                        <p className="mt-4 line-clamp-2 text-sm leading-6 text-neutral-600">
                          {image.caption}
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-neutral-400">
                        {displayDate && (
                          <span>{displayDate}</span>
                        )}

                        {journal && (
                          <>
                            {displayDate && (
                              <span aria-hidden="true">
                                ·
                              </span>
                            )}

                            {journal.slug ? (
                              <Link
                                href={`/journal/${journal.slug}`}
                                className="transition hover:text-neutral-900"
                              >
                                {journal.title}
                              </Link>
                            ) : (
                              <span>{journal.title}</span>
                            )}
                          </>
                        )}
                      </div>

                      {place?.slug && (
                        <div className="mt-5 border-t border-neutral-100 pt-4">
                          <Link
                            href={`/travel/${place.slug}`}
                            className="inline-flex items-center gap-2 text-sm font-medium text-neutral-800 transition hover:gap-3 hover:text-black"
                          >
                            View place
                            <span aria-hidden="true">
                              →
                            </span>
                          </Link>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}