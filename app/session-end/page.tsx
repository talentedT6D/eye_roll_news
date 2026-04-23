import Link from "next/link";
import { LeaderboardEntry } from "@/lib/types";

export const dynamic = "force-dynamic";

async function loadLeaderboard(): Promise<LeaderboardEntry[]> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  const url = base ? `${base}/api/leaderboard` : "/api/leaderboard";
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.leaderboard ?? []).slice(0, 3);
  } catch {
    return [];
  }
}

export default async function SessionEndPage({
  searchParams,
}: {
  searchParams: { count?: string; mins?: string };
}) {
  const count = Number(searchParams.count ?? 0) || 0;
  const mins = Number(searchParams.mins ?? 1) || 1;
  const top = await loadLeaderboard();

  const shareUrl = `/api/og?count=${count}&mins=${mins}`;

  return (
    <main className="min-h-[100dvh] bg-cream flex flex-col px-6 py-10 gap-8">
      <header className="flex flex-col items-center text-center gap-2">
        <span className="label-eyebrow">Session complete</span>
        <h1 className="font-serif text-[48px] leading-[1] tracking-[-0.02em] tabular">
          {count.toLocaleString()}
        </h1>
        <p className="text-ink-muted text-sm">
          eye rolls in {mins} {mins === 1 ? "minute" : "minutes"}
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <span className="label-eyebrow">Top 3 today</span>
        <ol className="flex flex-col divide-y divide-rule border-y border-rule">
          {top.length === 0 ? (
            <li className="py-4 text-ink-muted text-sm">
              Nobody&rsquo;s rolled yet today. Be the first.
            </li>
          ) : (
            top.map((entry, i) => (
              <li key={entry.id} className="py-4 flex items-start gap-3">
                <span className="font-serif text-[22px] leading-none tabular w-6">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="label-eyebrow">{entry.category}</div>
                  <div className="font-serif text-[16px] leading-[1.3] text-ink line-clamp-2">
                    {entry.headline}
                  </div>
                </div>
                <span className="font-serif text-[18px] tabular">
                  {entry.rolls.toLocaleString()}
                </span>
              </li>
            ))
          )}
        </ol>
      </section>

      <section className="flex flex-col gap-3 mt-auto">
        <a
          href={shareUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full text-center py-3 rounded-full border border-ink text-ink text-sm tracking-wide"
        >
          Share card
        </a>
        <Link
          href="/feed"
          className="w-full text-center py-3 rounded-full bg-ink text-cream text-sm tracking-wide"
        >
          Keep rolling
        </Link>
      </section>
    </main>
  );
}
