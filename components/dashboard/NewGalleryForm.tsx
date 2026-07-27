"use client";

import { useState } from "react";
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
export default function NewGalleryForm({
  places,
  journals,
}: NewGalleryFormProps) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setUploading(true);
    setMessage("");

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      const file = formData.get("image");

      if (!(file instanceof File) || file.size === 0) {
        throw new Error("請選擇照片");
      }



      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath = `${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("gallery")
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from("gallery")
        .getPublicUrl(filePath);

      const response = await fetch("/api/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.get("title"),
          city: formData.get("city"),
          description: formData.get("description"),
          imageUrl: publicUrl,
          storagePath: filePath,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        await supabase.storage
          .from("gallery")
          .remove([filePath]);

        throw new Error(result.error || "儲存照片資料失敗");
      }

      form.reset();
      setMessage("照片上傳成功");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "照片上傳失敗"
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" required />
      <input name="city" required />

      <textarea name="description" />

      <input
        name="image"
        type="file"
        accept="image/*"
        required
      />

      <button type="submit" disabled={uploading}>
        {uploading ? "Uploading..." : "Upload photo"}
      </button>

      {message && <p>{message}</p>}
    </form>
  );
}