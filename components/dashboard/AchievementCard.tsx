import Link from "next/link";

export default function AchievementCard() {
  return (
    <Link
      href="/achievements"
      className="group block rounded-3xl border border-black/5 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Collection
          </p>

          <h2 className="mt-2 font-serif text-2xl text-slate-900">
            Achievements
          </h2>
        </div>

        <span className="text-2xl">🏆</span>
      </div>

      <div className="mt-7">
        <p className="font-serif text-5xl text-slate-900">
          0
          <span className="text-2xl text-slate-400"> / 24</span>
        </p>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-0 rounded-full bg-slate-800" />
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <span className="text-sm text-slate-400">
          Start your adventure
        </span>

        <span className="transition-transform group-hover:translate-x-1">
          View →
        </span>
      </div>
    </Link>
  );
}