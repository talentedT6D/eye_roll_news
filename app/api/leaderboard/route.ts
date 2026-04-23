import { NextResponse } from "next/server";
import { getSupabaseAnon, hasSupabase } from "@/lib/supabase";
import { MOCK_LEADERBOARD } from "@/lib/mock-articles";
import { LeaderboardEntry } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (hasSupabase()) {
    const sb = getSupabaseAnon();
    if (sb) {
      const { data, error } = await sb
        .from("leaderboard_today")
        .select("id, headline, category, image_url, rolls")
        .order("rolls", { ascending: false })
        .limit(10);
      if (!error && data && data.length > 0) {
        return NextResponse.json({
          leaderboard: data as LeaderboardEntry[],
          source: "supabase",
        });
      }
    }
  }

  return NextResponse.json({
    leaderboard: MOCK_LEADERBOARD,
    source: "mock",
  });
}
