import Link from "next/link";

const managementCards = [
  {
    title: "Places",
    description:
      "新增去過的城市、旅行日期、心得與地圖座標。",
    href: "/dashboard/places",
    action: "Manage places",
  },
  {
    title: "Journal",
    description:
      "新增文章、儲存草稿、發布和編輯內容。",
    href: "/dashboard/journal",
    action: "Manage stories",
  },
  {
    title: "Flights",
    description:
      "手動新增航班，或從 Google Calendar 匯入。",
    href: "/dashboard/flights",
    action: "Manage flights",
  },
  {
    title: "Gallery",
    description:
      "上傳交換生活與旅行照片。",
    href: "/dashboard/gallery",
    action: "Manage photos",
  },
];

export default function DashboardPage() {
  return (
    <div>
      <header>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
          Private workspace
        </p>

        <h1 className="mt-3 font-serif text-4xl text-slate-950 sm:text-5xl">
          Welcome back, Joy.
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-500">
          在這裡管理旅程、文章、航班與照片。
        </p>
      </header>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {managementCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-[1.75rem] border border-black/5 bg-[#faf8f5] p-6 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <h2 className="font-serif text-3xl text-slate-950">
              {card.title}
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              {card.description}
            </p>

            <p className="mt-7 text-xs uppercase tracking-[0.15em] text-slate-700">
              {card.action} →
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}