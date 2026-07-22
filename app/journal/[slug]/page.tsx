import { notFound } from "next/navigation";

import JournalArticle from "@/components/journal/JournalArticle";

import {
  getJournalPost,
  journalPosts,
} from "@/data/journalPosts";

type JournalPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return journalPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function JournalPostPage({
  params,
}: JournalPostPageProps) {
  const { slug } = await params;

  const post = getJournalPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <JournalArticle post={post} />
    </main>
  );
}