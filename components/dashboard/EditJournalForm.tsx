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

type Journal = {
  id: string;
  place_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  journal_date: string | null;
  status: "draft" | "published";
};

type EditJournalFormProps = {
  journal: Journal;
  places: PlaceOption[];
};

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function EditJournalForm({
  journal,
  places,
}: EditJournalFormProps) {
  const router = useRouter();

  const [placeId, setPlaceId] = useState(
    journal.place_id,
  );

  const [title, setTitle] = useState(
    journal.title,
  );

  const [slug, setSlug] = useState(
    journal.slug,
  );

  const [excerpt, setExcerpt] = useState(
    journal.excerpt ?? "",
  );

  const [content, setContent] = useState(
    journal.content ?? "",
  );

  const [journalDate, setJournalDate] =
    useState(journal.journal_date ?? "");

  const [status, setStatus] = useState<
    "draft" | "published"
  >(journal.status);

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

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
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: journal.id,
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
          result.error ?? "更新失敗。",
        );
      }

      router.push(
        `/dashboard/journal/${journal.id}`,
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
          className="w-full rounded-xl border border-neutral-300 bg-white p-3 outline-none transition focus:border-neutral-600"
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
            setTitle(event.target.value)
          }
          required
          className="w-full rounded-xl border border-neutral-300 p-3 outline-none transition focus:border-neutral-600"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label
            htmlFor="slug"
            className="block font-medium"
          >
            Slug
          </label>

          <button
            type="button"
            onClick={() =>
              setSlug(normalizeSlug(title))
            }
            className="text-xs text-neutral-500 underline-offset-4 transition hover:text-neutral-900 hover:underline"
          >
            Generate from title
          </button>
        </div>

        <input
          id="slug"
          value={slug}
          onChange={(event) =>
            setSlug(event.target.value)
          }
          required
          className="w-full rounded-xl border border-neutral-300 p-3 font-mono text-sm outline-none transition focus:border-neutral-600"
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
          className="w-full rounded-xl border border-neutral-300 p-3 outline-none transition focus:border-neutral-600"
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
          className="w-full resize-y rounded-xl border border-neutral-300 p-3 leading-7 outline-none transition focus:border-neutral-600"
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
          rows={14}
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          className="w-full resize-y rounded-xl border border-neutral-300 p-3 leading-7 outline-none transition focus:border-neutral-600"
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
          className="w-full rounded-xl border border-neutral-300 bg-white p-3 outline-none transition focus:border-neutral-600"
        >
          <option value="draft">Draft</option>

          <option value="published">
            Published
          </option>
        </select>
      </div>

      <div className="flex flex-wrap gap-3 border-t border-neutral-100 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-neutral-900 px-8 py-3 text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() =>
            router.push(
              `/dashboard/journal/${journal.id}`,
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