import {
  NextRequest,
  NextResponse,
} from "next/server";

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  country?: string;
  country_code?: string;
};

type NominatimResult = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  type?: string;
  addresstype?: string;
  address?: NominatimAddress;
};

function getCity(
  result: NominatimResult,
) {
  return (
    result.address?.city ??
    result.address?.town ??
    result.address?.village ??
    result.address?.municipality ??
    result.address?.county ??
    result.name ??
    result.display_name.split(",")[0]?.trim() ??
    ""
  );
}

function getCountry(
  result: NominatimResult,
) {
  return result.address?.country ?? "";
}

async function searchPlaces(
  query: string,
) {
  const url = new URL(
    "https://nominatim.openstreetmap.org/search",
  );

  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("accept-language", "en");

  const response = await fetch(
    url.toString(),
    {
      headers: {
        "User-Agent":
          "JoyExchangeAdventure/1.0",
        Accept: "application/json",
      },
      next: {
        revalidate: 86400,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Geocoding search failed: ${response.status}`,
    );
  }

  const results =
    (await response.json()) as NominatimResult[];

  return results.map((result) => ({
    id: String(result.place_id),
    city: getCity(result),
    country: getCountry(result),
    displayName: result.display_name,
    longitude: Number(result.lon),
    latitude: Number(result.lat),
    type:
      result.addresstype ??
      result.type ??
      "",
  }));
}

async function reversePlace(
  latitude: string,
  longitude: string,
) {
  const url = new URL(
    "https://nominatim.openstreetmap.org/reverse",
  );

  url.searchParams.set(
    "lat",
    latitude,
  );

  url.searchParams.set(
    "lon",
    longitude,
  );

  url.searchParams.set(
    "format",
    "jsonv2",
  );

  url.searchParams.set(
    "addressdetails",
    "1",
  );

  url.searchParams.set(
    "accept-language",
    "en",
  );

  const response = await fetch(
    url.toString(),
    {
      headers: {
        "User-Agent":
          "JoyExchangeAdventure/1.0",
        Accept: "application/json",
      },
      next: {
        revalidate: 86400,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Reverse geocoding failed: ${response.status}`,
    );
  }

  const result =
    (await response.json()) as NominatimResult;

  return {
    id: String(result.place_id),
    city: getCity(result),
    country: getCountry(result),
    displayName: result.display_name,
    longitude: Number(result.lon),
    latitude: Number(result.lat),
  };
}

export async function GET(
  request: NextRequest,
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const query =
      searchParams.get("q")?.trim();

    const latitude =
      searchParams.get("lat")?.trim();

    const longitude =
      searchParams.get("lon")?.trim();

    if (query) {
      if (query.length < 2) {
        return NextResponse.json(
          {
            error:
              "請至少輸入兩個字元。",
          },
          {
            status: 400,
          },
        );
      }

      const results =
        await searchPlaces(query);

      return NextResponse.json({
        results,
      });
    }

    if (latitude && longitude) {
      const location =
        await reversePlace(
          latitude,
          longitude,
        );

      return NextResponse.json({
        location,
      });
    }

    return NextResponse.json(
      {
        error:
          "請提供搜尋文字或經緯度。",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    console.error(
      "Geocode API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "地點搜尋失敗。",
      },
      {
        status: 500,
      },
    );
  }
}