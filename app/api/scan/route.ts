import { NextRequest, NextResponse } from "next/server";
import { UNIVERSE } from "@/lib/universe";
import { scoreStock, type Quote } from "@/lib/scoring";
import { analyzeMarket } from "@/lib/market";
import {
  scoreStrategies,
  scoreUnderlying,
  scoreOptionLayer,
  buildPortfolioCheck,
  scoreRollOpportunity,
  finalScore,
} from "@/lib/layers";
import { getThemes } from "@/lib/themes";

const FALLBACK_PRICES: Record<string, number> = {
  AAPL: 210, MSFT: 430, NVDA: 125, TSLA: 250, AMZN: 195, META: 530,
  GOOGL: 180, AMD: 145, SPY: 560, QQQ: 490, IWM: 220, AVGO: 250,
  AMAT: 180, MU: 110, INTC: 25, TSM: 180, PLTR: 40, NFLX: 700,
  JPM: 220, BAC: 40, GS: 500, XOM: 115, CVX: 155, COST: 900,
  WMT: 95, HD: 380, MCD: 290, DIS: 100, BA: 180, UNH: 520,
  LLY: 800, PFE: 28, COIN: 250, MSTR: 350, SOFI: 15, HOOD: 40,
  BABA: 90, UBER: 75, CRWD: 350, SHOP: 100, PYPL: 75, V: 290,
  MA: 520, IBKR: 150, F: 11, XLE: 90, XLF: 45, XLK: 230, GLD: 240, TLT: 90,
};

async function fetchOneChart(symbol: string): Promise<Quote | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
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
    return { symbol, price: Number(price) || 0, changePercent: Number(changePercent) || 0, volume: Number(volume) || 0 };
  } catch {
    return null;
  }
}

async function fetchQuotes(symbols: string[]) {
  const quotes: Record<string, Quote> = {};
  let liveCount = 0;
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
        quotes[sym] = { symbol: sym, price: FALLBACK_PRICES[sym] ?? 50, changePercent: 0, volume: 5_000_000 };
      }
    });
  }
  return { quotes, liveCount };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const minScore = Number(searchParams.get("minScore") || "0");
  const sector = searchParams.get("sector") || "All";
  const heldParam = searchParams.get("held") || ""; // comma symbols user holds for portfolio layer
  const heldSymbols = heldParam ? heldParam.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean) : [];

  // Default held from user's known portfolio if empty
  const effectiveHeld =
    heldSymbols.length > 0
      ? heldSymbols
      : ["AMAT", "COHR", "CRDO", "GDX", "MCD", "NVDA", "IBKR", "VWRA"];

  const symbols = UNIVERSE.map((s) => s.symbol);
  const { quotes, liveCount } = await fetchQuotes(symbols);

  const spyQ = quotes["SPY"] || { changePercent: 0 };
  const qqqQ = quotes["QQQ"] || { changePercent: 0 };
  const market = analyzeMarket({
    spyChange: spyQ.changePercent || 0,
    qqqChange: qqqQ.changePercent || 0,
  });
  const strategyScores = scoreStrategies(market);
  const topStrategy = strategyScores[0];

  const portfolio = buildPortfolioCheck(effectiveHeld);

  // Known short puts for roll layer (user's AMAT/COHR/CRDO style positions)
  const rollCandidates = ["AMAT", "COHR", "CRDO"].filter((s) => effectiveHeld.includes(s));

  let results = UNIVERSE.map((meta) => {
    const q = quotes[meta.symbol] || {
      symbol: meta.symbol,
      price: FALLBACK_PRICES[meta.symbol] ?? 50,
      changePercent: 0,
      volume: 5_000_000,
    };
    const scored = scoreStock(meta, q);
    const underlying = scoreUnderlying({
      symbol: meta.symbol,
      price: scored.price,
      changePercent: scored.changePercent,
      volume: scored.volume,
      typicalOptionsVolume: meta.typicalOptionsVolume,
      sector: meta.sector,
    });
    const optionLayer = scoreOptionLayer({
      ivRankProxy: scored.ivRankProxy,
      liquidityScore: scored.liquidityScore,
      volatilityProxy: scored.volatilityProxy,
      price: scored.price,
      typicalOptionsVolume: meta.typicalOptionsVolume,
    });

    const themes = getThemes(meta.symbol);
    const portfolioOk = portfolio.canAddTheme(themes);

    // Market fit: higher if top strategies are sell-premium and this name is liquid high IV
    let marketFit = 50;
    if (market.strategyBias === "sell_premium" && scored.ivRankProxy >= 50 && scored.liquidityScore >= 70) {
      marketFit = 90;
    } else if (market.strategyBias === "buy_options" && scored.ivRankProxy <= 40) {
      marketFit = 75;
    } else if (market.strategyBias === "defensive") {
      marketFit = 40;
    } else {
      marketFit = 60 + (scored.liquidityScore > 80 ? 15 : 0);
    }

    const isRollCandidate = rollCandidates.includes(meta.symbol);
    const roll = isRollCandidate
      ? scoreRollOpportunity({
          symbol: meta.symbol,
          unrealizedPnl: 1500, // placeholder; real PnL from IBKR when integrated
          marketValue: -8000,
          deltaProxy: -0.45,
          daysToExpiryApprox: 110,
        })
      : undefined;

    const ai = finalScore({
      marketWeight: marketFit,
      stockScore: underlying.total,
      optionScore: optionLayer.total,
      portfolioOk,
      premiumQuality: optionLayer.premiumQuality,
      rollScore: roll?.score,
    });

    return {
      ...scored,
      themes,
      underlying,
      optionLayer,
      portfolioOk,
      portfolioWarning: portfolioOk ? null : `主题集中: ${themes.join(",")} 已接近上限`,
      roll,
      aiScore: ai.total,
      aiBreakdown: ai.breakdown,
      recommendedAction: roll
        ? roll.recommendation === "Roll"
          ? `今天: Roll ${meta.symbol}`
          : roll.recommendation === "观察"
          ? `观察 ${meta.symbol}`
          : `不处理 ${meta.symbol}`
        : topStrategy.score >= 70 && portfolioOk && ai.total >= 65
        ? `可考虑 ${topStrategy.name}`
        : "观望",
    };
  });

  if (sector !== "All") {
    results = results.filter((r) => r.sector === sector);
  }
  results = results.filter((r) => r.aiScore >= minScore);
  results.sort((a, b) => b.aiScore - a.aiScore);

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    liveQuotes: liveCount,
    usingFallback: liveCount === 0,
    market,
    strategyScores,
    topStrategy,
    portfolio: {
      held: effectiveHeld,
      themeCounts: portfolio.themeCounts,
      warnings: portfolio.sectorWarnings,
      limits: portfolio.limits,
    },
    optionCriteria: {
      dte: "30–45天（可至60）",
      delta: "0.25–0.35（卖Put）",
      ivRank: ">60 优先",
      ivPercentile: ">70 优先",
      oi: ">500",
      volume: ">100",
      bidAsk: "<5%",
      popOtm: ">65%",
    },
    results,
    note:
      liveCount === 0
        ? "实时报价暂不可用，使用参考价。IV Rank/Delta/OI 等为规则代理，生产环境请接真实期权链。"
        : `六层扫描已启用。实时报价 ${liveCount}/${symbols.length}。IV Rank/Delta 等仍为代理指标。`,
  });
}
