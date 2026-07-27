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

  const [image, setImage] =
    useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] =
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

  const [previewUrl, setPreviewUrl] =
    useState("");
  const [loading, setLoading] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  function handleImageChange(
    file: File | null,
  ) {
    setImage(file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(
      file ? URL.createObjectURL(file) : "",
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!image) {
      setErrorMessage("請選擇一張圖片。");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();

      formData.append("image", image);
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
          Image
        </label>

        <input
          id="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          required
          onChange={(event) =>
            handleImageChange(
              event.target.files?.[0] ??
                null,
            )
          }
          className="w-full rounded-xl border border-neutral-300 p-3"
        />

        <p className="mt-2 text-sm text-neutral-500">
          JPG、PNG、WebP 或 GIF，最大 10 MB。
        </p>
      </div>

      {previewUrl && (
        <div className="overflow-hidden rounded-3xl bg-neutral-100">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-[500px] w-full object-contain"
          />
        </div>
      )}

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
          placeholder="Sunset in Munich"
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
          placeholder="這張照片的故事……"
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