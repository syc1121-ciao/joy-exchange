import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import FlightForm, {
  type FlightFormData,
} from "@/components/dashboard/FlightForm";

import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic =
  "force-dynamic";

export default async function EditFlightPage({
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

  const [
    flightResult,
    placesResult,
  ] = await Promise.all([
    supabaseAdmin
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
        arrival_place_id,

        notes
      `)
      .eq("id", id)
      .eq(
        "author_email",
        authorEmail,
      )
      .maybeSingle(),

    supabaseAdmin
      .from("places")
      .select(
        "id, city, country",
      )
      .eq(
        "author_email",
        authorEmail,
      )
      .order("city", {
        ascending: true,
      }),
  ]);

  if (flightResult.error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        無法讀取 Flight：
        {flightResult.error.message}
      </div>
    );
  }

  if (!flightResult.data) {
    notFound();
  }

  if (placesResult.error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        無法讀取 Places：
        {placesResult.error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href={`/dashboard/flights/${id}`}
        className="text-sm text-neutral-500 transition hover:text-neutral-900"
      >
        ← Back to Flight
      </Link>

      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
          Flight
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Edit Flight
        </h1>

        <p className="mt-3 text-sm text-neutral-500">
          修改航班、座位、票價與里程資訊。
        </p>
      </div>

      <FlightForm
        flight={
          flightResult.data as FlightFormData
        }
        places={
          placesResult.data ?? []
        }
      />
    </div>
  );
}