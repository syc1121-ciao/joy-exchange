import Link from "next/link";

import WorldMap from "@/components/world-map/WorldMap";

export default function DestinationsPage() {
  return (
    <main className="min-h-screen bg-[#faf8f5] pb-20 pt-24 text-[#1f2933]">
      <section className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
        <div className="grid gap-8 border-b border-[#ddd6cc] pb-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#6f7f8d]">
              My Travel Map
            </p>

            <h1 className="mt-5 font-serif text-5xl leading-tight text-[#17324d] sm:text-6xl">
              Destinations
            </h1>
          </div>

          <div>
            <p className="max-w-2xl text-base leading-8 text-[#66727d]">
              從臺灣出發，把交換期間想去的城市、夢想目的地與已經留下回憶的地方，
              一個個標記在這張地圖上。
            </p>

            <div className="mt-6 flex flex-wrap gap-5 text-xs uppercase tracking-[0.18em] text-[#66727d]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#17324d]" />
                Home
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#657f6e]" />
                Visited
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#b78a53]" />
                Dream
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#9a8797]" />
                Wishlist
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-10 max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2rem] border border-[#ddd6cc] bg-[#e8edf0] shadow-[0_20px_60px_rgba(31,41,51,0.08)]">
          <WorldMap />
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-7xl px-6 sm:px-10 lg:px-12">
        <div className="flex flex-col gap-7 rounded-[2rem] bg-[#eee8df] p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#76838d]">
              Travel Journal
            </p>

            <h2 className="mt-3 font-serif text-3xl text-[#17324d]">
              Every city has a story.
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#66727d]">
              地圖收藏目的地，日記收藏真正發生過的故事。
            </p>
          </div>

          <Link
            href="/journal"
            className="w-fit shrink-0 rounded-full bg-[#17324d] px-6 py-3 text-sm text-white transition hover:bg-[#244666]"
          >
            Read Journal
          </Link>
        </div>
      </section>
    </main>
  );
}