import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/requireAdmin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type UploadedImageInput = {
  imageUrl?: unknown;
  storagePath?: unknown;
  originalName?: unknown;
};

type CreateGalleryBody = {
  title?: unknown;
  caption?: unknown;
  description?: unknown;

  placeId?: unknown;
  journalId?: unknown;

  takenAt?: unknown;
  isFeatured?: unknown;

  images?: unknown;
};

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true" || value === "on";
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: "你沒有權限執行這項操作。",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      (await request.json()) as CreateGalleryBody;

    if (
      !Array.isArray(body.images) ||
      body.images.length === 0
    ) {
      return NextResponse.json(
        {
          error: "請至少上傳一張照片。",
        },
        {
          status: 400,
        },
      );
    }

    if (body.images.length > 30) {
      return NextResponse.json(
        {
          error: "一次最多上傳 30 張照片。",
        },
        {
          status: 400,
        },
      );
    }

    const images =
      body.images as UploadedImageInput[];

    const invalidImage = images.some(
      (image) =>
        typeof image.imageUrl !== "string" ||
        image.imageUrl.trim() === "" ||
        typeof image.storagePath !==
          "string" ||
        image.storagePath.trim() === "",
    );

    if (invalidImage) {
      return NextResponse.json(
        {
          error: "照片網址或 Storage 路徑不正確。",
        },
        {
          status: 400,
        },
      );
    }

    const authorEmail = session.user.email
      .trim()
      .toLowerCase();

    const baseTitle =
      optionalString(body.title) ?? "Untitled";

    // 兼容前端目前可能使用 description
    const caption =
      optionalString(body.caption) ??
      optionalString(body.description);

    const placeId = optionalString(
      body.placeId,
    );

    const journalId = optionalString(
      body.journalId,
    );

    const takenAt = optionalString(
      body.takenAt,
    );

    const isFeatured = parseBoolean(
      body.isFeatured,
    );

    const rows = images.map(
      (image, index) => ({
        title:
          images.length === 1
            ? baseTitle
            : `${baseTitle} ${index + 1}`,

        caption,

        image_url: String(
          image.imageUrl,
        ).trim(),

        storage_path: String(
          image.storagePath,
        ).trim(),

        place_id: placeId,

        journal_id: journalId,

        taken_at: takenAt,

        sort_order: index,

        // 多張照片時只讓第一張成為精選
        is_featured:
          isFeatured && index === 0,

        author_email: authorEmail,
      }),
    );

    const supabaseAdmin =
      getSupabaseAdmin();

    const { data, error } =
      await supabaseAdmin
        .from("gallery_images")
        .insert(rows)
        .select(
          `
            id,
            title,
            caption,
            image_url,
            storage_path,
            place_id,
            journal_id,
            taken_at,
            sort_order,
            is_featured,
            author_email,
            created_at,
            updated_at
          `,
        );

    if (error) {
      console.error(
        "Insert gallery_images error:",
        error,
      );

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        data,
        count: data?.length ?? rows.length,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Create gallery error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "新增照片時發生錯誤。",
      },
      {
        status: 500,
      },
    );
  }
}