"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeletePlaceButton({
  id,
}: {
  id: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const ok = window.confirm(
      "確定要刪除這個 Place？"
    );

    if (!ok) return;

    setLoading(true);

    const res = await fetch("/api/places", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      alert("刪除失敗");
      return;
    }

    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="rounded-full bg-red-600 px-5 py-2.5 text-sm text-white transition hover:bg-red-700 disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}