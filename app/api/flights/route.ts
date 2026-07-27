import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/requireAdmin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const supabaseAdmin = getSupabaseAdmin();

const FLIGHT_DOCUMENT_BUCKET =
  "flight-documents";

const MAXIMUM_FILE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

type FlightStatus =
  | "planned"
  | "booked"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "delayed";

type CabinClass =
  | "economy"
  | "premium_economy"
  | "business"
  | "first";

type FlightBody = {
  id?: string;

  airline?: string;
  flightNumber?: string;
  bookingReference?: string;

  departureAirport?: string;
  departureCity?: string;
  departureTerminal?: string;
  departureGate?: string;
  departureTime?: string;

  arrivalAirport?: string;
  arrivalCity?: string;
  arrivalTerminal?: string;
  arrivalGate?: string;
  arrivalTime?: string;

  seat?: string;
  cabinClass?: CabinClass;
  ticketType?: string;
  aircraft?: string;

  price?: string | number | null;
  currency?: string;

  milesProgram?: string;
  milesEarned?: string | number | null;

  status?: FlightStatus;
  arrivalPlaceId?: string;

  notes?: string;
};

const validStatuses: FlightStatus[] = [
  "planned",
  "booked",
  "checked_in",
  "completed",
  "cancelled",
  "delayed",
];

const validCabinClasses: CabinClass[] = [
  "economy",
  "premium_economy",
  "business",
  "first",
];

function normalizeText(
  value: unknown,
): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeAirportCode(
  value: unknown,
) {
  return normalizeText(value).toUpperCase();
}

function normalizeFlightNumber(
  value: unknown,
) {
  return normalizeText(value)
    .toUpperCase()
    .replace(/\s+/g, "");
}

function normalizeCurrency(
  value: unknown,
) {
  const currency =
    normalizeText(value).toUpperCase();

  return currency || "TWD";
}

function nullableText(
  value: unknown,
): string | null {
  const text = normalizeText(value);

  return text || null;
}

function parsePrice(
  value: unknown,
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const numberValue = Number(value);

  if (
    !Number.isFinite(numberValue) ||
    numberValue < 0
  ) {
    return null;
  }

  return numberValue;
}

function parseMiles(
  value: unknown,
): number {
  const numberValue = Number(value);

  if (
    !Number.isFinite(numberValue) ||
    numberValue < 0
  ) {
    return 0;
  }

  return Math.floor(numberValue);
}

function parseDateTime(
  value: unknown,
): string | null {
  const text = normalizeText(value);

  if (!text) {
    return null;
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function sanitizeFileName(
  fileName: string,
) {
  const lastDotIndex =
    fileName.lastIndexOf(".");

  const extension =
    lastDotIndex >= 0
      ? fileName
          .slice(lastDotIndex + 1)
          .toLowerCase()
      : "file";

  const baseName =
    lastDotIndex >= 0
      ? fileName.slice(0, lastDotIndex)
      : fileName;

  const cleanBaseName = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

  return `${
    cleanBaseName || "flight-document"
  }.${extension}`;
}

async function getAdminEmail() {
  const session = await requireAdmin();

  return (
    session?.user?.email
      ?.trim()
      .toLowerCase() ?? null
  );
}

async function validateArrivalPlace({
  arrivalPlaceId,
  authorEmail,
}: {
  arrivalPlaceId: string | null;
  authorEmail: string;
}) {
  if (!arrivalPlaceId) {
    return null;
  }

  const { data, error } =
    await supabaseAdmin
      .from("places")
      .select("id")
      .eq("id", arrivalPlaceId)
      .eq("author_email", authorEmail)
      .maybeSingle();

  if (error) {
    return {
      error: error.message,
      status: 500,
    };
  }

  if (!data) {
    return {
      error:
        "Selected arrival place does not exist.",
      status: 404,
    };
  }

  return null;
}

function validateFlightBody(
  body: FlightBody,
) {
  const airline = normalizeText(
    body.airline,
  );

  const flightNumber =
    normalizeFlightNumber(
      body.flightNumber,
    );

  const departureAirport =
    normalizeAirportCode(
      body.departureAirport,
    );

  const arrivalAirport =
    normalizeAirportCode(
      body.arrivalAirport,
    );

  const departureTime = parseDateTime(
    body.departureTime,
  );

  const arrivalTime = parseDateTime(
    body.arrivalTime,
  );

  const status =
    body.status ?? "planned";

  const cabinClass =
    body.cabinClass ?? "economy";

  if (!airline) {
    return {
      error: "Airline is required.",
    };
  }

  if (!flightNumber) {
    return {
      error:
        "Flight number is required.",
    };
  }

  if (!departureAirport) {
    return {
      error:
        "Departure airport is required.",
    };
  }

  if (!arrivalAirport) {
    return {
      error:
        "Arrival airport is required.",
    };
  }

  if (!departureTime) {
    return {
      error:
        "A valid departure time is required.",
    };
  }

  if (!arrivalTime) {
    return {
      error:
        "A valid arrival time is required.",
    };
  }

  if (
    new Date(arrivalTime).getTime() <=
    new Date(departureTime).getTime()
  ) {
    return {
      error:
        "Arrival time must be later than departure time.",
    };
  }

  if (
    !validStatuses.includes(status)
  ) {
    return {
      error: "Invalid flight status.",
    };
  }

  if (
    !validCabinClasses.includes(
      cabinClass,
    )
  ) {
    return {
      error: "Invalid cabin class.",
    };
  }

  return {
    value: {
      airline,
      flight_number: flightNumber,

      booking_reference: nullableText(
        body.bookingReference,
      ),

      departure_airport:
        departureAirport,

      departure_city: nullableText(
        body.departureCity,
      ),

      departure_terminal: nullableText(
        body.departureTerminal,
      ),

      departure_gate: nullableText(
        body.departureGate,
      ),

      departure_time: departureTime,

      arrival_airport: arrivalAirport,

      arrival_city: nullableText(
        body.arrivalCity,
      ),

      arrival_terminal: nullableText(
        body.arrivalTerminal,
      ),

      arrival_gate: nullableText(
        body.arrivalGate,
      ),

      arrival_time: arrivalTime,

      seat: nullableText(body.seat),

      cabin_class: cabinClass,

      ticket_type: nullableText(
        body.ticketType,
      ),

      aircraft: nullableText(
        body.aircraft,
      ),

      price: parsePrice(body.price),

      currency: normalizeCurrency(
        body.currency,
      ),

      miles_program: nullableText(
        body.milesProgram,
      ),

      miles_earned: parseMiles(
        body.milesEarned,
      ),

      status,

      arrival_place_id:
        nullableText(
          body.arrivalPlaceId,
        ),

      notes: nullableText(body.notes),
    },
  };
}

// 公開取得所有航班
export async function GET() {
  try {
    const { data, error } =
      await supabaseAdmin
        .from("flights")
        .select(`
          id,
          airline,
          flight_number,
          booking_reference,

          departure_airport,
          departure_city,
          departure_terminal,
          departure_gate,
          departure_time,

          arrival_airport,
          arrival_city,
          arrival_terminal,
          arrival_gate,
          arrival_time,

          seat,
          cabin_class,
          ticket_type,
          aircraft,

          price,
          currency,

          miles_program,
          miles_earned,

          status,
          notes,

          boarding_pass_url,
          boarding_pass_name,

          created_at,
          updated_at,

          arrival_place:places (
            id,
            city,
            country,
            slug
          )
        `)
        .order("departure_time", {
          ascending: true,
        });

    if (error) {
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
      flights: data ?? [],
    });
  } catch (error) {
    console.error(
      "GET /api/flights error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load flights.",
      },
      {
        status: 500,
      },
    );
  }
}

// 新增航班
export async function POST(
  request: Request,
) {
  try {
    const authorEmail =
      await getAdminEmail();

    if (!authorEmail) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      (await request.json()) as FlightBody;

    const validation =
      validateFlightBody(body);

    if ("error" in validation) {
      return NextResponse.json(
        {
          error: validation.error,
        },
        {
          status: 400,
        },
      );
    }

    const relationError =
      await validateArrivalPlace({
        arrivalPlaceId:
          validation.value
            .arrival_place_id,
        authorEmail,
      });

    if (relationError) {
      return NextResponse.json(
        {
          error: relationError.error,
        },
        {
          status: relationError.status,
        },
      );
    }

    const { data, error } =
      await supabaseAdmin
        .from("flights")
        .insert({
          ...validation.value,
          author_email: authorEmail,
        })
        .select("*")
        .single();

    if (error) {
      console.error(
        "POST /api/flights error:",
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
        message:
          "Flight created successfully.",
        flight: data,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "POST /api/flights unexpected error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create flight.",
      },
      {
        status: 500,
      },
    );
  }
}

// 更新航班
export async function PATCH(
  request: Request,
) {
  try {
    const authorEmail =
      await getAdminEmail();

    if (!authorEmail) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      (await request.json()) as FlightBody;

    const id = normalizeText(body.id);

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Flight ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const validation =
      validateFlightBody(body);

    if ("error" in validation) {
      return NextResponse.json(
        {
          error: validation.error,
        },
        {
          status: 400,
        },
      );
    }

    const relationError =
      await validateArrivalPlace({
        arrivalPlaceId:
          validation.value
            .arrival_place_id,
        authorEmail,
      });

    if (relationError) {
      return NextResponse.json(
        {
          error: relationError.error,
        },
        {
          status: relationError.status,
        },
      );
    }

    const { data, error } =
      await supabaseAdmin
        .from("flights")
        .update({
          ...validation.value,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .eq(
          "author_email",
          authorEmail,
        )
        .select("*")
        .maybeSingle();

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        },
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          error:
            "Flight not found or you do not have permission to edit it.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      message:
        "Flight updated successfully.",
      flight: data,
    });
  } catch (error) {
    console.error(
      "PATCH /api/flights error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update flight.",
      },
      {
        status: 500,
      },
    );
  }
}

// 刪除航班
export async function DELETE(
  request: Request,
) {
  try {
    const authorEmail =
      await getAdminEmail();

    if (!authorEmail) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const { searchParams } =
      new URL(request.url);

    const id =
      searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Flight ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      data: existingFlight,
      error: readError,
    } = await supabaseAdmin
      .from("flights")
      .select(`
        id,
        boarding_pass_path
      `)
      .eq("id", id)
      .eq(
        "author_email",
        authorEmail,
      )
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

    if (!existingFlight) {
      return NextResponse.json(
        {
          error: "Flight not found.",
        },
        {
          status: 404,
        },
      );
    }

    const { error: deleteError } =
      await supabaseAdmin
        .from("flights")
        .delete()
        .eq("id", id)
        .eq(
          "author_email",
          authorEmail,
        );

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

    if (
      existingFlight.boarding_pass_path
    ) {
      const { error: storageError } =
        await supabaseAdmin.storage
          .from(
            FLIGHT_DOCUMENT_BUCKET,
          )
          .remove([
            existingFlight
              .boarding_pass_path,
          ]);

      if (storageError) {
        console.error(
          "Flight document delete warning:",
          storageError,
        );
      }
    }

    return NextResponse.json({
      success: true,
      deletedId: existingFlight.id,
    });
  } catch (error) {
    console.error(
      "DELETE /api/flights error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete flight.",
      },
      {
        status: 500,
      },
    );
  }
}

// // 提供給文件 API 共用
// export {
//   ALLOWED_FILE_TYPES,
//   FLIGHT_DOCUMENT_BUCKET,
//   MAXIMUM_FILE_SIZE,
//   sanitizeFileName,
// };