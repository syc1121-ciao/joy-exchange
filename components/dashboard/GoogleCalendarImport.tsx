"use client";

import {
  signIn,
  signOut,
  useSession,
} from "next-auth/react";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

type CalendarFlightStatus =
  | "scheduled"
  | "on-time"
  | "delayed"
  | "cancelled"
  | "completed";

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

  status: CalendarFlightStatus;

  confidence:
    | "high"
    | "medium"
    | "low";

  calendarUrl?: string;
};

type CalendarResponse = {
  candidates?: CalendarCandidate[];

  importedCalendarEventIds?: string[];

  totalEvents?: number;

  error?: string;
};

type ImportResponse = {
  inserted?: number;
  skipped?: number;
  error?: string;
  message?: string;
};

export default function GoogleCalendarImport() {
  const router = useRouter();

  const {
    status,
  } = useSession();

  const [
    candidates,
    setCandidates,
  ] = useState<CalendarCandidate[]>(
    [],
  );

  const [
    importedIds,
    setImportedIds,
  ] = useState<Set<string>>(
    new Set(),
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
    isImporting,
    setIsImporting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(
    null,
  );

  const [
    message,
    setMessage,
  ] = useState<string | null>(
    null,
  );

  async function loadCalendarFlights() {
    setIsLoading(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const response = await fetch(
        "/api/flights/import",
        {
          method: "GET",
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

      const nextImportedIds =
        new Set(
          data.importedCalendarEventIds ??
            [],
        );

      setCandidates(
        nextCandidates,
      );

      setImportedIds(
        nextImportedIds,
      );

      setSelectedIds(
        new Set(
          nextCandidates
            .filter(
              (candidate) =>
                !nextImportedIds.has(
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
          "No possible flights were found in your Google Calendar.",
        );
      } else {
        const availableCount =
          nextCandidates.filter(
            (candidate) =>
              !nextImportedIds.has(
                candidate.calendarEventId,
              ),
          ).length;

        setMessage(
          `${nextCandidates.length} possible flight event(s) found. ${availableCount} can be imported.`,
        );
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to read Google Calendar.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function toggleCandidate(
    calendarEventId: string,
  ) {
    if (
      importedIds.has(
        calendarEventId,
      )
    ) {
      return;
    }

    setSelectedIds(
      (current) => {
        const next =
          new Set(current);

        if (
          next.has(
            calendarEventId,
          )
        ) {
          next.delete(
            calendarEventId,
          );
        } else {
          next.add(
            calendarEventId,
          );
        }

        return next;
      },
    );
  }

  async function handleImport() {
    const selectedFlights =
      candidates.filter(
        (candidate) =>
          selectedIds.has(
            candidate.calendarEventId,
          ) &&
          !importedIds.has(
            candidate.calendarEventId,
          ),
      );

    if (
      selectedFlights.length === 0
    ) {
      setMessage(
        "Select at least one flight.",
      );

      return;
    }

    setIsImporting(true);
    setErrorMessage(null);
    setMessage(null);

    try {
      const response = await fetch(
        "/api/flights/import",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            flights:
              selectedFlights,
          }),
        },
      );

      const data =
        (await response.json()) as
          ImportResponse;

      if (!response.ok) {
        throw new Error(
          data.error ??
            "Unable to import flights.",
        );
      }

      const importedEventIds =
        selectedFlights.map(
          (flight) =>
            flight.calendarEventId,
        );

      setImportedIds(
        (current) => {
          const next =
            new Set(current);

          importedEventIds.forEach(
            (id) => next.add(id),
          );

          return next;
        },
      );

      setSelectedIds(
        new Set(),
      );

      setMessage(
        data.message ??
          `${data.inserted ?? 0} flight(s) imported successfully.`,
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to import flights.",
      );
    } finally {
      setIsImporting(false);
    }
  }

  function selectAllAvailable() {
    setSelectedIds(
      new Set(
        candidates
          .filter(
            (candidate) =>
              !importedIds.has(
                candidate.calendarEventId,
              ),
          )
          .map(
            (candidate) =>
              candidate.calendarEventId,
          ),
      ),
    );
  }

  function clearSelection() {
    setSelectedIds(
      new Set(),
    );
  }

  if (
    status === "loading"
  ) {
    return (
      <div className="h-36 animate-pulse rounded-[2rem] bg-black/5" />
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

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
            掃描 Google Calendar
            中未來一年的行程，確認後直接儲存到
            Supabase Flight Log。
          </p>
        </div>

        {status !==
        "authenticated" ? (
          <button
            type="button"
            className="w-full rounded-full bg-slate-950 px-6 py-3 text-sm text-white sm:w-auto"
            onClick={() => {
              void signIn(
                "google",
                {
                  callbackUrl:
                    "/dashboard/flights",
                },
              );
            }}
          >
            Connect Google Calendar
          </button>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              disabled={
                isLoading ||
                isImporting
              }
              className="rounded-full bg-slate-950 px-6 py-3 text-sm text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
              disabled={
                isLoading ||
                isImporting
              }
              className="rounded-full border border-black/10 px-5 py-3 text-sm transition hover:bg-white disabled:opacity-50"
              onClick={() => {
                void signOut({
                  callbackUrl:
                    "/login",
                });
              }}
            >
              Disconnect
            </button>
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      {message && (
        <p className="mt-5 rounded-2xl bg-white px-4 py-3 text-sm text-slate-600">
          {message}
        </p>
      )}

      {candidates.length > 0 && (
        <div className="mt-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Selected{" "}
              {selectedIds.size} of{" "}
              {
                candidates.length
              }
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={
                  selectAllAvailable
                }
                className="rounded-full border border-black/10 px-4 py-2 text-xs transition hover:bg-white"
              >
                Select available
              </button>

              <button
                type="button"
                onClick={
                  clearSelection
                }
                className="rounded-full border border-black/10 px-4 py-2 text-xs transition hover:bg-white"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {candidates.map(
              (candidate) => {
                const alreadyImported =
                  importedIds.has(
                    candidate.calendarEventId,
                  );

                const selected =
                  selectedIds.has(
                    candidate.calendarEventId,
                  );

                return (
                  <label
                    key={
                      candidate.calendarEventId
                    }
                    className={[
                      "flex gap-4 rounded-3xl border p-4 transition",
                      alreadyImported
                        ? "cursor-default border-black/5 bg-black/[0.025] opacity-60"
                        : selected
                          ? "cursor-pointer border-slate-900/20 bg-white shadow-sm"
                          : "cursor-pointer border-black/5 bg-white hover:border-black/10",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 shrink-0"
                      checked={
                        selected
                      }
                      disabled={
                        alreadyImported ||
                        isImporting
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
                            {
                              candidate.title
                            }
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
                        {new Intl.DateTimeFormat(
                          "en-US",
                          {
                            year:
                              "numeric",
                            month:
                              "short",
                            day:
                              "numeric",
                            hour:
                              "2-digit",
                            minute:
                              "2-digit",
                          },
                        ).format(
                          new Date(
                            candidate.departureTime,
                          ),
                        )}
                      </p>

                      {candidate.calendarUrl && (
                        <a
                          href={
                            candidate.calendarUrl
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="mt-3 inline-block text-xs text-slate-700 underline underline-offset-4"
                          onClick={(
                            event,
                          ) => {
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
          </div>

          <button
            type="button"
            disabled={
              selectedIds.size === 0 ||
              isImporting
            }
            className="mt-5 w-full rounded-full bg-slate-950 px-6 py-4 text-sm text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
            onClick={() => {
              void handleImport();
            }}
          >
            {isImporting
              ? "Importing…"
              : `Import selected (${selectedIds.size})`}
          </button>
        </div>
      )}
    </section>
  );
}