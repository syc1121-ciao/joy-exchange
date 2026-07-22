import JournalCard from "@/components/journal/JournalCard";
import { journalPosts } from "@/data/journalPosts";

export default function JournalPage() {
  const [featuredPost, ...otherPosts] =
    journalPosts;

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

            <p className="mt-6 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
              記錄交換準備、旅行、生活，以及那些不想遺忘的小事。
            </p>
          </header>

          {featuredPost && (
            <div className="mt-10 md:mt-14">
              <JournalCard
                post={featuredPost}
                featured
              />
            </div>
          )}

          {otherPosts.length > 0 && (
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mt-8">
              {otherPosts.map((post) => (
                <JournalCard
                  key={post.slug}
                  post={post}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}