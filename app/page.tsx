"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type PermissionState = "idle" | "requesting" | "granted" | "denied" | "unsupported";

export default function Home() {
  const [state, setState] = useState<PermissionState>("idle");

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setState("unsupported");
    }
  }, []);

  const request = useCallback(async () => {
    setState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setState("granted");
      window.location.href = "/feed";
    } catch {
      setState("denied");
    }
  }, []);

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-6 bg-cream">
      <div className="w-full max-w-sm flex flex-col items-center text-center gap-6">
        <span className="label-eyebrow">Eye Roll News</span>
        <h1 className="font-serif text-[40px] leading-[1.05] tracking-[-0.02em] text-ink">
          Roll your eyes at the news.
        </h1>
        <p className="text-[15px] leading-[1.55] text-ink-muted">
          We track how many times you roll your eyes at each story. Every roll is
          counted, globally. You&rsquo;ll need to allow camera access.
        </p>

        {state === "unsupported" ? (
          <p className="text-sm text-red-600">
            Your browser doesn&rsquo;t support camera access. Try Chrome or Safari
            on mobile.
          </p>
        ) : state === "denied" ? (
          <>
            <p className="text-sm text-red-600">
              Camera permission denied. Enable it in your browser settings, then
              try again.
            </p>
            <button
              onClick={request}
              className="w-full py-3 rounded-full bg-ink text-cream text-sm tracking-wide"
            >
              Try again
            </button>
          </>
        ) : (
          <button
            onClick={request}
            disabled={state === "requesting"}
            className="w-full py-3 rounded-full bg-ink text-cream text-sm tracking-wide disabled:opacity-60"
          >
            {state === "requesting" ? "Requesting…" : "Enable camera"}
          </button>
        )}

        <Link
          href="/desktop"
          className="label-eyebrow underline decoration-dotted underline-offset-4"
        >
          Desktop tuning mode
        </Link>
      </div>
    </main>
  );
}
