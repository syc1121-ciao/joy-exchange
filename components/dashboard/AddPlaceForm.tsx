"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import PlacePickerMap from "./PlacePickerMap";

type PlaceType =
  | "home"
  | "visited"
  | "dream"
  | "wishlist";

type Coordinates = {
  longitude: number;
  latitude: number;
};

type SelectedLocation = Coordinates & {
  country: string;
};

export default function AddPlaceForm() {
  const router = useRouter();

  const [city, setCity] =
    useState("");

  const [country, setCountry] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [image, setImage] =
    useState("");

  const [placeType, setPlaceType] =
    useState<PlaceType>("dream");

  const [publishStatus, setPublishStatus] =
    useState<"draft" | "published">(
      "draft",
    );

  const [coordinates, setCoordinates] =
    useState<Coordinates | null>(null);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  function handleLocationChange(
    location: SelectedLocation,
  ) {
    setCoordinates({
      longitude: location.longitude,
      latitude: location.latitude,
    });

    setCountry(location.country);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!city.trim()) {
      setError("請輸入城市名稱");
      return;
    }

    if (!country.trim()) {
      setError("請輸入國家");
      return;
    }

    if (!coordinates) {
      setError("請先在地圖上選擇位置");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(
        "/api/places",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            city: city.trim(),
            country: country.trim(),
            description:
              description.trim(),
            image: image.trim(),

            status: publishStatus,
            place_type: placeType,

            longitude:
              coordinates.longitude,
            latitude:
              coordinates.latitude,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.error ??
            "新增地點失敗",
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
          : "新增地點失敗",
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
      <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-sm text-neutral-500">
            Step 1
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-neutral-900">
            在地圖上選擇位置
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            點擊地圖上的國家後，系統會自動填入國家名稱。
            城市名稱目前仍需要手動輸入。
          </p>
        </div>

        <PlacePickerMap
          value={coordinates}
          onChange={
            handleLocationChange
          }
        />
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-sm text-neutral-500">
            Step 2
          </p>

          <h2 className="mt-1 text-2xl font-semibold text-neutral-900">
            填寫地點資料
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">
              城市名稱
            </span>

            <input
              value={city}
              onChange={(event) =>
                setCity(
                  event.target.value,
                )
              }
              placeholder="例如 Munich"
              className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-[#17324d]"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">
              國家
            </span>

            <input
              value={country}
              onChange={(event) =>
                setCountry(
                  event.target.value,
                )
              }
              placeholder="例如 Germany"
              className="mt-2 w-full rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-[#17324d]"
            />

            <p className="mt-2 text-xs text-neutral-400">
              點擊地圖上的國家後會自動填入。
            </p>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-neutral-700">
              地點類型
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
              發布狀態
            </span>

            <select
              value={publishStatus}
              onChange={(event) =>
                setPublishStatus(
                  event.target.value as
                    | "draft"
                    | "published",
                )
              }
              className="mt-2 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-3 outline-none transition focus:border-[#17324d]"
            >
              <option value="draft">
                Draft
              </option>

              <option value="published">
                Published
              </option>
            </select>
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-medium text-neutral-700">
              圖片路徑
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
            描述
          </span>

          <textarea
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value,
              )
            }
            rows={4}
            placeholder="為什麼想去這個地方？"
            className="mt-2 w-full resize-none rounded-2xl border border-neutral-200 px-4 py-3 outline-none transition focus:border-[#17324d]"
          />
        </label>

        {coordinates && (
          <div className="mt-6 rounded-2xl bg-[#f4f6f7] p-4">
            <p className="text-sm font-medium text-neutral-700">
              已選擇座標
            </p>

            <div className="mt-2 flex flex-wrap gap-4 text-sm text-neutral-500">
              <span>
                Longitude:{" "}
                {coordinates.longitude}
              </span>

              <span>
                Latitude:{" "}
                {coordinates.latitude}
              </span>
            </div>
          </div>
        )}
      </section>

      {error && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-[#17324d] px-7 py-3 text-sm font-medium text-white transition hover:bg-[#244666] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Adding..."
            : "Add Place"}
        </button>
      </div>
    </form>
  );
}