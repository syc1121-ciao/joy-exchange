import Link from "next/link";
import { redirect } from "next/navigation";

import FlightForm from "@/components/dashboard/FlightForm";
import { requireAdmin } from "@/lib/requireAdmin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const supabaseAdmin = getSupabaseAdmin();

export const dynamic =
  "force-dynamic";

export default async function NewFlightPage() {
  const session =
    await requireAdmin();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const authorEmail =
    session.user.email
      .trim()
      .toLowerCase();

  const { data, error } =
    await supabaseAdmin
      .from("places")
      .select(
        "id, city, country",
      )
      .eq(
        "author_email",
        authorEmail,
      )
      .order("city", {
        ascending: true,
      });

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        無法讀取 Places：
        {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/dashboard/flights"
        className="text-sm text-neutral-500 transition hover:text-neutral-900"
      >
        ← Back to Flights
      </Link>

      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
          Flight
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          New Flight
        </h1>

        <p className="mt-3 text-sm text-neutral-500">
          新增預定航班、機票與里程資訊。
        </p>
      </div>

      <FlightForm
        places={data ?? []}
      />
    </div>
  );
}