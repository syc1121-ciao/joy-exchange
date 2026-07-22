"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { initialFlights } from "./flights";

import type {
  Flight,
  FlightFormData,
} from "./types";

const STORAGE_KEY = "joy-exchange-flights";

type FlightContextValue = {
  flights: Flight[];
  isReady: boolean;

  addFlight: (flight: FlightFormData) => void;

  updateFlight: (
    id: string,
    flight: FlightFormData,
  ) => void;

  deleteFlight: (id: string) => void;

  importFlights: (
  flights: FlightFormData[],
) => void;

  getFlightById: (
    id: string,
  ) => Flight | undefined;

  getFlightsByDestination: (
    destinationSlug: string,
  ) => Flight[];
};

const FlightContext =
  createContext<FlightContextValue | null>(null);

function sortFlights(
  flights: Flight[],
): Flight[] {
  return [...flights].sort(
    (first, second) =>
      new Date(first.departureTime).getTime() -
      new Date(second.departureTime).getTime(),
  );
}

function createFlightId() {
  if (
    typeof crypto !== "undefined" &&
    "randomUUID" in crypto
  ) {
    return crypto.randomUUID();
  }

  return `flight-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

type FlightProviderProps = {
  children: ReactNode;
};

export default function FlightProvider({
  children,
}: FlightProviderProps) {
  const [flights, setFlights] =
    useState<Flight[]>(initialFlights);

  const [isReady, setIsReady] =
    useState(false);

  useEffect(() => {
    try {
      const savedFlights =
        window.localStorage.getItem(
          STORAGE_KEY,
        );

      if (savedFlights) {
        const parsedFlights =
          JSON.parse(savedFlights) as Flight[];

        setFlights(
          sortFlights(parsedFlights),
        );
      }
    } catch (error) {
      console.error(
        "Unable to load saved flights:",
        error,
      );
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(flights),
    );
  }, [flights, isReady]);

  const value = useMemo<FlightContextValue>(
    () => ({
      flights,

      isReady,

      addFlight: (flightData) => {
        const newFlight: Flight = {
          ...flightData,
          id: createFlightId(),
        };

        setFlights((currentFlights) =>
          sortFlights([
            ...currentFlights,
            newFlight,
          ]),
        );
      },

      updateFlight: (
        id,
        flightData,
      ) => {
        setFlights((currentFlights) =>
          sortFlights(
            currentFlights.map((flight) =>
              flight.id === id
                ? {
                    ...flightData,
                    id,
                  }
                : flight,
            ),
          ),
        );
      },

      deleteFlight: (id) => {
        setFlights((currentFlights) =>
          currentFlights.filter(
            (flight) => flight.id !== id,
          ),
        );
      },
      importFlights: (importedFlights) => {
  setFlights((currentFlights) => {
    const nextFlights = [
      ...currentFlights,
    ];

    for (
      const flightData
      of importedFlights
    ) {
      const isDuplicate =
        flightData.calendarEventId
          ? nextFlights.some(
              (flight) =>
                flight.calendarEventId ===
                flightData.calendarEventId,
            )
          : nextFlights.some(
              (flight) =>
                flight.flightNumber ===
                  flightData.flightNumber &&
                flight.departureTime ===
                  flightData.departureTime,
            );

      if (isDuplicate) {
        continue;
      }

      nextFlights.push({
        ...flightData,
        id: createFlightId(),
      });
    }

    return sortFlights(nextFlights);
  });
},

      getFlightById: (id) =>
        flights.find(
          (flight) => flight.id === id,
        ),

      getFlightsByDestination: (
        destinationSlug,
      ) =>
        flights.filter(
          (flight) =>
            flight.destinationSlug ===
            destinationSlug,
        ),
    }),
    [flights, isReady],
  );

  return (
    <FlightContext.Provider value={value}>
      {children}
    </FlightContext.Provider>
  );
}

export function useFlights() {
  const context =
    useContext(FlightContext);

  if (!context) {
    throw new Error(
      "useFlights must be used inside FlightProvider.",
    );
  }

  return context;
}