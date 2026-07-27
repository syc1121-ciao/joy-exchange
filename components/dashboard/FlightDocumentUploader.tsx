"use client";

import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  useState,
} from "react";

type FlightDocumentUploaderProps = {
  flightId: string;
  documentUrl: string | null;
  documentName: string | null;
};

export default function FlightDocumentUploader({
  flightId,
  documentUrl,
  documentName,
}: FlightDocumentUploaderProps) {
  const router = useRouter();

  const [file, setFile] =
    useState<File | null>(null);

  const [isUploading, setIsUploading] =
    useState(false);

  const [isRemoving, setIsRemoving] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    setFile(
      event.target.files?.[0] ??
        null,
    );

    setErrorMessage("");
  }

  async function handleUpload() {
    if (!file) {
      setErrorMessage(
        "請先選擇檔案。",
      );

      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      const formData = new FormData();

      formData.append(
        "flightId",
        flightId,
      );

      formData.append("file", file);

      const response = await fetch(
        "/api/flights/document",
        {
          method: "POST",
          body: formData,
        },
      );

      const result =
        (await response.json()) as {
          error?: string;
        };

      if (!response.ok) {
        throw new Error(
          result.error ??
            "上傳失敗。",
        );
      }

      setFile(null);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "上傳失敗，請稍後再試。",
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleRemove() {
    const confirmed =
      window.confirm(
        "確定要刪除這份登機證或機票檔案嗎？",
      );

    if (!confirmed) {
      return;
    }

    setIsRemoving(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/flights/document?flightId=${encodeURIComponent(
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
            "刪除檔案失敗。",
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
      setIsRemoving(false);
    }
  }

  return (
    <section className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
        Document
      </p>

      <h2 className="mt-2 text-2xl font-semibold">
        Boarding Pass or Ticket
      </h2>

      {documentUrl ? (
        <div className="mt-6 rounded-2xl border border-neutral-200 p-5">
          <p className="text-sm font-medium">
            {documentName ??
              "Flight document"}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={documentUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm text-white"
            >
              Open Document ↗
            </a>

            <button
              type="button"
              onClick={handleRemove}
              disabled={isRemoving}
              className="rounded-full border border-red-200 px-5 py-2.5 text-sm text-red-600 disabled:opacity-50"
            >
              {isRemoving
                ? "Removing..."
                : "Remove"}
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-neutral-500">
          尚未上傳登機證或電子機票。
        </p>
      )}

      <div className="mt-6 border-t border-neutral-100 pt-6">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={handleFileChange}
          className="w-full rounded-xl border border-neutral-300 p-3"
        />

        <p className="mt-2 text-xs text-neutral-500">
          支援 JPG、PNG、WebP 與 PDF，最大 10 MB。
        </p>

        <button
          type="button"
          onClick={handleUpload}
          disabled={
            !file || isUploading
          }
          className="mt-4 rounded-full bg-neutral-900 px-6 py-2.5 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading
            ? "Uploading..."
            : documentUrl
              ? "Replace Document"
              : "Upload Document"}
        </button>
      </div>

      {errorMessage && (
        <p className="mt-4 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </section>
  );
}