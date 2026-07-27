"use client";

import {
  FormEvent,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import type { FlightFormData, FlightStatus, CabinClass } from "@/lib/types/flight";

// Re-export for convenience
export type { FlightFormData };

type PlaceOption = {
  id: string;
  city: string;
  country: string;
};

type FlightFormProps = {
  places?: PlaceOption[];
  flight?: FlightFormData;
  onSave?: (formData: FlightFormData) => void;
  onCancel?: () => void;
};

function toDateTimeLocal(
  isoDate: string,
) {
  const date = new Date(isoDate);

  const offset =
    date.getTimezoneOffset() * 60_000;

  return new Date(
    date.getTime() - offset,
  )
    .toISOString()
    .slice(0, 16);
}

export default function FlightForm({
  places = [],
  flight,
  onSave,
  onCancel,
}: FlightFormProps) {
  const router = useRouter();

  const isEditing = Boolean(flight);

  const [airline, setAirline] =
    useState(flight?.airline ?? "");

  const [
    flightNumber,
    setFlightNumber,
  ] = useState(
    flight?.flight_number ?? "",
  );

  const [
    bookingReference,
    setBookingReference,
  ] = useState(
    flight?.booking_reference ?? "",
  );

  const [
    departureAirport,
    setDepartureAirport,
  ] = useState(
    flight?.departure_airport ?? "",
  );

  const [
    departureCity,
    setDepartureCity,
  ] = useState(
    flight?.departure_city ?? "",
  );

  const [
    departureTerminal,
    setDepartureTerminal,
  ] = useState(
    flight?.departure_terminal ?? "",
  );

  const [
    departureGate,
    setDepartureGate,
  ] = useState(
    flight?.departure_gate ?? "",
  );

  const [
    departureTime,
    setDepartureTime,
  ] = useState(
    flight?.departure_time
      ? toDateTimeLocal(
          flight.departure_time,
        )
      : "",
  );

  const [
    arrivalAirport,
    setArrivalAirport,
  ] = useState(
    flight?.arrival_airport ?? "",
  );

  const [
    arrivalCity,
    setArrivalCity,
  ] = useState(
    flight?.arrival_city ?? "",
  );

  const [
    arrivalTerminal,
    setArrivalTerminal,
  ] = useState(
    flight?.arrival_terminal ?? "",
  );

  const [arrivalGate, setArrivalGate] =
    useState(
      flight?.arrival_gate ?? "",
    );

  const [arrivalTime, setArrivalTime] =
    useState(
      flight?.arrival_time
        ? toDateTimeLocal(
            flight.arrival_time,
          )
        : "",
    );

  const [seat, setSeat] = useState(
    flight?.seat ?? "",
  );

  const [cabinClass, setCabinClass] =
    useState<CabinClass>(
      flight?.cabin_class ??
        "economy",
    );

  const [ticketType, setTicketType] =
    useState(
      flight?.ticket_type ?? "",
    );

  const [aircraft, setAircraft] =
    useState(
      flight?.aircraft ?? "",
    );

  const [price, setPrice] = useState(
    flight?.price !== null &&
      flight?.price !== undefined
      ? String(flight.price)
      : "",
  );

  const [currency, setCurrency] =
    useState(
      flight?.currency ?? "TWD",
    );

  const [
    milesProgram,
    setMilesProgram,
  ] = useState(
    flight?.miles_program ?? "",
  );

  const [
    milesEarned,
    setMilesEarned,
  ] = useState(
    String(flight?.miles_earned ?? 0),
  );

  const [status, setStatus] =
    useState<FlightStatus>(
      flight?.status ?? "planned",
    );

  const [
    arrivalPlaceId,
    setArrivalPlaceId,
  ] = useState(
    flight?.arrival_place_id ?? "",
  );

  const [notes, setNotes] = useState(
    flight?.notes ?? "",
  );

  const [loading, setLoading] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      // If onSave callback is provided, use it instead of API
      if (onSave) {
        const formData: FlightFormData = {
          id: flight?.id ?? "",
          airline,
          flight_number: flightNumber,
          booking_reference: bookingReference || null,
          departure_airport: departureAirport,
          departure_city: departureCity || null,
          departure_terminal: departureTerminal || null,
          departure_gate: departureGate || null,
          departure_time: new Date(departureTime).toISOString(),
          arrival_airport: arrivalAirport,
          arrival_city: arrivalCity || null,
          arrival_terminal: arrivalTerminal || null,
          arrival_gate: arrivalGate || null,
          arrival_time: new Date(arrivalTime).toISOString(),
          seat: seat || null,
          cabin_class: cabinClass as CabinClass,
          ticket_type: ticketType || null,
          aircraft: aircraft || null,
          price: price ? Number(price) : null,
          currency,
          miles_program: milesProgram || null,
          miles_earned: milesEarned ? Number(milesEarned) : 0,
          status: status as FlightStatus,
          arrival_place_id: arrivalPlaceId || null,
          notes: notes || null,
        };

        onSave(formData);
        setLoading(false);
        return;
      }

      const response = await fetch(
        "/api/flights",
        {
          method: isEditing
            ? "PATCH"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            id: flight?.id,

            airline,
            flightNumber,
            bookingReference,

            departureAirport,
            departureCity,
            departureTerminal,
            departureGate,

            departureTime:
              new Date(
                departureTime,
              ).toISOString(),

            arrivalAirport,
            arrivalCity,
            arrivalTerminal,
            arrivalGate,

            arrivalTime:
              new Date(
                arrivalTime,
              ).toISOString(),

            seat,
            cabinClass,
            ticketType,
            aircraft,

            price,
            currency,

            milesProgram,
            milesEarned,

            status,
            arrivalPlaceId,

            notes,
          }),
        },
      );

      const result =
        (await response.json()) as {
          error?: string;

          flight?: {
            id: string;
          };
        };

      if (!response.ok) {
        throw new Error(
          result.error ??
            "儲存航班失敗。",
        );
      }

      const savedFlightId =
        flight?.id ??
        result.flight?.id;

      if (!savedFlightId) {
        throw new Error(
          "找不到已儲存的 Flight ID。",
        );
      }

      router.push(
        `/dashboard/flights/${savedFlightId}`,
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "儲存失敗，請稍後再試。",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <section className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
        <SectionHeader
          eyebrow="Flight"
          title="Basic Information"
        />

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Field
            label="Airline"
            required
          >
            <input
              value={airline}
              onChange={(event) =>
                setAirline(
                  event.target.value,
                )
              }
              required
              placeholder="Emirates"
              className={inputClass}
            />
          </Field>

          <Field
            label="Flight Number"
            required
          >
            <input
              value={flightNumber}
              onChange={(event) =>
                setFlightNumber(
                  event.target.value,
                )
              }
              required
              placeholder="EK367"
              className={inputClass}
            />
          </Field>

          <Field label="Booking Reference">
            <input
              value={bookingReference}
              onChange={(event) =>
                setBookingReference(
                  event.target.value,
                )
              }
              placeholder="ABC123"
              className={inputClass}
            />
          </Field>

          <Field label="Aircraft">
            <input
              value={aircraft}
              onChange={(event) =>
                setAircraft(
                  event.target.value,
                )
              }
              placeholder="Airbus A380"
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
        <SectionHeader
          eyebrow="Route"
          title="Departure"
        />

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Field
            label="Airport Code"
            required
          >
            <input
              value={departureAirport}
              onChange={(event) =>
                setDepartureAirport(
                  event.target.value
                    .toUpperCase()
                    .slice(0, 4),
                )
              }
              required
              placeholder="TPE"
              className={inputClass}
            />
          </Field>

          <Field label="City">
            <input
              value={departureCity}
              onChange={(event) =>
                setDepartureCity(
                  event.target.value,
                )
              }
              placeholder="Taipei"
              className={inputClass}
            />
          </Field>

          <Field label="Terminal">
            <input
              value={departureTerminal}
              onChange={(event) =>
                setDepartureTerminal(
                  event.target.value,
                )
              }
              placeholder="Terminal 1"
              className={inputClass}
            />
          </Field>

          <Field label="Gate">
            <input
              value={departureGate}
              onChange={(event) =>
                setDepartureGate(
                  event.target.value,
                )
              }
              placeholder="B5"
              className={inputClass}
            />
          </Field>

          <Field
            label="Departure Time"
            required
          >
            <input
              type="datetime-local"
              value={departureTime}
              onChange={(event) =>
                setDepartureTime(
                  event.target.value,
                )
              }
              required
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
        <SectionHeader
          eyebrow="Route"
          title="Arrival"
        />

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Field
            label="Airport Code"
            required
          >
            <input
              value={arrivalAirport}
              onChange={(event) =>
                setArrivalAirport(
                  event.target.value
                    .toUpperCase()
                    .slice(0, 4),
                )
              }
              required
              placeholder="DXB"
              className={inputClass}
            />
          </Field>

          <Field label="City">
            <input
              value={arrivalCity}
              onChange={(event) =>
                setArrivalCity(
                  event.target.value,
                )
              }
              placeholder="Dubai"
              className={inputClass}
            />
          </Field>

          <Field label="Terminal">
            <input
              value={arrivalTerminal}
              onChange={(event) =>
                setArrivalTerminal(
                  event.target.value,
                )
              }
              placeholder="Terminal 3"
              className={inputClass}
            />
          </Field>

          <Field label="Gate">
            <input
              value={arrivalGate}
              onChange={(event) =>
                setArrivalGate(
                  event.target.value,
                )
              }
              placeholder="A12"
              className={inputClass}
            />
          </Field>

          <Field
            label="Arrival Time"
            required
          >
            <input
              type="datetime-local"
              value={arrivalTime}
              onChange={(event) =>
                setArrivalTime(
                  event.target.value,
                )
              }
              required
              className={inputClass}
            />
          </Field>

          <Field label="Arrival Place">
            <select
              value={arrivalPlaceId}
              onChange={(event) =>
                setArrivalPlaceId(
                  event.target.value,
                )
              }
              className={inputClass}
            >
              <option value="">
                No related place
              </option>

              {places.map((place) => (
                <option
                  key={place.id}
                  value={place.id}
                >
                  {place.city},{" "}
                  {place.country}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
        <SectionHeader
          eyebrow="Ticket"
          title="Seat and Fare"
        />

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Field label="Seat">
            <input
              value={seat}
              onChange={(event) =>
                setSeat(
                  event.target.value,
                )
              }
              placeholder="42A"
              className={inputClass}
            />
          </Field>

          <Field label="Cabin Class">
            <select
              value={cabinClass}
              onChange={(event) =>
                setCabinClass(
                  event.target
                    .value as CabinClass,
                )
              }
              className={inputClass}
            >
              <option value="economy">
                Economy
              </option>

              <option value="premium_economy">
                Premium Economy
              </option>

              <option value="business">
                Business
              </option>

              <option value="first">
                First
              </option>
            </select>
          </Field>

          <Field label="Ticket Type">
            <input
              value={ticketType}
              onChange={(event) =>
                setTicketType(
                  event.target.value,
                )
              }
              placeholder="Student Flex"
              className={inputClass}
            />
          </Field>

          <Field label="Status">
            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target
                    .value as FlightStatus,
                )
              }
              className={inputClass}
            >
              <option value="planned">
                Planned
              </option>

              <option value="booked">
                Booked
              </option>

              <option value="checked_in">
                Checked In
              </option>

              <option value="delayed">
                Delayed
              </option>

              <option value="completed">
                Completed
              </option>

              <option value="cancelled">
                Cancelled
              </option>
            </select>
          </Field>

          <Field label="Price">
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) =>
                setPrice(
                  event.target.value,
                )
              }
              placeholder="29500"
              className={inputClass}
            />
          </Field>

          <Field label="Currency">
            <input
              value={currency}
              onChange={(event) =>
                setCurrency(
                  event.target.value
                    .toUpperCase()
                    .slice(0, 3),
                )
              }
              placeholder="TWD"
              className={inputClass}
            />
          </Field>

          <Field label="Miles Program">
            <input
              value={milesProgram}
              onChange={(event) =>
                setMilesProgram(
                  event.target.value,
                )
              }
              placeholder="Emirates Skywards"
              className={inputClass}
            />
          </Field>

          <Field label="Miles Earned">
            <input
              type="number"
              min="0"
              step="1"
              value={milesEarned}
              onChange={(event) =>
                setMilesEarned(
                  event.target.value,
                )
              }
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
        <SectionHeader
          eyebrow="Memory"
          title="Notes"
        />

        <textarea
          rows={7}
          value={notes}
          onChange={(event) =>
            setNotes(event.target.value)
          }
          placeholder="轉機提醒、行李額度、機票規則或旅行回憶……"
          className={`${inputClass} mt-6 resize-y leading-7`}
        />
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-neutral-900 px-8 py-3 text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Create Flight"}
        </button>

        <button
          type="button"
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              router.push(
                isEditing && flight
                  ? `/dashboard/flights/${flight.id}`
                  : "/dashboard/flights",
              );
            }
          }}
          className="rounded-full border border-neutral-300 px-8 py-3 transition hover:bg-neutral-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </span>

      {children}
    </label>
  );
}

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-2xl font-semibold">
        {title}
      </h2>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-neutral-300 bg-white p-3 outline-none transition focus:border-neutral-700";