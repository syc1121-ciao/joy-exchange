"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type PlaceOption = {
  id: string;
  city: string;
  country: string;
};

type JournalOption = {
  id: string;
  title: string;
};

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

type EditGalleryFormProps = {
  album: GalleryAlbum;
  places: PlaceOption[];
  journals: JournalOption[];
};

type UpdateAlbumResponse = {
  success?: boolean;
  error?: string;
};

export default function EditGalleryForm({
  album,
  places,
  journals,
}: EditGalleryFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(album.title);
  const [caption, setCaption] = useState(
    album.caption ?? "",
  );
  const [placeId, setPlaceId] = useState(
    album.place_id ?? "",
  );
  const [journalId, setJournalId] = useState(
    album.journal_id ?? "",
  );
  const [takenAt, setTakenAt] = useState(
    album.taken_at
      ? album.taken_at.slice(0, 10)
      : "",
  );
  const [sortOrder, setSortOrder] = useState(
    String(album.sort_order ?? 0),
  );
  const [isFeatured, setIsFeatured] = useState(
    album.is_featured ?? false,
  );

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setErrorMessage("請輸入相簿名稱。");
      return;
    }

    const parsedSortOrder = Number.parseInt(
      sortOrder,
      10,
    );

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/gallery/albums/${encodeURIComponent(
          album.id,
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: trimmedTitle,
            caption: caption.trim() || null,
            placeId: placeId || null,
            journalId: journalId || null,
            takenAt: takenAt || null,
            sortOrder: Number.isNaN(
              parsedSortOrder,
            )
              ? 0
              : parsedSortOrder,
            isFeatured,
          }),
        },
      );

      const result =
        (await response.json()) as UpdateAlbumResponse;

      if (!response.ok) {
        throw new Error(
          result.error ?? "更新相簿失敗。",
        );
      }

      router.push(
        `/dashboard/gallery/${album.id}`,
      );
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "更新相簿失敗，請稍後再試。",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    router.push(
      `/dashboard/gallery/${album.id}`,
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8"
    >
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {album.cover_image_url ? (
        <div className="overflow-hidden rounded-3xl bg-neutral-100">
          <img
            src={album.cover_image_url}
            alt={title || "Album cover"}
            className="max-h-[500px] w-full object-contain"
          />
        </div>
      ) : (
        <div className="flex min-h-[260px] items-center justify-center rounded-3xl bg-neutral-100 px-6 text-center text-sm text-neutral-400">
          此相簿目前沒有封面圖片
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-neutral-800"
        >
          Album Title
        </label>

        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          required
          disabled={loading}
          className="w-full rounded-xl border border-neutral-300 bg-white p-3 outline-none transition focus:border-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-100"
        />
      </div>

      <div>
        <label
          htmlFor="caption"
          className="mb-2 block text-sm font-medium text-neutral-800"
        >
          Caption
        </label>

        <textarea
          id="caption"
          rows={4}
          value={caption}
          onChange={(event) =>
            setCaption(event.target.value)
          }
          disabled={loading}
          className="w-full resize-y rounded-xl border border-neutral-300 bg-white p-3 outline-none transition focus:border-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-100"
        />
      </div>

      <div>
        <label
          htmlFor="place"
          className="mb-2 block text-sm font-medium text-neutral-800"
        >
          Place
        </label>

        <select
          id="place"
          value={placeId}
          onChange={(event) =>
            setPlaceId(event.target.value)
          }
          disabled={loading}
          className="w-full rounded-xl border border-neutral-300 bg-white p-3 outline-none transition focus:border-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-100"
        >
          <option value="">
            No related place
          </option>

          {places.map((place) => (
            <option
              key={place.id}
              value={place.id}
            >
              {place.city}, {place.country}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="journal"
          className="mb-2 block text-sm font-medium text-neutral-800"
        >
          Journal
        </label>

        <select
          id="journal"
          value={journalId}
          onChange={(event) =>
            setJournalId(event.target.value)
          }
          disabled={loading}
          className="w-full rounded-xl border border-neutral-300 bg-white p-3 outline-none transition focus:border-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-100"
        >
          <option value="">
            No related journal
          </option>

          {journals.map((journal) => (
            <option
              key={journal.id}
              value={journal.id}
            >
              {journal.title}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="takenAt"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Taken Date
          </label>

          <input
            id="takenAt"
            type="date"
            value={takenAt}
            onChange={(event) =>
              setTakenAt(event.target.value)
            }
            disabled={loading}
            className="w-full rounded-xl border border-neutral-300 bg-white p-3 outline-none transition focus:border-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-100"
          />
        </div>

        <div>
          <label
            htmlFor="sortOrder"
            className="mb-2 block text-sm font-medium text-neutral-800"
          >
            Sort Order
          </label>

          <input
            id="sortOrder"
            type="number"
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(event.target.value)
            }
            disabled={loading}
            className="w-full rounded-xl border border-neutral-300 bg-white p-3 outline-none transition focus:border-neutral-500 disabled:cursor-not-allowed disabled:bg-neutral-100"
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-neutral-200 p-4">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(event) =>
            setIsFeatured(event.target.checked)
          }
          disabled={loading}
          className="h-4 w-4 disabled:cursor-not-allowed"
        />

        <div>
          <p className="font-medium text-neutral-800">
            Featured album
          </p>

          <p className="mt-1 text-sm text-neutral-500">
            將這本相簿標記為精選相簿。
          </p>
        </div>
      </label>

      <div className="flex flex-wrap gap-3 border-t border-neutral-100 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-neutral-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="rounded-full border border-neutral-300 px-8 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}