import type { MarketSnapshot } from "./market";
import type { Theme } from "./themes";
import { getThemes } from "./themes";
import { computeChainTakeProfit, type ChainTakeProfit } from "./chain";

export type StrategyName =
  | "Sell Put"
  | "Covered Call"
  | "Bull Put Spread"
  | "Iron Condor"
  | "Long Call"
  | "Long Put"
  | "Bear Put Spread"
  | "Calendar";

export function scoreStrategies(market: MarketSnapshot): { name: StrategyName; score: number; reason: string }[] {
  const { strategyBias, regimes } = market;
  const highIV = regimes.includes("High IV");
  const lowIV = regimes.includes("Low IV");
  const bull = regimes.includes("Bull");
  const bear = regimes.includes("Bear");
  const side = regimes.includes("Sideways");

  const scores: { name: StrategyName; score: number; reason: string }[] = [
    {
      name: "Sell Put",
      score: strategyBias === "sell_premium" ? 95 : bull ? 78 : bear ? 35 : 70,
      reason: highIV && !bear ? "高IV+非空头，卖Put收权利金优先" : "视市场调整",
    },
    {
      name: "Bull Put Spread",
      score: strategyBias === "sell_premium" ? 90 : bull ? 75 : 40,
      reason: "有限风险卖Put，适合控制保证金",
    },
    {
      name: "Covered Call",
      score: highIV && !bear ? 82 : 55,
      reason: "已有持仓时高IV适合备兑",
    },
    {
      name: "Iron Condor",
      score: highIV && side ? 88 : side ? 55 : 42,
      reason: highIV && side ? "高IV震荡最适合IC" : "非理想震荡环境",
    },
    {
      name: "Long Call",
      score: lowIV && bull ? 75 : 20,
      reason: lowIV && bull ? "低IV多头可买Call" : "当前不优先买权利金",
    },
    {
      name: "Long Put",
      score: lowIV && bear ? 70 : 18,
      reason: "防御或看空时",
    },
    {
      name: "Bear Put Spread",
      score: bear ? 72 : 25,
      reason: "看空有限风险",
    },
    {
      name: "Calendar",
      score: side ? 58 : 35,
      reason: "震荡可考虑日历价差",
    },
  ];

  return scores.sort((a, b) => b.score - a.score);
}

export type UnderlyingScores = {
  fundamentalScore: number;
  technicalScore: number;
  riskScore: number;
  total: number;
  flags: string[];
};

export function scoreUnderlying(params: {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  typicalOptionsVolume: string;
  sector: string;
}): UnderlyingScores {
  const { price, changePercent, volume, typicalOptionsVolume, sector } = params;
  const flags: string[] = [];

  let fundamentalScore = 50;
  if (typicalOptionsVolume === "Very High") fundamentalScore = 88;
  else if (typicalOptionsVolume === "High") fundamentalScore = 75;
  else fundamentalScore = 55;
  if (price >= 50) fundamentalScore += 5;
  if (["Technology", "Financials", "Healthcare", "Consumer Staples"].includes(sector)) {
    fundamentalScore += 3;
  }
  fundamentalScore = Math.min(100, fundamentalScore);

  let technicalScore = 55;
  if (changePercent > 0 && changePercent < 3) technicalScore = 78;
  else if (changePercent >= 3) technicalScore = 65;
  else if (changePercent > -2) technicalScore = 60;
  else technicalScore = 40;
  if (volume > 5_000_000) technicalScore += 5;
  technicalScore = Math.min(100, technicalScore);

  let riskScore = 70;
  if (Math.abs(changePercent) > 5) {
    riskScore = 40;
    flags.push("日内波动过大");
  } else if (Math.abs(changePercent) > 3) {
    riskScore = 55;
    flags.push("波动偏高");
  }
  if (price < 15) {
    riskScore -= 15;
    flags.push("低价股");
  }

  const total = Math.round(fundamentalScore * 0.4 + technicalScore * 0.35 + riskScore * 0.25);
  return { fundamentalScore, technicalScore, riskScore, total, flags };
}

export type OptionScores = {
  dteIdeal: boolean;
  deltaIdeal: boolean;
  ivRankProxy: number;
  liquidityScore: number;
  premiumQuality: number;
  yieldProxy: number;
  total: number;
  notes: string[];
};

export function scoreOptionLayer(params: {
  ivRankProxy: number;
  liquidityScore: number;
  volatilityProxy: number;
  price: number;
  typicalOptionsVolume: string;
}): OptionScores {
  const { ivRankProxy, liquidityScore, price, typicalOptionsVolume } = params;
  const notes: string[] = [];

  const dteIdeal = true;
  const deltaIdeal = ivRankProxy >= 50;

  if (ivRankProxy >= 60) notes.push("IV Rank代理≥60，适合卖权利金");
  else if (ivRankProxy < 35) notes.push("IV偏低，慎卖裸权利金");
  if (liquidityScore < 60) notes.push("期权流动性一般");

  const premiumQuality = Math.round(
    Math.min(
      100,
      ivRankProxy * 0.45 +
        liquidityScore * 0.35 +
        (typicalOptionsVolume === "Very High" ? 90 : typicalOptionsVolume === "High" ? 70 : 50) * 0.2
    )
  );

  const yieldProxy = Math.round(Math.min(100, ivRankProxy * 0.7 + (price > 30 ? 15 : 5)));

  const total = Math.round(
    (ivRankProxy >= 55 ? 85 : ivRankProxy) * 0.35 +
      liquidityScore * 0.3 +
      premiumQuality * 0.2 +
      yieldProxy * 0.15
  );

  return {
    dteIdeal,
    deltaIdeal,
    ivRankProxy,
    liquidityScore,
    premiumQuality,
    yieldProxy,
    total: Math.min(100, total),
    notes,
  };
}

export type PortfolioCheck = {
  sectorWarnings: string[];
  themeCounts: Record<string, number>;
  canAddTheme: (themes: Theme[]) => boolean;
  limits: { maxThemePuts: number; maxSectorPct: number; maxSinglePct: number; minCashPct: number };
};

export function buildPortfolioCheck(heldSymbols: string[]): PortfolioCheck {
  const themeCounts: Record<string, number> = {};
  for (const s of heldSymbols) {
    for (const t of getThemes(s)) {
      themeCounts[t] = (themeCounts[t] || 0) + 1;
    }
  }

  const sectorWarnings: string[] = [];
  for (const [theme, count] of Object.entries(themeCounts)) {
    if (count >= 2 && (theme === "AI" || theme === "Semi")) {
      sectorWarnings.push(`${theme} 主题已持有 ${count} 个相关标的，建议同主题 Sell Put ≤2`);
    }
  }

  return {
    sectorWarnings,
    themeCounts,
    canAddTheme: (themes: Theme[]) => {
      for (const t of themes) {
        if ((themeCounts[t] || 0) >= 2 && (t === "AI" || t === "Semi")) return false;
      }
      return true;
    },
    limits: {
      maxThemePuts: 2,
      maxSectorPct: 30,
      maxSinglePct: 15,
      minCashPct: 40,
    },
  };
}

export type RollScore = {
  score: number;
  stars: number;
  factors: { label: string; value: string; weight: string }[];
  recommendation: "Roll" | "观察" | "不处理" | "获利了结";
  detail: {
    strike: number;
    expiry: string;
    dte: number;
    entryPremium: number;
    currentPremium: number;
    unrealizedPnl: number;
    profitPctOfCredit: number;
  };
  chain?: ChainTakeProfit | null;
};

/** Layer 6: 主止盈 = 链累计净权利金 50% */
export function scoreRollOpportunity(params: {
  symbol: string;
  strike: number;
  expiry: string;
  dte: number;
  entryPremium: number;
  currentPremium: number;
  unrealizedPnl: number;
  marketValue: number;
  position: number;
}): RollScore {
  const { symbol, strike, expiry, dte, entryPremium, currentPremium, unrealizedPnl, position } = params;

  const creditReceived = Math.abs(entryPremium) * 100 * Math.abs(position);
  const legPct = creditReceived > 0 ? unrealizedPnl / creditReceived : 0;
  const remainingRatio = entryPremium > 0 ? currentPremium / entryPremium : 1;

  const chain = computeChainTakeProfit({
    underlying: symbol,
    currentPremium,
    position,
  });

  let score = 40;
  const factors: RollScore["factors"] = [];

  if (chain) {
    factors.push({
      label: "链净权利金",
      value: `$${chain.chainNetCreditUsd.toFixed(0)}（腿入场 $${chain.currentLegCreditUsd.toFixed(0)} − 历史亏 $${chain.priorRealizedLossUsd.toFixed(0)}）`,
      weight: "★★★★★",
    });
    factors.push({
      label: "链50%平仓目标",
      value: `单价 ≤ $${chain.targetClosePrice.toFixed(2)}（目标利润 $${chain.targetProfitUsd.toFixed(0)}）`,
      weight: "★★★★★",
    });
    factors.push({
      label: "现价平仓链利润",
      value: `$${chain.chainPnlIfCloseNowUsd.toFixed(0)}（${(chain.chainProfitPctIfCloseNow * 100).toFixed(0)}% 链净）· 进度 ${(chain.progressToTarget * 100).toFixed(0)}%`,
      weight: "★★★★★",
    });

    if (chain.takeProfitHit) {
      score += 35;
      factors.push({
        label: "主止盈",
        value: `已达链累计净权利金 50%（现价 ${currentPremium.toFixed(2)} ≤ 目标 ${chain.targetClosePrice.toFixed(2)}）`,
        weight: "★★★★★",
      });
    } else if (chain.progressToTarget >= 0.7) {
      score += 18;
      factors.push({
        label: "主止盈",
        value: `接近链目标，继续持有至 ≈$${chain.targetClosePrice.toFixed(2)}`,
        weight: "★★★★",
      });
    } else {
      factors.push({
        label: "主止盈",
        value: `未达链 50%，勿按单腿 50% 提前止盈`,
        weight: "★★★★",
      });
    }
  }

  factors.push({
    label: "单腿参考",
    value: `浮盈/本腿权利金 ${(legPct * 100).toFixed(0)}%（仅参考，非主止盈）`,
    weight: "★★",
  });

  factors.push({
    label: "权利金剩余",
    value: `入场 ${entryPremium.toFixed(2)} → 现价 ${currentPremium.toFixed(2)} (${(remainingRatio * 100).toFixed(0)}%)`,
    weight: "★★★★",
  });

  if (dte < 30) {
    score += 15;
    factors.push({ label: "DTE", value: `${dte}天 <30，评估 Roll 或持有到期`, weight: "★★★★" });
  } else if (dte < 60) {
    score += 8;
    factors.push({ label: "DTE", value: `${dte}天`, weight: "★★★" });
  } else {
    score += 4;
    factors.push({ label: "DTE", value: `${dte}天仍较远`, weight: "★★★" });
  }

  factors.push({
    label: "Strike",
    value: `${strike} · 到期 ${expiry}`,
    weight: "★★★★★",
  });

  score = Math.max(0, Math.min(100, score));
  const stars = score >= 85 ? 5 : score >= 70 ? 4 : score >= 55 ? 3 : score >= 40 ? 2 : 1;

  let recommendation: RollScore["recommendation"] = "观察";
  if (chain?.takeProfitHit) recommendation = "获利了结";
  else if (!chain && legPct >= 0.5) recommendation = "获利了结"; // 无链条数据时退回单腿
  else if (score >= 75) recommendation = "Roll";
  else if (score < 45) recommendation = "不处理";

  return {
    score,
    stars,
    factors,
    recommendation,
    detail: {
      strike,
      expiry,
      dte,
      entryPremium,
      currentPremium,
      unrealizedPnl,
      profitPctOfCredit: legPct,
    },
    chain,
  };
}

export function finalScore(params: {
  marketWeight: number;
  stockScore: number;
  optionScore: number;
  portfolioOk: boolean;
  premiumQuality: number;
  rollScore?: number;
}): { total: number; breakdown: Record<string, number> } {
  const market = params.marketWeight;
  const stock = params.stockScore;
  const option = params.optionScore;
  const portfolio = params.portfolioOk ? 85 : 40;
  const premium = params.premiumQuality;
  const roll = params.rollScore ?? 50;

  const total = Math.round(
    market * 0.2 +
      stock * 0.2 +
      option * 0.2 +
      premium * 0.15 +
      portfolio * 0.15 +
      roll * 0.1
  );

  return {
    total: Math.min(100, total),
    breakdown: { market, stock, option, premium, portfolio, roll },
  };
}
