import Link from "next/link";

import { requireAdmin } from "@/lib/requireAdmin";

import AddPlaceForm from "./AddPlaceForm";

export default async function NewPlacePage() {
  await requireAdmin();

  return (
    <main className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
            Destinations
          </p>

          <h1 className="mt-2 text-4xl font-semibold text-neutral-900">
            Add a dream place
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-neutral-500">
            搜尋城市或直接點擊地圖，自動取得城市、國家與座標。
          </p>
        </div>

        <Link
          href="/dashboard/places"
          className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-100"
        >
          Back to places
        </Link>
      </header>

      <AddPlaceForm />
    </main>
  );
}