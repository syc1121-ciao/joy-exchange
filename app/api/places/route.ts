import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type PlaceStatus = "draft" | "published";

type PlaceContinent =
  | "asia"
  | "europe"
  | "north-america";

type CreatePlaceBody = {
  city?: string;
  country?: string;
  slug?: string;
  description?: string;
  status?: PlaceStatus;
  continent?: string;
  latitude?: number | string;
  longitude?: number | string;
};

type UpdatePlaceBody = CreatePlaceBody & {
  id?: string;
};

const validContinents: PlaceContinent[] = [
  "asia",
  "europe",
  "north-america",
];

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// 公開讀取已發布的 Places
export async function GET() {
  try {
    const { data: placesData, error: placesError } =
      await supabaseAdmin
        .from("places")
        .select("*")
        .eq("status", "published")
        .order("visited_at", {
          ascending: false,
          nullsFirst: false,
        });

    if (placesError) {
      console.error("GET /api/places error:", placesError);

      return NextResponse.json(
        { error: placesError.message },
        { status: 500 },
      );
    }

    const placeIds = (placesData ?? [])
      .map((place: any) => place.id)
      .filter(
        (id: unknown): id is string =>
          typeof id === "string" && id.length > 0,
      );

    const galleryImagesByPlaceId: Record<string, string> = {};

    if (placeIds.length > 0) {
      const {
        data: galleryData,
        error: galleryError,
      } = await supabaseAdmin
        .from("gallery_images")
        .select("place_id, image_url, sort_order, created_at")
        .in("place_id", placeIds)
        .order("sort_order", {
          ascending: true,
        })
        .order("created_at", {
          ascending: false,
        });

      if (galleryError) {
        console.error(
          "GET /api/places gallery images error:",
          galleryError,
        );
      } else {
        const firstImageByPlaceId = new Map<string, string>();

        for (const image of galleryData ?? []) {
          const placeId = image.place_id;

          if (
            typeof placeId === "string" &&
            !firstImageByPlaceId.has(placeId)
          ) {
            firstImageByPlaceId.set(
              placeId,
              image.image_url,
            );
          }
        }

        for (const [placeId, imageUrl] of firstImageByPlaceId) {
          galleryImagesByPlaceId[placeId] = imageUrl;
        }
      }
    }

    const places = (placesData ?? []).map((place: any) => ({
      ...place,
      image:
        typeof place.id === "string"
          ? galleryImagesByPlaceId[place.id] ?? ""
          : "",
    }));

    return NextResponse.json({
      places,
    });
  } catch (error) {
    console.error(
      "GET /api/places unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load places.",
      },
      { status: 500 },
    );
  }
}

// 管理者新增 Place
export async function POST(request: Request) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body =
      (await request.json()) as CreatePlaceBody;

    const city = body.city?.trim();
    const country = body.country?.trim();
    const slug = normalizeSlug(body.slug ?? "");
    const description =
      body.description?.trim() ?? "";
    const status = body.status ?? "draft";
    const continent =
      body.continent?.trim().toLowerCase() ?? "";
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (!city) {
      return NextResponse.json(
        { error: "City is required." },
        { status: 400 },
      );
    }

    if (!country) {
      return NextResponse.json(
        { error: "Country is required." },
        { status: 400 },
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required." },
        { status: 400 },
      );
    }

    if (
      !continent ||
      !validContinents.includes(
        continent as PlaceContinent,
      )
    ) {
      return NextResponse.json(
        { error: "Continent is required." },
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      return NextResponse.json(
        {
          error:
            "Latitude must be a number between -90 and 90.",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          error:
            "Longitude must be a number between -180 and 180.",
        },
        { status: 400 },
      );
    }

    if (
      status !== "draft" &&
      status !== "published"
    ) {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400 },
      );
    }

    const authorEmail = session.user?.email
      ?.trim()
      .toLowerCase();

    if (!authorEmail) {
      return NextResponse.json(
        { error: "找不到登入者的 email。" },
        { status: 400 },
      );
    }

    const {
      data: existingPlace,
      error: existingPlaceError,
    } = await supabaseAdmin
      .from("places")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (existingPlaceError) {
      console.error(
        "Check existing place error:",
        existingPlaceError,
      );

      return NextResponse.json(
        { error: existingPlaceError.message },
        { status: 500 },
      );
    }

    if (existingPlace) {
      return NextResponse.json(
        { error: "This slug already exists." },
        { status: 409 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("places")
      .insert({
        city,
        country,
        slug,
        description,
        status,
        continent,
        latitude,
        longitude,
        author_email: authorEmail,
      })
      .select("*")
      .single();

    if (error) {
      console.error("POST /api/places error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Place created successfully.",
        place: data,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "POST /api/places unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create place.",
      },
      { status: 500 },
    );
  }
}

// 管理者更新 Place
export async function PATCH(request: Request) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body =
      (await request.json()) as UpdatePlaceBody;

    const id = body.id?.trim();
    const city = body.city?.trim();
    const country = body.country?.trim();
    const slug = normalizeSlug(body.slug ?? "");
    const description =
      body.description?.trim() ?? "";
    const status = body.status ?? "draft";
    const continent =
      body.continent?.trim().toLowerCase() ?? "";
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (!id) {
      return NextResponse.json(
        { error: "Place ID is required." },
        { status: 400 },
      );
    }

    if (!city) {
      return NextResponse.json(
        { error: "City is required." },
        { status: 400 },
      );
    }

    if (!country) {
      return NextResponse.json(
        { error: "Country is required." },
        { status: 400 },
      );
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required." },
        { status: 400 },
      );
    }

    if (
      !continent ||
      !validContinents.includes(
        continent as PlaceContinent,
      )
    ) {
      return NextResponse.json(
        { error: "Continent is required." },
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      return NextResponse.json(
        {
          error:
            "Latitude must be a number between -90 and 90.",
        },
        { status: 400 },
      );
    }

    if (
      !Number.isFinite(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          error:
            "Longitude must be a number between -180 and 180.",
        },
        { status: 400 },
      );
    }

    if (
      status !== "draft" &&
      status !== "published"
    ) {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400 },
      );
    }

    const authorEmail = session.user?.email
      ?.trim()
      .toLowerCase();

    if (!authorEmail) {
      return NextResponse.json(
        { error: "找不到登入者的 email。" },
        { status: 400 },
      );
    }

    // 確認新的 slug 沒有被其他 Place 使用
    const {
      data: existingPlace,
      error: existingPlaceError,
    } = await supabaseAdmin
      .from("places")
      .select("id")
      .eq("slug", slug)
      .neq("id", id)
      .maybeSingle();

    if (existingPlaceError) {
      console.error(
        "Check update slug error:",
        existingPlaceError,
      );

      return NextResponse.json(
        { error: existingPlaceError.message },
        { status: 500 },
      );
    }

    if (existingPlace) {
      return NextResponse.json(
        { error: "This slug already exists." },
        { status: 409 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("places")
      .update({
        city,
        country,
        slug,
        description,
        status,
        continent,
        latitude,
        longitude,
      })
      .eq("id", id)
      .eq("author_email", authorEmail)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("PATCH /api/places error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "找不到這個 Place，或你沒有權限編輯。",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Place updated successfully.",
      place: data,
    });
  } catch (error) {
    console.error(
      "PATCH /api/places unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update place.",
      },
      { status: 500 },
    );
  }
}
export async function DELETE(request: Request) {
  try {
    const session = await requireAdmin();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Place ID is required." },
        { status: 400 },
      );
    }

    const authorEmail = session.user?.email
      ?.trim()
      .toLowerCase();

    const { error } = await supabaseAdmin
      .from("places")
      .delete()
      .eq("id", id)
      .eq("author_email", authorEmail);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Place deleted successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Delete failed.",
      },
      {
        status: 500,
      },
    );
  }
}