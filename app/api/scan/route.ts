import { NextRequest, NextResponse } from "next/server";
import { UNIVERSE } from "@/lib/universe";
import { scoreStock, type Quote } from "@/lib/scoring";
import { recommendStrategies } from "@/lib/strategies";

async function fetchQuotes(symbols: string[]): Promise<Record<string, Quote>> {
  const result: Record<string, Quote> = {};
  // Batch in chunks of ~40 to stay under URL limits
  const chunkSize = 40;
  for (let i = 0; i < symbols.length; i += chunkSize) {
    const chunk = symbols.slice(i, i + chunkSize);
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${chunk.join(",")}&fields=symbol,regularMarketPrice,regularMarketChangePercent,regularMarketVolume,averageDailyVolume3Month,marketCap,fiftyTwoWeekHigh,fiftyTwoWeekLow`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; OptionsScanner/1.0)",
        },
        next: { revalidate: 60 }, // cache ~1 min
      });
      if (!res.ok) continue;
      const data = await res.json();
      const quotes = data?.quoteResponse?.result || [];
      for (const q of quotes) {
        if (!q.symbol) continue;
        result[q.symbol] = {
          symbol: q.symbol,
          price: q.regularMarketPrice ?? 0,
          changePercent: q.regularMarketChangePercent ?? 0,
          volume: q.regularMarketVolume ?? 0,
          averageVolume: q.averageDailyVolume3Month,
          marketCap: q.marketCap,
          fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: q.fiftyTwoWeekLow,
        };
      }
    } catch (e) {
      console.error("Quote fetch error", e);
    }
  }
  return result;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const minPrice = Number(searchParams.get("minPrice") || "5");
  const maxPrice = Number(searchParams.get("maxPrice") || "2000");
  const minScore = Number(searchParams.get("minScore") || "50");
  const sector = searchParams.get("sector") || "All";
  const strategyBias = searchParams.get("bias") || "All"; // Bullish / Bearish / Neutral / All
  const limit = Math.min(Number(searchParams.get("limit") || "40"), 80);

  const symbols = UNIVERSE.map((s) => s.symbol);
  const quotes = await fetchQuotes(symbols);

  let scored = UNIVERSE.map((meta) => {
    const q = quotes[meta.symbol] || {
      symbol: meta.symbol,
      price: 0,
      changePercent: 0,
      volume: 0,
    };
    return scoreStock(meta, q);
  });

  // filters
  scored = scored.filter((s) => {
    if (s.price < minPrice || s.price > maxPrice) return false;
    if (s.optionsSuitabilityScore < minScore) return false;
    if (sector !== "All" && s.sector !== sector) return false;
    return true;
  });

  // sort by suitability then liquidity
  scored.sort((a, b) => {
    if (b.optionsSuitabilityScore !== a.optionsSuitabilityScore) {
      return b.optionsSuitabilityScore - a.optionsSuitabilityScore;
    }
    return b.liquidityScore - a.liquidityScore;
  });

  const results = scored.slice(0, limit).map((s) => {
    const strategies = recommendStrategies({
      ivRankProxy: s.ivRankProxy,
      trend: s.trend,
      liquidityScore: s.liquidityScore,
      price: s.price,
    });

    let filteredStrategies = strategies;
    if (strategyBias !== "All") {
      filteredStrategies = strategies.filter((st) => st.bias === strategyBias);
      if (filteredStrategies.length === 0) filteredStrategies = strategies.slice(0, 2);
    }

    return {
      ...s,
      strategies: filteredStrategies,
    };
  });

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    count: results.length,
    universeSize: UNIVERSE.length,
    results,
    note: "IV Rank is a proxy based on recent price action and known options liquidity. For production use, connect a real options data feed (IVolatility, ORATS, CBOE, etc.).",
  });
}
