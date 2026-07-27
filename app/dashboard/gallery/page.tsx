import Link from "next/link";
import { redirect } from "next/navigation";

import DeleteGalleryButton from "@/components/dashboard/DeleteGalleryButton";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type PlaceRelation =
  | {
      city: string;
      country: string;
    }
  | {
      city: string;
      country: string;
    }[]
  | null;

type JournalRelation =
  | {
      title: string;
    }
  | {
      title: string;
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

export default async function GalleryPage() {
  const session = await requireAdmin();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const authorEmail = session.user.email
    .trim()
    .toLowerCase();

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
        country
      ),
      journal:journals (
        title
      )
    `)
    .eq("author_email", authorEmail)
    .order("sort_order", {
      ascending: true,
    })
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        無法讀取 Gallery：{error.message}
      </div>
    );
  }

  const images =
    (data ?? []) as GalleryImage[];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            Gallery
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Manage Gallery
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            管理旅行照片、城市回憶與首頁精選圖片。
          </p>
        </div>

        <Link
          href="/dashboard/gallery/new"
          className="inline-flex w-fit rounded-full bg-neutral-900 px-6 py-3 text-sm text-white transition hover:bg-neutral-700"
        >
          + New Image
        </Link>
      </div>

      {images.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center">
          <p className="text-lg font-medium">
            還沒有任何照片
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            上傳第一張照片，開始建立你的交換相簿。
          </p>

          <Link
            href="/dashboard/gallery/new"
            className="mt-6 inline-flex rounded-full bg-neutral-900 px-6 py-3 text-sm text-white"
          >
            Upload Image
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((image) => {
            const place = Array.isArray(
              image.place,
            )
              ? image.place[0]
              : image.place;

            const journal = Array.isArray(
              image.journal,
            )
              ? image.journal[0]
              : image.journal;

            return (
              <article
                key={image.id}
                className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm"
              >
                <div className="aspect-[4/3] overflow-hidden bg-neutral-100">
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {image.is_featured && (
                      <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                        Featured
                      </span>
                    )}

                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
                      Order {image.sort_order}
                    </span>
                  </div>

                  <h2 className="mt-4 text-xl font-semibold">
                    {image.title}
                  </h2>

                  {place && (
                    <p className="mt-2 text-sm text-neutral-500">
                      {place.city},{" "}
                      {place.country}
                    </p>
                  )}

                  {journal && (
                    <p className="mt-1 text-sm text-neutral-400">
                      Journal: {journal.title}
                    </p>
                  )}

                  {image.caption && (
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">
                      {image.caption}
                    </p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/dashboard/gallery/${image.id}`}
                      className="rounded-full border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-50"
                    >
                      View
                    </Link>

                    <Link
                      href={`/dashboard/gallery/${image.id}/edit`}
                      className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white transition hover:bg-neutral-700"
                    >
                      Edit
                    </Link>

                    <DeleteGalleryButton
                      imageId={image.id}
                      imageTitle={image.title}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}