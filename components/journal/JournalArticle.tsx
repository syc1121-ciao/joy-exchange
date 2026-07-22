import Image from "next/image";
import Link from "next/link";

import type { JournalPost } from "@/data/journalPosts";

type JournalArticleProps = {
  post: JournalPost;
};

export default function JournalArticle({
  post,
}: JournalArticleProps) {
  return (
    <article>
      <header className="mx-auto max-w-4xl px-4 pb-10 pt-14 text-center sm:px-6 sm:pb-14 sm:pt-20">
        <Link
          href="/journal"
          className="text-xs uppercase tracking-[0.2em] text-slate-400"
        >
          ← Back to journal
        </Link>

        <div className="mt-8 flex flex-wrap justify-center gap-3 text-[10px] uppercase tracking-[0.18em] text-slate-400">
          <span>{post.category}</span>
          <span>•</span>
          <span>{post.date}</span>
          <span>•</span>
          <span>{post.readingTime}</span>
        </div>

        <h1 className="mx-auto mt-5 max-w-3xl font-serif text-4xl leading-[1.05] text-slate-950 sm:text-5xl md:text-6xl">
          {post.title}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
          {post.excerpt}
        </p>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-10">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] sm:aspect-[16/9] sm:rounded-[2.5rem]">
          <Image
            src={post.coverImage}
            alt={post.coverAlt}
            fill
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover"
          />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <div className="space-y-12">
          {post.sections.map(
            (section, sectionIndex) => (
              <section
                key={`${post.slug}-${sectionIndex}`}
              >
                {section.heading && (
                  <h2 className="font-serif text-3xl leading-tight text-slate-950 sm:text-4xl">
                    {section.heading}
                  </h2>
                )}

                {section.paragraphs && (
                  <div
                    className={[
                      section.heading
                        ? "mt-5"
                        : "",
                      "space-y-5",
                    ].join(" ")}
                  >
                    {section.paragraphs.map(
                      (
                        paragraph,
                        paragraphIndex,
                      ) => (
                        <p
                          key={paragraphIndex}
                          className="text-base leading-8 text-slate-650"
                        >
                          {paragraph}
                        </p>
                      ),
                    )}
                  </div>
                )}

                {section.image && (
                  <figure className="my-10">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
                      <Image
                        src={section.image}
                        alt={
                          section.imageAlt ??
                          ""
                        }
                        fill
                        sizes="(max-width: 768px) 100vw, 672px"
                        className="object-cover"
                      />
                    </div>

                    {section.imageAlt && (
                      <figcaption className="mt-3 text-center text-xs text-slate-400">
                        {section.imageAlt}
                      </figcaption>
                    )}
                  </figure>
                )}

                {section.quote && (
                  <blockquote className="my-10 border-l-2 border-slate-900 pl-6 font-serif text-2xl leading-relaxed text-slate-800 sm:text-3xl">
                    “{section.quote}”
                  </blockquote>
                )}
              </section>
            ),
          )}
        </div>

        <footer className="mt-16 border-t border-black/10 pt-8">
          <Link
            href="/journal"
            className="inline-flex rounded-full border border-black/10 px-5 py-3 text-xs tracking-[0.12em] text-slate-700"
          >
            ← ALL STORIES
          </Link>
        </footer>
      </div>
    </article>
  );
}