import { redirect } from "next/navigation";

import NewJournalForm from "@/components/dashboard/NewJournalForm";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export default async function NewJournalPage() {
  const session = await requireAdmin();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const authorEmail = session.user.email
    .trim()
    .toLowerCase();

  const { data, error } = await supabaseAdmin
    .from("places")
    .select("id, city, country")
    .eq("author_email", authorEmail)
    .order("city", {
      ascending: true,
    });

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        無法讀取 Places：{error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
          Journal
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          New Journal
        </h1>

        <p className="mt-3 text-sm text-neutral-500">
          記錄旅行日期、故事與城市回憶。
        </p>
      </div>

      <NewJournalForm places={data ?? []} />
    </div>
  );
}