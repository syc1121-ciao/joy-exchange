"use client";
import GoogleCalendarImport from "./GoogleCalendarImport";
import { useState } from "react";

import FlightCard from "./FlightCard";
import FlightForm from "./FlightForm";

import { useFlights } from "./FlightProvider";

import type {
  Flight,
  FlightFormData,
} from "./types";

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

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingFlight(null);
  };

  const handleSave = (
    formData: FlightFormData,
  ) => {
    if (editingFlight) {
      updateFlight(
        editingFlight.id,
        formData,
      );
    } else {
      addFlight(formData);
    }

    closeForm();
  };

  const handleDelete = (
    flight: Flight,
  ) => {
    const shouldDelete =
      window.confirm(
        `Delete ${flight.flightNumber} from ${flight.departureCity} to ${flight.arrivalCity}?`,
      );

    if (shouldDelete) {
      deleteFlight(flight.id);
    }
  };

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
          className="w-full rounded-full bg-slate-950 px-6 py-4 text-xs tracking-[0.14em] text-white sm:w-auto"
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
            flight={editingFlight}
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
              onEdit={(selectedFlight) => {
                setEditingFlight(
                  selectedFlight,
                );

                setIsFormOpen(true);

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
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