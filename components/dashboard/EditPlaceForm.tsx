"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

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

export default function EditPlaceForm({
  place,
}: {
  place: Place;
}) {
  const router = useRouter();

  const [city, setCity] = useState(place.city);
  const [country, setCountry] = useState(
    place.country,
  );
  const [continent, setContinent] = useState(
    place.continent,
  );
  const [latitude, setLatitude] = useState(
    String(place.latitude),
  );
  const [longitude, setLongitude] = useState(
    String(place.longitude),
  );
  const [slug, setSlug] = useState(place.slug);
  const [description, setDescription] =
    useState(place.description ?? "");
  const [status, setStatus] = useState<
    "draft" | "published"
  >(place.status);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/places", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: place.id,
          city,
          country,
          slug,
          continent,
          latitude,
          longitude,
          description,
          status,
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error ?? "更新失敗。",
        );
      }

      setSuccessMessage("Place 已成功更新。");

      router.push("/dashboard/places");
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

      {successMessage && (
        <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <div>
        <label
          htmlFor="city"
          className="mb-2 block font-medium"
        >
          City
        </label>

        <input
          id="city"
          value={city}
          onChange={(event) =>
            setCity(event.target.value)
          }
          required
          className="w-full rounded-xl border border-neutral-300 p-3 outline-none transition focus:border-neutral-900"
        />
      </div>

      <div>
        <label
          htmlFor="country"
          className="mb-2 block font-medium"
        >
          Country
        </label>

        <input
          id="country"
          value={country}
          onChange={(event) =>
            setCountry(event.target.value)
          }
          required
          className="w-full rounded-xl border border-neutral-300 p-3 outline-none transition focus:border-neutral-900"
        />
      </div>

      <div>
        <label
          htmlFor="continent"
          className="mb-2 block font-medium"
        >
          Continent
        </label>

        <select
          id="continent"
          value={continent}
          onChange={(event) =>
            setContinent(event.target.value)
          }
          required
          className="w-full rounded-xl border border-neutral-300 p-3 outline-none transition focus:border-neutral-900"
        >
          <option value="">Select continent</option>
          <option value="asia">Asia</option>
          <option value="europe">Europe</option>
          <option value="north-america">North America</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="latitude"
            className="mb-2 block font-medium"
          >
            Latitude
          </label>

          <input
            id="latitude"
            type="number"
            step="any"
            value={latitude}
            onChange={(event) =>
              setLatitude(event.target.value)
            }
            required
            className="w-full rounded-xl border border-neutral-300 p-3 outline-none transition focus:border-neutral-900"
          />
        </div>

        <div>
          <label
            htmlFor="longitude"
            className="mb-2 block font-medium"
          >
            Longitude
          </label>

          <input
            id="longitude"
            type="number"
            step="any"
            value={longitude}
            onChange={(event) =>
              setLongitude(event.target.value)
            }
            required
            className="w-full rounded-xl border border-neutral-300 p-3 outline-none transition focus:border-neutral-900"
          />
        </div>
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
          className="w-full rounded-xl border border-neutral-300 p-3 outline-none transition focus:border-neutral-900"
        />

        <p className="mt-2 text-sm text-neutral-500">
          公開網址：/travel/{slug || "your-slug"}
        </p>
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block font-medium"
        >
          Description
        </label>

        <textarea
          id="description"
          rows={6}
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          className="w-full resize-y rounded-xl border border-neutral-300 p-3 outline-none transition focus:border-neutral-900"
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
          className="w-full rounded-xl border border-neutral-300 p-3 outline-none transition focus:border-neutral-900"
        >
          <option value="draft">Draft</option>
          <option value="published">
            Published
          </option>
        </select>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-neutral-900 px-8 py-3 text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        <button
          type="button"
          onClick={() =>
            router.push("/dashboard/places")
          }
          disabled={loading}
          className="rounded-full border border-neutral-300 px-8 py-3 transition hover:bg-neutral-100 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}