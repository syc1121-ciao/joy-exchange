"use client";

import dynamic from "next/dynamic";

const WorldMap = dynamic(() => import("./WorldMap"), {
  ssr: false,
  loading: () => (
    <section className="bg-[#f7f5f2] px-5 py-24 md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <p className="text-sm uppercase tracking-[0.35em] text-slate-500">
            My Journey
          </p>

          <h2 className="mt-4 font-serif text-4xl text-slate-900 md:text-5xl">
            Places I want to explore.
          </h2>
        </div>

        <div className="aspect-[5/3] animate-pulse rounded-3xl border border-black/5 bg-[#eeeae4]" />
      </div>
    </section>
  ),
});

export default function WorldMapLoader() {
  return <WorldMap />;
}