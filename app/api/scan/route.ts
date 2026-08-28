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
  AAPL: 210, MSFT: 430, NVDA: 199, TSLA: 250, AMZN: 195, META: 530,
  GOOGL: 180, AMD: 145, SPY: 560, QQQ: 490, IWM: 220, AVGO: 380,
  AMAT: 400, MU: 820, INTC: 90, TSM: 400, PLTR: 40, NFLX: 700,
  JPM: 220, BAC: 40, GS: 500, XOM: 115, CVX: 155, COST: 900,
  WMT: 95, HD: 380, MCD: 271, DIS: 100, BA: 180, UNH: 520,
  LLY: 800, PFE: 28, COIN: 250, MSTR: 350, SOFI: 15, HOOD: 40,
  BABA: 90, UBER: 75, CRWD: 350, SHOP: 100, PYPL: 75, V: 290,
  MA: 520, IBKR: 88, F: 11, XLE: 90, XLF: 45, XLK: 230, GLD: 240, TLT: 90,
  COHR: 95, CRDO: 140, GDX: 74, GLW: 150, WDC: 400, MRVL: 190,
  ALAB: 120, LITE: 80, CRWV: 70, LRCX: 260, KLAC: 900, STX: 100, TER: 120, DELL: 120, ARM: 150,
};

async function fetchOneChart(symbol: string): Promise<Quote | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
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
  const poolFilter = searchParams.get("pool") || "All";

  const snapshot = IBKR_SNAPSHOT;
  const effectiveHeld = getHeldSymbols(snapshot);
  const shortPuts = getShortPuts(snapshot);
  const coveredCalls = getCoveredCalls(snapshot);
  const stocks = getStockPositions(snapshot);
  const risk = portfolioRiskFlags(snapshot);

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

  const rollByUnderlying: Record<string, ReturnType<typeof scoreRollOpportunity>> = {};
  for (const sp of shortPuts) {
    rollByUnderlying[sp.underlying] = scoreRollOpportunity({
      symbol: sp.underlying,
      strike: sp.strike || 0,
      expiry: sp.expiry || "",
      dte: sp.dte,
      entryPremium: sp.averagePrice,
      currentPremium: sp.marketPrice,
      unrealizedPnl: sp.unrealizedPnl,
      marketValue: sp.marketValue,
      position: sp.position,
    });
  }

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
    const themeBlocked = !portfolioOk;

    const playbook = scoreAgainstPlaybook({
      symbol: meta.symbol,
      ivRankProxy: scored.ivRankProxy,
      liquidityScore: scored.liquidityScore,
      portfolioOk,
      themeBlocked,
    });

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

    const roll = rollByUnderlying[meta.symbol];

    const baseAi = finalScore({
      marketWeight: marketFit,
      stockScore: underlying.total,
      optionScore: optionLayer.total,
      portfolioOk,
      premiumQuality: optionLayer.premiumQuality,
      rollScore: roll?.score,
    });
    const aiScore = Math.round(baseAi.total * 0.75 + playbook.playbookScore * 0.25);

    let recommendedAction = "观望";
    if (roll) {
      if (roll.recommendation === "获利了结")
        recommendedAction = roll.chain?.takeProfitHit
          ? `今天: 链50%已达，可平仓 ${meta.symbol}（目标≤$${roll.chain.targetClosePrice.toFixed(2)}）`
          : `今天: 考虑平仓 ${meta.symbol} Put（单腿 ${(roll.detail.profitPctOfCredit * 100).toFixed(0)}%）`;
      else if (roll.recommendation === "Roll") recommendedAction = `今天: Roll ${meta.symbol}`;
      else if (roll.recommendation === "观察") recommendedAction = `观察 ${meta.symbol}`;
      else recommendedAction = `不处理 ${meta.symbol}`;
    } else if (themeBlocked) {
      recommendedAction = "主题额度满 — 先平旧仓";
    } else if (playbook.tier === "caution") {
      recommendedAction = "慎做池 — 不建议作为收租主力";
    } else if (topStrategy.score >= 70 && portfolioOk && aiScore >= 65) {
      if (playbook.tier === "core") {
        recommendedAction = "可考虑 CSP（核心池）";
      } else if (playbook.tier === "satellite") {
        recommendedAction = "可小仓 CSP（卫星池，权利金需够厚）";
      } else {
        recommendedAction = `可考虑 ${topStrategy.name}`;
      }
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
          ? `当前空头Put ${shortPuts.length} 张，建议先管理/平仓后再开新CSP（每周期最多${ACCOUNT_RULES.maxNewCspPerCycle}张）。主止盈=链累计净权利金50%。`
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
      dte: `${OPTION_RULES.dteMin}–${OPTION_RULES.dteMax}天（最长${OPTION_RULES.dteHardMax}）`,
      delta: `${OPTION_RULES.deltaMin}–${OPTION_RULES.deltaMax}（硬上限${OPTION_RULES.deltaHardMax}）`,
      ivRank: `≥${OPTION_RULES.ivRankPrefer}优先，≥${OPTION_RULES.ivRankStrong}更强；IV%ile参考≥${OPTION_RULES.ivPercentileMin}`,
      oi: `>${OPTION_RULES.minOpenInterest}`,
      volume: `>${OPTION_RULES.minOptionVolume}`,
      bidAsk: `<${OPTION_RULES.maxBidAskPct}% of premium`,
      popOtm: `>${OPTION_RULES.minPopOtm}%（胜率倾向≥${OPTION_RULES.minWinProbPct}%）`,
      yield: `年化权利金倾向≥${OPTION_RULES.minAnnualizedYieldPct}%`,
      earnings: `避开${OPTION_RULES.earningsAvoidDays}天内财报；不用杠杆ETF`,
      takeProfit: `主止盈=链累计净权利金${ACCOUNT_RULES.takeProfitPctOfChainNet}%；约${ACCOUNT_RULES.earlyCloseDteThreshold}DTE且已赚${ACCOUNT_RULES.earlyClosePremiumPctNearExpiry}%可提前平`,
      roll: "若今天不愿新开同等Put → 不为扳本而Roll",
      macro: MACRO_FILTERS.note,
      assignment: `单票assignment notional≤${ACCOUNT_RULES.maxSingleAssignmentNotionalPct}% NLV；按全部Put同时接股管理资金`,
    },
    macroFilters: MACRO_FILTERS,
    history: {
      count: IBKR_HISTORY.length,
      summary: getHistorySummary(),
      entries: IBKR_HISTORY,
    },
    results,
    note: `持仓历史 ${IBKR_HISTORY.length} 条（含 Delta/IV）。主止盈=链累计净权利金50%。快照 ${snapshot.updatedAt}。`,
  });
}
