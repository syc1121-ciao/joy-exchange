import Link from "next/link";
import { requireAdmin } from "@/lib/requireAdmin";

const stats = [
  {
    label: "Places",
    value: 0,
    href: "/dashboard/places",
  },
  {
    label: "Journal",
    value: 0,
    href: "/dashboard/journal",
  },
  {
    label: "Flights",
    value: 0,
    href: "/dashboard/flights",
  },
  {
    label: "Gallery",
    value: 0,
    href: "/dashboard/gallery",
  },
];

export default async function DashboardPage() {
  const session = await requireAdmin();
  const userName = session.user?.name ?? "Admin";

  return (
    <section className="mx-auto w-full max-w-7xl">
      {/* Header */}
      <div className="mb-8 min-w-0">
        <p className="mb-2 text-sm text-[#6f84a6]">
          Welcome back
        </p>

        <h1 className="max-w-full break-words font-serif text-4xl font-semibold leading-[0.95] text-[#171717] sm:text-5xl lg:text-6xl">
          {userName}
        </h1>

        <p className="mt-4 max-w-xl text-sm leading-6 text-[#66615b] sm:text-base">
          Keep track of your exchange destinations, flights, journals and
          memories.
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="
              min-w-0
              rounded-2xl
              border border-black/10
              bg-white
              p-4
              shadow-sm
              transition
              duration-200
              hover:-translate-y-0.5
              hover:shadow-md
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#8da0bf]
              focus-visible:ring-offset-2
              sm:p-6
            "
          >
            <p className="truncate text-xs font-medium text-[#6f84a6] sm:text-sm">
              {stat.label}
            </p>

            <p className="mt-3 font-serif text-4xl font-semibold leading-none text-[#8da0bf] sm:mt-4 sm:text-5xl">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Next Adventure */}
      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:p-7">
        <p className="mb-0 text-xs uppercase tracking-[0.25em] text-[#6f84a6]">
          Next Adventure
        </p>

        <h2 className="mt-3 break-words font-serif text-2xl font-medium text-[#171717] sm:text-3xl">
          Start planning your next destination
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#66615b]">
          Add a city, record your travel dates and collect your favorite
          moments.
        </p>

        <Link
          href="/dashboard/places"
          className="
            mt-5
            inline-flex
            min-h-11
            items-center
            justify-center
            rounded-full
            bg-[#171717]
            px-5
            py-2.5
            text-sm
            font-medium
            text-white
            transition
            hover:bg-[#303030]
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#171717]
            focus-visible:ring-offset-2
          "
        >
          Add a place
        </Link>
      </div>
    </section>
  );
}