"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteFlightButtonProps = {
  flightId: string;
  flightLabel: string;
  redirectAfterDelete?: boolean;
};

export default function DeleteFlightButton({
  flightId,
  flightLabel,
  redirectAfterDelete = false,
}: DeleteFlightButtonProps) {
  const router = useRouter();

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `確定要刪除「${flightLabel}」嗎？\n\n相關登機證檔案也會一起刪除，且無法復原。`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/flights?id=${encodeURIComponent(
          flightId,
        )}`,
        {
          method: "DELETE",
        },
      );

      const result =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          result.error ??
            "刪除航班失敗。",
        );
      }

      if (redirectAfterDelete) {
        router.push(
          "/dashboard/flights",
        );
      }

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "刪除失敗，請稍後再試。",
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
          : "Delete"}
      </button>

      {errorMessage && (
        <p className="mt-2 max-w-xs text-xs text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
}