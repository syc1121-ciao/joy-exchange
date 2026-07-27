"use client";

import { useState } from "react";

import GoogleCalendarImport from "../dashboard/GoogleCalendarImport";
import FlightForm from "../dashboard/FlightForm";

import FlightCard from "./FlightCard";
import { useFlights } from "./FlightProvider";

import type { Flight } from "./types";
import type { FlightFormData as ServerFlightFormData } from "@/lib/types/flight";

// Local Flight type without id
type LocalFlightFormData = Omit<Flight, "id">;

export default function FlightManager() {
  const {
    flights,
    isReady,
    addFlight,
    updateFlight,
    deleteFlight,
  } = useFlights();

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingFlight, setEditingFlight] =
    useState<Flight | null>(null);

  function mapFlightToFormData(
    flight: Flight,
  ): ServerFlightFormData {
    return {
      id: flight.id,
      airline: flight.airline,
      flight_number: flight.flightNumber,
      booking_reference: flight.bookingReference ?? null,
      departure_airport: flight.departureAirport,
      departure_city: flight.departureCity ?? null,
      departure_terminal: flight.terminal ?? null,
      departure_gate: flight.gate ?? null,
      departure_time: flight.departureTime,
      arrival_airport: flight.arrivalAirport,
      arrival_city: flight.arrivalCity ?? null,
      arrival_terminal: null,
      arrival_gate: null,
      arrival_time: flight.arrivalTime,
      seat: flight.seat ?? null,
      cabin_class: "economy",
      ticket_type: null,
      aircraft: null,
      price: null,
      currency: "TWD",
      miles_program: null,
      miles_earned: 0,
      status: flight.status === "scheduled" ? "planned" : 
              flight.status === "on-time" ? "booked" :
              flight.status === "completed" ? "completed" :
              flight.status === "cancelled" ? "cancelled" :
              flight.status === "delayed" ? "delayed" : "planned",
      arrival_place_id: null,
      notes: flight.notes ?? null,
    };
  }

  function convertServerFormDataToLocal(
    formData: ServerFlightFormData,
  ): LocalFlightFormData {
    return {
      airline: formData.airline,
      flightNumber: formData.flight_number,
      bookingReference: formData.booking_reference ?? undefined,
      departureAirport: formData.departure_airport,
      departureCity: formData.departure_city ?? "",
      departureTime: formData.departure_time,
      arrivalAirport: formData.arrival_airport,
      arrivalCity: formData.arrival_city ?? "",
      arrivalTime: formData.arrival_time,
      destinationSlug: "",
      terminal: formData.departure_terminal ?? undefined,
      gate: formData.departure_gate ?? undefined,
      seat: formData.seat ?? undefined,
      notes: formData.notes ?? undefined,
      status: formData.status === "planned" ? "scheduled" :
              formData.status === "booked" ? "on-time" :
              formData.status === "completed" ? "completed" :
              formData.status === "cancelled" ? "cancelled" :
              formData.status === "delayed" ? "delayed" : "scheduled",
    };
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingFlight(null);
  }

  function handleSave(
    formData: ServerFlightFormData,
  ) {
    const localData = convertServerFormDataToLocal(formData);
    
    if (editingFlight) {
      updateFlight(
        editingFlight.id,
        localData,
      );
    } else {
      addFlight(localData);
    }

    closeForm();
  }

  function handleDelete(
    flight: Flight,
  ) {
    const shouldDelete =
      window.confirm(
        `Delete ${flight.flightNumber} from ${flight.departureCity} to ${flight.arrivalCity}?`,
      );

    if (shouldDelete) {
      deleteFlight(flight.id);
    }
  }

  function handleEdit(
    selectedFlight: Flight,
  ) {
    setEditingFlight(selectedFlight);
    setIsFormOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  if (!isReady) {
    return (
      <div className="h-72 animate-pulse rounded-3xl bg-black/5" />
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            Flight planner
          </p>

          <h1 className="mt-3 font-serif text-4xl text-slate-950 sm:text-5xl">
            My flights
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Add, edit and organise every
            flight in your exchange journey.
          </p>
        </div>

        <button
          type="button"
          className="w-full rounded-full bg-slate-950 px-6 py-4 text-xs tracking-[0.14em] text-white transition hover:bg-slate-800 sm:w-auto"
          onClick={() => {
            setEditingFlight(null);
            setIsFormOpen(true);
          }}
        >
          ＋ ADD FLIGHT
        </button>
      </div>

      {isFormOpen && (
        <div className="mt-8 rounded-[2rem] border border-black/5 bg-[#f7f5f2] p-5 sm:p-7 md:p-9">
          <h2 className="mb-7 font-serif text-3xl">
            {editingFlight
              ? "Edit flight"
              : "Add a new flight"}
          </h2>

          <FlightForm
            flight={
              editingFlight
                ? mapFlightToFormData(
                    editingFlight,
                  )
                : undefined
            }
            onSave={handleSave}
            onCancel={closeForm}
          />
        </div>
      )}

      {flights.length === 0 ? (
        <div className="mt-8 rounded-[2rem] border border-dashed border-black/10 px-6 py-16 text-center">
          <p className="font-serif text-3xl">
            No flights yet.
          </p>

          <p className="mt-3 text-sm text-slate-500">
            Add your first flight to begin
            planning.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <div className="mt-8">
        <GoogleCalendarImport />
      </div>
    </div>
  );
}