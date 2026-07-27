import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type CreatePlaceBody = {
  slug?: string;
  city?: string;
  country?: string;
  excerpt?: string;
  description?: string;
  coverImage?: string;
  coverAlt?: string;
  latitude?: number | null;
  longitude?: number | null;
  visitedAt?: string | null;
  endDate?: string | null;
  rating?: number | null;
  expense?: number | null;
  mood?: string;
  learnedGerman?: string;
  souvenir?: string;
  status?: "draft" | "published";
};

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("places")
    .select("*")
    .eq("status", "published")
    .order("visited_at", {
      ascending: false,
      nullsFirst: false,
    });

  if (error) {
    console.error("Failed to fetch places:", error);

    return NextResponse.json(
      {
        error: "無法讀取地點資料",
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json({
    places: data,
  });
}

export async function POST(
  request: Request,
) {
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

  let body: CreatePlaceBody;

  try {
    body =
      (await request.json()) as CreatePlaceBody;
  } catch {
    return NextResponse.json(
      {
        error: "請求格式錯誤",
      },
      {
        status: 400,
      },
    );
  }

  const slug = body.slug?.trim().toLowerCase();
  const city = body.city?.trim();
  const country = body.country?.trim();

  if (!slug || !city || !country) {
    return NextResponse.json(
      {
        error:
          "slug、city 和 country 為必填欄位",
      },
      {
        status: 400,
      },
    );
  }

  const { data, error } = await supabaseAdmin
    .from("places")
    .insert({
      slug,
      city,
      country,
      excerpt: body.excerpt?.trim() ?? "",
      description:
        body.description?.trim() ?? "",
      cover_image:
        body.coverImage?.trim() ?? "",
      cover_alt:
        body.coverAlt?.trim() ?? "",
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      visited_at: body.visitedAt ?? null,
      end_date: body.endDate ?? null,
      rating: body.rating ?? null,
      expense: body.expense ?? null,
      mood: body.mood?.trim() ?? "",
      learned_german:
        body.learnedGerman?.trim() ?? "",
      souvenir:
        body.souvenir?.trim() ?? "",
      status: body.status ?? "draft",
      author_email: session.user.email,
      published_at:
        body.status === "published"
          ? new Date().toISOString()
          : null,
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to create place:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        {
          error: "這個 slug 已經存在",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        error: "新增地點失敗",
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json(
    {
      place: data,
    },
    {
      status: 201,
    },
  );
}