"use client";
import { useCallback, useEffect, useState } from "react";
import ArticleCard from "@/components/ArticleCard";
import FaceTracker, { TrackerStatus } from "@/components/FaceTracker";
import { getDeviceId } from "@/lib/device-id";
import { Article } from "@/lib/types";

export default function DesktopPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [index, setIndex] = useState(0);
  const [threshold, setThreshold] = useState(0.5);
  const [rollCounts, setRollCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState<TrackerStatus>("idle");

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
    setIndex((i) => (articles.length ? (i + 1) % articles.length : 0));
  }, [articles.length]);

  const handleRoll = useCallback(() => {
    if (!current) return;
    const id = current.id;
    setRollCounts((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 }));
    const deviceId = getDeviceId();
    fetch("/api/roll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ article_id: id, device_id: deviceId }),
    }).catch(() => {});
    advance();
  }, [current, advance]);

  return (
    <main className="min-h-[100dvh] grid grid-cols-[minmax(0,1fr)_420px] bg-cream">
      <section className="relative border-r border-rule overflow-hidden">
        {current ? (
          <ArticleCard
            article={current}
            rollCount={rollCounts[current.id] ?? 0}
            hideCounterBelow={1}
            onSwipe={advance}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <span className="label-eyebrow">Loading stories…</span>
          </div>
        )}
      </section>

      <aside className="flex flex-col gap-6 p-6">
        <header className="flex flex-col gap-1">
          <span className="label-eyebrow">Tuning</span>
          <h2 className="font-serif text-[24px] leading-[1.1]">
            Desktop calibration
          </h2>
          <p className="text-ink-muted text-sm">
            Adjust the detection threshold and watch the live camera signal.
          </p>
        </header>

        <div className="aspect-video rounded-xl overflow-hidden bg-black">
          <FaceTracker
            onRoll={handleRoll}
            threshold={threshold}
            showDebug
            onStatus={setStatus}
          />
        </div>

        <label className="flex flex-col gap-2">
          <span className="label-eyebrow flex justify-between">
            Threshold
            <span className="tabular">{threshold.toFixed(2)}</span>
          </span>
          <input
            type="range"
            min={0.2}
            max={0.9}
            step={0.01}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          />
        </label>

        <div className="flex flex-col gap-1 text-sm">
          <span className="label-eyebrow">Status</span>
          <span className="tabular text-ink">{status}</span>
        </div>

        <button
          onClick={advance}
          className="mt-auto py-2 rounded-full border border-ink text-ink text-sm"
        >
          Skip manually
        </button>
      </aside>
    </main>
  );
}
