import { notFound } from "next/navigation";

import JournalArticle from "@/components/journal/JournalArticle";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const supabaseAdmin = getSupabaseAdmin();
import type { JournalPost } from "@/lib/types/journal";

export const dynamic = "force-dynamic";

type JournalPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function JournalPostPage({
  params,
}: JournalPostPageProps) {
  const { slug } = await params;

  const { data, error } = await supabaseAdmin
    .from("journals")
    .select(
      `slug, title, excerpt, journal_date, created_at, cover_image, cover_alt, category, reading_time, sections`
    )
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("Supabase fetch error for journal:", error);
    notFound();
  }

  const row: any = data;

  const post: JournalPost = {
    slug: row.slug,
    title: row.title ?? "Untitled",
    excerpt: row.excerpt ?? null,
    category: row.category ?? null,
    date: row.journal_date ?? row.created_at ?? null,
    readingTime: row.reading_time ?? null,
    coverImage: row.cover_image ?? "/images/journal/placeholder.jpg",
    coverAlt: row.cover_alt ?? row.title ?? "Journal cover",
    sections: Array.isArray(row.sections) ? row.sections : [],
  };

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <JournalArticle post={post} />
    </main>
  );
}