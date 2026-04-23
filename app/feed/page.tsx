"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import FaceTracker, { TrackerStatus } from "@/components/FaceTracker";
import { getDeviceId } from "@/lib/device-id";
import { Article } from "@/lib/types";

const SESSION_TARGET = 10;

export default function FeedPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [index, setIndex] = useState(0);
  const [rollCounts, setRollCounts] = useState<Record<string, number>>({});
  const [sessionRolls, setSessionRolls] = useState(0);
  const [startedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<TrackerStatus>("idle");
  const advancingRef = useRef(false);

  useEffect(() => {
    const deviceId = getDeviceId();
    fetch(`/api/articles?device_id=${encodeURIComponent(deviceId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.articles)) setArticles(data.articles);
      })
      .catch(() => {});
  }, []);

  const current = articles[index];

  const advance = useCallback(() => {
    if (advancingRef.current) return;
    advancingRef.current = true;
    setIndex((i) => {
      const next = i + 1;
      setTimeout(() => {
        advancingRef.current = false;
      }, 350);
      return next;
    });
  }, []);

  const handleRoll = useCallback(() => {
    if (!current) return;
    const articleId = current.id;
    setRollCounts((r) => ({ ...r, [articleId]: (r[articleId] ?? 0) + 1 }));
    setSessionRolls((n) => n + 1);

    const deviceId = getDeviceId();
    fetch("/api/roll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_id: articleId, device_id: deviceId }),
    }).catch(() => {});

    advance();
  }, [current, advance]);

  useEffect(() => {
    if (articles.length === 0) return;
    if (index >= articles.length || sessionRolls >= SESSION_TARGET) {
      const mins = Math.max(1, Math.round((Date.now() - startedAt) / 60_000));
      router.replace(
        `/session-end?count=${sessionRolls}&mins=${mins}`,
      );
    }
  }, [index, articles.length, sessionRolls, startedAt, router]);

  if (!current) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center bg-cream">
        <span className="label-eyebrow">Loading stories…</span>
      </main>
    );
  }

  const count = rollCounts[current.id] ?? 0;

  return (
    <main className="relative min-h-[100dvh] bg-cream">
      <FaceTracker
        onRoll={handleRoll}
        preview="mini"
        onStatus={setStatus}
      />
      <ArticleCard
        article={current}
        rollCount={count}
        hideCounterBelow={1}
        onSwipe={advance}
      />
      <div className="absolute top-3 right-3 w-20 h-14 pointer-events-none">
        {status === "no-permission" ? (
          <span className="label-eyebrow text-red-600">Camera blocked</span>
        ) : null}
      </div>
    </main>
  );
}
