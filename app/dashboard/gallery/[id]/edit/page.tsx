import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import EditGalleryForm from "@/components/dashboard/EditGalleryForm";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type GalleryImage = {
  id: string;
  title: string;
  caption: string | null;
  image_url: string;
  place_id: string | null;
  journal_id: string | null;
  taken_at: string | null;
  sort_order: number;
  is_featured: boolean;
};

export default async function EditGalleryPage({
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

  const [
    imageResult,
    placesResult,
    journalsResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("gallery_images")
      .select(`
        id,
        title,
        caption,
        image_url,
        place_id,
        journal_id,
        taken_at,
        sort_order,
        is_featured
      `)
      .eq("id", id)
      .eq("author_email", authorEmail)
      .maybeSingle(),

    supabaseAdmin
      .from("places")
      .select("id, city, country")
      .eq("author_email", authorEmail)
      .order("city", {
        ascending: true,
      }),

    supabaseAdmin
      .from("journals")
      .select("id, title")
      .eq("author_email", authorEmail)
      .order("created_at", {
        ascending: false,
      }),
  ]);

  if (imageResult.error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        無法讀取圖片：
        {imageResult.error.message}
      </div>
    );
  }

  if (!imageResult.data) {
    notFound();
  }

  if (placesResult.error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        無法讀取 Places：
        {placesResult.error.message}
      </div>
    );
  }

  if (journalsResult.error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        無法讀取 Journals：
        {journalsResult.error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/dashboard/gallery/${id}`}
          className="text-sm text-neutral-500 transition hover:text-neutral-900"
        >
          ← Back to Image
        </Link>

        <p className="mt-8 text-sm uppercase tracking-[0.2em] text-neutral-500">
          Gallery
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Edit Image
        </h1>

        <p className="mt-3 text-sm text-neutral-500">
          修改照片、說明、關聯城市與排序。
        </p>
      </div>

      <EditGalleryForm
        image={
          imageResult.data as GalleryImage
        }
        places={placesResult.data ?? []}
        journals={
          journalsResult.data ?? []
        }
      />
    </div>
  );
}