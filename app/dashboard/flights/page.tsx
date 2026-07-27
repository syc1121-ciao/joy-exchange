import Link from "next/link";
import { redirect } from "next/navigation";
import GoogleCalendarImport from "@/components/dashboard/GoogleCalendarImport";
import DeleteFlightButton from "@/components/dashboard/DeleteFlightButton";
import { requireAdmin } from "@/lib/requireAdmin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const supabaseAdmin = getSupabaseAdmin();

export const dynamic =
  "force-dynamic";

type Flight = {
  id: string;
  airline: string;
  flight_number: string;

  departure_airport: string;
  departure_city: string | null;
  departure_time: string;

  arrival_airport: string;
  arrival_city: string | null;
  arrival_time: string;

  cabin_class:
    | "economy"
    | "premium_economy"
    | "business"
    | "first";

  status:
    | "planned"
    | "booked"
    | "checked_in"
    | "completed"
    | "cancelled"
    | "delayed";

  price: number | null;
  currency: string;

  seat: string | null;
};

export default async function FlightsPage() {
  const session =
    await requireAdmin();

  if (!session?.user?.email) {
    redirect("/login");
  }

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

        departure_airport,
        departure_city,
        departure_time,

        arrival_airport,
        arrival_city,
        arrival_time,

        cabin_class,
        status,

        price,
        currency,
        seat
      `)
      .eq(
        "author_email",
        authorEmail,
      )
      .order("departure_time", {
        ascending: true,
      });

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        無法讀取 Flights：
        {error.message}
      </div>
    );
  }

  const flights =
    (data ?? []) as Flight[];

  const now = Date.now();

  const upcomingFlights =
    flights.filter(
      (flight) =>
        new Date(
          flight.departure_time,
        ).getTime() >= now &&
        flight.status !==
          "cancelled",
    );

  const pastFlights =
    flights
      .filter(
        (flight) =>
          new Date(
            flight.departure_time,
          ).getTime() < now ||
          flight.status ===
            "cancelled",
      )
      .reverse();

  const nextFlight =
    upcomingFlights[0];

  return (
    <div className="space-y-8 dashboard-flights">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            Flights
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Flight Log
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            管理預定航班、機票、座位與飛行紀錄。
          </p>
        </div>

        <Link
          href="/dashboard/flights/new"
          className="inline-flex w-fit rounded-full bg-neutral-900 px-6 py-3 text-sm text-white transition hover:bg-neutral-700"
        >
          + New Flight
        </Link>
      </div>
      <GoogleCalendarImport />

      {nextFlight && (
        <section className="rounded-[32px] bg-[#0F172A] p-7 text-white sm:p-9 flight-hero">
          <p className="text-xs uppercase tracking-[0.25em] text-neutral-400">
            Upcoming Flight
          </p>

          <div className="mt-5 flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm text-neutral-400">
                {nextFlight.airline}{" "}
                {nextFlight.flight_number}
              </p>

              <div className="mt-4 flex items-center gap-4">
                <span className="text-4xl font-semibold font-ticket sm:text-5xl">
                  {nextFlight.departure_airport}
                </span>

                <span className="text-2xl text-neutral-500">
                  →
                </span>

                <span className="text-4xl font-semibold font-ticket sm:text-5xl">
                  {nextFlight.arrival_airport}
                </span>
              </div>

              <p className="mt-4 text-neutral-300">
                {formatDateTime(
                  nextFlight.departure_time,
                )}
              </p>
            </div>

            <div className="lg:text-right">
              <p className="text-sm text-neutral-400">
                Departure in
              </p>

              <p className="mt-2 text-3xl font-semibold font-ticket">
                {getCountdown(
                  nextFlight.departure_time,
                )}
              </p>

              <Link
                href={`/dashboard/flights/${nextFlight.id}`}
                className="mt-5 inline-flex rounded-full bg-black px-5 py-2.5 text-sm text-white"
              >
                View Flight
              </Link>
            </div>
          </div>
        </section>
      )}

      {flights.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center">
          <p className="text-lg font-medium">
            還沒有航班資料
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            新增第一班航班後，資料會保存在 Supabase。
          </p>

          <Link
            href="/dashboard/flights/new"
            className="mt-6 inline-flex rounded-full bg-neutral-900 px-6 py-3 text-sm text-white"
          >
            Create Flight
          </Link>
        </div>
      ) : (
        <>
          <FlightSection
            title="Upcoming"
            flights={upcomingFlights}
          />

          <FlightSection
            title="Past Flights"
            flights={pastFlights}
          />
        </>
      )}
    </div>
  );
}

function FlightSection({
  title,
  flights,
}: {
  title: string;
  flights: Flight[];
}) {
  if (flights.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-serif">
        {title}
      </h2>

      <div className="grid gap-5">
        {flights.map((flight) => (
          <article
            key={flight.id}
            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-medium">
                    {flight.airline}{" "}
                    {
                      flight.flight_number
                    }
                  </p>

                  <StatusBadge
                    status={flight.status}
                  />
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <div>
                    <p className="text-3xl font-semibold font-ticket">
                      {flight.departure_airport}
                    </p>

                    <p className="mt-1 text-sm text-neutral-400">
                      {flight.departure_city ??
                        "Departure"}
                    </p>
                  </div>

                  <div className="min-w-20 flex-1">
                    <div className="h-px bg-neutral-200" />

                    <p className="mt-2 text-center text-xs text-neutral-400">
                      {formatDuration(
                        flight.departure_time,
                        flight.arrival_time,
                      )}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-3xl font-semibold font-ticket">
                      {flight.arrival_airport}
                    </p>

                    <p className="mt-1 text-sm text-neutral-400">
                      {flight.arrival_city ??
                        "Arrival"}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-neutral-500">
                  <span>
                    {formatDateTime(
                      flight.departure_time,
                    )}
                  </span>

                  <span>
                    {formatCabinClass(
                      flight.cabin_class,
                    )}
                  </span>

                  {flight.seat && (
                    <span>
                      Seat {flight.seat}
                    </span>
                  )}

                  {flight.price !==
                    null && (
                    <span>
                      {formatPrice(
                        flight.price,
                        flight.currency,
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  href={`/dashboard/flights/${flight.id}`}
                  className="rounded-full border border-neutral-300 px-4 py-2 text-sm transition hover:bg-neutral-50"
                >
                  View
                </Link>

                <Link
                  href={`/dashboard/flights/${flight.id}/edit`}
                  className="rounded-full bg-neutral-900 px-4 py-2 text-sm text-white transition hover:bg-neutral-700"
                >
                  Edit
                </Link>

                <DeleteFlightButton
                  flightId={flight.id}
                  flightLabel={`${flight.airline} ${flight.flight_number}`}
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function StatusBadge({
  status,
}: {
  status: Flight["status"];
}) {
  const styles = {
    planned:
      "bg-neutral-100 text-neutral-700",

    booked:
      "bg-blue-100 text-blue-700",

    checked_in:
      "bg-violet-100 text-violet-700",

    completed:
      "bg-green-100 text-green-700",

    cancelled:
      "bg-red-100 text-red-700",

    delayed:
      "bg-amber-100 text-amber-700",
  };

  const labels = {
    planned: "Planned",
    booked: "Booked",
    checked_in: "Checked In",
    completed: "Completed",
    cancelled: "Cancelled",
    delayed: "Delayed",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
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
        maximumFractionDigits: 2,
      },
    ).format(price);
  } catch {
    return `${currency} ${price.toLocaleString(
      "en-US",
    )}`;
  }
}

function formatCabinClass(
  cabinClass: Flight["cabin_class"],
) {
  const labels = {
    economy: "Economy",
    premium_economy:
      "Premium Economy",
    business: "Business",
    first: "First",
  };

  return labels[cabinClass];
}

function formatDuration(
  departure: string,
  arrival: string,
) {
  const milliseconds =
    new Date(arrival).getTime() -
    new Date(departure).getTime();

  const totalMinutes = Math.max(
    0,
    Math.floor(
      milliseconds / 60_000,
    ),
  );

  const hours = Math.floor(
    totalMinutes / 60,
  );

  const minutes =
    totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

function getCountdown(
  departure: string,
) {
  const difference =
    new Date(departure).getTime() -
    Date.now();

  if (difference <= 0) {
    return "Departed";
  }

  const totalHours = Math.ceil(
    difference / 3_600_000,
  );

  const days = Math.floor(
    totalHours / 24,
  );

  const hours = totalHours % 24;

  if (days > 0) {
    return `${days} days ${hours} hours`;
  }

  return `${hours} hours`;
}