export type JournalSection = {
  heading?: string;
  paragraphs?: string[];
  image?: string;
  imageAlt?: string;
  quote?: string;
};

export type JournalPost = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string | null;
  date: string | null;
  readingTime: string | null;
  coverImage: string;
  coverAlt: string;
  sections: JournalSection[];
};

export default JournalPost;
