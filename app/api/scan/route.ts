import { NextRequest, NextResponse } from "next/server";
import { UNIVERSE } from "@/lib/universe";
import { scoreStock, type Quote } from "@/lib/scoring";
import { recommendStrategies } from "@/lib/strategies";

/** Approximate reference prices so the UI still works when Yahoo is blocked */
const FALLBACK_PRICES: Record<string, number> = {
  AAPL: 210, MSFT: 430, NVDA: 125, TSLA: 250, AMZN: 195, META: 530,
  GOOGL: 180, AMD: 145, SPY: 560, QQQ: 490, IWM: 220, AVGO: 250,
  AMAT: 180, LRCX: 90, MU: 110, INTC: 25, TSM: 180, SMCI: 45,
  PLTR: 40, CRM: 280, NFLX: 700, JPM: 220, BAC: 40, GS: 500,
  XOM: 115, CVX: 155, OXY: 55, COST: 900, WMT: 95, HD: 380,
  MCD: 290, DIS: 100, BA: 180, UNH: 520, LLY: 800, PFE: 28,
  COIN: 250, MSTR: 350, SOFI: 15, HOOD: 40, BABA: 90, UBER: 75,
  CRWD: 350, SHOP: 100, PYPL: 75, V: 290, MA: 520, IBKR: 150,
  F: 11, XLE: 90, XLF: 45, XLK: 230, GLD: 240, TLT: 90,
};

async function fetchOneChart(symbol: string): Promise<Quote | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) return null;
    const meta = result.meta || {};
    const closes: number[] = result.indicators?.quote?.[0]?.close || [];
    const volumes: number[] = result.indicators?.quote?.[0]?.volume || [];
    const price = meta.regularMarketPrice ?? closes.filter(Boolean).pop() ?? 0;
    const prev = meta.chartPreviousClose ?? closes.filter(Boolean).slice(-2, -1)[0] ?? price;
    const changePercent = prev ? ((price - prev) / prev) * 100 : 0;
    const volume = volumes.filter(Boolean).pop() ?? 0;
    return {
      symbol,
      price: Number(price) || 0,
      changePercent: Number(changePercent) || 0,
      volume: Number(volume) || 0,
    };
  } catch {
    return null;
  }
}

async function fetchQuotes(symbols: string[]): Promise<{ quotes: Record<string, Quote>; liveCount: number }> {
  const quotes: Record<string, Quote> = {};
  let liveCount = 0;

  // Parallel with concurrency limit
  const concurrency = 8;
  for (let i = 0; i < symbols.length; i += concurrency) {
    const batch = symbols.slice(i, i + concurrency);
    const results = await Promise.all(batch.map((s) => fetchOneChart(s)));
    results.forEach((q, idx) => {
      const sym = batch[idx];
      if (q && q.price > 0) {
        quotes[sym] = q;
        liveCount++;
      } else {
        const fb = FALLBACK_PRICES[sym];
        quotes[sym] = {
          symbol: sym,
          price: fb ?? 50,
          changePercent: 0,
          volume: 5_000_000,
        };
      }
    });
  }
  return { quotes, liveCount };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const minPrice = Number(searchParams.get("minPrice") || "1");
  const maxPrice = Number(searchParams.get("maxPrice") || "5000");
  const minScore = Number(searchParams.get("minScore") || "0");
  const sector = searchParams.get("sector") || "All";
  const strategyBias = searchParams.get("bias") || "All";
  const limit = Math.min(Number(searchParams.get("limit") || "50"), 80);

  const symbols = UNIVERSE.map((s) => s.symbol);
  const { quotes, liveCount } = await fetchQuotes(symbols);

  let scored = UNIVERSE.map((meta) => {
    const q = quotes[meta.symbol] || {
      symbol: meta.symbol,
      price: FALLBACK_PRICES[meta.symbol] ?? 50,
      changePercent: 0,
      volume: 5_000_000,
    };
    return scoreStock(meta, q);
  });

  scored = scored.filter((s) => {
    if (s.price > 0 && (s.price < minPrice || s.price > maxPrice)) return false;
    if (s.optionsSuitabilityScore < minScore) return false;
    if (sector !== "All" && s.sector !== sector) return false;
    return true;
  });

  scored.sort(
    (a, b) =>
      b.optionsSuitabilityScore - a.optionsSuitabilityScore ||
      b.liquidityScore - a.liquidityScore
  );

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
    return { ...s, strategies: filteredStrategies };
  });

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    count: results.length,
    universeSize: UNIVERSE.length,
    liveQuotes: liveCount,
    usingFallback: liveCount === 0,
    results,
    note:
      liveCount === 0
        ? "实时报价暂不可用，已使用参考价格展示。策略推荐仍基于流动性与规则引擎。"
        : `已获取 ${liveCount}/${symbols.length} 只实时报价。IV Rank 为代理指标。`,
  });
}
