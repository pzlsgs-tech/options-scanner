/** Layer 1: Market environment filter */

export type MarketRegime =
  | "Bull"
  | "Bear"
  | "Correction"
  | "Sideways"
  | "High IV"
  | "Low IV"
  | "Risk Off"
  | "Risk On";

export type FearGreedLabel =
  | "Extreme Fear"
  | "Fear"
  | "Neutral"
  | "Greed"
  | "Extreme Greed"
  | "Unknown";

export type MarketSnapshot = {
  regimes: MarketRegime[];
  vixProxy: number;
  spyChange: number;
  qqqChange: number;
  spyTrend: "up" | "down" | "sideways";
  qqqTrend: "up" | "down" | "sideways";
  /** Brent crude USD/bbl (BZ=F or front-month) */
  brentPrice: number | null;
  /** CNN Fear & Greed 0–100 */
  fearGreedIndex: number | null;
  fearGreedLabel: FearGreedLabel;
  summary: string;
  strategyBias: "sell_premium" | "buy_options" | "neutral" | "defensive";
};

export function fearGreedLabel(score: number | null | undefined): FearGreedLabel {
  if (score == null || Number.isNaN(score)) return "Unknown";
  if (score <= 24) return "Extreme Fear";
  if (score <= 44) return "Fear";
  if (score <= 55) return "Neutral";
  if (score <= 74) return "Greed";
  return "Extreme Greed";
}

export function analyzeMarket(params: {
  spyChange: number;
  qqqChange: number;
  spyVolProxy?: number;
  brentPrice?: number | null;
  fearGreedIndex?: number | null;
}): MarketSnapshot {
  const { spyChange, qqqChange } = params;
  const brentPrice =
    params.brentPrice != null && !Number.isNaN(params.brentPrice) ? params.brentPrice : null;
  const fearGreedIndex =
    params.fearGreedIndex != null && !Number.isNaN(params.fearGreedIndex)
      ? Math.round(params.fearGreedIndex)
      : null;
  const fgiLabel = fearGreedLabel(fearGreedIndex);

  const avgMove = (Math.abs(spyChange) + Math.abs(qqqChange)) / 2;
  const vixProxy = Math.min(45, Math.max(12, 15 + avgMove * 4));

  const spyTrend: "up" | "down" | "sideways" =
    spyChange > 0.6 ? "up" : spyChange < -0.6 ? "down" : "sideways";
  const qqqTrend: "up" | "down" | "sideways" =
    qqqChange > 0.8 ? "up" : qqqChange < -0.8 ? "down" : "sideways";

  const regimes: MarketRegime[] = [];

  if (spyTrend === "up" && qqqTrend === "up") {
    regimes.push("Bull", "Risk On");
  } else if (spyTrend === "down" && qqqTrend === "down") {
    regimes.push("Bear", "Risk Off");
  } else if (spyChange < -1.5 || qqqChange < -2) {
    regimes.push("Correction", "Risk Off");
  } else {
    regimes.push("Sideways");
  }

  if (vixProxy >= 28) regimes.push("High IV");
  else if (vixProxy <= 16) regimes.push("Low IV");

  // Oil / sentiment overlays (informational + soft bias)
  if (brentPrice != null && brentPrice >= 100) {
    // elevated energy cost → mild risk-off tilt if not already bull
    if (!regimes.includes("Bull")) regimes.push("Risk Off");
  }
  if (fearGreedIndex != null && fearGreedIndex <= 25) {
    if (!regimes.includes("Risk Off")) regimes.push("Risk Off");
  }

  let strategyBias: MarketSnapshot["strategyBias"] = "neutral";
  if (regimes.includes("High IV") && (regimes.includes("Sideways") || regimes.includes("Bull"))) {
    strategyBias = "sell_premium";
  } else if (regimes.includes("Low IV") && regimes.includes("Bull")) {
    strategyBias = "buy_options";
  } else if (regimes.includes("Bear") || regimes.includes("Risk Off")) {
    strategyBias = "defensive";
  }

  const parts = [
    `VIX代理≈${vixProxy.toFixed(0)}`,
    `SPY ${spyChange >= 0 ? "+" : ""}${spyChange.toFixed(2)}% (${spyTrend})`,
    `QQQ ${qqqChange >= 0 ? "+" : ""}${qqqChange.toFixed(2)}% (${qqqTrend})`,
  ];
  if (brentPrice != null) parts.push(`布伦特 $${brentPrice.toFixed(2)}`);
  if (fearGreedIndex != null) parts.push(`F&G ${fearGreedIndex} (${fgiLabel})`);
  parts.push(`偏向: ${strategyBias}`);
  const summary = parts.join(" · ");

  const uniqueRegimes: MarketRegime[] = [];
  for (let i = 0; i < regimes.length; i++) {
    if (uniqueRegimes.indexOf(regimes[i]) === -1) uniqueRegimes.push(regimes[i]);
  }

  return {
    regimes: uniqueRegimes,
    vixProxy: Math.round(vixProxy),
    spyChange,
    qqqChange,
    spyTrend,
    qqqTrend,
    brentPrice,
    fearGreedIndex,
    fearGreedLabel: fgiLabel,
    summary,
    strategyBias,
  };
}
