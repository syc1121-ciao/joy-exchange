"use client";

import type { Flight, FlightStatus } from "./types";

type FlightCardProps = {
  flight: Flight;
  onEdit?: (flight: Flight) => void;
  onDelete?: (flight: Flight) => void;
};

const statusStyles: Record<FlightStatus, string> = {
  scheduled: "bg-slate-100 text-slate-600",
  "on-time": "bg-emerald-50 text-emerald-700",
  delayed: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-700",
  completed: "bg-blue-50 text-blue-700",
};

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function FlightCard({
  flight,
  onEdit,
  onDelete,
}: FlightCardProps) {
  const canManage = Boolean(onEdit || onDelete);

  return (
    <article className="min-w-0 overflow-hidden rounded-3xl border border-black/5 bg-white">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-xs uppercase tracking-[0.2em] text-slate-400">
              {flight.airline}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-700">
              {flight.flightNumber}
            </p>
          </div>

          <span
            className={[
              "shrink-0 rounded-full px-3 py-1.5",
              "text-[10px] uppercase tracking-[0.12em]",
              statusStyles[flight.status],
            ].join(" ")}
          >
            {flight.status.replace("-", " ")}
          </span>
        </div>

        <div className="mt-7 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="min-w-0">
            <p className="font-serif text-3xl sm:text-4xl">
              {flight.departureAirport}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">
              {flight.departureCity}
            </p>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="hidden h-px w-6 bg-slate-200 sm:block" />
            <span aria-hidden="true">✈</span>
            <span className="hidden h-px w-6 bg-slate-200 sm:block" />
          </div>

          <div className="min-w-0 text-right">
            <p className="font-serif text-3xl sm:text-4xl">
              {flight.arrivalAirport}
            </p>

            <p className="mt-1 truncate text-xs text-slate-500">
              {flight.arrivalCity}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 rounded-2xl bg-[#f6f3ef] p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">
              Departure
            </p>

            <p className="mt-1 break-words text-slate-700">
              {formatDateTime(flight.departureTime)}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">
              Arrival
            </p>

            <p className="mt-1 break-words text-slate-700">
              {formatDateTime(flight.arrivalTime)}
            </p>
          </div>
        </div>

        {(flight.terminal || flight.gate || flight.seat) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {flight.terminal && (
              <span className="rounded-full border border-black/5 px-3 py-1.5 text-xs text-slate-500">
                Terminal {flight.terminal}
              </span>
            )}

            {flight.gate && (
              <span className="rounded-full border border-black/5 px-3 py-1.5 text-xs text-slate-500">
                Gate {flight.gate}
              </span>
            )}

            {flight.seat && (
              <span className="rounded-full border border-black/5 px-3 py-1.5 text-xs text-slate-500">
                Seat {flight.seat}
              </span>
            )}
          </div>
        )}

        {flight.bookingReference && (
          <div className="mt-5 rounded-2xl border border-black/5 px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">
              Booking reference
            </p>

            <p className="mt-1 text-sm font-medium tracking-[0.08em] text-slate-700">
              {flight.bookingReference}
            </p>
          </div>
        )}

        {flight.notes && (
          <p className="mt-5 text-sm leading-6 text-slate-500">
            {flight.notes}
          </p>
        )}

        {canManage && (
          <div className="mt-6 flex flex-col gap-3 border-t border-black/5 pt-5 sm:flex-row">
            {onEdit && (
              <button
                type="button"
                className="flex-1 rounded-full border border-black/10 px-4 py-3 text-xs tracking-[0.1em] transition hover:bg-slate-50"
                onClick={() => {
                  onEdit(flight);
                }}
              >
                EDIT
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                className="flex-1 rounded-full bg-red-50 px-4 py-3 text-xs tracking-[0.1em] text-red-700 transition hover:bg-red-100"
                onClick={() => {
                  onDelete(flight);
                }}
              >
                DELETE
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}