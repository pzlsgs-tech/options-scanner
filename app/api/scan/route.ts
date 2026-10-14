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
import {
  IBKR_SNAPSHOT,
  getHeldSymbols,
  getShortPuts,
  getCoveredCalls,
  getStockPositions,
  portfolioRiskFlags,
} from "@/lib/ibkr-snapshot";
import { IBKR_HISTORY, getHistorySummary } from "@/lib/ibkr-history";
import { buildLedger } from "@/lib/ledger";
import {
  ACCOUNT_RULES,
  OPTION_RULES,
  PRINCIPLES,
  MACRO_FILTERS,
  scoreAgainstPlaybook,
  getPoolTier,
  POOL_LABELS,
} from "@/lib/rules";
import { computeChainTakeProfit } from "@/lib/chain";

const FALLBACK_PRICES: Record<string, number> = {
  AAPL: 210, MSFT: 430, NVDA: 199, AMAT: 400, COHR: 95, SPY: 560, QQQ: 490,
  MCD: 271, IBKR: 88, MU: 820, INTC: 90, CRDO: 140, GDX: 74, AMD: 145,
};

async function fetchOneChart(symbol: string): Promise<Quote | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
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

async function fetchBrentPrice(): Promise<number | null> {
  const q = await fetchOneChart("BZ=F");
  return q && q.price > 0 ? q.price : null;
}

async function fetchFearGreedIndex(): Promise<number | null> {
  try {
    const res = await fetch("https://production.dataviz.cnn.io/index/fearandgreed/graphdata", {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const data = await res.json();
      const score = data?.fear_and_greed?.score ?? data?.fearAndGreed?.score ?? data?.score;
      if (typeof score === "number" && score >= 0 && score <= 100) return score;
    }
  } catch { /* ignore */ }
  return 31;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const minScore = Number(searchParams.get("minScore") || "0");
  const sector = searchParams.get("sector") || "All";
  const poolFilter = searchParams.get("pool") || "All";

  const snapshot = IBKR_SNAPSHOT;
  const effectiveHeld = getHeldSymbols(snapshot);
  const shortPuts = getShortPuts(snapshot);
  const coveredCalls = getCoveredCalls(snapshot);
  const stocks = getStockPositions(snapshot);
  const risk = portfolioRiskFlags(snapshot);

  const symbols = UNIVERSE.map((s) => s.symbol);
  const [{ quotes, liveCount }, brentPrice, fearGreedIndex] = await Promise.all([
    fetchQuotes(symbols),
    fetchBrentPrice(),
    fetchFearGreedIndex(),
  ]);

  const spy = quotes["SPY"] || { changePercent: 0 };
  const qqq = quotes["QQQ"] || { changePercent: 0 };
  const market = analyzeMarket({
    spyChange: spy.changePercent,
    qqqChange: qqq.changePercent,
    brentPrice,
    fearGreedIndex,
  });

  const strategyScores = scoreStrategies(market);
  const topStrategy = strategyScores[0];

  const portfolio = buildPortfolioCheck({
    heldSymbols: effectiveHeld,
    shortPutUnderlyings: shortPuts.map((p) => p.underlying),
  });

  let results = UNIVERSE.map((meta) => {
    const q = quotes[meta.symbol] || { symbol: meta.symbol, price: FALLBACK_PRICES[meta.symbol] ?? 50, changePercent: 0, volume: 0 };
    const scored = scoreStock(meta, q);
    const themes = getThemes(meta.symbol);
    const underlying = scoreUnderlying({ price: q.price, changePercent: q.changePercent, volume: q.volume, sector: meta.sector });
    const optionLayer = scoreOptionLayer({ ivRankProxy: scored.ivRankProxy, liquidityScore: scored.liquidityScore, price: q.price });
    const themeBlocked = themes.some((t) => (portfolio.themeCounts[t] || 0) >= ACCOUNT_RULES.maxThemePuts);
    const portfolioOk = !themeBlocked;
    const playbook = scoreAgainstPlaybook({ symbol: meta.symbol, themes, ivRankProxy: scored.ivRankProxy });
    const baseAi = finalScore({ underlying, optionLayer, strategyScore: topStrategy.score, portfolioOk });
    const aiScore = Math.round(baseAi.total * 0.75 + playbook.playbookScore * 0.25);

    const shortMatch = shortPuts.find((p) => p.underlying === meta.symbol);
    let roll = null as ReturnType<typeof scoreRollOpportunity> | null;
    if (shortMatch) {
      const chain = computeChainTakeProfit({
        underlying: shortMatch.underlying,
        currentPremium: shortMatch.marketPrice,
        position: shortMatch.position,
      });
      roll = scoreRollOpportunity({
        dte: shortMatch.dte,
        profitPctOfCredit: shortMatch.profitPctOfCredit,
        remainingPremiumRatio: shortMatch.remainingPremiumRatio,
        entryPremium: shortMatch.averagePrice,
        currentPremium: shortMatch.marketPrice,
        strike: shortMatch.strike || 0,
        expiry: shortMatch.expiry || "",
        unrealizedPnl: shortMatch.unrealizedPnl,
        chain,
      });
    }

    let recommendedAction = "观望";
    if (roll) {
      if (roll.recommendation === "平仓") {
        recommendedAction = roll.chain?.takeProfitHit
          ? `今天: 链级止盈平仓 ${meta.symbol}（目标≤$${roll.chain.targetClosePrice.toFixed(2)}）`
          : `今天: 考虑平仓 ${meta.symbol} Put（单腿 ${(roll.detail.profitPctOfCredit * 100).toFixed(0)}%）`;
      } else if (roll.recommendation === "Roll") recommendedAction = `今天: Roll ${meta.symbol}`;
      else if (roll.recommendation === "观察") recommendedAction = `观察 ${meta.symbol}`;
      else recommendedAction = `不处理 ${meta.symbol}`;
    } else if (themeBlocked) {
      recommendedAction = "主题额度满 — 先平旧仓";
    } else if (playbook.tier === "caution") {
      recommendedAction = "慎做池 — 不建议作为收租主力";
    } else if (topStrategy.score >= 70 && portfolioOk && aiScore >= 65) {
      if (playbook.tier === "core") recommendedAction = "可考虑 CSP（核心池）";
      else if (playbook.tier === "satellite") recommendedAction = "可小仓 CSP（卫星池，权利金需够厚）";
      else recommendedAction = `可考虑 ${topStrategy.name}`;
    }

    return {
      ...scored,
      themes,
      poolTier: playbook.tier,
      poolLabel: POOL_LABELS[playbook.tier],
      playbookScore: playbook.playbookScore,
      playbookNotes: playbook.notes,
      underlying,
      optionLayer,
      portfolioOk,
      portfolioWarning: portfolioOk ? null : `主题集中: ${themes.join(",")} 已接近上限（≤${ACCOUNT_RULES.maxThemePuts}）`,
      roll,
      aiScore,
      aiBreakdown: { ...baseAi.breakdown, playbook: playbook.playbookScore },
      recommendedAction,
    };
  });

  if (sector !== "All") results = results.filter((r) => r.sector === sector);
  if (poolFilter !== "All") results = results.filter((r) => r.poolTier === poolFilter);
  results = results.filter((r) => r.aiScore >= minScore);
  results.sort((a, b) => b.aiScore - a.aiScore);

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    liveQuotes: liveCount,
    usingFallback: liveCount === 0,
    market,
    strategyScores,
    topStrategy,
    playbook: {
      principles: PRINCIPLES,
      accountRules: ACCOUNT_RULES,
      optionRules: OPTION_RULES,
      macroFilters: MACRO_FILTERS,
      nextCycleHint:
        shortPuts.length >= ACCOUNT_RULES.maxThemePuts
          ? `当前空头Put ${shortPuts.length} 张，建议先管理/平仓后再开新CSP。主止盈=链累计净权利金50%。`
          : `可规划下一周期 1–2 个CSP，目标权利金约 $${ACCOUNT_RULES.targetPremiumPerCycleUsd}`,
    },
    ibkr: {
      snapshotAt: snapshot.updatedAt,
      source: snapshot.source,
      balances: snapshot.balances,
      sectors: snapshot.sectors,
      stocks: stocks.map((s) => ({
        symbol: s.symbol,
        qty: s.position,
        avg: s.averagePrice,
        price: s.marketPrice,
        value: s.marketValue,
        pnl: s.unrealizedPnl,
        dailyPnl: s.dailyPnl,
        poolTier: getPoolTier(s.symbol),
      })),
      shortPuts: shortPuts.map((p) => {
        const chain = computeChainTakeProfit({
          underlying: p.underlying,
          currentPremium: p.marketPrice,
          position: p.position,
        });
        return {
          underlying: p.underlying,
          description: p.description,
          strike: p.strike,
          expiry: p.expiry,
          dte: p.dte,
          entryPremium: p.averagePrice,
          currentPremium: p.marketPrice,
          unrealizedPnl: p.unrealizedPnl,
          dailyPnl: p.dailyPnl,
          profitPctOfCredit: p.profitPctOfCredit,
          marketValue: p.marketValue,
          delta: p.delta ?? null,
          iv: p.iv ?? null,
          spot: p.spot ?? null,
          poolTier: getPoolTier(p.underlying),
          takeProfitHit: chain ? chain.takeProfitHit : p.profitPctOfCredit >= ACCOUNT_RULES.takeProfitPctOfChainNet / 100,
          chain,
        };
      }),
      coveredCalls: coveredCalls.map((c) => ({
        underlying: c.underlying || c.symbol,
        description: c.description,
        strike: c.strike,
        expiry: c.expiry,
        entryPremium: c.averagePrice,
        currentPremium: c.marketPrice,
        unrealizedPnl: c.unrealizedPnl,
      })),
      riskFlags: risk.flags,
      limits: { ...risk.limits, ...ACCOUNT_RULES },
    },
    portfolio: {
      held: effectiveHeld,
      themeCounts: portfolio.themeCounts,
      warnings: [...portfolio.sectorWarnings, ...risk.flags],
      limits: { ...portfolio.limits, ...ACCOUNT_RULES },
    },
    optionCriteria: {
      philosophy: "奔着接股去，不是只赚权利金",
      dte: `${OPTION_RULES.dteMin}–${OPTION_RULES.dteMax}天`,
      takeProfit: `主止盈=链累计净权利金${ACCOUNT_RULES.takeProfitPctOfChainNet}%`,
    },
    macroFilters: MACRO_FILTERS,
    history: {
      count: IBKR_HISTORY.length,
      summary: getHistorySummary(),
      entries: IBKR_HISTORY,
      ledger: buildLedger(IBKR_HISTORY),
    },
    results,
    note: `持仓历史 ${IBKR_HISTORY.length} 条。主止盈=链累计净权利金50%。快照 ${snapshot.updatedAt}。`,
  });
}
