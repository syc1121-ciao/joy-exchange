import { redirect } from "next/navigation";

import NewGalleryForm from "@/components/dashboard/NewGalleryForm";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function NewGalleryPage() {
  const session = await requireAdmin();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const authorEmail = session.user.email
    .trim()
    .toLowerCase();

  const [placesResult, journalsResult] =
    await Promise.all([
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
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
          Gallery
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          New Image
        </h1>

        <p className="mt-3 text-sm text-neutral-500">
          上傳一張照片，記錄交換生活中的畫面。
        </p>
      </div>

      <NewGalleryForm
        places={placesResult.data ?? []}
        journals={
          journalsResult.data ?? []
        }
      />
    </div>
  );
}