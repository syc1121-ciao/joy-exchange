import Link from "next/link";

import AddPlaceForm from "@/components/dashboard/places/AddPlaceForm";

export default function NewPlacePage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-neutral-500">
            Places
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-neutral-900">
            Add a dream destination
          </h1>
        </div>

        <Link
          href="/dashboard/places"
          className="rounded-full border border-neutral-200 bg-white px-5 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50"
        >
          Back to Places
        </Link>
      </div>

      <AddPlaceForm />
    </div>
  );
}