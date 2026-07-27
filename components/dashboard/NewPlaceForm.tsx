"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function NewPlaceForm() {
  const router = useRouter();

  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [continent, setContinent] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const slug = useMemo(() => slugify(city), [city]);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save");
      }

      router.push("/dashboard/places");
      router.refresh();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error ? err.message : "Unknown error"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-3xl bg-white p-8 shadow-sm"
    >
      <div>
        <label className="mb-2 block font-medium">
          City
        </label>

        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          className="w-full rounded-xl border border-neutral-300 p-3 outline-none focus:border-neutral-900"
          placeholder="Munich"
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Country
        </label>

        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
          className="w-full rounded-xl border border-neutral-300 p-3 outline-none focus:border-neutral-900"
          placeholder="Germany"
        />
      </div>

        <div>
          <label className="mb-2 block font-medium">
            Continent
          </label>

          <select
            value={continent}
            onChange={(e) => setContinent(e.target.value)}
            required
            className="w-full rounded-xl border border-neutral-300 p-3 outline-none focus:border-neutral-900"
          >
            <option value="">Select continent</option>
            <option value="asia">Asia</option>
            <option value="europe">Europe</option>
            <option value="north-america">North America</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium">
              Latitude
            </label>

            <input
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              required
              step="any"
              className="w-full rounded-xl border border-neutral-300 p-3 outline-none focus:border-neutral-900"
              placeholder="25.033"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Longitude
            </label>

            <input
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              required
              step="any"
              className="w-full rounded-xl border border-neutral-300 p-3 outline-none focus:border-neutral-900"
              placeholder="121.5654"
            />
          </div>
        </div>

      <div>
        <label className="mb-2 block font-medium">
          Description
        </label>

        <textarea
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-xl border border-neutral-300 p-3 outline-none focus:border-neutral-900"
          placeholder="Write something about this place..."
        />
      </div>

      <div>
        <label className="mb-2 block font-medium">
          Status
        </label>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-xl border border-neutral-300 p-3 outline-none focus:border-neutral-900"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-full bg-neutral-900 px-8 py-3 text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Place"}
      </button>
    </form>
  );
}