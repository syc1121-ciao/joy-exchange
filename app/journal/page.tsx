import JournalCard from "@/components/journal/JournalCard";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const supabaseAdmin = getSupabaseAdmin();

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const { data, error } = await supabaseAdmin
    .from("journals")
    .select(
      `slug, title, excerpt, journal_date, created_at, cover_image, cover_alt, category, reading_time, status`
    )
    .eq("status", "published")
    .order("journal_date", { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
  }

  const posts = (data ?? []).map((row: any) => ({
    slug: row.slug,
    title: row.title ?? "Untitled",
    excerpt: row.excerpt ?? "",
    category: row.category ?? "Exchange Diary",
    date: row.journal_date ?? row.created_at ?? "",
    readingTime: row.reading_time ?? "3 min read",
    coverImage: row.cover_image ?? "/images/journal/placeholder.jpg",
    coverAlt: row.cover_alt ?? row.title ?? "Journal cover",
    sections: [],
  }));

  const [featuredPost, ...otherPosts] = posts;

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <section className="px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20 md:px-10 md:pb-24">
        <div className="mx-auto max-w-7xl">
          <header className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-400">
              Exchange Journal
            </p>

            <h1 className="mt-4 font-serif text-5xl leading-[0.95] text-slate-950 sm:text-6xl md:text-7xl">
              Stories worth remembering.
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-500">
              記錄交換準備、旅行、生活，以及那些不想遺忘的小事。
            </p>
          </header>

          {featuredPost && (
            <div className="mt-10 md:mt-14">
              <JournalCard post={featuredPost} featured />
            </div>
          )}

          {otherPosts.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-8">
              {otherPosts.map((post) => (
                <JournalCard key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}