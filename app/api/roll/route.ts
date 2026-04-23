import { NextResponse } from "next/server";
import { getSupabaseAdmin, hasSupabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: { article_id?: string; device_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const articleId = body.article_id;
  const deviceId = body.device_id;
  if (!articleId || !deviceId) {
    return NextResponse.json(
      { error: "article_id and device_id required" },
      { status: 400 },
    );
  }

  if (!hasSupabase()) {
    return NextResponse.json({ ok: true, stored: false });
  }

  const sb = getSupabaseAdmin();
  if (!sb) return NextResponse.json({ ok: true, stored: false });

  const { error } = await sb
    .from("rolls")
    .insert({ article_id: articleId, device_id: deviceId })
    .select()
    .single();

  if (error && !error.message.toLowerCase().includes("duplicate")) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, stored: true });
}
