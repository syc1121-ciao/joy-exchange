import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type UpdateAlbumBody = {
  title?: unknown;
  caption?: unknown;
  placeId?: unknown;
  journalId?: unknown;
  takenAt?: unknown;
  sortOrder?: unknown;
  isFeatured?: unknown;
};

function optionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed || null;
}

async function requireLoggedInUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();

  return email ?? null;
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const authorEmail = await requireLoggedInUser();

    if (!authorEmail) {
      return NextResponse.json(
        {
          error: "請先登入。",
        },
        {
          status: 401,
        },
      );
    }

    const { id } = await context.params;
    const body = (await request.json()) as UpdateAlbumBody;

    const title = optionalString(body.title);

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

    const sortOrder =
      typeof body.sortOrder === "number" &&
      Number.isFinite(body.sortOrder)
        ? Math.trunc(body.sortOrder)
        : 0;

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from("gallery_albums")
      .update({
        title,
        caption: optionalString(body.caption),
        place_id: optionalString(body.placeId),
        journal_id: optionalString(body.journalId),
        taken_at: optionalString(body.takenAt),
        sort_order: sortOrder,
        is_featured: body.isFeatured === true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
          id,
          title,
          caption,
          cover_image_url,
          cover_storage_path,
          place_id,
          journal_id,
          taken_at,
          sort_order,
          is_featured,
          updated_at
        `,
      )
      .single();

    if (error) {
      console.error("Update album error:", error);

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      album: data,
    });
  } catch (error) {
    console.error("Update album route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "更新相簿失敗。",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const authorEmail = await requireLoggedInUser();

    if (!authorEmail) {
      return NextResponse.json(
        {
          error: "請先登入。",
        },
        {
          status: 401,
        },
      );
    }

    const { id } = await context.params;
    const supabase = getSupabaseAdmin();

    const { data: images, error: imagesError } =
      await supabase
        .from("gallery_images")
        .select("storage_path")
        .eq("album_id", id);

    if (imagesError) {
      return NextResponse.json(
        {
          error: imagesError.message,
        },
        {
          status: 500,
        },
      );
    }

    const storagePaths = (images ?? [])
      .map((image) => image.storage_path)
      .filter(
        (path): path is string =>
          typeof path === "string" &&
          path.length > 0,
      );

    if (storagePaths.length > 0) {
      const { error: storageError } =
        await supabase.storage
          .from("gallery")
          .remove(storagePaths);

      if (storageError) {
        console.error(
          "Delete storage images error:",
          storageError,
        );

        return NextResponse.json(
          {
            error: storageError.message,
          },
          {
            status: 500,
          },
        );
      }
    }

    const { error: deleteError } =
      await supabase
        .from("gallery_albums")
        .delete()
        .eq("id", id);

    if (deleteError) {
      return NextResponse.json(
        {
          error: deleteError.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Delete album route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "刪除相簿失敗。",
      },
      {
        status: 500,
      },
    );
  }
}