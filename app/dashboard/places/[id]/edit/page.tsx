import Link from "next/link";

import EditPlaceForm from "@/components/dashboard/EditPlaceForm";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Place = {
  id: string;
  city: string;
  country: string;
  slug: string;
  continent: "asia" | "europe" | "north-america";
  latitude: number;
  longitude: number;
  description: string | null;
  status: "draft" | "published";
};

export default async function EditPlacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: place, error } =
    await supabaseAdmin
      .from("places")
      .select(
        "id, city, country, slug, continent, latitude, longitude, description, status",
      )
      .eq("id", id)
      .maybeSingle();

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-semibold">
          Edit Place
        </h1>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          無法讀取 Place：{error.message}
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-semibold">
          Place not found
        </h1>

        <Link
          href="/dashboard/places"
          className="inline-flex rounded-full border border-neutral-300 px-5 py-2.5"
        >
          Back to Places
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
          Places
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Edit {place.city}
        </h1>

        <p className="mt-3 text-sm text-neutral-500">
          更新城市資訊與發布狀態。
        </p>
      </div>

      <EditPlaceForm place={place} />
    </div>
  );
}