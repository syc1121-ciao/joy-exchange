"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { emptyFlightForm } from "./flights";

import type {
  Flight,
  FlightFormData,
  FlightStatus,
} from "./types";

type FlightFormProps = {
  flight?: Flight | null;

  onSave: (
    data: FlightFormData,
  ) => void;

  onCancel: () => void;
};

const inputClassName =
  "mt-2 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-base outline-none transition focus:border-slate-500";

export default function FlightForm({
  flight,
  onSave,
  onCancel,
}: FlightFormProps) {
  const [formData, setFormData] =
    useState<FlightFormData>(
      flight
        ? {
            airline: flight.airline,
            flightNumber:
              flight.flightNumber,

            departureAirport:
              flight.departureAirport,
            departureCity:
              flight.departureCity,
            departureTime:
              flight.departureTime,

            arrivalAirport:
              flight.arrivalAirport,
            arrivalCity:
              flight.arrivalCity,
            arrivalTime:
              flight.arrivalTime,

            destinationSlug:
              flight.destinationSlug,

            terminal:
              flight.terminal ?? "",
            gate: flight.gate ?? "",
            seat: flight.seat ?? "",
            bookingReference:
              flight.bookingReference ??
              "",
            notes: flight.notes ?? "",

            status: flight.status,
          }
        : emptyFlightForm,
    );

  useEffect(() => {
    if (!flight) {
      setFormData(emptyFlightForm);
      return;
    }

    setFormData({
      airline: flight.airline,
      flightNumber: flight.flightNumber,

      departureAirport:
        flight.departureAirport,
      departureCity:
        flight.departureCity,
      departureTime:
        flight.departureTime,

      arrivalAirport:
        flight.arrivalAirport,
      arrivalCity: flight.arrivalCity,
      arrivalTime: flight.arrivalTime,

      destinationSlug:
        flight.destinationSlug,

      terminal: flight.terminal ?? "",
      gate: flight.gate ?? "",
      seat: flight.seat ?? "",
      bookingReference:
        flight.bookingReference ?? "",
      notes: flight.notes ?? "",

      status: flight.status,
    });
  }, [flight]);

  const updateField = <
    Key extends keyof FlightFormData,
  >(
    key: Key,
    value: FlightFormData[Key],
  ) => {
    setFormData((currentData) => ({
      ...currentData,
      [key]: value,
    }));
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    onSave({
      ...formData,

      flightNumber:
        formData.flightNumber
          .trim()
          .toUpperCase(),

      departureAirport:
        formData.departureAirport
          .trim()
          .toUpperCase(),

      arrivalAirport:
        formData.arrivalAirport
          .trim()
          .toUpperCase(),

      destinationSlug:
        formData.destinationSlug
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-"),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm text-slate-600">
          Airline
          <input
            required
            value={formData.airline}
            onChange={(event) => {
              updateField(
                "airline",
                event.target.value,
              );
            }}
            className={inputClassName}
            placeholder="Lufthansa"
          />
        </label>

        <label className="text-sm text-slate-600">
          Flight number
          <input
            required
            value={formData.flightNumber}
            onChange={(event) => {
              updateField(
                "flightNumber",
                event.target.value,
              );
            }}
            className={inputClassName}
            placeholder="LH731"
          />
        </label>
      </div>

      <div>
        <p className="mb-4 font-serif text-2xl">
          Departure
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm text-slate-600">
            Airport code
            <input
              required
              value={
                formData.departureAirport
              }
              onChange={(event) => {
                updateField(
                  "departureAirport",
                  event.target.value,
                );
              }}
              className={inputClassName}
              placeholder="TPE"
              maxLength={3}
            />
          </label>

          <label className="text-sm text-slate-600">
            City
            <input
              required
              value={
                formData.departureCity
              }
              onChange={(event) => {
                updateField(
                  "departureCity",
                  event.target.value,
                );
              }}
              className={inputClassName}
              placeholder="Taipei"
            />
          </label>
        </div>

        <label className="mt-5 block text-sm text-slate-600">
          Departure time
          <div className="mt-2 flex w-full min-w-0 rounded-2xl border border-black/10 bg-white px-4 py-3">
            <input
              required
              type="datetime-local"
              value={
                formData.departureTime
              }
              onChange={(event) => {
                updateField(
                  "departureTime",
                  event.target.value,
                );
              }}
              className="block w-full min-w-0 border-0 bg-transparent p-0 text-base outline-none"
            />
          </div>
        </label>
      </div>

      <div>
        <p className="mb-4 font-serif text-2xl">
          Arrival
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm text-slate-600">
            Airport code
            <input
              required
              value={
                formData.arrivalAirport
              }
              onChange={(event) => {
                updateField(
                  "arrivalAirport",
                  event.target.value,
                );
              }}
              className={inputClassName}
              placeholder="MUC"
              maxLength={3}
            />
          </label>

          <label className="text-sm text-slate-600">
            City
            <input
              required
              value={
                formData.arrivalCity
              }
              onChange={(event) => {
                updateField(
                  "arrivalCity",
                  event.target.value,
                );
              }}
              className={inputClassName}
              placeholder="Munich"
            />
          </label>
        </div>

        <label className="mt-5 block text-sm text-slate-600">
          Arrival time
          <div className="mt-2 flex w-full min-w-0 rounded-2xl border border-black/10 bg-white px-4 py-3">
            <input
              required
              type="datetime-local"
              value={
                formData.arrivalTime
              }
              onChange={(event) => {
                updateField(
                  "arrivalTime",
                  event.target.value,
                );
              }}
              className="block w-full min-w-0 border-0 bg-transparent p-0 text-base outline-none"
            />
          </div>
        </label>
      </div>

      <label className="block text-sm text-slate-600">
        Travel city slug
        <input
          required
          value={
            formData.destinationSlug
          }
          onChange={(event) => {
            updateField(
              "destinationSlug",
              event.target.value,
            );
          }}
          className={inputClassName}
          placeholder="munich"
        />

        <span className="mt-2 block text-xs leading-5 text-slate-400">
          Must match the Travel page URL,
          such as /travel/munich.
        </span>
      </label>

      <div className="grid gap-5 sm:grid-cols-3">
        <label className="text-sm text-slate-600">
          Terminal
          <input
            value={formData.terminal}
            onChange={(event) => {
              updateField(
                "terminal",
                event.target.value,
              );
            }}
            className={inputClassName}
            placeholder="2"
          />
        </label>

        <label className="text-sm text-slate-600">
          Gate
          <input
            value={formData.gate}
            onChange={(event) => {
              updateField(
                "gate",
                event.target.value,
              );
            }}
            className={inputClassName}
            placeholder="B12"
          />
        </label>

        <label className="text-sm text-slate-600">
          Seat
          <input
            value={formData.seat}
            onChange={(event) => {
              updateField(
                "seat",
                event.target.value,
              );
            }}
            className={inputClassName}
            placeholder="32A"
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm text-slate-600">
          Booking reference
          <input
            value={
              formData.bookingReference
            }
            onChange={(event) => {
              updateField(
                "bookingReference",
                event.target.value,
              );
            }}
            className={inputClassName}
            placeholder="ABC123"
          />
        </label>

        <label className="text-sm text-slate-600">
          Status
          <select
            value={formData.status}
            onChange={(event) => {
              updateField(
                "status",
                event.target
                  .value as FlightStatus,
              );
            }}
            className={inputClassName}
          >
            <option value="scheduled">
              Scheduled
            </option>

            <option value="on-time">
              On time
            </option>

            <option value="delayed">
              Delayed
            </option>

            <option value="cancelled">
              Cancelled
            </option>

            <option value="completed">
              Completed
            </option>
          </select>
        </label>
      </div>

      <label className="block text-sm text-slate-600">
        Notes
        <textarea
          value={formData.notes}
          onChange={(event) => {
            updateField(
              "notes",
              event.target.value,
            );
          }}
          className={`${inputClassName} min-h-28 resize-y`}
          placeholder="Anything to remember..."
        />
      </label>

      <div className="flex flex-col-reverse gap-3 border-t border-black/5 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-black/10 px-6 py-3 text-sm"
        >
          Cancel
        </button>

        <button
          type="submit"
          className="rounded-full bg-slate-950 px-7 py-3 text-sm text-white"
        >
          {flight
            ? "Save changes"
            : "Add flight"}
        </button>
      </div>
    </form>
  );
}