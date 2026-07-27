"use client";

import {
  FormEvent,
  useState,
} from "react";
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

type EditGalleryFormProps = {
  image: GalleryImage;
  places: PlaceOption[];
  journals: JournalOption[];
};

export default function EditGalleryForm({
  image,
  places,
  journals,
}: EditGalleryFormProps) {
  const router = useRouter();

  const [newImage, setNewImage] =
    useState<File | null>(null);
  const [previewUrl, setPreviewUrl] =
    useState(image.image_url);
  const [title, setTitle] = useState(
    image.title,
  );
  const [caption, setCaption] = useState(
    image.caption ?? "",
  );
  const [placeId, setPlaceId] = useState(
    image.place_id ?? "",
  );
  const [journalId, setJournalId] =
    useState(image.journal_id ?? "");
  const [takenAt, setTakenAt] = useState(
    image.taken_at ?? "",
  );
  const [sortOrder, setSortOrder] =
    useState(String(image.sort_order));
  const [isFeatured, setIsFeatured] =
    useState(image.is_featured);

  const [loading, setLoading] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  function handleImageChange(
    file: File | null,
  ) {
    setNewImage(file);

    if (file) {
      setPreviewUrl(
        URL.createObjectURL(file),
      );
    } else {
      setPreviewUrl(image.image_url);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();

      formData.append("id", image.id);
      formData.append("title", title);
      formData.append("caption", caption);
      formData.append("placeId", placeId);
      formData.append(
        "journalId",
        journalId,
      );
      formData.append("takenAt", takenAt);
      formData.append(
        "sortOrder",
        sortOrder,
      );
      formData.append(
        "isFeatured",
        String(isFeatured),
      );

      if (newImage) {
        formData.append("image", newImage);
      }

      const response = await fetch(
        "/api/gallery",
        {
          method: "PATCH",
          body: formData,
        },
      );

      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error ?? "更新失敗。",
        );
      }

      router.push(
        `/dashboard/gallery/${image.id}`,
      );
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "更新失敗，請稍後再試。",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm"
    >
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl bg-neutral-100">
        <img
          src={previewUrl}
          alt={title}
          className="max-h-[500px] w-full object-contain"
        />
      </div>

      <div>
        <label
          htmlFor="image"
          className="mb-2 block font-medium"
        >
          Replace Image
        </label>

        <input
          id="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) =>
            handleImageChange(
              event.target.files?.[0] ??
                null,
            )
          }
          className="w-full rounded-xl border border-neutral-300 p-3"
        />

        <p className="mt-2 text-sm text-neutral-500">
          不選擇新檔案就會保留目前圖片。
        </p>
      </div>

      <div>
        <label
          htmlFor="title"
          className="mb-2 block font-medium"
        >
          Title
        </label>

        <input
          id="title"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          required
          className="w-full rounded-xl border border-neutral-300 p-3"
        />
      </div>

      <div>
        <label
          htmlFor="caption"
          className="mb-2 block font-medium"
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
          className="w-full rounded-xl border border-neutral-300 p-3"
        />
      </div>

      <div>
        <label
          htmlFor="place"
          className="mb-2 block font-medium"
        >
          Place
        </label>

        <select
          id="place"
          value={placeId}
          onChange={(event) =>
            setPlaceId(event.target.value)
          }
          className="w-full rounded-xl border border-neutral-300 bg-white p-3"
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
          className="mb-2 block font-medium"
        >
          Journal
        </label>

        <select
          id="journal"
          value={journalId}
          onChange={(event) =>
            setJournalId(event.target.value)
          }
          className="w-full rounded-xl border border-neutral-300 bg-white p-3"
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
            className="mb-2 block font-medium"
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
            className="w-full rounded-xl border border-neutral-300 p-3"
          />
        </div>

        <div>
          <label
            htmlFor="sortOrder"
            className="mb-2 block font-medium"
          >
            Sort Order
          </label>

          <input
            id="sortOrder"
            type="number"
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(
                event.target.value,
              )
            }
            className="w-full rounded-xl border border-neutral-300 p-3"
          />
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 p-4">
        <input
          type="checkbox"
          checked={isFeatured}
          onChange={(event) =>
            setIsFeatured(
              event.target.checked,
            )
          }
          className="h-4 w-4"
        />

        <span className="font-medium">
          Featured image
        </span>
      </label>

      <div className="flex flex-wrap gap-3 border-t border-neutral-100 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-neutral-900 px-8 py-3 text-white disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() =>
            router.push(
              `/dashboard/gallery/${image.id}`,
            )
          }
          className="rounded-full border border-neutral-300 px-8 py-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}