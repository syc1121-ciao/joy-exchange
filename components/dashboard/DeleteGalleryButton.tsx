"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteGalleryButtonProps = {
  albumId: string;
  albumTitle: string;
  redirectAfterDelete?: boolean;
};

export default function DeleteGalleryButton({
  albumId,
  albumTitle,
  redirectAfterDelete = false,
}: DeleteGalleryButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `確定要刪除相簿「${albumTitle}」嗎？\n\n相簿內的所有照片與圖片檔案都會一起刪除，而且無法復原。`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/gallery/albums/${encodeURIComponent(
          albumId,
        )}`,
        {
          method: "DELETE",
        },
      );

      const result = (await response.json()) as {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error ?? "刪除相簿失敗。",
        );
      }

      if (redirectAfterDelete) {
        router.push("/dashboard/gallery");
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "刪除相簿失敗，請稍後再試。",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isDeleting
          ? "Deleting..."
          : "Delete Album"}
      </button>

      {errorMessage && (
        <p className="mt-2 max-w-xs text-xs text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}