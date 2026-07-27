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

export default function NewJournalForm({
  places,
}: {
  places: PlaceOption[];
}) {
  const router = useRouter();

  const [placeId, setPlaceId] = useState(
    places[0]?.id ?? "",
  );
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [journalDate, setJournalDate] =
    useState("");
  const [status, setStatus] = useState<
    "draft" | "published"
  >("draft");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  function handleTitleChange(value: string) {
    setTitle(value);

    if (!slug) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      );
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        "/api/journals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            placeId,
            title,
            slug,
            excerpt,
            content,
            journalDate,
            status,
          }),
        },
      );

      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error ?? "新增失敗。",
        );
      }

      router.push("/dashboard/journal");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "新增失敗，請稍後再試。",
      );
    } finally {
      setLoading(false);
    }
  }

  if (places.length === 0) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
        請先建立至少一個 Place，再新增 Journal。
      </div>
    );
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
          required
          className="w-full rounded-xl border border-neutral-300 p-3"
        >
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
          htmlFor="title"
          className="mb-2 block font-medium"
        >
          Title
        </label>

        <input
          id="title"
          value={title}
          onChange={(event) =>
            handleTitleChange(event.target.value)
          }
          required
          placeholder="My first day in Munich"
          className="w-full rounded-xl border border-neutral-300 p-3"
        />
      </div>

      <div>
        <label
          htmlFor="slug"
          className="mb-2 block font-medium"
        >
          Slug
        </label>

        <input
          id="slug"
          value={slug}
          onChange={(event) =>
            setSlug(event.target.value)
          }
          required
          placeholder="first-day-in-munich"
          className="w-full rounded-xl border border-neutral-300 p-3"
        />

        <p className="mt-2 text-sm text-neutral-500">
          公開網址：/journal/{slug || "journal-slug"}
        </p>
      </div>

      <div>
        <label
          htmlFor="date"
          className="mb-2 block font-medium"
        >
          Journal Date
        </label>

        <input
          id="date"
          type="date"
          value={journalDate}
          onChange={(event) =>
            setJournalDate(event.target.value)
          }
          className="w-full rounded-xl border border-neutral-300 p-3"
        />
      </div>

      <div>
        <label
          htmlFor="excerpt"
          className="mb-2 block font-medium"
        >
          Excerpt
        </label>

        <textarea
          id="excerpt"
          rows={3}
          value={excerpt}
          onChange={(event) =>
            setExcerpt(event.target.value)
          }
          placeholder="這篇遊記的簡短介紹"
          className="w-full rounded-xl border border-neutral-300 p-3"
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="mb-2 block font-medium"
        >
          Content
        </label>

        <textarea
          id="content"
          rows={12}
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          placeholder="今天發生了什麼……"
          className="w-full rounded-xl border border-neutral-300 p-3"
        />
      </div>

      <div>
        <label
          htmlFor="status"
          className="mb-2 block font-medium"
        >
          Status
        </label>

        <select
          id="status"
          value={status}
          onChange={(event) =>
            setStatus(
              event.target.value as
                | "draft"
                | "published",
            )
          }
          className="w-full rounded-xl border border-neutral-300 p-3"
        >
          <option value="draft">Draft</option>
          <option value="published">
            Published
          </option>
        </select>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-neutral-900 px-8 py-3 text-white disabled:opacity-50"
        >
          {loading
            ? "Creating..."
            : "Create Journal"}
        </button>

        <button
          type="button"
          onClick={() =>
            router.push("/dashboard/journal")
          }
          className="rounded-full border border-neutral-300 px-8 py-3"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}