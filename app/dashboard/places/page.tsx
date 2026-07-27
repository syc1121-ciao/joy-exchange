import Link from "next/link";

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import DeletePlaceButton from "@/components/dashboard/DeletePlaceButton";
export const dynamic = "force-dynamic";

type Place = {
  id: string;
  city: string;
  country: string;
  slug: string;
  description: string | null;
  status: "draft" | "published";
  created_at?: string;
};

export default async function PlacesPage() {
  const { data, error } = await supabaseAdmin
    .from("places")
    .select(
      "id, city, country, slug, description, status, created_at",
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Failed to load places:", error);

    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            Places
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Manage Places
          </h1>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          無法讀取 Places：{error.message}
        </div>
      </div>
    );
  }

  const places = (data ?? []) as Place[];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            Places
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Manage Places
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            管理城市、草稿與已發布內容。
          </p>
        </div>

        <Link
          href="/dashboard/places/new"
          className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          + New Place
        </Link>
      </div>

      {places.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center">
          <p className="text-lg font-medium">
            還沒有任何 Place
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            建立第一個城市，開始整理你的交換旅行紀錄。
          </p>

          <Link
            href="/dashboard/places/new"
            className="mt-6 inline-flex rounded-full bg-neutral-900 px-6 py-3 text-sm text-white"
          >
            Create Place
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {places.map((place) => (
            <article
              key={place.id}
              className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold">
                      {place.city}
                    </h2>

                    <span
                      className={
                        place.status === "published"
                          ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                          : "rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
                      }
                    >
                      {place.status === "published"
                        ? "Published"
                        : "Draft"}
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-neutral-500">
                    {place.country}
                  </p>

                  <p className="mt-3 text-xs text-neutral-400">
                    /travel/{place.slug}
                  </p>

                  {place.description && (
                    <p className="mt-4 line-clamp-2 max-w-2xl text-sm leading-6 text-neutral-600">
                      {place.description}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3">
  <Link
    href={`/dashboard/places/${place.id}/edit`}
    className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm"
  >
    Edit
  </Link>

  <DeletePlaceButton id={place.id} />

  <Link
    href={`/travel/${place.slug}`}
    target="_blank"
    className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm text-white"
  >
    View
  </Link>
</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
