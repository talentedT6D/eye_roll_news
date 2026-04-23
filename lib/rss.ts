import Parser from "rss-parser";

export const FEEDS = [
  {
    name: "The Hindu",
    url: "https://www.thehindu.com/news/national/feeder/default.rss",
    category: "NATIONAL",
  },
  {
    name: "Indian Express",
    url: "https://indianexpress.com/section/india/feed/",
    category: "NATIONAL",
  },
  {
    name: "Scroll",
    url: "https://scroll.in/feed",
    category: "POLITICS",
  },
  {
    name: "The Print",
    url: "https://theprint.in/feed/",
    category: "POLITICS",
  },
  {
    name: "Mint",
    url: "https://www.livemint.com/rss/news",
    category: "BUSINESS",
  },
  {
    name: "NDTV",
    url: "https://feeds.feedburner.com/ndtv/TopStories",
    category: "NATIONAL",
  },
];

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "media_content"],
      ["media:thumbnail", "media_thumbnail"],
    ],
  },
});

export async function fetchFeed(url: string) {
  try {
    return await parser.parseURL(url);
  } catch (err) {
    console.error("Feed failed:", url, err);
    return null;
  }
}

// Pull an image out of common RSS envelope variants.
export function extractImageUrl(item: Record<string, unknown>): string | null {
  const enclosure = item.enclosure as { url?: string } | undefined;
  if (enclosure?.url) return enclosure.url;

  const media = item.media_content as { $?: { url?: string } } | undefined;
  if (media?.$?.url) return media.$.url;

  const thumb = item.media_thumbnail as { $?: { url?: string } } | undefined;
  if (thumb?.$?.url) return thumb.$.url;

  const content = (item.content as string) || "";
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match ? match[1] : null;
}
