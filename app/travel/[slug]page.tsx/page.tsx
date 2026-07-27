import Link from "next/link";
import { notFound } from "next/navigation";

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const supabaseAdmin = getSupabaseAdmin();

export const dynamic = "force-dynamic";

type Place = {
  id: string;
  city: string;
  country: string;
  slug: string;
  description: string | null;
  status: "draft" | "published";
};

type Journal = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  journal_date: string | null;
};

export default async function TravelPage({
  params,
}: {
  params: Promise<{
    slug: string;
  }>;
}) {
  const { slug } = await params;

  const {
    data: placeData,
    error: placeError,
  } = await supabaseAdmin
    .from("places")
    .select(
      `
        id,
        city,
        country,
        slug,
        description,
        status
      `,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (placeError) {
    console.error(
      "Failed to load travel place:",
      placeError,
    );

    return (
      <main className="min-h-screen bg-[#faf8f5] px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            無法讀取城市資料：{placeError.message}
          </div>
        </div>
      </main>
    );
  }

  if (!placeData) {
    notFound();
  }

  const place = placeData as Place;

  const {
    data: journalData,
    error: journalError,
  } = await supabaseAdmin
    .from("journals")
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        journal_date
      `,
    )
    .eq("place_id", place.id)
    .eq("status", "published")
    .order("journal_date", {
      ascending: false,
      nullsFirst: false,
    });

  if (journalError) {
    console.error(
      "Failed to load place journals:",
      journalError,
    );
  }

  const journals =
    (journalData ?? []) as Journal[];

  return (
    <main className="min-h-screen bg-[#faf8f5] text-neutral-900">
      <section className="border-b border-neutral-200 px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="text-sm text-neutral-500 transition hover:text-neutral-900"
          >
            ← Back Home
          </Link>

          <p className="mt-16 text-sm uppercase tracking-[0.3em] text-neutral-500">
            Travel Journal
          </p>

          <h1 className="mt-5 font-serif text-6xl font-medium tracking-tight sm:text-7xl lg:text-8xl">
            {place.city}
          </h1>

          <p className="mt-4 text-lg text-neutral-500">
            {place.country}
          </p>

          {place.description && (
            <p className="mt-10 max-w-2xl text-lg leading-8 text-neutral-600">
              {place.description}
            </p>
          )}
        </div>
      </section>

      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
                Stories
              </p>

              <h2 className="mt-3 font-serif text-4xl font-medium sm:text-5xl">
                Journal entries
              </h2>
            </div>

            <p className="hidden text-sm text-neutral-500 sm:block">
              {journals.length}{" "}
              {journals.length === 1
                ? "story"
                : "stories"}
            </p>
          </div>

          {journalError ? (
            <div className="mt-10 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
              無法讀取 Journal：
              {journalError.message}
            </div>
          ) : journals.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-neutral-300 bg-white/60 p-12 text-center">
              <p className="text-lg font-medium">
                還沒有已發布的遊記
              </p>

              <p className="mt-2 text-sm text-neutral-500">
                在 Dashboard 將 Journal 狀態改成
                Published 後，就會出現在這裡。
              </p>
            </div>
          ) : (
            <div className="mt-12 grid gap-5">
              {journals.map((journal) => (
                <Link
                  key={journal.id}
                  href={`/journal/${journal.slug}`}
                  className="group rounded-3xl border border-neutral-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-8"
                >
                  <article className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-neutral-400">
                        {journal.journal_date
                          ? formatJournalDate(
                              journal.journal_date,
                            )
                          : "Date not set"}
                      </p>

                      <h3 className="mt-3 font-serif text-3xl font-medium">
                        {journal.title}
                      </h3>

                      {journal.excerpt && (
                        <p className="mt-4 max-w-2xl text-sm leading-7 text-neutral-600">
                          {journal.excerpt}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 text-sm font-medium text-neutral-500 transition group-hover:translate-x-1 group-hover:text-neutral-900">
                      Read Story →
                    </span>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-neutral-200 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.25em] text-neutral-500">
            Gallery
          </p>

          <h2 className="mt-3 font-serif text-4xl font-medium">
            Moments from {place.city}
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={index}
                className="aspect-[4/5] rounded-3xl border border-dashed border-neutral-300 bg-white/60"
              />
            ))}
          </div>

          <p className="mt-5 text-sm text-neutral-400">
            Gallery 會在之後串接 Supabase
            Storage。
          </p>
        </div>
      </section>
    </main>
  );
}

function formatJournalDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}