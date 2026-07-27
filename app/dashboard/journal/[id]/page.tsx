import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import DeleteJournalButton from "@/components/dashboard/DeleteJournalButton";
import { requireAdmin } from "@/lib/requireAdmin";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const supabaseAdmin = getSupabaseAdmin();

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
  created_at: string;
  place:
    | {
        city: string;
        country: string;
        slug: string;
      }
    | {
        city: string;
        country: string;
        slug: string;
      }[]
    | null;
};

export default async function JournalViewPage({
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

  const { data, error } = await supabaseAdmin
    .from("journals")
    .select(`
      id,
      place_id,
      title,
      slug,
      excerpt,
      content,
      journal_date,
      status,
      created_at,
      place:places (
        city,
        country,
        slug
      )
    `)
    .eq("id", id)
    .eq("author_email", authorEmail)
    .maybeSingle();

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        無法讀取 Journal：{error.message}
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  const journal = data as Journal;

  const place = Array.isArray(journal.place)
    ? journal.place[0]
    : journal.place;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/journal"
          className="text-sm text-neutral-500 transition hover:text-neutral-900"
        >
          ← Back to Journal
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          {journal.status === "published" && (
            <Link
              href={`/journal/${journal.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm transition hover:bg-neutral-50"
            >
              Open Public Page ↗
            </Link>
          )}

          <Link
            href={`/dashboard/journal/${journal.id}/edit`}
            className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm text-white transition hover:bg-neutral-700"
          >
            Edit
          </Link>

          <DeleteJournalButton
            journalId={journal.id}
            journalTitle={journal.title}
            redirectAfterDelete
          />
        </div>
      </div>

      <article className="rounded-[32px] border border-neutral-200 bg-white p-7 shadow-sm sm:p-12">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={
              journal.status === "published"
                ? "rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700"
                : "rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
            }
          >
            {journal.status === "published"
              ? "Published"
              : "Draft"}
          </span>

          <span className="text-sm text-neutral-400">
            {journal.journal_date
              ? formatDate(journal.journal_date)
              : "No journal date"}
          </span>
        </div>

        <h1 className="mt-7 font-serif text-4xl font-medium sm:text-6xl">
          {journal.title}
        </h1>

        {place && (
          <div className="mt-4">
            <p className="text-neutral-500">
              {place.city}, {place.country}
            </p>

            <Link
              href={`/travel/${place.slug}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-sm text-neutral-400 underline underline-offset-4 transition hover:text-neutral-900"
            >
              Open travel page ↗
            </Link>
          </div>
        )}

        <div className="mt-8 border-y border-neutral-100 py-5">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Public URL
          </p>

          <p className="mt-2 break-all font-mono text-sm text-neutral-600">
            /journal/{journal.slug}
          </p>
        </div>

        {journal.excerpt && (
          <section className="mt-10">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Excerpt
            </p>

            <p className="mt-4 text-lg leading-8 text-neutral-600">
              {journal.excerpt}
            </p>
          </section>
        )}

        <section className="mt-10">
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
            Content
          </p>

          {journal.content ? (
            <div className="mt-5 whitespace-pre-wrap text-base leading-8 text-neutral-700">
              {journal.content}
            </div>
          ) : (
            <p className="mt-5 text-neutral-400">
              尚未填寫文章內容。
            </p>
          )}
        </section>

        <footer className="mt-12 border-t border-neutral-100 pt-6 text-xs text-neutral-400">
          Created {formatDateTime(journal.created_at)}
        </footer>
      </article>
    </div>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}