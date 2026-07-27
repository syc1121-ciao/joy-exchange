import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/requireAdmin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const session = await requireAdmin();

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const { id } = await context.params;
    const supabase = getSupabaseAdmin();

    const { data: image, error: readError } = await supabase
      .from("gallery_images")
      .select(
        `
          id,
          album_id,
          storage_path,
          image_url
        `,
      )
      .eq("id", id)
      .maybeSingle();

    if (readError) {
      return NextResponse.json(
        {
          error: readError.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!image) {
      return NextResponse.json(
        {
          error: "找不到照片。",
        },
        {
          status: 404,
        },
      );
    }

    if (image.storage_path) {
      const { error: storageError } = await supabase.storage
        .from("gallery")
        .remove([image.storage_path]);

      if (storageError) {
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

    const { error: deleteError } = await supabase
      .from("gallery_images")
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
      albumId: image.album_id,
    });
  } catch (error) {
    console.error("Delete gallery image error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "刪除照片失敗。",
      },
      {
        status: 500,
      },
    );
  }
}