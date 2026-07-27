import {
  getServerSession,
} from "next-auth";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  authOptions,
} from "@/lib/authOptions";

import {
  getSupabaseAdmin,
} from "@/lib/supabaseAdmin";

type PlaceType =
  | "home"
  | "visited"
  | "dream"
  | "wishlist";

type PublishStatus =
  | "draft"
  | "published";

type CreatePlaceBody = {
  city?: unknown;
  country?: unknown;
  description?: unknown;
  image?: unknown;
  icon?: unknown;
  placeType?: unknown;
  publishStatus?: unknown;
  longitude?: unknown;
  latitude?: unknown;
};

const allowedPlaceTypes:
  PlaceType[] = [
    "home",
    "visited",
    "dream",
    "wishlist",
  ];

const allowedPublishStatuses:
  PublishStatus[] = [
    "draft",
    "published",
  ];

function createSlug(
  city: string,
  country: string,
) {
  const rawSlug =
    `${city}-${country}`
      .toLowerCase()
      .normalize("NFKD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .replace(
        /[^a-z0-9\u4e00-\u9fff]+/g,
        "-",
      )
      .replace(/^-+|-+$/g, "");

  return (
    rawSlug ||
    `place-${Date.now()}`
  );
}

function isFiniteNumber(
  value: unknown,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

async function createUniqueSlug(
  city: string,
  country: string,
) {
  const supabase =
    getSupabaseAdmin();

  const baseSlug =
    createSlug(city, country);

  let candidate = baseSlug;
  let counter = 2;

  while (true) {
    const {
      data,
      error,
    } = await supabase
      .from("places")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return candidate;
    }

    candidate =
      `${baseSlug}-${counter}`;

    counter += 1;
  }
}

export async function GET() {
  try {
    const supabase =
      getSupabaseAdmin();

    const {
      data,
      error,
    } = await supabase
      .from("places")
      .select(
        `
          id,
          city,
          country,
          slug,
          description,
          image,
          icon,
          status,
          place_type,
          longitude,
          latitude,
          created_at,
          updated_at
        `,
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      );

    if (error) {
      throw error;
    }

    return NextResponse.json({
      places: data ?? [],
    });
  } catch (error) {
    console.error(
      "Get places error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "讀取地點失敗。",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  try {
    const session =
      await getServerSession(
        authOptions,
      );

    if (!session?.user?.email) {
      return NextResponse.json(
        {
          error: "請先登入。",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      (await request.json()) as CreatePlaceBody;

    const city =
      typeof body.city === "string"
        ? body.city.trim()
        : "";

    const country =
      typeof body.country === "string"
        ? body.country.trim()
        : "";

    const description =
      typeof body.description ===
      "string"
        ? body.description.trim()
        : "";

    const image =
      typeof body.image === "string"
        ? body.image.trim()
        : "";

    const icon =
      typeof body.icon === "string" &&
      body.icon.trim()
        ? body.icon.trim()
        : "📍";

    const placeType =
      typeof body.placeType ===
        "string" &&
      allowedPlaceTypes.includes(
        body.placeType as PlaceType,
      )
        ? (body.placeType as PlaceType)
        : null;

    const publishStatus =
      typeof body.publishStatus ===
        "string" &&
      allowedPublishStatuses.includes(
        body.publishStatus as PublishStatus,
      )
        ? (body.publishStatus as PublishStatus)
        : null;

    const longitude =
      body.longitude;

    const latitude =
      body.latitude;

    if (!city) {
      return NextResponse.json(
        {
          error:
            "請輸入城市名稱。",
        },
        {
          status: 400,
        },
      );
    }

    if (!country) {
      return NextResponse.json(
        {
          error:
            "請輸入國家名稱。",
        },
        {
          status: 400,
        },
      );
    }

    if (!placeType) {
      return NextResponse.json(
        {
          error:
            "地點類型不正確。",
        },
        {
          status: 400,
        },
      );
    }

    if (!publishStatus) {
      return NextResponse.json(
        {
          error:
            "發布狀態不正確。",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !isFiniteNumber(longitude) ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          error:
            "經度資料不正確。",
        },
        {
          status: 400,
        },
      );
    }

    if (
      !isFiniteNumber(latitude) ||
      latitude < -90 ||
      latitude > 90
    ) {
      return NextResponse.json(
        {
          error:
            "緯度資料不正確。",
        },
        {
          status: 400,
        },
      );
    }

    const slug =
      await createUniqueSlug(
        city,
        country,
      );

    const supabase =
      getSupabaseAdmin();

    const {
      data,
      error,
    } = await supabase
      .from("places")
      .insert({
        city,
        country,
        slug,
        description:
          description || null,
        image: image || null,
        icon,
        status: publishStatus,
        place_type: placeType,
        longitude,
        latitude,
      })
      .select(
        `
          id,
          city,
          country,
          slug,
          description,
          image,
          icon,
          status,
          place_type,
          longitude,
          latitude,
          created_at
        `,
      )
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        place: data,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Create place error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "新增地點失敗。",
      },
      {
        status: 500,
      },
    );
  }
}