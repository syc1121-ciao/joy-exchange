"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import PlacePickerMap, {
  type SelectedLocation,
} from "@/app/dashboard/places/new/PlacePickerMap";

type PlaceType =
  | "home"
  | "visited"
  | "dream"
  | "wishlist";

type PublishStatus =
  | "draft"
  | "published";

type ApiResponse = {
  error?: string;
  place?: {
    id: string;
    slug: string;
  };
};

async function readJsonSafely<T>(
  response: Response,
): Promise<T> {
  const contentType =
    response.headers.get("content-type") ?? "";

  if (
    !contentType.includes(
      "application/json",
    )
  ) {
    const text =
      await response.text();

    throw new Error(
      text ||
        `Request failed (${response.status})`,
    );
  }

  return response.json() as Promise<T>;
}

export default function AddPlaceForm() {
  const router = useRouter();

  const [location, setLocation] =
    useState<SelectedLocation | null>(
      null,
    );

  const [city, setCity] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [image, setImage] =
    useState("");

  const [icon, setIcon] =
    useState("📍");

  const [placeType, setPlaceType] =
    useState<PlaceType>("dream");

  const [
    publishStatus,
    setPublishStatus,
  ] = useState<PublishStatus>(
    "published",
  );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  function handleLocationChange(
    nextLocation: SelectedLocation,
  ) {
    setLocation(nextLocation);
    setCity(nextLocation.city);
    setCountry(
      nextLocation.country,
    );
    setError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!location) {
      setError(
        "請先搜尋城市或在地圖上選擇位置。",
      );

      return;
    }

    if (!city.trim()) {
      setError("請輸入城市名稱。");
      return;
    }

    if (!country.trim()) {
      setError("請輸入國家名稱。");
      return;
    }

    try {
      setIsSubmitting(true);

      const response =
        await fetch(
          "/api/places",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              city: city.trim(),
              country:
                country.trim(),
              description:
                description.trim(),
              image: image.trim(),
              icon:
                icon.trim() ||
                "📍",
              placeType,
              publishStatus,
              longitude:
                location.longitude,
              latitude:
                location.latitude,
            }),
          },
        );

      const result =
        await readJsonSafely<ApiResponse>(
          response,
        );

      if (!response.ok) {
        throw new Error(
          result.error ??
            "新增地點失敗。",
        );
      }

      router.push(
        "/dashboard/places",
      );

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "新增地點失敗。",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.16em] text-neutral-400">
            Step 1
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-neutral-900">
            Find your destination
          </h2>

          <p className="mt-2 text-sm leading-7 text-neutral-500">
            搜尋城市，或直接在地圖上點擊想加入的位置。
          </p>
        </div>

        <PlacePickerMap
          value={location}
          onChange={
            handleLocationChange
          }
        />
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.16em] text-neutral-400">
            Step 2
          </p>

          <h2 className="mt-2 text-2xl font-semibold text-neutral-900">
            Place details
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">
              City
            </span>

            <input
              value={city}
              onChange={(event) =>
                setCity(
                  event.target.value,
                )
              }
              required
              placeholder="Munich"
              className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-[#17324d]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">
              Country
            </span>

            <input
              value={country}
              onChange={(event) =>
                setCountry(
                  event.target.value,
                )
              }
              required
              placeholder="Germany"
              className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-[#17324d]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">
              Place type
            </span>

            <select
              value={placeType}
              onChange={(event) =>
                setPlaceType(
                  event.target
                    .value as PlaceType,
                )
              }
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-[#17324d]"
            >
              <option value="dream">
                Dream
              </option>

              <option value="wishlist">
                Wishlist
              </option>

              <option value="visited">
                Visited
              </option>

              <option value="home">
                Home
              </option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">
              Marker icon
            </span>

            <input
              value={icon}
              onChange={(event) =>
                setIcon(
                  event.target.value,
                )
              }
              maxLength={8}
              placeholder="🥨"
              className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-2xl outline-none transition focus:border-[#17324d]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">
              Publish status
            </span>

            <select
              value={publishStatus}
              onChange={(event) =>
                setPublishStatus(
                  event.target
                    .value as PublishStatus,
                )
              }
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-[#17324d]"
            >
              <option value="published">
                Published
              </option>

              <option value="draft">
                Draft
              </option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">
              Image path
            </span>

            <input
              value={image}
              onChange={(event) =>
                setImage(
                  event.target.value,
                )
              }
              placeholder="/images/cities/munich.jpg"
              className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-[#17324d]"
            />
          </label>
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-medium text-neutral-700">
            Description
          </span>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            rows={5}
            placeholder="Why do you want to visit this place?"
            className="mt-2 w-full resize-none rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-[#17324d]"
          />
        </label>

        {location && (
          <div className="mt-6 grid gap-4 rounded-2xl bg-neutral-100 p-5 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-400">
                Longitude
              </p>

              <p className="mt-1 font-medium text-neutral-800">
                {location.longitude.toFixed(
                  6,
                )}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-400">
                Latitude
              </p>

              <p className="mt-1 font-medium text-neutral-800">
                {location.latitude.toFixed(
                  6,
                )}
              </p>
            </div>
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() =>
            router.push(
              "/dashboard/places",
            )
          }
          className="rounded-full border border-neutral-300 px-7 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            isSubmitting ||
            !location
          }
          className="rounded-full bg-[#17324d] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#244666] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : "Save place"}
        </button>
      </div>
    </form>
  );
}