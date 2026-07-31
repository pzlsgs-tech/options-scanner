export type StrategyType =
  | "Cash-Secured Put"
  | "Covered Call"
  | "Bull Call Spread"
  | "Bear Put Spread"
  | "Iron Condor"
  | "Long Call"
  | "Long Put"
  | "Bull Put Spread"
  | "Bear Call Spread";

export type StrategyRecommendation = {
  name: StrategyType;
  bias: "Bullish" | "Bearish" | "Neutral" | "Volatile";
  suitability: string;
  description: string;
  risk: "Defined" | "Undefined";
  when: string;
};

export const STRATEGY_LIBRARY: Record<StrategyType, Omit<StrategyRecommendation, "name">> = {
  "Cash-Secured Put": {
    bias: "Bullish",
    suitability: "High IV + support nearby + willing to own stock",
    description: "卖出看跌期权并预留现金。到期若未被指派则赚取权利金；若被指派则以较低有效成本持有股票。",
    risk: "Undefined",
    when: "IV Rank 偏高、股价接近支撑、你看好或中性偏多",
  },
  "Covered Call": {
    bias: "Neutral",
    suitability: "已持有股票 + 高 IV + 想增强收益",
    description: "持有正股同时卖出看涨期权，收取权利金，适合震荡或温和上涨行情。",
    risk: "Undefined (股票下跌风险仍在)",
    when: "已持仓、IV 较高、不预期大幅暴涨",
  },
  "Bull Call Spread": {
    bias: "Bullish",
    suitability: "看涨但想控制成本与风险",
    description: "买入较低行权价 Call，同时卖出更高行权价 Call，降低净权利金支出，风险有限。",
    risk: "Defined",
    when: "低到中等 IV、明确看涨、想用有限风险做多",
  },
  "Bear Put Spread": {
    bias: "Bearish",
    suitability: "看跌且想控制风险",
    description: "买入较高行权价 Put，卖出较低行权价 Put，形成有限风险的看跌价差。",
    risk: "Defined",
    when: "看跌、IV 中等、想避免裸卖 Put 的无限风险",
  },
  "Iron Condor": {
    bias: "Neutral",
    suitability: "高 IV + 预期震荡",
    description: "同时卖出 Put 价差和 Call 价差，收取双重权利金，适合区间震荡行情。",
    risk: "Defined",
    when: "IV Rank 高、预期股价在区间内波动",
  },
  "Long Call": {
    bias: "Bullish",
    suitability: "强势看涨 + 低 IV",
    description: "直接买入 Call，杠杆看涨。风险有限（权利金），但需要方向正确且时间足够。",
    risk: "Defined",
    when: "IV 偏低、强势上涨趋势、事件驱动",
  },
  "Long Put": {
    bias: "Bearish",
    suitability: "强势看跌 + 低 IV",
    description: "直接买入 Put，杠杆看跌或对冲。",
    risk: "Defined",
    when: "IV 偏低、明确下跌趋势或保护持仓",
  },
  "Bull Put Spread": {
    bias: "Bullish",
    suitability: "温和看涨 + 高 IV",
    description: "卖出较高行权价 Put，买入更低行权价 Put 作为保护，净收权利金。",
    risk: "Defined",
    when: "高 IV、支撑明显、温和看多",
  },
  "Bear Call Spread": {
    bias: "Bearish",
    suitability: "温和看跌 + 高 IV",
    description: "卖出较低行权价 Call，买入更高行权价 Call 作为保护。",
    risk: "Defined",
    when: "高 IV、阻力明显、温和看空",
  },
};

export function recommendStrategies(params: {
  ivRankProxy: number; // 0-100 approximate
  trend: "up" | "down" | "sideways";
  liquidityScore: number;
  price: number;
}): StrategyRecommendation[] {
  const { ivRankProxy, trend, liquidityScore, price } = params;
  const recs: StrategyRecommendation[] = [];

  const highIV = ivRankProxy >= 55;
  const lowIV = ivRankProxy <= 35;
  const liquid = liquidityScore >= 70;

  if (!liquid) {
    // still return something but note lower liquidity
  }

  if (highIV && trend === "sideways") {
    recs.push({ name: "Iron Condor", ...STRATEGY_LIBRARY["Iron Condor"] });
    recs.push({ name: "Bull Put Spread", ...STRATEGY_LIBRARY["Bull Put Spread"] });
    recs.push({ name: "Bear Call Spread", ...STRATEGY_LIBRARY["Bear Call Spread"] });
  }

  if (highIV && (trend === "up" || trend === "sideways")) {
    recs.push({ name: "Cash-Secured Put", ...STRATEGY_LIBRARY["Cash-Secured Put"] });
    recs.push({ name: "Bull Put Spread", ...STRATEGY_LIBRARY["Bull Put Spread"] });
    if (price > 30) {
      recs.push({ name: "Covered Call", ...STRATEGY_LIBRARY["Covered Call"] });
    }
  }

  if (highIV && trend === "down") {
    recs.push({ name: "Bear Call Spread", ...STRATEGY_LIBRARY["Bear Call Spread"] });
    recs.push({ name: "Bear Put Spread", ...STRATEGY_LIBRARY["Bear Put Spread"] });
  }

  if (lowIV && trend === "up") {
    recs.push({ name: "Long Call", ...STRATEGY_LIBRARY["Long Call"] });
    recs.push({ name: "Bull Call Spread", ...STRATEGY_LIBRARY["Bull Call Spread"] });
  }

  if (lowIV && trend === "down") {
    recs.push({ name: "Long Put", ...STRATEGY_LIBRARY["Long Put"] });
    recs.push({ name: "Bear Put Spread", ...STRATEGY_LIBRARY["Bear Put Spread"] });
  }

  if (recs.length === 0) {
    // default fallback
    if (trend === "up") {
      recs.push({ name: "Bull Call Spread", ...STRATEGY_LIBRARY["Bull Call Spread"] });
      recs.push({ name: "Cash-Secured Put", ...STRATEGY_LIBRARY["Cash-Secured Put"] });
    } else if (trend === "down") {
      recs.push({ name: "Bear Put Spread", ...STRATEGY_LIBRARY["Bear Put Spread"] });
    } else {
      recs.push({ name: "Iron Condor", ...STRATEGY_LIBRARY["Iron Condor"] });
      recs.push({ name: "Cash-Secured Put", ...STRATEGY_LIBRARY["Cash-Secured Put"] });
    }
  }

  // dedupe by name
  const seen = new Set<string>();
  return recs.filter((r) => {
    if (seen.has(r.name)) return false;
    seen.add(r.name);
    return true;
  }).slice(0, 4);
}
