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
  description?: unknown;
  placeId?: unknown;
  journalId?: unknown;
  images?: unknown;
};

function optionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue || null;
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
          error: "照片資料格式不正確。",
        },
        {
          status: 400,
        },
      );
    }

    const authorEmail = session.user.email
      .trim()
      .toLowerCase();

    const title =
      optionalString(body.title) ?? "Untitled";

    const description = optionalString(
      body.description,
    );

    const placeId = optionalString(
      body.placeId,
    );

    const journalId = optionalString(
      body.journalId,
    );

    const rows = images.map(
      (image, index) => ({
        title:
          images.length === 1
            ? title
            : `${title} ${index + 1}`,

        description,

        place_id: placeId,
        journal_id: journalId,

        image_url: String(
          image.imageUrl,
        ).trim(),

        storage_path: String(
          image.storagePath,
        ).trim(),

        author_email: authorEmail,
      }),
    );

    const supabaseAdmin =
      getSupabaseAdmin();

    const { data, error } =
      await supabaseAdmin
        .from("gallery")
        .insert(rows)
        .select();

    if (error) {
      console.error(
        "Insert gallery error:",
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