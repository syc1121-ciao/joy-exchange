"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useFlights } from "./FlightProvider";

import type { Flight } from "./types";

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  hasDeparted: boolean;
};

function calculateCountdown(
  departureTime: string,
): Countdown {
  const difference =
    new Date(departureTime).getTime() -
    Date.now();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      hasDeparted: true,
    };
  }

  return {
    days: Math.floor(
      difference / (1000 * 60 * 60 * 24),
    ),

    hours: Math.floor(
      (difference /
        (1000 * 60 * 60)) %
        24,
    ),

    minutes: Math.floor(
      (difference / (1000 * 60)) % 60,
    ),

    seconds: Math.floor(
      (difference / 1000) % 60,
    ),

    hasDeparted: false,
  };
}

function getNextFlight(
  flights: Flight[],
): Flight | undefined {
  const now = Date.now();

  return flights
    .filter(
      (flight) =>
        new Date(
          flight.departureTime,
        ).getTime() >= now &&
        flight.status !== "cancelled",
    )
    .sort(
      (first, second) =>
        new Date(
          first.departureTime,
        ).getTime() -
        new Date(
          second.departureTime,
        ).getTime(),
    )[0];
}

type UpcomingFlightProps = {
  variant?: "hero" | "dashboard";
};

export default function UpcomingFlight({
  variant = "hero",
}: UpcomingFlightProps) {
  const { flights, isReady } =
    useFlights();

  const nextFlight = useMemo(
    () => getNextFlight(flights),
    [flights],
  );

  const [countdown, setCountdown] =
    useState<Countdown | null>(null);

  useEffect(() => {
    if (!nextFlight) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      setCountdown(
        calculateCountdown(
          nextFlight.departureTime,
        ),
      );
    };

    updateCountdown();

    const intervalId =
      window.setInterval(
        updateCountdown,
        1000,
      );

    return () => {
      window.clearInterval(intervalId);
    };
  }, [nextFlight]);

  if (!isReady) {
    return (
      <div className="h-64 animate-pulse rounded-[2rem] bg-black/5" />
    );
  }

  if (!nextFlight) {
    return (
      <div className="rounded-[2rem] border border-black/5 bg-white p-6 text-center md:p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
          Upcoming flight
        </p>

        <h3 className="mt-4 font-serif text-3xl text-slate-900">
          No flight planned yet.
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Add your next journey to begin the
          countdown.
        </p>

        <Link
          href="/dashboard/flights"
          className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-xs tracking-[0.14em] text-white"
        >
          ADD A FLIGHT
        </Link>
      </div>
    );
  }

  return (
    <article
      className={[
        "overflow-hidden rounded-[2rem]",
        "border border-black/5",
        variant === "dashboard"
          ? "bg-slate-950 text-white"
          : "bg-white text-slate-900",
      ].join(" ")}
    >
      <div className="p-5 sm:p-7 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p
              className={[
                "text-xs uppercase tracking-[0.28em]",
                variant === "dashboard"
                  ? "text-white/50"
                  : "text-slate-400",
              ].join(" ")}
            >
              Next departure
            </p>

            <p className="mt-2 text-sm">
              {nextFlight.airline}
              {" · "}
              {nextFlight.flightNumber}
            </p>
          </div>

          <span
            className={[
              "rounded-full px-3 py-1.5",
              "text-[11px] uppercase tracking-[0.12em]",
              variant === "dashboard"
                ? "bg-white/10 text-white/70"
                : "bg-slate-100 text-slate-600",
            ].join(" ")}
          >
            {nextFlight.status}
          </span>
        </div>

        <div className="mt-8 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div>
            <p className="font-serif text-4xl sm:text-5xl">
              {nextFlight.departureAirport}
            </p>

            <p
              className={
                variant === "dashboard"
                  ? "mt-1 text-xs text-white/50"
                  : "mt-1 text-xs text-slate-500"
              }
            >
              {nextFlight.departureCity}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={
                variant === "dashboard"
                  ? "h-px w-5 bg-white/30 sm:w-10"
                  : "h-px w-5 bg-slate-300 sm:w-10"
              }
            />

            <span aria-hidden="true">
              ✈
            </span>

            <span
              className={
                variant === "dashboard"
                  ? "h-px w-5 bg-white/30 sm:w-10"
                  : "h-px w-5 bg-slate-300 sm:w-10"
              }
            />
          </div>

          <div className="text-right">
            <p className="font-serif text-4xl sm:text-5xl">
              {nextFlight.arrivalAirport}
            </p>

            <p
              className={
                variant === "dashboard"
                  ? "mt-1 text-xs text-white/50"
                  : "mt-1 text-xs text-slate-500"
              }
            >
              {nextFlight.arrivalCity}
            </p>
          </div>
        </div>

        {countdown && (
          <div className="mt-8 grid grid-cols-4 gap-2">
            {[
              ["Days", countdown.days],
              ["Hours", countdown.hours],
              ["Minutes", countdown.minutes],
              ["Seconds", countdown.seconds],
            ].map(([label, value]) => (
              <div
                key={label}
                className={
                  variant === "dashboard"
                    ? "rounded-2xl bg-white/10 px-2 py-3 text-center"
                    : "rounded-2xl bg-[#f4f1ed] px-2 py-3 text-center"
                }
              >
                <p className="font-serif text-2xl">
                  {String(value).padStart(
                    2,
                    "0",
                  )}
                </p>

                <p
                  className={
                    variant === "dashboard"
                      ? "mt-1 text-[9px] uppercase tracking-[0.12em] text-white/45"
                      : "mt-1 text-[9px] uppercase tracking-[0.12em] text-slate-400"
                  }
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        )}

        <div
          className={[
            "mt-6 flex flex-col gap-3",
            "border-t pt-5 sm:flex-row",
            "sm:items-center sm:justify-between",
            variant === "dashboard"
              ? "border-white/10"
              : "border-black/5",
          ].join(" ")}
        >
          <p
            className={
              variant === "dashboard"
                ? "text-sm text-white/60"
                : "text-sm text-slate-500"
            }
          >
            {new Date(
              nextFlight.departureTime,
            ).toLocaleString()}
          </p>

          <Link
            href="/dashboard/flights"
            className={
              variant === "dashboard"
                ? "text-xs tracking-[0.12em] text-white"
                : "text-xs tracking-[0.12em] text-slate-900"
            }
          >
            MANAGE FLIGHTS →
          </Link>
        </div>
      </div>
    </article>
  );
}