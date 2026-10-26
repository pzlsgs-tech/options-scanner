import { NextResponse } from "next/server";
import { IBKR_SNAPSHOT, getHeldSymbols } from "@/lib/ibkr-snapshot";

type NewsItem = {
  title: string;
  link: string;
  publisher: string;
  publishedAt: string | null;
  summary: string;
};

type SymbolNews = {
  symbol: string;
  name?: string;
  news: NewsItem[];
};

async function fetchYahooNews(symbol: string): Promise<{ name?: string; news: NewsItem[] }> {
  const url =
    "https://query1.finance.yahoo.com/v1/finance/search?q=" +
    encodeURIComponent(symbol) +
    "&quotesCount=1&newsCount=6&listsCount=0&enableFuzzyQuery=false";
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return { news: [] };
    const data = await res.json();
    const quoteName =
      data?.quotes?.[0]?.shortname || data?.quotes?.[0]?.longname || undefined;
    const raw = Array.isArray(data?.news) ? data.news : [];
    const news: NewsItem[] = [];
    for (const n of raw.slice(0, 5)) {
      const title = String(n?.title || "").trim();
      if (!title) continue;
      const ts = n?.providerPublishTime;
      let publishedAt: string | null = null;
      if (typeof ts === "number" && ts > 0) {
        publishedAt = new Date(ts * 1000).toISOString();
      }
      news.push({
        title,
        link: String(n?.link || n?.url || "").trim(),
        publisher: String(n?.publisher || n?.provider || "").trim(),
        publishedAt,
        summary: String(n?.summary || n?.description || "").trim(),
      });
    }
    return { name: quoteName, news };
  } catch {
    return { news: [] };
  }
}

export async function GET() {
  const symbols = getHeldSymbols(IBKR_SNAPSHOT)
    .filter((s) => Boolean(s) && s.length <= 8 && !/^\d/.test(s))
    .sort();

  const items: SymbolNews[] = [];
  const concurrency = 3;
  for (let i = 0; i < symbols.length; i += concurrency) {
    const batch = symbols.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (symbol) => {
        const fetched = await fetchYahooNews(symbol);
        const row: SymbolNews = {
          symbol,
          name: fetched.name,
          news: fetched.news,
        };
        return row;
      })
    );
    items.push(...results);
  }

  items.sort((a, b) => {
    if (a.news.length && !b.news.length) return -1;
    if (!a.news.length && b.news.length) return 1;
    return a.symbol.localeCompare(b.symbol);
  });

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    symbols,
    items,
    source: "Yahoo Finance search",
  });
}
