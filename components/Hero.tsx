import Image from "next/image";
import Link from "next/link";
export default function Hero() {
  return (
    <section className="overflow-hidden bg-[#faf8f5] px-4 py-12 sm:px-6 md:px-10 md:py-20">
  <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 md:grid-cols-2 md:items-center md:gap-16">
    {/* 文字 */}
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
        Exchange Student 2026/2027 Winter
      </p>

      <h1 className="mt-5 max-w-xl font-serif text-5xl leading-[0.96] text-slate-950 sm:text-6xl md:text-7xl lg:text-8xl">
        TUM Germany
      </h1>

      <p className="mt-6 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
        玩遍歐洲的高山小河大海
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/dashboard"
          className="inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-6 py-4 text-xs tracking-[0.16em] text-white sm:w-auto"
        >
          OPEN DASHBOARD →
        </Link>

        {/* <Link
          href="/journal"
          className="inline-flex w-full items-center justify-center rounded-full border border-black/10 px-6 py-4 text-xs tracking-[0.16em] text-slate-800 sm:w-auto"
        >
          EXPLORE JOURNAL
        </Link> */}
      </div>
    </div>

    {/* 圖片 */}
    <div className="relative min-w-0">
      <div className="mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[2rem] md:max-w-md">
        <img
          src="/images/cambridge.jpg"
          alt="Exchange journey"
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  </div>
</section>
  );
}