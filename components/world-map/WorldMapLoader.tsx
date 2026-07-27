"use client";

import dynamic from "next/dynamic";

import type { PublicPlace } from "./WorldMap";

type WorldMapLoaderProps = {
  places: PublicPlace[];
};

const WorldMap = dynamic<WorldMapLoaderProps>(
  () => import("./WorldMap"),
  {
    ssr: false,

    loading: () => (
      <section className="w-full">
        <header className="mb-6 text-center sm:mb-9">
          <div className="mx-auto h-3 w-24 animate-pulse rounded-full bg-neutral-200 sm:w-28" />

          <div className="mx-auto mt-4 h-9 w-64 max-w-[85%] animate-pulse rounded-xl bg-neutral-200 sm:h-12 sm:w-96" />

          <div className="mx-auto mt-4 h-4 w-72 max-w-[90%] animate-pulse rounded-full bg-neutral-200" />
        </header>

        <div className="overflow-hidden rounded-[1.5rem] border border-black/5 bg-[#eeeae4] sm:rounded-[2rem]">
          <div className="border-b border-black/5 bg-white/50 px-4 py-4 sm:px-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="h-3 w-28 animate-pulse rounded-full bg-neutral-200" />

                <div className="mt-2 h-4 w-40 animate-pulse rounded-full bg-neutral-200" />
              </div>

              <div className="h-8 w-20 animate-pulse rounded-full bg-white/80" />
            </div>
          </div>

          <div className="relative aspect-[4/3] min-h-[300px] sm:aspect-[5/3] sm:min-h-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-[72%] w-[86%] animate-pulse">
                <div className="absolute left-[8%] top-[18%] h-[35%] w-[25%] rounded-[45%] bg-[#d8d3cb]" />

                <div className="absolute left-[34%] top-[13%] h-[32%] w-[18%] rounded-[45%] bg-[#d8d3cb]" />

                <div className="absolute left-[50%] top-[18%] h-[43%] w-[28%] rounded-[45%] bg-[#d8d3cb]" />

                <div className="absolute left-[73%] top-[55%] h-[19%] w-[14%] rounded-[45%] bg-[#d8d3cb]" />

                <div className="absolute left-[25%] top-[55%] h-[27%] w-[17%] rounded-[45%] bg-[#d8d3cb]" />
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2 sm:hidden">
              <div className="h-10 animate-pulse rounded-xl bg-white/70" />
              <div className="h-10 animate-pulse rounded-xl bg-white/70" />
              <div className="h-10 animate-pulse rounded-xl bg-white/70" />
            </div>
          </div>
        </div>
      </section>
    ),
  },
);

export default function WorldMapLoader({
  places,
}: WorldMapLoaderProps) {
  return <WorldMap places={places} />;
}