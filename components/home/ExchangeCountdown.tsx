"use client";

import { useEffect, useMemo, useState } from "react";

type ExchangeCountdownProps = {
  targetDate: string;
};

type CountdownValue = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function calculateCountdown(
  targetDate: string,
): CountdownValue {
  const targetTime =
    new Date(targetDate).getTime();

  const now =
    new Date().getTime();

  const distance =
    Math.max(targetTime - now, 0);

  return {
    days: Math.floor(
      distance / (1000 * 60 * 60 * 24),
    ),
    hours: Math.floor(
      (distance / (1000 * 60 * 60)) % 24,
    ),
    minutes: Math.floor(
      (distance / (1000 * 60)) % 60,
    ),
    seconds: Math.floor(
      (distance / 1000) % 60,
    ),
  };
}

export default function ExchangeCountdown({
  targetDate,
}: ExchangeCountdownProps) {
  const [countdown, setCountdown] =
    useState<CountdownValue>({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    });

  const targetLabel = useMemo(() => {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    ).format(new Date(targetDate));
  }, [targetDate]);

  useEffect(() => {
    function updateCountdown() {
      setCountdown(
        calculateCountdown(targetDate),
      );
    }

    updateCountdown();

    const interval =
      window.setInterval(
        updateCountdown,
        1000,
      );

    return () => {
      window.clearInterval(interval);
    };
  }, [targetDate]);

  const values = [
    {
      label: "Days",
      value: countdown.days,
    },
    {
      label: "Hours",
      value: countdown.hours,
    },
    {
      label: "Minutes",
      value: countdown.minutes,
    },
    {
      label: "Seconds",
      value: countdown.seconds,
    },
  ];

  return (
    <section className="bg-[#faf8f5]">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-12 lg:py-32">
        <div className="overflow-hidden rounded-[2.5rem] bg-[#17324d] text-white shadow-[0_24px_70px_rgba(23,50,77,0.18)]">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
            <div className="border-b border-white/10 p-8 sm:p-12 lg:border-b-0 lg:border-r lg:p-14">
              <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                Taiwan → Germany
              </p>

              <h2 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl">
                Counting down
                <br />
                to a new chapter.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-white/65">
                交換生活還沒正式開始，
                但每一天都正在讓這個夢想變得更真實。
              </p>

              <p className="mt-9 text-xs uppercase tracking-[0.22em] text-white/45">
                Departure · {targetLabel}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4">
              {values.map((item, index) => (
                <div
                  key={item.label}
                  className={[
                    "flex min-h-40 flex-col items-center justify-center p-6 text-center sm:min-h-full",
                    index % 2 !== 0
                      ? "border-l border-white/10"
                      : "",
                    index >= 2
                      ? "border-t border-white/10 sm:border-t-0"
                      : "",
                    index > 0
                      ? "sm:border-l sm:border-white/10"
                      : "",
                  ].join(" ")}
                >
                  <p className="font-serif text-5xl sm:text-6xl">
                    {String(item.value).padStart(
                      2,
                      "0",
                    )}
                  </p>

                  <p className="mt-3 text-xs uppercase tracking-[0.22em] text-white/50">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}