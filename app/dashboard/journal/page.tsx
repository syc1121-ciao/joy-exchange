import Link from "next/link";
import { redirect } from "next/navigation";

import DeleteJournalButton from "@/components/dashboard/DeleteJournalButton";
import { requireAdmin } from "@/lib/requireAdmin";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type Journal = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  journal_date: string | null;
  status: "draft" | "published";
  created_at: string;
  place:
    | {
        city: string;
        country: string;
      }
    | {
        city: string;
        country: string;
      }[]
    | null;
};

export default async function JournalPage() {
  const session = await requireAdmin();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const authorEmail = session.user.email
    .trim()
    .toLowerCase();

  const { data, error } = await supabaseAdmin
    .from("journals")
    .select(`
      id,
      title,
      slug,
      excerpt,
      journal_date,
      status,
      created_at,
      place:places (
        city,
        country
      )
    `)
    .eq("author_email", authorEmail)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
        無法讀取 Journal：{error.message}
      </div>
    );
  }

  const journals = (data ?? []) as Journal[];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
            Journal
          </p>

          <h1 className="mt-2 text-4xl font-semibold">
            Manage Journal
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            管理你的交換日記與旅行故事。
          </p>
        </div>

        <Link
          href="/dashboard/journal/new"
          className="inline-flex w-fit rounded-full bg-neutral-900 px-6 py-3 text-sm text-white transition hover:bg-neutral-700"
        >
          + New Journal
        </Link>
      </div>

      {journals.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 bg-white p-12 text-center">
          <p className="text-lg font-medium">
            還沒有任何 Journal
          </p>

          <p className="mt-2 text-sm text-neutral-500">
            建立第一篇旅行日記，開始記錄你的交換生活。
          </p>

          <Link
            href="/dashboard/journal/new"
            className="mt-6 inline-flex rounded-full bg-neutral-900 px-6 py-3 text-sm text-white transition hover:bg-neutral-700"
          >
            Create Journal
          </Link>
        </div>
      ) : (
        <div className="grid gap-5">
          {journals.map((journal) => {
            const place = Array.isArray(journal.place)
              ? journal.place[0]
              : journal.place;

            return (
              <article
                key={journal.id}
                className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold">
                        {journal.title}
                      </h2>

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
                    </div>

                    {place && (
                      <p className="mt-2 text-sm text-neutral-500">
                        {place.city}, {place.country}
                      </p>
                    )}

                    <p className="mt-1 text-sm text-neutral-400">
                      {journal.journal_date
                        ? formatDate(journal.journal_date)
                        : "No journal date"}
                    </p>

                    {journal.excerpt && (
                      <p className="mt-4 line-clamp-2 max-w-2xl text-sm leading-6 text-neutral-600">
                        {journal.excerpt}
                      </p>
                    )}

                    <p className="mt-3 font-mono text-xs text-neutral-400">
                      /journal/{journal.slug}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-3">
                    <Link
                      href={`/dashboard/journal/${journal.id}`}
                      className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm transition hover:bg-neutral-50"
                    >
                      View
                    </Link>

                    <Link
                      href={`/dashboard/journal/${journal.id}/edit`}
                      className="rounded-full bg-neutral-900 px-5 py-2.5 text-sm text-white transition hover:bg-neutral-700"
                    >
                      Edit
                    </Link>

                    <DeleteJournalButton
                      journalId={journal.id}
                      journalTitle={journal.title}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
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