import Link from "next/link";

export default function CitiesCard() {
  return (
    <Link
      href="/cities"
      className="group block rounded-3xl border border-black/5 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
            Travel
          </p>

          <h2 className="mt-2 font-serif text-2xl text-slate-900">
            Dream Cities
          </h2>
        </div>

        <span className="text-2xl">🗺️</span>
      </div>

      <div className="mt-6 space-y-3 text-slate-600">
        <p>🇩🇪 Berlin</p>
        <p>🇨🇭 Zurich</p>
        <p>🇳🇴 Oslo</p>
      </div>

      <div className="mt-7 flex items-center justify-between">
        <span className="text-sm text-slate-400">3 cities planned</span>

        <span className="transition-transform group-hover:translate-x-1">
          Explore →
        </span>
      </div>
    </Link>
  );
}