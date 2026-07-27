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

type NewGalleryFormProps = {
  places: PlaceOption[];
  journals: JournalOption[];
};

export default function NewGalleryForm({
  places,
  journals,
}: NewGalleryFormProps) {
  const router = useRouter();

  const [images, setImages] =
    useState<File[]>([]);
  const [albumTitle, setAlbumTitle] =
    useState("");
  const [albumCaption, setAlbumCaption] =
    useState("");
  const [placeId, setPlaceId] =
    useState("");
  const [journalId, setJournalId] =
    useState("");
  const [takenAt, setTakenAt] =
    useState("");
  const [sortOrder, setSortOrder] =
    useState("0");
  const [isFeatured, setIsFeatured] =
    useState(false);

  const [previewUrls, setPreviewUrls] =
    useState<string[]>([]);
  const [loading, setLoading] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  function handleImageChange(
    files: FileList | null,
  ) {
    const nextFiles = Array.from(files ?? []);

    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    setImages(nextFiles);
    setPreviewUrls(
      nextFiles.map((file) => URL.createObjectURL(file)),
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (images.length === 0) {
      setErrorMessage("請至少選擇一張圖片。" );
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();

      formData.append("albumTitle", albumTitle);
      formData.append("albumCaption", albumCaption);
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

      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch(
        "/api/gallery",
        {
          method: "POST",
          body: formData,
        },
      );

      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error ?? "上傳失敗。",
        );
      }

      router.push("/dashboard/gallery");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "上傳失敗，請稍後再試。",
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

      <div>
        <label
          htmlFor="image"
          className="mb-2 block font-medium"
        >
          Images
        </label>

        <input
          id="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          required
          onChange={(event) =>
            handleImageChange(
              event.target.files,
            )
          }
          className="w-full rounded-xl border border-neutral-300 p-3"
        />

        <p className="mt-2 text-sm text-neutral-500">
          可一次選多張 JPG、PNG、WebP 或 GIF，單張最大 10 MB。
        </p>
      </div>

      {previewUrls.length > 0 && (
        <div className="overflow-hidden rounded-3xl bg-neutral-100 p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {previewUrls.map((url, index) => (
              <img
                key={url}
                src={url}
                alt={`Preview ${index + 1}`}
                className="h-40 w-full rounded-2xl object-cover"
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="albumTitle"
          className="mb-2 block font-medium"
        >
          Album Title
        </label>

        <input
          id="albumTitle"
          value={albumTitle}
          onChange={(event) =>
            setAlbumTitle(event.target.value)
          }
          required
          placeholder="Bangkok weekend"
          className="w-full rounded-xl border border-neutral-300 p-3"
        />
      </div>

      <div>
        <label
          htmlFor="albumCaption"
          className="mb-2 block font-medium"
        >
          Album Description
        </label>

        <textarea
          id="albumCaption"
          rows={4}
          value={albumCaption}
          onChange={(event) =>
            setAlbumCaption(event.target.value)
          }
          placeholder="這個相簿的說明……"
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

        <span>
          <span className="block font-medium">
            Featured image
          </span>

          <span className="text-sm text-neutral-500">
            可用於首頁或 Gallery 精選區域。
          </span>
        </span>
      </label>

      <div className="flex flex-wrap gap-3 border-t border-neutral-100 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-neutral-900 px-8 py-3 text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {loading
            ? "Uploading..."
            : "Upload Image"}
        </button>

        <button
          type="button"
          onClick={() =>
            router.push(
              "/dashboard/gallery",
            )
          }
          className="rounded-full border border-neutral-300 px-8 py-3 transition hover:bg-neutral-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}