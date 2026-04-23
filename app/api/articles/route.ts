import { NextResponse } from "next/server";
import { getSupabaseAnon, hasSupabase } from "@/lib/supabase";
import { fetchFromProviders } from "@/lib/news-providers";
import { MOCK_ARTICLES } from "@/lib/mock-articles";
import { Article } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const deviceId = searchParams.get("device_id") ?? "";

  // 1. Supabase
  if (hasSupabase()) {
    const sb = getSupabaseAnon();
    if (sb) {
      const { data, error } = await sb
        .from("articles")
        .select("id, source, category, headline, summary, image_url, published_at")
        .order("published_at", { ascending: false })
        .limit(30);
      if (!error && data && data.length > 0) {
        return NextResponse.json({
          articles: data as Article[],
          source: "supabase",
          device_id: deviceId,
        });
      }
    }
  }

  // 2. News providers
  const { articles: provided, used } = await fetchFromProviders();
  if (provided.length > 0) {
    return NextResponse.json({
      articles: provided.slice(0, 30),
      source: "providers",
      used,
      device_id: deviceId,
    });
  }

  // 3. Seeded mock
  return NextResponse.json({
    articles: MOCK_ARTICLES,
    source: "mock",
    device_id: deviceId,
  });
}
