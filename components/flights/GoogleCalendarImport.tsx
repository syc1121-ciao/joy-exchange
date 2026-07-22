"use client";

import {
  signIn,
  signOut,
  useSession,
} from "next-auth/react";

import {
  useMemo,
  useState,
} from "react";

import {
  useFlights,
} from "./FlightProvider";

import type {
  FlightFormData,
  FlightStatus,
} from "./types";

type CalendarCandidate = {
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

type CalendarResponse = {
  candidates?: CalendarCandidate[];
  totalEvents?: number;
  error?: string;
};

function toFlightFormData(
  candidate: CalendarCandidate,
): FlightFormData {
  return {
    airline:
      candidate.airline ||
      "Unknown airline",

    flightNumber:
      candidate.flightNumber ||
      "UNKNOWN",

    departureAirport:
      candidate.departureAirport,

    departureCity:
      candidate.departureCity,

    departureTime:
      candidate.departureTime,

    arrivalAirport:
      candidate.arrivalAirport,

    arrivalCity:
      candidate.arrivalCity,

    arrivalTime:
      candidate.arrivalTime,

    destinationSlug:
      candidate.destinationSlug,

    terminal:
      candidate.terminal,

    gate:
      candidate.gate,

    seat:
      candidate.seat,

    bookingReference:
      candidate.bookingReference,

    notes:
      candidate.notes,

    status:
      candidate.status,

    calendarEventId:
      candidate.calendarEventId,

    source:
      "google-calendar",
  };
}

export default function GoogleCalendarImport() {
  const {
    status,
  } = useSession();

  const {
    flights,
    importFlights,
  } = useFlights();

  const [
    candidates,
    setCandidates,
  ] = useState<CalendarCandidate[]>(
    [],
  );

  const [
    selectedIds,
    setSelectedIds,
  ] = useState<Set<string>>(
    new Set(),
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const [
    message,
    setMessage,
  ] = useState<string | null>(
    null,
  );

  const importedCalendarIds =
    useMemo(
      () =>
        new Set(
          flights
            .map(
              (flight) =>
                flight.calendarEventId,
            )
            .filter(
              (
                id,
              ): id is string =>
                Boolean(id),
            ),
        ),
      [flights],
    );

  const loadCalendarFlights =
    async () => {
      try {
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const response = await fetch(
          "/api/calendar/flights",
          {
            cache: "no-store",
          },
        );

        const data =
          (await response.json()) as
            CalendarResponse;

        if (!response.ok) {
          throw new Error(
            data.error ??
              "Unable to read Google Calendar.",
          );
        }

        const nextCandidates =
          data.candidates ?? [];

        setCandidates(
          nextCandidates,
        );

        setSelectedIds(
          new Set(
            nextCandidates
              .filter(
                (candidate) =>
                  !importedCalendarIds.has(
                    candidate.calendarEventId,
                  ),
              )
              .map(
                (candidate) =>
                  candidate.calendarEventId,
              ),
          ),
        );

        if (
          nextCandidates.length === 0
        ) {
          setMessage(
            "No possible flights were found.",
          );
        }
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to read Google Calendar.",
        );
      } finally {
        setIsLoading(false);
      }
    };

  const toggleCandidate = (
    id: string,
  ) => {
    setSelectedIds(
      (currentIds) => {
        const nextIds =
          new Set(currentIds);

        if (nextIds.has(id)) {
          nextIds.delete(id);
        } else {
          nextIds.add(id);
        }

        return nextIds;
      },
    );
  };

  const handleImport = () => {
    const selectedFlights =
      candidates
        .filter(
          (candidate) =>
            selectedIds.has(
              candidate.calendarEventId,
            ),
        )
        .map(toFlightFormData);

    if (
      selectedFlights.length === 0
    ) {
      setMessage(
        "Select at least one flight.",
      );

      return;
    }

    importFlights(
      selectedFlights,
    );

    setMessage(
      `${selectedFlights.length} flight(s) imported successfully.`,
    );

    setSelectedIds(
      new Set(),
    );
  };

  if (
    status === "loading"
  ) {
    return (
      <div className="h-28 animate-pulse rounded-[2rem] bg-black/5" />
    );
  }

  return (
    <section className="rounded-[2rem] border border-black/5 bg-[#f6f3ef] p-5 sm:p-7">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Google Calendar
          </p>

          <h2 className="mt-2 font-serif text-2xl text-slate-900">
            Import flight events
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Read your Calendar and review
            possible flights before importing.
          </p>
        </div>

        {status !==
        "authenticated" ? (
          <button
            type="button"
            className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm text-white sm:w-auto"
            onClick={() => {
              void signIn("google");
            }}
          >
            Connect Google Calendar
          </button>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={isLoading}
              className="rounded-full bg-slate-950 px-6 py-3 text-sm text-white disabled:opacity-50"
              onClick={() => {
                void loadCalendarFlights();
              }}
            >
              {isLoading
                ? "Reading Calendar…"
                : "Find flights"}
            </button>

            <button
              type="button"
              className="rounded-full border border-black/10 px-5 py-3 text-sm"
              onClick={() => {
                void signOut();
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-5 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
          {message}
        </p>
      )}

      {candidates.length > 0 && (
        <div className="mt-7 space-y-3">
          {candidates.map(
            (candidate) => {
              const alreadyImported =
                importedCalendarIds.has(
                  candidate.calendarEventId,
                );

              return (
                <label
                  key={
                    candidate.calendarEventId
                  }
                  className={[
                    "flex gap-4 rounded-3xl border p-4",
                    alreadyImported
                      ? "cursor-default border-black/5 bg-black/[0.025] opacity-60"
                      : "cursor-pointer border-black/5 bg-white",
                  ].join(" ")}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 shrink-0"
                    checked={
                      selectedIds.has(
                        candidate.calendarEventId,
                      )
                    }
                    disabled={
                      alreadyImported
                    }
                    onChange={() => {
                      toggleCandidate(
                        candidate.calendarEventId,
                      );
                    }}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-800">
                          {candidate.title}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {candidate.airline ||
                            "Airline unknown"}
                          {" · "}
                          {candidate.flightNumber ||
                            "Flight number missing"}
                        </p>
                      </div>

                      <span className="rounded-full bg-[#f1ede8] px-3 py-1 text-[10px] uppercase tracking-[0.1em] text-slate-500">
                        {alreadyImported
                          ? "Imported"
                          : candidate.confidence}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                      <div className="min-w-0">
                        <p className="font-serif text-2xl">
                          {candidate.departureAirport ||
                            "—"}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                          {candidate.departureCity ||
                            "Unknown"}
                        </p>
                      </div>

                      <span className="text-slate-400">
                        ✈
                      </span>

                      <div className="min-w-0 text-right">
                        <p className="font-serif text-2xl">
                          {candidate.arrivalAirport ||
                            "—"}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                          {candidate.arrivalCity ||
                            "Unknown"}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-5 text-slate-500">
                      {new Date(
                        candidate.departureTime,
                      ).toLocaleString()}
                    </p>

                    {candidate.calendarUrl && (
                      <a
                        href={
                          candidate.calendarUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-xs text-slate-700 underline underline-offset-4"
                        onClick={(event) => {
                          event.stopPropagation();
                        }}
                      >
                        Open in Google Calendar
                      </a>
                    )}
                  </div>
                </label>
              );
            },
          )}

          <button
            type="button"
            disabled={
              selectedIds.size === 0
            }
            className="mt-3 w-full rounded-full bg-slate-950 px-6 py-4 text-sm text-white disabled:opacity-40 sm:w-auto"
            onClick={
              handleImport
            }
          >
            Import selected (
            {selectedIds.size})
          </button>
        </div>
      )}
    </section>
  );
}