export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
          Dashboard
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Welcome back 👋
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Places
          </p>

          <p className="mt-4 text-4xl font-bold">
            0
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Journal
          </p>

          <p className="mt-4 text-4xl font-bold">
            0
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Flights
          </p>

          <p className="mt-4 text-4xl font-bold">
            0
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="text-sm text-neutral-500">
            Gallery
          </p>

          <p className="mt-4 text-4xl font-bold">
            0
          </p>
        </div>
      </div>
    </div>
  );
}