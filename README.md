# Eye Roll News

A news app where you skip stories by rolling your eyes. Every roll is counted, globally.

## Stack

- Next.js 14 (App Router), TypeScript, Tailwind
- MediaPipe FaceLandmarker for in-browser eye tracking
- Supabase Postgres (optional — falls back to seeded mock data)
- `@vercel/og` for shareable session-end PNG
- Vercel cron for RSS ingestion (every 30 min)

## Routes

- `/` — Camera permission gate
- `/feed` — Mobile article view, one story per screen
- `/session-end` — Personal count + top 3 leaderboard, share surface
- `/desktop` — Split-screen tuning mode with visible camera feed

## API

- `GET /api/articles?device_id=X` — queue of articles (Supabase → providers → mock, in that order)
- `POST /api/roll` — increments counter, dedup by `(article_id, device_id)`
- `GET /api/leaderboard` — top 10 today
- `GET /api/og?count=N&mins=M` — 1200×1200 PNG share card
- `GET /api/cron/ingest` — pulls from 6 RSS feeds into Supabase
- `GET /api/news[?providers=a,b]` — pulls from configured news providers, merged & deduped. Response shape: `{ articles, used, available, configured }`

## News providers

All optional. Set any subset of keys in `.env.local` and they're automatically mixed into `/api/articles`. Each is normalised to the same `Article` shape and deduped by headline.

| Provider      | Free tier          | Env var               | Docs                                |
| ------------- | ------------------ | --------------------- | ----------------------------------- |
| GNews         | 100 req/day        | `GNEWS_API_KEY`       | gnews.io                            |
| NewsData.io   | 200 credits/day    | `NEWSDATA_API_KEY`    | newsdata.io                         |
| NewsAPI.org   | 100 req/day (dev)  | `NEWSAPI_KEY`         | newsapi.org                         |
| Mediastack    | 500 req/month      | `MEDIASTACK_KEY`      | mediastack.com                      |
| Guardian      | free with key      | `GUARDIAN_API_KEY`    | open-platform.theguardian.com       |
| NY Times      | free with key      | `NYT_API_KEY`         | developer.nytimes.com               |
| Hacker News   | no key needed      | `ENABLE_HACKERNEWS=1` | hacker-news.firebaseio.com          |

Call `/api/news?providers=gnews,hackernews` to force a specific subset (useful for debugging). Results are cached 60s at the fetch layer.

## Setup

```bash
npm install
cp .env.local.example .env.local    # optional; mock data works without
npm run dev
```

Open http://localhost:3000.

Without Supabase credentials, the API serves seeded mock articles and a mock leaderboard. With credentials, run the SQL from the build doc in the Supabase SQL editor, then hit `/api/cron/ingest` once to seed from RSS.

## Detection

MediaPipe's `eyeLookUpLeft` + `eyeLookUpRight` blendshapes are averaged into a single signal. A roll is a spike above threshold (default `0.5`) that drops back below `0.3` within 150–1000ms. A 1.5s debounce prevents double-counting.

Sustained upward looks (>1.5s elevated) reset to `idle` without counting.

## Deploy

Push to GitHub, import in Vercel. Set env vars:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

`vercel.json` registers the cron. Manually trigger `/api/cron/ingest` once post-deploy to seed articles.
