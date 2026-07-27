import Image from "next/image";
import Link from "next/link";

import ExchangeCountdown from "@/components/home/ExchangeCountdown";

type TimelineItem = {
  title: string;
  description: string;
  completed: boolean;
};

type Memory = {
  id: string;
  city: string;
  country: string;
  title: string;
  date: string;
  description: string;
  image: string;
  href: string;
};

type Goal = {
  id: string;
  title: string;
  completed: boolean;
};

const timelineItems: TimelineItem[] = [
  {
    title: "申請交換學生",
    description: "準備校內申請文件",
    completed: true,
  },
  {
    title: "收到交換錄取通知",
    description: "正式確認即將前往德國展開交換生活",
    completed: true,
  },
  {
    title: "申請德國簽證",
    description: "準備財力證明、保險與其他申請文件",
    completed: true,
  },
  {
    title: "購買前往德國的機票",
    description: "確認航班、行李額度與出發日期",
    completed: true,
  },
  {
    title: "確定交換住宿",
    description: "學生宿舍Service Package",
    completed: false,
  },
  {
    title: "抵達德國",
    description: "開始交換生活",
    completed: false,
  },
];

const memories: Memory[] = [
  {
    id: "exchange-preparation",
    city: "Taipei",
    country: "Taiwan",
    title: "Preparing for Germany",
    date: "July 2026",
    description:
      "從申請、機票到行李，慢慢把原本遙遠的交換夢想變成真實計畫。",
    image: "/images/cities/taipei.jpg",
    href: "/journal",
  },
  {
    id: "munich-dream",
    city: "Munich",
    country: "Germany",
    title: "My Future Exchange City",
    date: "Coming Soon",
    description:
      "即將生活半年的城市，也是這段交換冒險真正開始的地方。",
    image: "/images/cities/munich.jpg",
    href: "/destinations",
  },
  {
    id: "paris-dream",
    city: "Paris",
    country: "France",
    title: "Places I Dream of Visiting",
    date: "Europe Bucket List",
    description:
      "把想去的城市一個個收藏起來，等待未來親自抵達。",
    image: "/images/cities/paris.jpg",
    href: "/destinations",
  },
];

const monthlyGoals: Goal[] = [
  {
    id: "german",
    title: "持續學習德文，熟悉交換生活常用句子",
    completed: false,
  },
  {
    id: "visa",
    title: "整理簽證與交換申請文件",
    completed: false,
  },
  {
    id: "packing",
    title: "建立交換行李與必買用品清單",
    completed: false,
  },
  {
    id: "destinations",
    title: "完成第一版歐洲旅行願望清單",
    completed: true,
  },
];

const statistics = [
  {
    label: "Days to Exchange",
    value: "2027",
    note: "Adventure begins",
  },
  {
    label: "Dream Countries",
    value: "12",
    note: "Waiting to explore",
  },
  {
    label: "Saved Cities",
    value: "38",
    note: "Across Europe",
  },
  {
    label: "Memories",
    value: "∞",
    note: "Still collecting",
  },
];

const galleryPreview = [
  {
    src: "/images/cities/taipei.jpg",
    alt: "Taipei",
  },
  {
    src: "/images/cities/munich.jpg",
    alt: "Munich",
  },
  {
    src: "/images/cities/paris.jpg",
    alt: "Paris",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-[#faf8f5] text-[#1f2933]">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-5rem)]">
        <div className="absolute inset-0">
          <Image
            src="/images/cities/london.jpg"
            alt="London city"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />

          <div className="absolute inset-0 bg-[#10263f]/55" />

          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#10263f]/60" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl items-end px-6 pb-16 pt-28 sm:px-10 sm:pb-20 lg:px-12 lg:pb-24">
          <div className="max-w-4xl text-white">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.38em] text-white/75 sm:text-sm">
              Exchange Student 2027
            </p>

            <h1 className="max-w-4xl font-serif text-5xl leading-[0.95] sm:text-7xl lg:text-[6.5rem]">
              Ciao's
              <br />
              TUM Exchange
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-white/80 sm:text-lg">
              玩遍歐洲的高山小河大海
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/journal"
                className="rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-medium !text-[#0e1726] backdrop-blur-md transition hover:bg-white/20"
              >
                Explore Journal
              </Link>

              <Link
                href="/destinations"
                className="rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-medium text-white backdrop-blur-md transition hover:bg-white/20"
              >
                View Destinations
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-7 right-7 hidden items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/70 sm:flex">
          <span>Scroll to explore</span>

          <span className="h-px w-14 bg-white/50" />
        </div>
      </section>

      {/* Introduction
      <section className="border-b border-[#ddd6cc]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:px-12 lg:py-32">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#6f7f8d]">
              My Exchange Story
            </p>
          </div>

          <div>
            <h2 className="max-w-4xl font-serif text-4xl leading-tight text-[#17324d] sm:text-5xl lg:text-6xl">
              Every adventure begins long before the plane takes off.
            </h2>

            <p className="mt-8 max-w-3xl text-base leading-8 text-[#66727d] sm:text-lg">
              這裡記錄的不只是交換期間去了哪些城市，
              還有出發以前的期待、準備過程中的焦慮，
              以及那些慢慢靠近夢想的日常時刻。
            </p>
          </div>
        </div>
      </section> */}

      {/* Countdown */}

      <ExchangeCountdown targetDate="2026-09-15T00:00:00+08:00" />

      {/* Timeline */}
      <section className="bg-[#f2eee8]">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-12 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#6f7f8d]">
                Exchange Timeline
              </p>

              <h2 className="mt-5 font-serif text-4xl text-[#17324d] sm:text-5xl">
                The journey
                <br />
                before departure.
              </h2>

              <p className="mt-6 max-w-md text-sm leading-7 text-[#66727d]">
                
              </p>
            </div>

            <div className="relative">
              <div className="absolute bottom-5 left-[19px] top-5 w-px bg-[#c9c0b5]" />

              <div className="space-y-8">
                {timelineItems.map((item, index) => (
                  <article
                    key={item.title}
                    className="relative grid grid-cols-[40px_1fr] gap-5"
                  >
                    <div
                      className={[
                        "relative z-10 flex h-10 w-10 items-center justify-center rounded-full border text-sm",
                        item.completed
                          ? "border-[#17324d] bg-[#17324d] text-white"
                          : "border-[#bbb1a5] bg-[#f2eee8] text-[#8a8178]",
                      ].join(" ")}
                    >
                      {item.completed ? "✓" : index + 1}
                    </div>

                    <div className="rounded-3xl border border-[#ddd6cc] bg-[#faf8f5] p-6 sm:p-7">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-serif text-2xl text-[#17324d]">
                          {item.title}
                        </h3>

                        <span
                          className={[
                            "rounded-full px-3 py-1 text-xs",
                            item.completed
                              ? "bg-[#dfe8e3] text-[#456253]"
                              : "bg-[#ece7e0] text-[#80766d]",
                          ].join(" ")}
                        >
                          {item.completed ? "Completed" : "Upcoming"}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-7 text-[#66727d]">
                        {item.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Memories */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-12 lg:py-32">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#6f7f8d]">
              Featured Memories
            </p>

            <h2 className="mt-5 font-serif text-4xl text-[#17324d] sm:text-5xl">
              Stories worth keeping.
            </h2>
          </div>

          <Link
            href="/journal"
            className="w-fit border-b border-[#17324d] pb-1 text-sm text-[#17324d] transition hover:opacity-60"
          >
            View all stories
          </Link>
        </div>

        <div className="mt-12 grid gap-7 lg:grid-cols-3">
          {memories.map((memory) => (
            <Link
              key={memory.id}
              href={memory.href}
              className="group overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_50px_rgba(31,41,51,0.08)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={memory.image}
                  alt={memory.city}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

                <div className="absolute bottom-5 left-5 text-white">
                  <p className="text-xs uppercase tracking-[0.22em] text-white/70">
                    {memory.country}
                  </p>

                  <p className="mt-1 font-serif text-3xl">
                    {memory.city}
                  </p>
                </div>
              </div>

              <div className="p-7">
                <p className="text-xs uppercase tracking-[0.2em] text-[#89939c]">
                  {memory.date}
                </p>

                <h3 className="mt-3 font-serif text-2xl text-[#17324d]">
                  {memory.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-[#66727d]">
                  {memory.description}
                </p>

                <div className="mt-6 flex items-center gap-3 text-sm text-[#17324d]">
                  <span>Read story</span>

                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Goals */}
      <section className="bg-[#17324d] text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-32">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/55">
              Monthly Goals
            </p>

            <h2 className="mt-5 max-w-lg font-serif text-4xl sm:text-5xl">
              Small steps toward a bigger adventure.
            </h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-white/65">
              
            </p>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/15 bg-white/5 backdrop-blur-sm">
            {monthlyGoals.map((goal, index) => (
              <div
                key={goal.id}
                className={[
                  "flex items-start gap-5 p-6 sm:p-7",
                  index !== monthlyGoals.length - 1
                    ? "border-b border-white/10"
                    : "",
                ].join(" ")}
              >
                <div
                  className={[
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs",
                    goal.completed
                      ? "border-white bg-white text-[#17324d]"
                      : "border-white/35 text-transparent",
                  ].join(" ")}
                >
                  ✓
                </div>

                <div>
                  <p
                    className={[
                      "text-base leading-7",
                      goal.completed
                        ? "text-white/55 line-through"
                        : "text-white",
                    ].join(" ")}
                  >
                    {goal.title}
                  </p>

                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-white/40">
                    {goal.completed ? "Completed" : "In progress"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="border-b border-[#ddd6cc]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-12">
          <div className="grid gap-px overflow-hidden rounded-[2rem] border border-[#ddd6cc] bg-[#ddd6cc] sm:grid-cols-2 lg:grid-cols-4">
            {statistics.map((stat) => (
              <div
                key={stat.label}
                className="bg-[#faf8f5] p-7 sm:p-9"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-[#7d8992]">
                  {stat.label}
                </p>

                <p className="mt-5 font-serif text-5xl text-[#17324d]">
                  {stat.value}
                </p>

                <p className="mt-3 text-sm text-[#89939c]">
                  {stat.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Preview */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-12 lg:py-32">
        <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-[#6f7f8d]">
                Photo Diary
              </p>

              <h2 className="mt-5 font-serif text-4xl text-[#17324d] sm:text-5xl">
                Life, captured
                <br />
                along the way.
              </h2>

              <p className="mt-6 max-w-sm text-sm leading-7 text-[#66727d]">
                有些回憶不需要太多文字，
                一張照片就能讓當時的空氣與心情再次回來。
              </p>
            </div>

            <Link
              href="/gallery"
              className="mt-8 w-fit rounded-full bg-[#17324d] px-6 py-3 text-sm text-white transition hover:bg-[#244666]"
            >
              Open Gallery
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-5">
            <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] sm:min-h-[540px]">
              <Image
                src={galleryPreview[0].src}
                alt={galleryPreview[0].alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 35vw"
              />
            </div>

            <div className="grid gap-4 sm:gap-5">
              {galleryPreview.slice(1).map((image) => (
                <div
                  key={image.src}
                  className="relative min-h-[200px] overflow-hidden rounded-[2rem] sm:min-h-[260px]"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 30vw"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-8 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-[#e9e2d8] px-7 py-16 text-center sm:px-12 sm:py-24">
          <p className="text-xs uppercase tracking-[0.3em] text-[#73808a]">
            The world is waiting
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-tight text-[#17324d] sm:text-6xl">
            One day, these plans will become memories.
          </h2>

          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-[#66727d]">
            先把想去的地方收藏起來，
            未來再一座一座城市親自解鎖。
          </p>

          <Link
            href="/destinations"
            className="mt-9 inline-flex rounded-full bg-[#00000] px-7 py-3.5 text-sm font-medium text-[#162c47] transition hover:bg-[#244666]"
          >
            Explore My Map
          </Link>
        </div>
      </section>
    </main>
  );
}