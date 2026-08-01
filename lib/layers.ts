import type { MarketSnapshot } from "./market";
import type { Theme } from "./themes";
import { getThemes } from "./themes";

export type StrategyName =
  | "Sell Put"
  | "Covered Call"
  | "Bull Put Spread"
  | "Iron Condor"
  | "Long Call"
  | "Long Put"
  | "Bear Put Spread"
  | "Calendar";

/** Layer 2: Strategy scores based on market */
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
  riskScore: number; // higher = safer
  total: number;
  flags: string[];
};

/** Layer 3: Underlying quality (proxy without full fundamentals API) */
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

  // Fundamental proxy: large liquid names score higher
  let fundamentalScore = 50;
  if (typicalOptionsVolume === "Very High") fundamentalScore = 88;
  else if (typicalOptionsVolume === "High") fundamentalScore = 75;
  else fundamentalScore = 55;
  if (price >= 50) fundamentalScore += 5;
  if (["Technology", "Financials", "Healthcare", "Consumer Staples"].includes(sector)) {
    fundamentalScore += 3;
  }
  fundamentalScore = Math.min(100, fundamentalScore);

  // Technical proxy from daily change
  let technicalScore = 55;
  if (changePercent > 0 && changePercent < 3) technicalScore = 78; // healthy up
  else if (changePercent >= 3) technicalScore = 65; // extended
  else if (changePercent > -2) technicalScore = 60;
  else technicalScore = 40;
  if (volume > 5_000_000) technicalScore += 5;
  technicalScore = Math.min(100, technicalScore);

  // Risk: avoid extreme moves as proxy for event risk
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
  premiumQuality: number; // Premium ÷ risk proxy
  yieldProxy: number;
  total: number;
  notes: string[];
};

/** Layer 4: Option suitability (proxies where real chain data unavailable) */
export function scoreOptionLayer(params: {
  ivRankProxy: number;
  liquidityScore: number;
  volatilityProxy: number;
  price: number;
  typicalOptionsVolume: string;
}): OptionScores {
  const { ivRankProxy, liquidityScore, volatilityProxy, price, typicalOptionsVolume } = params;
  const notes: string[] = [];

  // Without live chain: assume mid-term CSP target is ideal when IV high & liquid
  const dteIdeal = true; // UI will note user should pick 30-45 DTE
  const deltaIdeal = ivRankProxy >= 50; // prefer selling premium when IV elevated

  if (ivRankProxy >= 60) notes.push("IV Rank代理≥60，适合卖权利金");
  else if (ivRankProxy < 35) notes.push("IV偏低，慎卖裸权利金");

  if (liquidityScore < 60) notes.push("期权流动性一般");

  // Premium quality: high IV + high liquidity + not extreme single-name risk
  const premiumQuality = Math.round(
    Math.min(
      100,
      ivRankProxy * 0.45 +
        liquidityScore * 0.35 +
        (typicalOptionsVolume === "Very High" ? 90 : typicalOptionsVolume === "High" ? 70 : 50) * 0.2
    )
  );

  // Yield proxy: higher IV → higher expected premium/strike
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

/** Layer 5: Portfolio constraints */
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

/** Layer 6: Roll opportunity score (for existing short puts) */
export type RollScore = {
  score: number;
  stars: number; // 1-5
  factors: { label: string; value: string; weight: string }[];
  recommendation: "Roll" | "观察" | "不处理";
};

export function scoreRollOpportunity(params: {
  symbol: string;
  unrealizedPnl: number;
  marketValue: number;
  deltaProxy?: number; // negative for short put
  daysToExpiryApprox?: number;
}): RollScore {
  const { unrealizedPnl, marketValue, deltaProxy = -0.4, daysToExpiryApprox = 90 } = params;

  // If short put is profitable (positive pnl for short), less urgency to roll
  // If losing (negative for short means option more expensive), may want to roll down
  const pnlRatio = marketValue !== 0 ? unrealizedPnl / Math.abs(marketValue) : 0;

  let score = 50;
  const factors: RollScore["factors"] = [];

  // Credit potential: if still decent time value / not deep ITM
  if (pnlRatio > 0.3) {
    score += 15;
    factors.push({ label: "浮盈", value: "较高，可考虑获利了结或Roll收Credit", weight: "★★★★" });
  } else if (pnlRatio < -0.2) {
    score += 10;
    factors.push({ label: "浮亏", value: "可评估降Strike Roll", weight: "★★★★★" });
  } else {
    factors.push({ label: "盈亏", value: "中性", weight: "★★★" });
  }

  // Delta: short put delta closer to -0.5 means higher assignment risk
  const absDelta = Math.abs(deltaProxy);
  if (absDelta >= 0.45) {
    score += 20;
    factors.push({ label: "Delta", value: `≈${deltaProxy.toFixed(2)} 偏高，优先考虑降Strike`, weight: "★★★★★" });
  } else if (absDelta >= 0.3) {
    score += 10;
    factors.push({ label: "Delta", value: `≈${deltaProxy.toFixed(2)}`, weight: "★★★★" });
  } else {
    factors.push({ label: "Delta", value: "风险可控", weight: "★★★" });
  }

  if (daysToExpiryApprox < 30) {
    score += 15;
    factors.push({ label: "DTE", value: "<30天，适合Roll延长期限", weight: "★★★★" });
  } else if (daysToExpiryApprox > 90) {
    score -= 5;
    factors.push({ label: "DTE", value: "仍较远，可不急", weight: "★★★" });
  }

  score = Math.max(0, Math.min(100, score));
  const stars = score >= 85 ? 5 : score >= 70 ? 4 : score >= 55 ? 3 : score >= 40 ? 2 : 1;
  const recommendation = score >= 75 ? "Roll" : score >= 50 ? "观察" : "不处理";

  return { score, stars, factors, recommendation };
}

/** Layer 7: Final AI composite score */
export function finalScore(params: {
  marketWeight: number; // how well this fits today's market strategy
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

  // Weights from user spec: Market 20, Strategy embedded in market, Stock 20, Option 20, Portfolio 10, Roll 10
  // + Premium quality folded into option/premium
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
    breakdown: {
      market,
      stock,
      option,
      premium,
      portfolio,
      roll,
    },
  };
}
