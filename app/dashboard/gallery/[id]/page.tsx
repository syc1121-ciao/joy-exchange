import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import DeleteGalleryButton from "@/components/dashboard/DeleteGalleryButton";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type GalleryImage = {
  id: string;
  title: string;
  caption: string | null;
  image_url: string;
  storage_path: string;
  taken_at: string | null;
  sort_order: number;
  is_featured: boolean;
  created_at: string;
  place:
    | {
        city: string;
        country: string;
      }
    | {
        city: string;
        country: string;
      }[]
    | null;
  journal:
    | {
        id: string;
        title: string;
      }
    | {
        id: string;
        title: string;
      }[]
    | null;
};

export default async function GalleryViewPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const session = await requireAdmin();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { id } = await params;

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
      storage_path,
      taken_at,
      sort_order,
      is_featured,
      created_at,
      place:places (
        city,
        country
      ),
      journal:journals (
        id,
        title
      )
    `)
    .eq("id", id)
    .eq("author_email", authorEmail)
    .maybeSingle();

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        無法讀取圖片：{error.message}
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const image = data as GalleryImage;

  const place = Array.isArray(image.place)
    ? image.place[0]
    : image.place;

  const journal = Array.isArray(
    image.journal,
  )
    ? image.journal[0]
    : image.journal;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/gallery"
          className="text-sm text-neutral-500 transition hover:text-neutral-900"
        >
          ← Back to Gallery
        </Link>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/dashboard/gallery/${image.id}/edit`}
            className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm text-white"
          >
            Edit
          </Link>

          <DeleteGalleryButton
            imageId={image.id}
            imageTitle={image.title}
            redirectAfterDelete
          />
        </div>
      </div>

      <article className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-sm">
        <div className="bg-neutral-100">
          <img
            src={image.image_url}
            alt={image.title}
            className="max-h-[75vh] w-full object-contain"
          />
        </div>

        <div className="p-7 sm:p-10">
          <div className="flex flex-wrap gap-2">
            {image.is_featured && (
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs text-violet-700">
                Featured
              </span>
            )}

            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600">
              Sort order {image.sort_order}
            </span>
          </div>

          <h1 className="mt-6 font-serif text-4xl font-medium sm:text-5xl">
            {image.title}
          </h1>

          {place && (
            <p className="mt-4 text-neutral-500">
              {place.city}, {place.country}
            </p>
          )}

          {image.taken_at && (
            <p className="mt-1 text-sm text-neutral-400">
              Taken on {image.taken_at}
            </p>
          )}

          {image.caption && (
            <p className="mt-8 whitespace-pre-wrap text-base leading-8 text-neutral-700">
              {image.caption}
            </p>
          )}

          {journal && (
            <div className="mt-8 border-t border-neutral-100 pt-6">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                Related Journal
              </p>

              <Link
                href={`/dashboard/journal/${journal.id}`}
                className="mt-3 inline-block font-medium underline underline-offset-4"
              >
                {journal.title}
              </Link>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}