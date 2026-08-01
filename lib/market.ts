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

export type MarketSnapshot = {
  regimes: MarketRegime[];
  vixProxy: number; // from SPY daily move magnitude when real VIX unavailable
  spyChange: number;
  qqqChange: number;
  spyTrend: "up" | "down" | "sideways";
  qqqTrend: "up" | "down" | "sideways";
  summary: string;
  strategyBias: "sell_premium" | "buy_options" | "neutral" | "defensive";
};

export function analyzeMarket(params: {
  spyChange: number;
  qqqChange: number;
  spyVolProxy?: number;
}): MarketSnapshot {
  const { spyChange, qqqChange } = params;
  const avgMove = (Math.abs(spyChange) + Math.abs(qqqChange)) / 2;
  // crude VIX proxy: daily move * ~16 annualizes roughly; scale to 12-40 range
  const vixProxy = Math.min(45, Math.max(12, 15 + avgMove * 4));

  const spyTrend: "up" | "down" | "sideways" =
    spyChange > 0.6 ? "up" : spyChange < -0.6 ? "down" : "sideways";
  const qqqTrend: "up" | "down" | "sideways" =
    qqqChange > 0.8 ? "up" : qqqChange < -0.8 ? "down" : "sideways";

  const regimes: MarketRegime[] = [];

  if (spyTrend === "up" && qqqTrend === "up") regimes.push("Bull", "Risk On");
  else if (spyTrend === "down" && qqqTrend === "down") regimes.push("Bear", "Risk Off");
  else if (spyChange < -1.5 || qqqChange < -2) regimes.push("Correction", "Risk Off");
  else regimes.push("Sideways");

  if (vixProxy >= 28) regimes.push("High IV");
  else if (vixProxy <= 16) regimes.push("Low IV");

  let strategyBias: MarketSnapshot["strategyBias"] = "neutral";
  if (regimes.includes("High IV") && (regimes.includes("Sideways") || regimes.includes("Bull"))) {
    strategyBias = "sell_premium";
  } else if (regimes.includes("Low IV") && regimes.includes("Bull")) {
    strategyBias = "buy_options";
  } else if (regimes.includes("Bear") || regimes.includes("Risk Off")) {
    strategyBias = "defensive";
  }

  const summary = [
    `VIX代理≈${vixProxy.toFixed(0)}`,
    `SPY ${spyChange >= 0 ? "+" : ""}${spyChange.toFixed(2)}% (${spyTrend})`,
    `QQQ ${qqqChange >= 0 ? "+" : ""}${qqqChange.toFixed(2)}% (${qqqTrend})`,
    `偏向: ${strategyBias}`,
  ].join(" · ");

  return {
    regimes: [...new Set(regimes)],
    vixProxy: Math.round(vixProxy),
    spyChange,
    qqqChange,
    spyTrend,
    qqqTrend,
    summary,
    strategyBias,
  };
}
