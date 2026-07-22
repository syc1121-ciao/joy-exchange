import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";

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

type FlightStatus =
  | "scheduled"
  | "on-time"
  | "delayed"
  | "cancelled"
  | "completed";

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

  status: FlightStatus;

  confidence:
    | "high"
    | "medium"
    | "low";

  calendarUrl?: string;
};

const AIRPORT_CITY_MAP: Record<string, string> = {
  TPE: "Taipei",
  TSA: "Taipei",
  KHH: "Kaohsiung",
  BNE: "Brisbane",

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

  JFK: "New York",
  EWR: "New York",
  LAX: "Los Angeles",
  SFO: "San Francisco",
};

const AIRLINE_MAP: Record<string,string> = {
  SQ:"Singapore Airlines",
  BR:"EVA Air",
  CI:"China Airlines",
  CX:"Cathay Pacific",
  LH:"Lufthansa",
  JL:"Japan Airlines",
  NH:"ANA",
  KE:"Korean Air",
  OZ:"Asiana Airlines",
  AF:"Air France",
  BA:"British Airways",
  KL:"KLM",
  EK:"Emirates",
  QR:"Qatar Airways",
  TK:"Turkish Airlines",
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
  const normalizedFlightNumber = flightNumber
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  const airlineCode = Object.keys(AIRLINE_MAP)
    .sort((first, second) => second.length - first.length)
    .find((code) => {
      if (!normalizedFlightNumber.startsWith(code)) {
        return false;
      }

      const remainingPart =
        normalizedFlightNumber.slice(code.length);

      return /^\d{1,4}[A-Z]?$/.test(remainingPart);
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
    ]
      .filter(Boolean)
      .join(" · "),

    status:
      event.status === "cancelled"
        ? "cancelled"
        : "scheduled",

    confidence,

    calendarUrl:
      event.htmlLink,
  };
}

export async function GET() {
  const session =
    await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      {
        error:
          "Google account is not connected.",
      },
      {
        status: 401,
      },
    );
  }

  if (session.authError) {
    return NextResponse.json(
      {
        error:
          "Google authorization expired. Please sign out and connect again.",
      },
      {
        status: 401,
      },
    );
  }

  if (!session.accessToken) {
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
            `Bearer ${session.accessToken}`,
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

    return NextResponse.json({
      candidates,
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