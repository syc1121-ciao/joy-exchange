import Link from "next/link";
import { notFound } from "next/navigation";

import EditGalleryForm from "@/components/dashboard/EditGalleryForm";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type GalleryAlbum = {
  id: string;
  title: string;
  caption: string | null;
  cover_image_url: string | null;
  cover_storage_path: string | null;
  place_id: string | null;
  journal_id: string | null;
  taken_at: string | null;
  sort_order: number;
  is_featured: boolean;
};

type PlaceOption = {
  id: string;
  city: string;
  country: string;
};

type JournalOption = {
  id: string;
  title: string;
};

export default async function EditGalleryAlbumPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const [
    albumResult,
    placesResult,
    journalsResult,
  ] = await Promise.all([
    supabase
      .from("gallery_albums")
      .select(
        `
          id,
          title,
          caption,
          cover_image_url,
          cover_storage_path,
          place_id,
          journal_id,
          taken_at,
          sort_order,
          is_featured
        `,
      )
      .eq("id", id)
      .maybeSingle(),

    supabase
      .from("places")
      .select("id, city, country")
      .order("country", {
        ascending: true,
      })
      .order("city", {
        ascending: true,
      }),

    supabase
      .from("journals")
      .select("id, title")
      .order("created_at", {
        ascending: false,
      }),
  ]);

  if (albumResult.error) {
    console.error(
      "Failed to load album:",
      albumResult.error,
    );

    return (
      <main className="min-h-screen bg-[#faf8f5] px-5 py-16 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/dashboard/gallery"
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← Back to Gallery
          </Link>

          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            無法讀取相簿：
            {albumResult.error.message}
          </div>
        </div>
      </main>
    );
  }

  if (!albumResult.data) {
    notFound();
  }

  const album =
    albumResult.data as GalleryAlbum;

  const places =
    (placesResult.data ??
      []) as PlaceOption[];

  const journals =
    (journalsResult.data ??
      []) as JournalOption[];

  return (
    <main className="min-h-screen bg-[#faf8f5] px-5 py-14 text-neutral-900 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <Link
            href={`/dashboard/gallery/${album.id}`}
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            ← Back to Album
          </Link>

          <p className="mt-10 text-xs uppercase tracking-[0.28em] text-neutral-400">
            Dashboard Gallery
          </p>

          <h1 className="mt-4 font-serif text-4xl font-medium sm:text-5xl">
            Edit Album
          </h1>

          <p className="mt-3 text-neutral-500">
            修改「{album.title}」的相簿資訊。
          </p>
        </div>

        <EditGalleryForm
          album={album}
          places={places}
          journals={journals}
        />
      </div>
    </main>
  );
}