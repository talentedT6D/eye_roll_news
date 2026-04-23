import { Article } from "./types";

// ---------- shared helpers ----------

function toArticle(partial: {
  id?: string;
  provider: string;
  source: string;
  category?: string;
  headline: string;
  summary?: string;
  image_url?: string | null;
  published_at?: string | null;
  source_url?: string;
}): Article {
  return {
    id:
      partial.id ||
      `${partial.provider}-${hash(partial.source_url || partial.headline)}`,
    source: partial.source,
    category: (partial.category || "NEWS").toUpperCase(),
    headline: partial.headline,
    summary: partial.summary?.slice(0, 400) || "",
    image_url: partial.image_url || null,
    published_at: partial.published_at || new Date().toISOString(),
  };
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

async function safeJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      headers: { "User-Agent": "eye-roll-news/0.1" },
    });
    if (!res.ok) {
      console.warn(`[provider] ${url} → ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[provider] ${url} failed`, err);
    return null;
  }
}

// ---------- individual providers ----------

// GNews — https://gnews.io — free: 100 req/day
async function gnews(): Promise<Article[]> {
  const key = process.env.GNEWS_API_KEY;
  if (!key) return [];
  const url = `https://gnews.io/api/v4/top-headlines?country=in&lang=en&max=10&apikey=${key}`;
  const data = await safeJson<{
    articles?: Array<{
      title: string;
      description?: string;
      image?: string;
      url: string;
      publishedAt?: string;
      source?: { name: string };
    }>;
  }>(url);
  return (data?.articles ?? []).map((a) =>
    toArticle({
      provider: "gnews",
      source: a.source?.name || "GNews",
      headline: a.title,
      summary: a.description || "",
      image_url: a.image || null,
      published_at: a.publishedAt,
      source_url: a.url,
    }),
  );
}

// NewsData.io — https://newsdata.io — free: 200 credits/day
async function newsdata(): Promise<Article[]> {
  const key = process.env.NEWSDATA_API_KEY;
  if (!key) return [];
  const url = `https://newsdata.io/api/1/news?apikey=${key}&country=in&language=en&size=10`;
  const data = await safeJson<{
    results?: Array<{
      title: string;
      description?: string;
      image_url?: string;
      link: string;
      pubDate?: string;
      source_id?: string;
      category?: string[];
    }>;
  }>(url);
  return (data?.results ?? []).map((a) =>
    toArticle({
      provider: "newsdata",
      source: a.source_id || "NewsData",
      category: a.category?.[0],
      headline: a.title,
      summary: a.description || "",
      image_url: a.image_url || null,
      published_at: a.pubDate,
      source_url: a.link,
    }),
  );
}

// NewsAPI.org — https://newsapi.org — free dev tier: 100/day
async function newsapi(): Promise<Article[]> {
  const key = process.env.NEWSAPI_KEY;
  if (!key) return [];
  const url = `https://newsapi.org/v2/top-headlines?country=in&pageSize=10&apiKey=${key}`;
  const data = await safeJson<{
    articles?: Array<{
      title: string;
      description?: string;
      urlToImage?: string;
      url: string;
      publishedAt?: string;
      source?: { name: string };
    }>;
  }>(url);
  return (data?.articles ?? []).map((a) =>
    toArticle({
      provider: "newsapi",
      source: a.source?.name || "NewsAPI",
      headline: a.title,
      summary: a.description || "",
      image_url: a.urlToImage || null,
      published_at: a.publishedAt,
      source_url: a.url,
    }),
  );
}

// Mediastack — https://mediastack.com — free: 500/month
async function mediastack(): Promise<Article[]> {
  const key = process.env.MEDIASTACK_KEY;
  if (!key) return [];
  const url = `http://api.mediastack.com/v1/news?access_key=${key}&countries=in&languages=en&limit=10`;
  const data = await safeJson<{
    data?: Array<{
      title: string;
      description?: string;
      image?: string;
      url: string;
      published_at?: string;
      source?: string;
      category?: string;
    }>;
  }>(url);
  return (data?.data ?? []).map((a) =>
    toArticle({
      provider: "mediastack",
      source: a.source || "Mediastack",
      category: a.category,
      headline: a.title,
      summary: a.description || "",
      image_url: a.image || null,
      published_at: a.published_at,
      source_url: a.url,
    }),
  );
}

// The Guardian — https://open-platform.theguardian.com — free with key
async function guardian(): Promise<Article[]> {
  const key = process.env.GUARDIAN_API_KEY;
  if (!key) return [];
  const url = `https://content.guardianapis.com/search?api-key=${key}&show-fields=thumbnail,trailText&page-size=10&order-by=newest`;
  const data = await safeJson<{
    response?: {
      results?: Array<{
        webTitle: string;
        webUrl: string;
        webPublicationDate?: string;
        sectionName?: string;
        fields?: { thumbnail?: string; trailText?: string };
      }>;
    };
  }>(url);
  return (data?.response?.results ?? []).map((a) =>
    toArticle({
      provider: "guardian",
      source: "The Guardian",
      category: a.sectionName,
      headline: a.webTitle,
      summary: stripHtml(a.fields?.trailText || ""),
      image_url: a.fields?.thumbnail || null,
      published_at: a.webPublicationDate,
      source_url: a.webUrl,
    }),
  );
}

// NY Times Top Stories — https://developer.nytimes.com
async function nyt(): Promise<Article[]> {
  const key = process.env.NYT_API_KEY;
  if (!key) return [];
  const url = `https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${key}`;
  const data = await safeJson<{
    results?: Array<{
      title: string;
      abstract?: string;
      url: string;
      published_date?: string;
      section?: string;
      multimedia?: Array<{ url: string; format?: string }>;
    }>;
  }>(url);
  return (data?.results ?? []).slice(0, 10).map((a) =>
    toArticle({
      provider: "nyt",
      source: "The New York Times",
      category: a.section,
      headline: a.title,
      summary: a.abstract || "",
      image_url: a.multimedia?.find((m) => m.format)?.url || null,
      published_at: a.published_date,
      source_url: a.url,
    }),
  );
}

// Hacker News — https://github.com/HackerNews/API — no key, always free
async function hackernews(): Promise<Article[]> {
  const ids = await safeJson<number[]>(
    "https://hacker-news.firebaseio.com/v0/topstories.json",
  );
  if (!ids) return [];
  const top = ids.slice(0, 10);
  const items = await Promise.all(
    top.map((id) =>
      safeJson<{
        id: number;
        title: string;
        url?: string;
        by?: string;
        time?: number;
        text?: string;
      }>(`https://hacker-news.firebaseio.com/v0/item/${id}.json`),
    ),
  );
  return items
    .filter((x): x is NonNullable<typeof x> => Boolean(x && x.title))
    .map((a) =>
      toArticle({
        provider: "hn",
        source: "Hacker News",
        category: "TECH",
        headline: a.title,
        summary: stripHtml(a.text || "").slice(0, 300),
        image_url: null,
        published_at: a.time
          ? new Date(a.time * 1000).toISOString()
          : undefined,
        source_url:
          a.url || `https://news.ycombinator.com/item?id=${a.id}`,
      }),
    );
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------- registry + dispatcher ----------

export type ProviderName =
  | "gnews"
  | "newsdata"
  | "newsapi"
  | "mediastack"
  | "guardian"
  | "nyt"
  | "hackernews";

export const PROVIDERS: Record<ProviderName, () => Promise<Article[]>> = {
  gnews,
  newsdata,
  newsapi,
  mediastack,
  guardian,
  nyt,
  hackernews,
};

export function enabledProviders(): ProviderName[] {
  const names: ProviderName[] = [];
  if (process.env.GNEWS_API_KEY) names.push("gnews");
  if (process.env.NEWSDATA_API_KEY) names.push("newsdata");
  if (process.env.NEWSAPI_KEY) names.push("newsapi");
  if (process.env.MEDIASTACK_KEY) names.push("mediastack");
  if (process.env.GUARDIAN_API_KEY) names.push("guardian");
  if (process.env.NYT_API_KEY) names.push("nyt");
  // Hacker News needs no key. Opt-in via env so we don't dilute India-news
  // feeds by default.
  if (process.env.ENABLE_HACKERNEWS === "1") names.push("hackernews");
  return names;
}

// Fetch from every enabled provider in parallel, merge, dedupe by headline,
// sort newest first.
export async function fetchFromProviders(
  only?: ProviderName[],
): Promise<{ articles: Article[]; used: ProviderName[] }> {
  const wanted = only?.length ? only : enabledProviders();
  if (wanted.length === 0) return { articles: [], used: [] };

  const batches = await Promise.all(
    wanted.map(async (n) => {
      try {
        return { name: n, items: await PROVIDERS[n]() };
      } catch (err) {
        console.warn(`[provider] ${n} threw`, err);
        return { name: n, items: [] as Article[] };
      }
    }),
  );

  const seen = new Set<string>();
  const merged: Article[] = [];
  for (const batch of batches) {
    for (const a of batch.items) {
      const key = a.headline.toLowerCase().slice(0, 80);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(a);
    }
  }

  merged.sort(
    (a, b) =>
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime(),
  );

  return {
    articles: merged,
    used: batches.filter((b) => b.items.length > 0).map((b) => b.name),
  };
}
