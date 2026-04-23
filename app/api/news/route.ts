import { NextResponse } from "next/server";
import {
  enabledProviders,
  fetchFromProviders,
  PROVIDERS,
  ProviderName,
} from "@/lib/news-providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALL_PROVIDERS = Object.keys(PROVIDERS) as ProviderName[];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("providers");
  const only = raw
    ? (raw
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is ProviderName =>
          (ALL_PROVIDERS as string[]).includes(s),
        ) as ProviderName[])
    : undefined;

  const { articles, used } = await fetchFromProviders(only);
  return NextResponse.json({
    articles,
    used,
    available: ALL_PROVIDERS,
    configured: enabledProviders(),
  });
}
