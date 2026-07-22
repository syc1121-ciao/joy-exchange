import Link from "next/link";

export default function CitiesPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f2] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Dashboard
        </Link>

        <h1 className="mt-8 font-serif text-5xl text-slate-900">
          Dream Cities
        </h1>

        <p className="mt-4 text-slate-500">
          Add the European cities you would like to visit.
        </p>
      </div>
    </main>
  );
}