import Image from "next/image";
import Link from "next/link";
export default function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-8 py-24">

      <div className="grid grid-cols-2 gap-16 items-center">

        {/* 左邊文字 */}

        <div>

    <p className="uppercase tracking-[0.4em] text-gray-500 text-sm mb-6">
        Exchange Student 2027
    </p>

    <h1 className="text-6xl font-serif leading-tight">

        Collect moments,
        <br />

        not things.

    </h1>

    <p className="mt-8 text-lg text-gray-600 leading-8">

        一場屬於我的交換冒險，
        <br />

        正在歐洲展開。

    </p>
    <Link
  href="/dashboard"
  className="mt-8 inline-flex items-center gap-3 rounded-full bg-slate-900 px-7 py-4 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-slate-700"
>
  Open Dashboard
  <span>→</span>
</Link>

    <button
        className="
        mt-10
        rounded-full
        bg-black
        text-white
        px-8
        py-4
        hover:bg-neutral-700
        transition
        "
    >
        Explore Journal
    </button>

</div>

        {/* 右邊圖片 */}
{/* 右邊圖片 */}

<div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">

    <Image
        src="/images/cambridge.jpg"
        alt="Europe"
        fill
        className="object-cover"
    />

</div>
</div>
    </section>
  );
}