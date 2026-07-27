import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import EditJournalForm from "@/components/dashboard/EditJournalForm";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Journal = {
  id: string;
  place_id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  journal_date: string | null;
  status: "draft" | "published";
};

type PlaceOption = {
  id: string;
  city: string;
  country: string;
};

export default async function EditJournalPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const session = await requireAdmin();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const { id } = await params;

  const authorEmail = session.user.email
    .trim()
    .toLowerCase();

  const [journalResult, placesResult] =
    await Promise.all([
      supabaseAdmin
        .from("journals")
        .select(`
          id,
          place_id,
          title,
          slug,
          excerpt,
          content,
          journal_date,
          status
        `)
        .eq("id", id)
        .eq("author_email", authorEmail)
        .maybeSingle(),

      supabaseAdmin
        .from("places")
        .select("id, city, country")
        .eq("author_email", authorEmail)
        .order("city", {
          ascending: true,
        }),
    ]);

  if (journalResult.error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        無法讀取 Journal：
        {journalResult.error.message}
      </div>
    );
  }

  if (!journalResult.data) {
    notFound();
  }

  if (placesResult.error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        無法讀取 Places：
        {placesResult.error.message}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/dashboard/journal/${id}`}
          className="text-sm text-neutral-500 transition hover:text-neutral-900"
        >
          ← Back to Journal
        </Link>

        <p className="mt-8 text-sm uppercase tracking-[0.2em] text-neutral-500">
          Journal
        </p>

        <h1 className="mt-2 text-4xl font-semibold">
          Edit Journal
        </h1>

        <p className="mt-3 text-sm text-neutral-500">
          修改旅行日期、文章內容、城市與發布狀態。
        </p>
      </div>

      <EditJournalForm
        journal={journalResult.data as Journal}
        places={
          (placesResult.data ?? []) as PlaceOption[]
        }
      />
    </div>
  );
}