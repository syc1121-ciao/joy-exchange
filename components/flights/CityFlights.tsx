"use client";

import FlightCard from "./FlightCard";
import { useFlights } from "./FlightProvider";

type CityFlightsProps = {
  destinationSlug: string;
  cityName: string;
};

export default function CityFlights({
  destinationSlug,
  cityName,
}: CityFlightsProps) {
  const {
    getFlightsByDestination,
    isReady,
  } = useFlights();

  const cityFlights =
    getFlightsByDestination(
      destinationSlug,
    );

  if (!isReady) {
    return (
      <div className="h-52 animate-pulse rounded-3xl bg-black/5" />
    );
  }

  return (
    <section className="py-12 md:py-20">
      <div className="mb-7">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
          Getting there
        </p>

        <h2 className="mt-3 font-serif text-3xl text-slate-950 sm:text-4xl">
          Flights to {cityName}
        </h2>
      </div>

      {cityFlights.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-black/10 px-5 py-12 text-center">
          <p className="font-serif text-2xl">
            No flight added yet.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Add a flight with destination
            slug “{destinationSlug}”.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {cityFlights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
            />
          ))}
        </div>
      )}
    </section>
  );
}