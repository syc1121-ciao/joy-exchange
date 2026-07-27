
import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import DeleteFlightButton from "@/components/dashboard/DeleteFlightButton";
import FlightDocumentUploader from "@/components/dashboard/FlightDocumentUploader";
import { requireAdmin } from "@/lib/requireAdmin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const supabaseAdmin = getSupabaseAdmin();

export const dynamic =
  "force-dynamic";

type Flight = {
  id: string;

  airline: string;
  flight_number: string;
  booking_reference: string | null;

  departure_airport: string;
  departure_city: string | null;
  departure_terminal: string | null;
  departure_gate: string | null;
  departure_time: string;

  arrival_airport: string;
  arrival_city: string | null;
  arrival_terminal: string | null;
  arrival_gate: string | null;
  arrival_time: string;

  seat: string | null;
  cabin_class: string;
  ticket_type: string | null;
  aircraft: string | null;

  price: number | null;
  currency: string;

  miles_program: string | null;
  miles_earned: number;

  status: string;
  notes: string | null;

  boarding_pass_url: string | null;
  boarding_pass_name: string | null;

  created_at: string;

  arrival_place:
    | {
        id: string;
        city: string;
        country: string;
        slug: string;
      }
    | {
        id: string;
        city: string;
        country: string;
        slug: string;
      }[]
    | null;
};

export default async function FlightViewPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const session =
    await requireAdmin();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { id } = await params;

  const authorEmail =
    session.user.email
      .trim()
      .toLowerCase();

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

        arrival_place:places (
          id,
          city,
          country,
          slug
        )
      `)
      .eq("id", id)
      .eq(
        "author_email",
        authorEmail,
      )
      .maybeSingle();

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        無法讀取 Flight：
        {error.message}
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const flight = data as Flight;

  const arrivalPlace =
    Array.isArray(
      flight.arrival_place,
    )
      ? flight.arrival_place[0]
      : flight.arrival_place;

  return (
    <div className="space-y-8 dashboard-flights">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/flights"
          className="text-sm text-neutral-500 transition hover:text-neutral-900"
        >
          ← Back to Flights
        </Link>

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/dashboard/flights/${flight.id}/edit`}
            className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm text-white"
          >
            Edit
          </Link>

          <DeleteFlightButton
            flightId={flight.id}
            flightLabel={`${flight.airline} ${flight.flight_number}`}
            redirectAfterDelete
          />
        </div>
      </div>

      <article className="overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-sm">
        <header className="bg-neutral-900 p-8 text-white sm:p-12 flight-hero">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
              {formatStatus(
                flight.status,
              )}
            </span>

            <span className="text-sm text-neutral-400">
              {flight.airline}{" "}
              {
                flight.flight_number
              }
            </span>
          </div>

          <div className="mt-9 grid items-center gap-7 md:grid-cols-[1fr_auto_1fr]">
            <AirportBlock
              align="left"
              airport={
                flight.departure_airport
              }
              city={
                flight.departure_city
              }
              time={
                flight.departure_time
              }
            />

            <div className="text-center">
              <p className="text-2xl text-neutral-500">
                →
              </p>

              <p className="mt-2 text-xs text-neutral-400">
                {formatDuration(
                  flight.departure_time,
                  flight.arrival_time,
                )}
              </p>
            </div>

            <AirportBlock
              align="right"
              airport={
                flight.arrival_airport
              }
              city={flight.arrival_city}
              time={flight.arrival_time}
            />
          </div>
        </header>

        <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-2">
          <DetailSection title="Departure">
            <DetailRow
              label="Airport"
              value={
                flight.departure_airport
              }
            />

            <DetailRow
              label="City"
              value={
                flight.departure_city
              }
            />

            <DetailRow
              label="Terminal"
              value={
                flight.departure_terminal
              }
            />

            <DetailRow
              label="Gate"
              value={
                flight.departure_gate
              }
            />

            <DetailRow
              label="Time"
              value={formatDateTime(
                flight.departure_time,
              )}
            />
          </DetailSection>

          <DetailSection title="Arrival">
            <DetailRow
              label="Airport"
              value={
                flight.arrival_airport
              }
            />

            <DetailRow
              label="City"
              value={
                flight.arrival_city
              }
            />

            <DetailRow
              label="Terminal"
              value={
                flight.arrival_terminal
              }
            />

            <DetailRow
              label="Gate"
              value={
                flight.arrival_gate
              }
            />

            <DetailRow
              label="Time"
              value={formatDateTime(
                flight.arrival_time,
              )}
            />
          </DetailSection>

          <DetailSection title="Ticket">
            <DetailRow
              label="Booking Reference"
              value={
                flight.booking_reference
              }
            />

            <DetailRow
              label="Cabin"
              value={formatCabinClass(
                flight.cabin_class,
              )}
            />

            <DetailRow
              label="Seat"
              value={flight.seat}
            />

            <DetailRow
              label="Ticket Type"
              value={
                flight.ticket_type
              }
            />

            <DetailRow
              label="Aircraft"
              value={flight.aircraft}
            />
          </DetailSection>

          <DetailSection title="Cost and Miles">
            <DetailRow
              label="Price"
              value={
                flight.price === null
                  ? null
                  : formatPrice(
                      flight.price,
                      flight.currency,
                    )
              }
            />

            <DetailRow
              label="Miles Program"
              value={
                flight.miles_program
              }
            />

            <DetailRow
              label="Miles Earned"
              value={flight.miles_earned.toLocaleString(
                "en-US",
              )}
            />
          </DetailSection>
        </div>

        {arrivalPlace && (
          <div className="border-t border-neutral-100 p-7 sm:px-10">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Arrival Place
            </p>

            <Link
              href={`/dashboard/places/${arrivalPlace.id}`}
              className="mt-3 inline-block text-lg font-medium underline underline-offset-4"
            >
              {arrivalPlace.city},{" "}
              {arrivalPlace.country}
            </Link>
          </div>
        )}

        {flight.notes && (
          <div className="border-t border-neutral-100 p-7 sm:px-10">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Notes
            </p>

            <p className="mt-4 whitespace-pre-wrap leading-8 text-neutral-700">
              {flight.notes}
            </p>
          </div>
        )}
      </article>

      <FlightDocumentUploader
        flightId={flight.id}
        documentUrl={
          flight.boarding_pass_url
        }
        documentName={
          flight.boarding_pass_name
        }
      />
    </div>
  );
}

function AirportBlock({
  airport,
  city,
  time,
  align,
}: {
  airport: string;
  city: string | null;
  time: string;
  align: "left" | "right";
}) {
  return (
    <div
      className={
        align === "right"
          ? "text-left md:text-right"
          : "text-left"
      }
    >
      <p className="text-5xl font-semibold font-ticket sm:text-6xl">
        {airport}
      </p>

      <p className="mt-3 text-neutral-400">
        {city ?? "Unknown city"}
      </p>

      <p className="mt-2 text-sm text-neutral-300">
        {formatDateTime(time)}
      </p>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-neutral-50 p-6">
      <h2 className="text-lg font-semibold">
        {title}
      </h2>

      <dl className="mt-5 space-y-4">
        {children}
      </dl>
    </section>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-neutral-200 pb-3 last:border-0 last:pb-0">
      <dt className="text-sm text-neutral-500">
        {label}
      </dt>

      <dd className="text-right text-sm font-medium">
        {value || "—"}
      </dd>
    </div>
  );
}

function formatDateTime(
  date: string,
) {
  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(new Date(date));
}

function formatDuration(
  departure: string,
  arrival: string,
) {
  const totalMinutes = Math.max(
    0,
    Math.floor(
      (new Date(arrival).getTime() -
        new Date(
          departure,
        ).getTime()) /
        60_000,
    ),
  );

  const hours = Math.floor(
    totalMinutes / 60,
  );

  const minutes =
    totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

function formatPrice(
  price: number,
  currency: string,
) {
  try {
    return new Intl.NumberFormat(
      "en-US",
      {
        style: "currency",
        currency,
      },
    ).format(price);
  } catch {
    return `${currency} ${price.toLocaleString(
      "en-US",
    )}`;
  }
}

function formatStatus(
  status: string,
) {
  const labels: Record<
    string,
    string
  > = {
    planned: "Planned",
    booked: "Booked",
    checked_in: "Checked In",
    completed: "Completed",
    cancelled: "Cancelled",
    delayed: "Delayed",
  };

  return labels[status] ?? status;
}

function formatCabinClass(
  cabinClass: string,
) {
  const labels: Record<
    string,
    string
  > = {
    economy: "Economy",
    premium_economy:
      "Premium Economy",
    business: "Business",
    first: "First",
  };

  return (
    labels[cabinClass] ??
    cabinClass
  );
}