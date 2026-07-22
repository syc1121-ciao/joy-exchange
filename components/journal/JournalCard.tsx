import Image from "next/image";
import Link from "next/link";

import type { JournalPost } from "@/data/journalPosts";

type JournalCardProps = {
  post: JournalPost;
  featured?: boolean;
};

export default function JournalCard({
  post,
  featured = false,
}: JournalCardProps) {
  return (
    <article
      className={[
        "group overflow-hidden rounded-[2rem]",
        "border border-black/5 bg-white",
        "transition duration-300",
        "hover:-translate-y-1 hover:shadow-xl",
        featured
          ? "lg:grid lg:grid-cols-2"
          : "",
      ].join(" ")}
    >
      <Link
        href={`/journal/${post.slug}`}
        className="block"
      >
        <div
          className={[
            "relative overflow-hidden",
            featured
              ? "aspect-[4/3] lg:h-full lg:aspect-auto"
              : "aspect-[4/3]",
          ].join(" ")}
        >
          <Image
            src={post.coverImage}
            alt={post.coverAlt}
            fill
            sizes={
              featured
                ? "(max-width: 1024px) 100vw, 50vw"
                : "(max-width: 768px) 100vw, 33vw"
            }
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="flex flex-col justify-between p-6 sm:p-7 lg:p-9">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-slate-400">
            <span>{post.category}</span>
            <span>•</span>
            <span>{post.date}</span>
          </div>

          <Link href={`/journal/${post.slug}`}>
            <h2
              className={[
                "mt-4 font-serif leading-tight text-slate-950",
                featured
                  ? "text-3xl sm:text-4xl"
                  : "text-2xl sm:text-3xl",
              ].join(" ")}
            >
              {post.title}
            </h2>
          </Link>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            {post.excerpt}
          </p>
        </div>

        <div className="mt-7 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {post.readingTime}
          </span>

          <Link
            href={`/journal/${post.slug}`}
            className="text-xs tracking-[0.12em] text-slate-800"
          >
            READ STORY →
          </Link>
        </div>
      </div>
    </article>
  );
}