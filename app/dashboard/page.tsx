import { requireAdmin } from "@/lib/requireAdmin";

export default async function DashboardPage() {
  const session = await requireAdmin();

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm text-neutral-500">
          Welcome back
        </p>

        <h1 className="mt-2 text-3xl font-semibold text-neutral-900">
          {session.user?.name ?? "Admin"}
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