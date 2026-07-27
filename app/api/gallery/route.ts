import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/requireAdmin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();

    const {
      title,
      city,
      description,
      imageUrl,
      storagePath,
    } = body;

    if (!title || !city || !imageUrl || !storagePath) {
      return NextResponse.json(
        { error: "缺少必要欄位" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("gallery")
      .insert({
        title,
        city,
        description: description || null,
        image_url: imageUrl,
        storage_path: storagePath,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Create gallery error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "建立照片資料失敗",
      },
      { status: 500 }
    );
  }
}