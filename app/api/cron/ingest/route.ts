import { NextResponse } from "next/server";
import { FEEDS, fetchFeed, extractImageUrl } from "@/lib/rss";
import { getSupabaseAdmin, hasSupabase } from "@/lib/supabase";
import { Article } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

export async function GET() {
  const results = await Promise.all(
    FEEDS.map(async (feed) => {
      const data = await fetchFeed(feed.url);
      if (!data?.items) return { feed: feed.name, count: 0 };
      const items: Article[] = data.items.slice(0, 15).map((raw) => {
        const item = raw as unknown as Record<string, unknown>;
        const link = (item.link as string) || "";
        const title = (item.title as string) || "";
        const content =
          (item.contentSnippet as string) || (item.content as string) || "";
        const iso =
          (item.isoDate as string) ||
          (item.pubDate as string) ||
          new Date().toISOString();
        return {
          id: `rss-${feed.name.replace(/\s+/g, "").toLowerCase()}-${hash(
            link || title,
          )}`,
          source: feed.name,
          category: feed.category,
          headline: title,
          summary: content.slice(0, 400),
          image_url: extractImageUrl(item),
          published_at: new Date(iso).toISOString(),
        };
      });
      return { feed: feed.name, items };
    }),
  );

  const all: Article[] = results.flatMap((r) =>
    "items" in r && r.items ? r.items : [],
  );

  if (!hasSupabase()) {
    return NextResponse.json({
      ok: true,
      stored: false,
      count: all.length,
      feeds: results.map((r) => ({
        feed: r.feed,
        count: "items" in r && r.items ? r.items.length : 0,
      })),
    });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ ok: true, stored: false, count: all.length });

  const { error } = await sb
    .from("articles")
    .upsert(all, { onConflict: "id", ignoreDuplicates: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    stored: true,
    count: all.length,
    feeds: results.map((r) => ({
      feed: r.feed,
      count: "items" in r && r.items ? r.items.length : 0,
    })),
  });
}
