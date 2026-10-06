export interface MemoryItem {
  id: string;
  author: string;
  title?: string;
  text: string;
  reactionsCount: number;
  imageUrl?: string;
  imageCaption?: string;
  images?: { id: string; url: string; caption?: string }[]; // <-- Made optional to match MemoryImage
  audioUrls?: string[];
  chapter: string;
  chapterSubtitle?: string;
  date: string;
}

export interface ShortQuote {
  id: string;
  author: string;
  text: string;
}

export interface HeroPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface MemoryImage {
  id: string;
  url: string;
  caption?: string;
}