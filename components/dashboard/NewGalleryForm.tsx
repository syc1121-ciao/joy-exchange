"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { supabase } from "@/lib/supabase";

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

type SelectedImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type UploadedImage = {
  imageUrl: string;
  storagePath: string;
  originalName: string;
};

const GALLERY_BUCKET = "gallery";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_FILE_COUNT = 30;



function createImageId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`;
}

function sanitizeFileName(fileName: string) {
  const extension =
    fileName.split(".").pop()?.toLowerCase() ||
    "jpg";

  return {
    extension: extension.replace(
      /[^a-z0-9]/g,
      "",
    ),
  };
}

export default function NewGalleryForm({
  places,
  journals,
}: NewGalleryFormProps) {
  const router = useRouter();
  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [selectedImages, setSelectedImages] =
    useState<SelectedImage[]>([]);

  const [isDragging, setIsDragging] =
    useState(false);

  const [isUploading, setIsUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const selectedCount = selectedImages.length;

  const totalSize = useMemo(() => {
    return selectedImages.reduce(
      (sum, image) => sum + image.file.size,
      0,
    );
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImages.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, [selectedImages]);

  function appendFiles(files: File[]) {
    setErrorMessage("");
    setSuccessMessage("");

    const imageFiles = files.filter((file) =>
      file.type.startsWith("image/"),
    );

    if (imageFiles.length !== files.length) {
      setErrorMessage(
        "只能上傳 JPG、PNG、WEBP、HEIC 等圖片檔案。",
      );
    }

    const oversizedFiles = imageFiles.filter(
      (file) => file.size > MAX_FILE_SIZE,
    );

    if (oversizedFiles.length > 0) {
      setErrorMessage(
        `單張照片不可超過 20 MB：${oversizedFiles
          .map((file) => file.name)
          .join("、")}`,
      );
      return;
    }

    const availableCount =
      MAX_FILE_COUNT - selectedImages.length;

    if (availableCount <= 0) {
      setErrorMessage(
        `一次最多上傳 ${MAX_FILE_COUNT} 張照片。`,
      );
      return;
    }

    const acceptedFiles = imageFiles.slice(
      0,
      availableCount,
    );

    if (acceptedFiles.length < imageFiles.length) {
      setErrorMessage(
        `一次最多上傳 ${MAX_FILE_COUNT} 張，超出的照片未加入。`,
      );
    }

    const existingKeys = new Set(
      selectedImages.map(
        ({ file }) =>
          `${file.name}-${file.size}-${file.lastModified}`,
      ),
    );

    const newImages = acceptedFiles
      .filter((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        return !existingKeys.has(key);
      })
      .map((file) => ({
        id: createImageId(file),
        file,
        previewUrl: URL.createObjectURL(file),
      }));

    setSelectedImages((current) => [
      ...current,
      ...newImages,
    ]);
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const files = Array.from(
      event.target.files ?? [],
    );

    appendFiles(files);

    event.target.value = "";
  }

  function removeImage(id: string) {
    setSelectedImages((current) => {
      const imageToRemove = current.find(
        (image) => image.id === id,
      );

      if (imageToRemove) {
        URL.revokeObjectURL(
          imageToRemove.previewUrl,
        );
      }

      return current.filter(
        (image) => image.id !== id,
      );
    });
  }

  function clearImages() {
    selectedImages.forEach((image) => {
      URL.revokeObjectURL(image.previewUrl);
    });

    setSelectedImages([]);
    setUploadProgress(0);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (selectedImages.length === 0) {
      setErrorMessage("請至少選擇一張照片。");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage("");
    setSuccessMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const uploadedImages: UploadedImage[] = [];

    try {
      

      for (
        let index = 0;
        index < selectedImages.length;
        index += 1
      ) {
        const selectedImage =
          selectedImages[index];

        const { extension } = sanitizeFileName(
          selectedImage.file.name,
        );

        const dateFolder = new Date()
          .toISOString()
          .slice(0, 10);

        const storagePath =
          `${dateFolder}/` +
          `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } =
          await supabase.storage
            .from(GALLERY_BUCKET)
            .upload(
              storagePath,
              selectedImage.file,
              {
                contentType:
                  selectedImage.file.type ||
                  "image/jpeg",
                cacheControl: "3600",
                upsert: false,
              },
            );

        if (uploadError) {
          throw new Error(
            `${selectedImage.file.name} 上傳失敗：${uploadError.message}`,
          );
        }

        const {
          data: { publicUrl },
        } = supabase.storage
          .from(GALLERY_BUCKET)
          .getPublicUrl(storagePath);

        uploadedImages.push({
          imageUrl: publicUrl,
          storagePath,
          originalName:
            selectedImage.file.name,
        });

        setUploadProgress(
          Math.round(
            ((index + 1) /
              selectedImages.length) *
              90,
          ),
        );
      }

      const response = await fetch(
        "/api/gallery",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title: String(
              formData.get("title") ?? "",
            ).trim(),

            description: String(
              formData.get("description") ??
                "",
            ).trim(),

            placeId:
              String(
                formData.get("placeId") ??
                  "",
              ) || null,

            journalId:
              String(
                formData.get("journalId") ??
                  "",
              ) || null,

            images: uploadedImages,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        await supabase.storage
          .from(GALLERY_BUCKET)
          .remove(
            uploadedImages.map(
              (image) => image.storagePath,
            ),
          );

        throw new Error(
          result.error ||
            "照片資料儲存失敗。",
        );
      }

      setUploadProgress(100);
      setSuccessMessage(
        `成功上傳 ${uploadedImages.length} 張照片。`,
      );

      form.reset();
      clearImages();

      router.push("/dashboard/gallery");
      router.refresh();
    } catch (error) {
      console.error(
        "Gallery upload error:",
        error,
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "照片上傳失敗，請稍後再試。",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
        <div className="border-b border-neutral-100 px-6 py-5 sm:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">
            Image details
          </p>

          <h2 className="mt-2 text-xl font-semibold text-neutral-900">
            照片資訊
          </h2>
        </div>

        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-2">
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-sm font-medium text-neutral-700">
              標題
            </span>

            <input
              name="title"
              type="text"
              placeholder="例如：慕尼黑的第一場雪"
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-700">
              地點
            </span>

            <select
              name="placeId"
              defaultValue=""
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:bg-white"
            >
              <option value="">
                不連結地點
              </option>

              {places.map((place) => (
                <option
                  key={place.id}
                  value={place.id}
                >
                  {place.city}
                  {place.country
                    ? `, ${place.country}`
                    : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-neutral-700">
              日記
            </span>

            <select
              name="journalId"
              defaultValue=""
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-400 focus:bg-white"
            >
              <option value="">
                不連結日記
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
          </label>

          <label className="block lg:col-span-2">
            <span className="mb-2 block text-sm font-medium text-neutral-700">
              說明
            </span>

            <textarea
              name="description"
              rows={4}
              placeholder="記錄當下的故事、心情或照片內容⋯⋯"
              className="w-full resize-y rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
            />
          </label>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-neutral-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-neutral-400">
              Photos
            </p>

            <h2 className="mt-2 text-xl font-semibold text-neutral-900">
              選擇照片
            </h2>
          </div>

          {selectedCount > 0 && (
            <button
              type="button"
              onClick={clearImages}
              disabled={isUploading}
              className="self-start text-sm font-medium text-neutral-500 transition hover:text-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              全部清除
            </button>
          )}
        </div>

        <div className="space-y-6 p-6 sm:p-8">
          <input
            ref={fileInputRef}
            name="images"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            disabled={isUploading}
            onClick={() =>
              fileInputRef.current?.click()
            }
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();

              if (
                event.currentTarget ===
                event.target
              ) {
                setIsDragging(false);
              }
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);

              appendFiles(
                Array.from(
                  event.dataTransfer.files,
                ),
              );
            }}
            className={`flex min-h-56 w-full flex-col items-center justify-center rounded-[1.75rem] border-2 border-dashed px-6 py-10 text-center transition ${
              isDragging
                ? "border-neutral-700 bg-neutral-100"
                : "border-neutral-200 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl shadow-sm">
              ＋
            </span>

            <span className="mt-5 text-base font-semibold text-neutral-900">
              選擇多張照片
            </span>

            <span className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
              點擊選擇或把照片拖曳到這裡。
              一次最多 {MAX_FILE_COUNT} 張，
              單張最多 20 MB。
            </span>
          </button>

          {selectedCount > 0 && (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-neutral-600">
                  已選擇{" "}
                  <span className="font-semibold text-neutral-900">
                    {selectedCount}
                  </span>{" "}
                  張照片
                </p>

                <p className="text-sm text-neutral-400">
                  總大小{" "}
                  {(
                    totalSize /
                    1024 /
                    1024
                  ).toFixed(1)}{" "}
                  MB
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {selectedImages.map(
                  (image, index) => (
                    <div
                      key={image.id}
                      className="group relative aspect-square overflow-hidden rounded-2xl bg-neutral-100"
                    >
                      <Image
                        src={image.previewUrl}
                        alt={
                          image.file.name ||
                          `Selected photo ${
                            index + 1
                          }`
                        }
                        fill
                        unoptimized
                        className="object-cover"
                      />

                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8">
                        <p className="truncate text-xs text-white">
                          {image.file.name}
                        </p>
                      </div>

                      <button
                        type="button"
                        aria-label="移除照片"
                        disabled={isUploading}
                        onClick={() =>
                          removeImage(image.id)
                        }
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-sm text-white backdrop-blur transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ×
                      </button>

                      <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-1 text-[11px] text-white backdrop-blur">
                        {index + 1}
                      </span>
                    </div>
                  ),
                )}
              </div>

              {selectedCount <
                MAX_FILE_COUNT && (
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  ＋ 繼續加入照片
                </button>
              )}
            </>
          )}

          {isUploading && (
            <div className="space-y-2 rounded-2xl bg-neutral-50 p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">
                  正在上傳照片⋯⋯
                </span>

                <span className="font-medium text-neutral-900">
                  {uploadProgress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
                <div
                  className="h-full rounded-full bg-neutral-900 transition-all duration-300"
                  style={{
                    width: `${uploadProgress}%`,
                  }}
                />
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
              {successMessage}
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          disabled={isUploading}
          onClick={() => router.back()}
          className="rounded-full border border-neutral-200 px-6 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            isUploading ||
            selectedImages.length === 0
          }
          className="rounded-full bg-neutral-900 px-7 py-3 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {isUploading
            ? `Uploading ${uploadProgress}%`
            : `Upload ${selectedCount || ""} ${
                selectedCount === 1
                  ? "photo"
                  : "photos"
              }`}
        </button>
      </div>
    </form>
  );
}