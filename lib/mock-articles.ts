import { Article } from "./types";

// Seeded baseline used when Supabase credentials aren't configured yet.
// Keeps the full flow demoable offline.
export const MOCK_ARTICLES: Article[] = [
  {
    id: "m-1",
    source: "The Hindu",
    category: "NATIONAL",
    headline:
      "Parliament passes bill nobody read after three-hour debate about the acoustics of the chamber",
    summary:
      "A legislative session concluded with the passage of a 312-page bill after members spent most of the allotted time debating whether the new microphone system carried their voices adequately to the press gallery. Opposition walked out twice.",
    image_url:
      "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&q=70&auto=format&fit=crop",
    published_at: new Date(Date.now() - 3600_000).toISOString(),
  },
  {
    id: "m-2",
    source: "Indian Express",
    category: "POLITICS",
    headline:
      "Minister claims inflation is a matter of perspective, suggests citizens 'adjust their outlook'",
    summary:
      "At a press briefing in New Delhi, the minister urged the public to consider rising prices through a wider lens, pointing to growth indicators and a forthcoming subsidy scheme that will be announced shortly, possibly next quarter.",
    image_url:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=1200&q=70&auto=format&fit=crop",
    published_at: new Date(Date.now() - 7200_000).toISOString(),
  },
  {
    id: "m-3",
    source: "Mint",
    category: "BUSINESS",
    headline:
      "Startup raises $80M at $2B valuation to reinvent the concept of 'a chair'",
    summary:
      "The company, founded by two ex-consultants and a furniture heir, plans to use the capital to develop a 'chair-as-a-service' platform that combines ergonomic analytics with subscription delivery. A waitlist has opened in three cities.",
    image_url:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=70&auto=format&fit=crop",
    published_at: new Date(Date.now() - 10800_000).toISOString(),
  },
  {
    id: "m-4",
    source: "Scroll",
    category: "POLITICS",
    headline:
      "Civic body plans to 'beautify' footpath by removing the footpath",
    summary:
      "Contractors have begun work on a ₹42 crore stretch that will replace the existing pedestrian pathway with a decorative arrangement of planters, signage, and granite benches, pedestrians will be routed onto the adjacent carriageway during construction.",
    image_url:
      "https://images.unsplash.com/photo-1549144511-f099e773c147?w=1200&q=70&auto=format&fit=crop",
    published_at: new Date(Date.now() - 14400_000).toISOString(),
  },
  {
    id: "m-5",
    source: "The Print",
    category: "POLITICS",
    headline:
      "Think piece: why the real inflation is the friends we made along the way",
    summary:
      "An opinion contributor argues that India's obsession with CPI data overlooks the deeper, more meaningful inflation of interpersonal expectations, relational bandwidth, and collective nostalgia. The piece runs 2,400 words and cites no sources.",
    image_url:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=70&auto=format&fit=crop",
    published_at: new Date(Date.now() - 18000_000).toISOString(),
  },
  {
    id: "m-6",
    source: "NDTV",
    category: "NATIONAL",
    headline:
      "Breaking: traffic committee meets for 11th year to discuss the same flyover",
    summary:
      "The inter-departmental committee tasked with finalising alignment for a contested flyover reconvened this morning. A source familiar with the matter said members made 'substantial progress' in agreeing to meet again in six weeks.",
    image_url:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&q=70&auto=format&fit=crop",
    published_at: new Date(Date.now() - 21600_000).toISOString(),
  },
  {
    id: "m-7",
    source: "Mint",
    category: "BUSINESS",
    headline:
      "CEO announces 'people-first' layoffs affecting 12% of people",
    summary:
      "In a memo to staff, the chief executive framed the workforce reduction as an investment in the company's long-term culture, citing recent strategic clarity and a renewed focus on operational efficiency across functions.",
    image_url:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=70&auto=format&fit=crop",
    published_at: new Date(Date.now() - 25200_000).toISOString(),
  },
  {
    id: "m-8",
    source: "The Hindu",
    category: "NATIONAL",
    headline:
      "Weather department issues 'mildly concerning but probably fine' advisory for coastal districts",
    summary:
      "A low-pressure system continues to hover, and residents are advised to stay indoors, or go outdoors if they prefer, and to keep an eye on the sky which may or may not do anything unusual over the next 36 hours.",
    image_url:
      "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=1200&q=70&auto=format&fit=crop",
    published_at: new Date(Date.now() - 28800_000).toISOString(),
  },
  {
    id: "m-9",
    source: "Indian Express",
    category: "NATIONAL",
    headline:
      "App-based everything company launches app to help you manage the other apps",
    summary:
      "A new super-app promises to consolidate the twenty-three existing apps on the average urban phone into a single interface, which will itself be downloadable as a twenty-fourth app with its own notification stack.",
    image_url:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=70&auto=format&fit=crop",
    published_at: new Date(Date.now() - 32400_000).toISOString(),
  },
  {
    id: "m-10",
    source: "Scroll",
    category: "POLITICS",
    headline:
      "Local MLA inaugurates a ribbon, ribbon to be cut at a later ceremony",
    summary:
      "In a pre-inauguration inauguration, the elected representative formally unveiled a commemorative strip of silk that will, in a separate event next month, be formally cut to mark the opening of a community hall still under construction.",
    image_url:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=70&auto=format&fit=crop",
    published_at: new Date(Date.now() - 36000_000).toISOString(),
  },
];

export const MOCK_LEADERBOARD = [...MOCK_ARTICLES]
  .slice(0, 10)
  .map((a, i) => ({
    id: a.id,
    headline: a.headline,
    category: a.category,
    image_url: a.image_url,
    rolls: 48213 - i * 3117 - Math.floor(Math.random() * 500),
  }));
