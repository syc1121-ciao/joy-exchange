import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type UploadedImage = {
  imageUrl?: unknown;
  storagePath?: unknown;
};

type CreateAlbumBody = {
  title?: unknown;
  caption?: unknown;

  placeId?: unknown;
  journalId?: unknown;

  takenAt?: unknown;
  isFeatured?: unknown;

  images?: unknown;
};

type NormalizedImage = {
  imageUrl: string;
  storagePath: string;
};

function getOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

function getRequiredString(value: unknown): string | null {
  return getOptionalString(value);
}

function normalizeImages(
  value: unknown,
): NormalizedImage[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const images: NormalizedImage[] = [];

  for (const item of value) {
    if (
      typeof item !== "object" ||
      item === null
    ) {
      return null;
    }

    const uploadedImage =
      item as UploadedImage;

    const imageUrl = getRequiredString(
      uploadedImage.imageUrl,
    );

    const storagePath = getRequiredString(
      uploadedImage.storagePath,
    );

    if (!imageUrl || !storagePath) {
      return null;
    }

    images.push({
      imageUrl,
      storagePath,
    });
  }

  return images;
}

export async function POST(
  request: Request,
) {
  const supabase = getSupabaseAdmin();

  let createdAlbumId: string | null = null;

  try {
    const session = await getServerSession(
      authOptions,
    );

    const authorEmail =
      session?.user?.email
        ?.trim()
        .toLowerCase();

    if (!authorEmail) {
      return NextResponse.json(
        {
          error: "請先登入後再建立相簿。",
        },
        {
          status: 401,
        },
      );
    }

    let body: CreateAlbumBody;

    try {
      body =
        (await request.json()) as CreateAlbumBody;
    } catch {
      return NextResponse.json(
        {
          error: "送出的資料格式不正確。",
        },
        {
          status: 400,
        },
      );
    }

    const title = getRequiredString(
      body.title,
    );

    const caption = getOptionalString(
      body.caption,
    );

    const placeId = getOptionalString(
      body.placeId,
    );

    const journalId = getOptionalString(
      body.journalId,
    );

    const takenAt = getOptionalString(
      body.takenAt,
    );

    const images = normalizeImages(
      body.images,
    );

    if (!title) {
      return NextResponse.json(
        {
          error: "請輸入相簿名稱。",
        },
        {
          status: 400,
        },
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        {
          error: "請至少上傳一張照片。",
        },
        {
          status: 400,
        },
      );
    }

    const firstImage = images[0];

    const {
      data: createdAlbum,
      error: albumError,
    } = await supabase
      .from("gallery_albums")
      .insert({
        title,
        caption,

        place_id: placeId,
        journal_id: journalId,

        taken_at: takenAt,

        cover_image_url:
          firstImage.imageUrl,

        cover_storage_path:
          firstImage.storagePath,

        is_featured:
          body.isFeatured === true,

        sort_order: 0,

        author_email:
          authorEmail,

        updated_at:
          new Date().toISOString(),
      })
      .select(
        `
          id,
          title,
          caption,
          place_id,
          journal_id,
          taken_at,
          cover_image_url,
          cover_storage_path,
          is_featured,
          sort_order,
          author_email,
          created_at,
          updated_at
        `,
      )
      .single();

    if (albumError || !createdAlbum) {
      console.error(
        "Failed to create gallery album:",
        albumError,
      );

      return NextResponse.json(
        {
          error:
            albumError?.message ??
            "建立相簿失敗。",
        },
        {
          status: 500,
        },
      );
    }

    createdAlbumId =
      createdAlbum.id as string;

    const imageRows = images.map(
      (image, index) => ({
        album_id: createdAlbumId,

        image_url:
          image.imageUrl,

        storage_path:
          image.storagePath,

        sort_order:
          index,

        /*
         * gallery_images 現有資料表的
         * author_email 是 not null，
         * 因此這裡仍然需要寫入。
         */
        author_email:
          authorEmail,

        updated_at:
          new Date().toISOString(),
      }),
    );

    const {
      data: createdImages,
      error: imagesError,
    } = await supabase
      .from("gallery_images")
      .insert(imageRows)
      .select(
        `
          id,
          album_id,
          image_url,
          storage_path,
          sort_order,
          created_at,
          updated_at
        `,
      );

    if (imagesError) {
      console.error(
        "Failed to create album images:",
        imagesError,
      );

      /*
       * gallery_images 新增失敗時，
       * 刪除剛剛建立的空相簿。
       */
      await supabase
        .from("gallery_albums")
        .delete()
        .eq(
          "id",
          createdAlbumId,
        );

      createdAlbumId = null;

      return NextResponse.json(
        {
          error:
            imagesError.message ||
            "照片寫入相簿失敗。",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        success: true,

        album: createdAlbum,

        images:
          createdImages ?? [],

        imageCount:
          createdImages?.length ??
          images.length,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Create gallery album error:",
      error,
    );

    /*
     * 避免發生非預期錯誤時，
     * 留下一個沒有照片的相簿。
     */
    if (createdAlbumId) {
      const {
        error: cleanupError,
      } = await supabase
        .from("gallery_albums")
        .delete()
        .eq(
          "id",
          createdAlbumId,
        );

      if (cleanupError) {
        console.error(
          "Failed to clean up album:",
          cleanupError,
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "建立相簿時發生未知錯誤。",
      },
      {
        status: 500,
      },
    );
  }
}