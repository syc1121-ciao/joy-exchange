import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const supabaseAdmin = getSupabaseAdmin();

type GoogleCalendarDate = {
  date?: string;
  dateTime?: string;
  timeZone?: string;
};

type GoogleCalendarEvent = {
  id?: string;
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  htmlLink?: string;

  start?: GoogleCalendarDate;
  end?: GoogleCalendarDate;
};

type GoogleCalendarResponse = {
  items?: GoogleCalendarEvent[];
  nextPageToken?: string;
};

type CalendarFlightStatus =
  | "scheduled"
  | "on-time"
  | "delayed"
  | "cancelled"
  | "completed";

type DatabaseFlightStatus =
  | "planned"
  | "booked"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "delayed";

type FlightCandidate = {
  calendarEventId: string;

  title: string;
  description: string;
  location: string;

  airline: string;
  flightNumber: string;

  departureAirport: string;
  departureCity: string;
  departureTime: string;

  arrivalAirport: string;
  arrivalCity: string;
  arrivalTime: string;

  destinationSlug: string;

  terminal: string;
  gate: string;
  seat: string;
  bookingReference: string;
  notes: string;

  status: CalendarFlightStatus;

  confidence:
    | "high"
    | "medium"
    | "low";

  calendarUrl?: string;
};

type ImportRequestBody = {
  flights?: FlightCandidate[];
};

const AIRPORT_CITY_MAP: Record<string, string> = {
  TPE: "Taipei",
  TSA: "Taipei",
  KHH: "Kaohsiung",
  BNE: "Brisbane",
  
  AUH: "Abu Dhabi",
  
  MUC: "Munich",
  FRA: "Frankfurt",
  BER: "Berlin",

  CDG: "Paris",
  ORY: "Paris",

  PRG: "Prague",
  VIE: "Vienna",
  AMS: "Amsterdam",

  LHR: "London",
  LGW: "London",

  FCO: "Rome",
  MXP: "Milan",
  ZRH: "Zurich",

  ICN: "Seoul",
  GMP: "Seoul",

  NRT: "Tokyo",
  HND: "Tokyo",

  SIN: "Singapore",
  BKK: "Bangkok",

  DXB: "Dubai",
  DOH: "Doha",
  IST: "Istanbul",

  JFK: "New York",
  EWR: "New York",
  LAX: "Los Angeles",
  SFO: "San Francisco",
};

const AIRLINE_MAP: Record<string, string> = {
  SQ: "Singapore Airlines",
  BR: "EVA Air",
  CI: "China Airlines",
  CX: "Cathay Pacific",
  LH: "Lufthansa",
  JL: "Japan Airlines",
  NH: "ANA",
  KE: "Korean Air",
  OZ: "Asiana Airlines",
  AF: "Air France",
  BA: "British Airways",
  KL: "KLM",
  EK: "Emirates",
  QR: "Qatar Airways",
  TK: "Turkish Airlines",
};

function normalizeText(
  event: GoogleCalendarEvent,
) {
  return [
    event.summary,
    event.description,
    event.location,
  ]
    .filter(
      (value): value is string =>
        Boolean(value),
    )
    .join("\n")
    .replace(/\u00a0/g, " ");
}

function normalizeValue(
  value: unknown,
) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function findFlightNumber(text: string) {
  const match = text
    .toUpperCase()
    .match(
      /\b([A-Z0-9]{2,3})\s?(\d{2,4}[A-Z]?)\b/,
    );

  if (!match) {
    return "";
  }

  return `${match[1]}${match[2]}`;
}

function getAirlineFromFlightNumber(
  flightNumber: string,
) {
  const normalizedFlightNumber =
    flightNumber
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "");

  const airlineCode = Object.keys(
    AIRLINE_MAP,
  )
    .sort(
      (first, second) =>
        second.length - first.length,
    )
    .find((code) => {
      if (
        !normalizedFlightNumber.startsWith(
          code,
        )
      ) {
        return false;
      }

      const remainingPart =
        normalizedFlightNumber.slice(
          code.length,
        );

      return /^\d{1,4}[A-Z]?$/.test(
        remainingPart,
      );
    });

  return airlineCode
    ? AIRLINE_MAP[airlineCode]
    : "";
}

function findAirportCodes(text: string) {
  const upperText = text.toUpperCase();

  const pairMatch = upperText.match(
    /\b([A-Z]{3})\s*(?:→|➜|->|–|—|-|TO)\s*([A-Z]{3})\b/,
  );

  if (pairMatch) {
    return [
      pairMatch[1],
      pairMatch[2],
    ] as const;
  }

  const knownCodes = Array.from(
    upperText.matchAll(/\b[A-Z]{3}\b/g),
  )
    .map((match) => match[0])
    .filter(
      (code) =>
        code in AIRPORT_CITY_MAP,
    );

  const uniqueCodes = [
    ...new Set(knownCodes),
  ];

  return [
    uniqueCodes[0] ?? "",
    uniqueCodes[1] ?? "",
  ] as const;
}

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function looksLikeFlight(
  event: GoogleCalendarEvent,
) {
  const text = normalizeText(event);

  const flightNumber =
    findFlightNumber(text);

  const [
    departureAirport,
    arrivalAirport,
  ] = findAirportCodes(text);

  const hasFlightKeyword =
    /\b(FLIGHT|AIRLINE|AIRPORT|BOARDING|航班|班機|飛機|航空|登機)\b/i.test(
      text,
    );

  return Boolean(
    flightNumber ||
      (departureAirport &&
        arrivalAirport) ||
      hasFlightKeyword,
  );
}

function eventToCandidate(
  event: GoogleCalendarEvent,
): FlightCandidate | null {
  if (
    !event.id ||
    !event.start?.dateTime ||
    !event.end?.dateTime
  ) {
    return null;
  }

  const text = normalizeText(event);

  const flightNumber =
    findFlightNumber(text);

  const airline =
    getAirlineFromFlightNumber(
      flightNumber,
    );

  const [
    departureAirport,
    arrivalAirport,
  ] = findAirportCodes(text);

  const departureCity =
    AIRPORT_CITY_MAP[
      departureAirport
    ] ?? "";

  const arrivalCity =
    AIRPORT_CITY_MAP[
      arrivalAirport
    ] ?? "";

  let confidence:
    | "high"
    | "medium"
    | "low" = "low";

  if (
    flightNumber &&
    departureAirport &&
    arrivalAirport
  ) {
    confidence = "high";
  } else if (
    flightNumber ||
    (departureAirport &&
      arrivalAirport)
  ) {
    confidence = "medium";
  }

  return {
    calendarEventId: event.id,

    title:
      event.summary ??
      "Google Calendar flight",

    description:
      event.description ?? "",

    location:
      event.location ?? "",

    airline,
    flightNumber,

    departureAirport,
    departureCity,
    departureTime:
      event.start.dateTime,

    arrivalAirport,
    arrivalCity,
    arrivalTime:
      event.end.dateTime,

    destinationSlug:
      createSlug(
        arrivalCity ||
          arrivalAirport,
      ),

    terminal: "",
    gate: "",
    seat: "",
    bookingReference: "",

    notes: [
      event.summary,
      event.location,
      event.description,
    ]
      .filter(Boolean)
      .join("\n"),

    status:
      event.status === "cancelled"
        ? "cancelled"
        : "scheduled",

    confidence,

    calendarUrl:
      event.htmlLink,
  };
}

function toDatabaseStatus(
  status: CalendarFlightStatus,
): DatabaseFlightStatus {
  switch (status) {
    case "cancelled":
      return "cancelled";

    case "delayed":
      return "delayed";

    case "completed":
      return "completed";

    case "on-time":
    case "scheduled":
    default:
      return "booked";
  }
}

async function getAuthenticatedSession() {
  const session =
    await getServerSession(authOptions);

  if (!session?.user?.email) {
    return {
      session: null,
      error:
        "Google account is not connected.",
      status: 401,
    };
  }

  if (session.authError) {
    return {
      session: null,
      error:
        "Google authorization expired. Please sign out and connect again.",
      status: 401,
    };
  }

  return {
    session,
    error: null,
    status: 200,
  };
}

/**
 * 從 Google Calendar 搜尋可能的航班。
 */
export async function GET() {
  const auth =
    await getAuthenticatedSession();

  if (!auth.session) {
    return NextResponse.json(
      {
        error: auth.error,
      },
      {
        status: auth.status,
      },
    );
  }

  if (!auth.session.accessToken) {
    return NextResponse.json(
      {
        error:
          "Google Calendar permission is missing.",
      },
      {
        status: 401,
      },
    );
  }

  const user = auth.session.user;

  if (!user?.email) {
    return NextResponse.json(
      {
        error: "Authenticated user email is missing.",
      },
      {
        status: 401,
      },
    );
  }

  const authorEmail = user.email
    .trim()
    .toLowerCase();

  const now = new Date();

  const oneYearLater =
    new Date(now);

  oneYearLater.setFullYear(
    oneYearLater.getFullYear() + 1,
  );

  const params =
    new URLSearchParams({
      timeMin: now.toISOString(),
      timeMax:
        oneYearLater.toISOString(),

      singleEvents: "true",
      orderBy: "startTime",

      maxResults: "250",
      showDeleted: "false",
    });

  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
      {
        headers: {
          Authorization:
            `Bearer ${auth.session.accessToken}`,
        },

        cache: "no-store",
      },
    );

    if (!response.ok) {
      const details =
        await response.text();

      console.error(
        "Google Calendar API error:",
        response.status,
        details,
      );

      return NextResponse.json(
        {
          error:
            response.status === 403
              ? "Google Calendar API is not enabled, or Calendar permission was not granted."
              : "Unable to read Google Calendar.",
        },
        {
          status: response.status,
        },
      );
    }

    const calendarData =
      (await response.json()) as
        GoogleCalendarResponse;

    const candidates =
      (calendarData.items ?? [])
        .filter(looksLikeFlight)
        .map(eventToCandidate)
        .filter(
          (
            candidate,
          ): candidate is FlightCandidate =>
            candidate !== null,
        );

    const candidateIds =
      candidates.map(
        (candidate) =>
          candidate.calendarEventId,
      );

    let importedCalendarEventIds:
      string[] = [];

    if (candidateIds.length > 0) {
      const {
        data: existingFlights,
        error: existingError,
      } = await supabaseAdmin
        .from("flights")
        .select("calendar_event_id")
        .eq(
          "author_email",
          authorEmail,
        )
        .in(
          "calendar_event_id",
          candidateIds,
        );

      if (existingError) {
        console.error(
          "Unable to check imported flights:",
          existingError,
        );
      } else {
        importedCalendarEventIds =
          (existingFlights ?? [])
            .map(
              (flight) =>
                flight.calendar_event_id,
            )
            .filter(
              (
                id,
              ): id is string =>
                Boolean(id),
            );
      }
    }

    return NextResponse.json({
      candidates,

      importedCalendarEventIds,

      totalEvents:
        calendarData.items?.length ?? 0,
    });
  } catch (error) {
    console.error(
      "Calendar request failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to connect to Google Calendar.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * 把使用者選取的航班存入 Supabase。
 */
export async function POST(
  request: Request,
) {
  const auth =
    await getAuthenticatedSession();

  if (!auth.session) {
    return NextResponse.json(
      {
        error: auth.error,
      },
      {
        status: auth.status,
      },
    );
  }

  const user = auth.session.user;

  if (!user?.email) {
    return NextResponse.json(
      {
        error: "Authenticated user email is missing.",
      },
      {
        status: 401,
      },
    );
  }

  const authorEmail = user.email
    .trim()
    .toLowerCase();

  try {
    const body =
      (await request.json()) as
        ImportRequestBody;

    const candidates =
      body.flights ?? [];

    if (
      !Array.isArray(candidates) ||
      candidates.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Select at least one flight.",
        },
        {
          status: 400,
        },
      );
    }

    const validCandidates =
      candidates.filter(
        (candidate) => {
          return Boolean(
            normalizeValue(
              candidate.calendarEventId,
            ) &&
              normalizeValue(
                candidate.departureAirport,
              ) &&
              normalizeValue(
                candidate.arrivalAirport,
              ) &&
              normalizeValue(
                candidate.departureTime,
              ) &&
              normalizeValue(
                candidate.arrivalTime,
              ),
          );
        },
      );

    if (
      validCandidates.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "The selected flights do not contain enough information.",
        },
        {
          status: 400,
        },
      );
    }

    const calendarEventIds =
      validCandidates.map(
        (candidate) =>
          candidate.calendarEventId,
      );

    const {
      data: existingFlights,
      error: existingError,
    } = await supabaseAdmin
      .from("flights")
      .select(`
        id,
        calendar_event_id
      `)
      .eq(
        "author_email",
        authorEmail,
      )
      .in(
        "calendar_event_id",
        calendarEventIds,
      );

    if (existingError) {
      return NextResponse.json(
        {
          error:
            existingError.message,
        },
        {
          status: 500,
        },
      );
    }

    const existingIds = new Set(
      (existingFlights ?? [])
        .map(
          (flight) =>
            flight.calendar_event_id,
        )
        .filter(Boolean),
    );

    const newCandidates =
      validCandidates.filter(
        (candidate) =>
          !existingIds.has(
            candidate.calendarEventId,
          ),
      );

    if (
      newCandidates.length === 0
    ) {
      return NextResponse.json({
        inserted: 0,
        skipped:
          validCandidates.length,
        flights: [],
        message:
          "All selected flights have already been imported.",
      });
    }

    const rows = newCandidates.map(
      (candidate) => ({
        author_email:
          authorEmail,

        airline:
          normalizeValue(
            candidate.airline,
          ) || "Unknown airline",

        flight_number:
          normalizeValue(
            candidate.flightNumber,
          )
            .toUpperCase()
            .replace(/\s+/g, "") ||
          "UNKNOWN",

        booking_reference:
          normalizeValue(
            candidate.bookingReference,
          ) || null,

        departure_airport:
          normalizeValue(
            candidate.departureAirport,
          ).toUpperCase(),

        departure_city:
          normalizeValue(
            candidate.departureCity,
          ) || null,

        departure_terminal:
          normalizeValue(
            candidate.terminal,
          ) || null,

        departure_gate:
          normalizeValue(
            candidate.gate,
          ) || null,

        departure_time:
          new Date(
            candidate.departureTime,
          ).toISOString(),

        arrival_airport:
          normalizeValue(
            candidate.arrivalAirport,
          ).toUpperCase(),

        arrival_city:
          normalizeValue(
            candidate.arrivalCity,
          ) || null,

        arrival_terminal: null,
        arrival_gate: null,

        arrival_time:
          new Date(
            candidate.arrivalTime,
          ).toISOString(),

        seat:
          normalizeValue(
            candidate.seat,
          ) || null,

        cabin_class: "economy",

        ticket_type: null,
        aircraft: null,

        price: null,
        currency: "TWD",

        miles_program: null,
        miles_earned: 0,

        status:
          toDatabaseStatus(
            candidate.status,
          ),

        notes:
          normalizeValue(
            candidate.notes,
          ) || null,

        arrival_place_id: null,

        calendar_event_id:
          candidate.calendarEventId,

        source:
          "google-calendar",
      }),
    );

    const {
      data: insertedFlights,
      error: insertError,
    } = await supabaseAdmin
      .from("flights")
      .insert(rows)
      .select("*");

    if (insertError) {
      console.error(
        "Google flight import error:",
        insertError,
      );

      return NextResponse.json(
        {
          error:
            insertError.message,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      inserted:
        insertedFlights?.length ?? 0,

      skipped:
        validCandidates.length -
        newCandidates.length,

      flights:
        insertedFlights ?? [],

      message:
        `${insertedFlights?.length ?? 0} flight(s) imported successfully.`,
    });
  } catch (error) {
    console.error(
      "POST /api/flights/import error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to import flights.",
      },
      {
        status: 500,
      },
    );
  }
}