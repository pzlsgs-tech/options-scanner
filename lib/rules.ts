/**
 * Options Scanner Pro — CSP 筛选原则（交易实践总结）
 */

export type PoolTier = "core" | "satellite" | "caution" | "standard";

export const ACCOUNT_RULES = {
  cycleDays: 35,
  maxNewCspPerCycle: 2,
  minCashPct: 40,
  maxSingleMarginPct: 15,
  maxSectorPct: 30,
  maxThemePuts: 2,
  targetPremiumPerCycleUsd: 2000,
  /**
   * 主止盈：展期链条「累计净权利金」的 50%
   * （含此前腿已实现亏损，不是单腿权利金的 50%）
   */
  takeProfitMode: "chain_net_credit" as const,
  takeProfitPctOfChainNet: 50,
  /** 单腿参考（仅展示，不作主止盈） */
  singleLegReferencePct: 50,
  earlyManagePctOfCredit: 30,
} as const;

export const OPTION_RULES = {
  dteMin: 30,
  dteMax: 45,
  dteHardMax: 60,
  deltaMin: 0.2,
  deltaMax: 0.3,
  deltaHardMax: 0.35,
  ivRankPrefer: 50,
  ivRankStrong: 60,
  ivAnnualBonus: 70,
  minOpenInterest: 500,
  minOptionVolume: 100,
  maxBidAskPct: 5,
  minPopOtm: 65,
  earningsAvoidDays: 7,
} as const;

export const POOL: Record<string, PoolTier> = {
  AMAT: "core",
  COHR: "core",
  MU: "core",
  LRCX: "core",
  KLAC: "core",
  ARM: "core",
  MRVL: "core",
  WDC: "core",
  STX: "core",
  TER: "core",
  INTC: "core",
  DELL: "core",
  AVGO: "core",
  TSM: "core",
  GLW: "core",
  ALAB: "satellite",
  LITE: "satellite",
  CRWV: "satellite",
  RKLB: "caution",
  AAOI: "caution",
  CRDO: "caution",
  SPCX: "caution",
  AAPL: "core",
  MSFT: "core",
  NVDA: "satellite",
  META: "core",
  GOOGL: "core",
  AMD: "satellite",
  JPM: "core",
  V: "core",
  MA: "core",
  COST: "core",
  WMT: "core",
  HD: "core",
  MCD: "core",
  UNH: "core",
  XOM: "core",
  CVX: "core",
};

export function getPoolTier(symbol: string): PoolTier {
  return POOL[symbol] || "standard";
}

export const POOL_LABELS: Record<PoolTier, string> = {
  core: "核心池",
  satellite: "卫星池",
  caution: "慎做",
  standard: "常规",
};

export const POOL_SCORE_BONUS: Record<PoolTier, number> = {
  core: 12,
  satellite: 4,
  standard: 0,
  caution: -20,
};

export const PRINCIPLES = [
  {
    id: "quality_first",
    title: "质量优先于权利金",
    detail: "第一过滤器：愿在行权价持有 6–12 个月；第二过滤器：IV Rank 偏高 / 权利金厚。不把 IV>80 当硬门槛。",
  },
  {
    id: "cycle",
    title: "低频：约每 35 天 1–2 个 CSP",
    detail: "不铺仓。单期目标权利金约 $2,000 为指引，不硬凑。",
  },
  {
    id: "cash",
    title: "现金 ≥ 40% NLV",
    detail: "入金与开仓后仍须满足；单票保证金 ≤ 15% NLV。",
  },
  {
    id: "theme",
    title: "同主题空头 Put ≤ 2",
    detail: "Semi/AI 等主题严格限制；先平旧仓再开新仓。核心池多为半导相关，每期仍最多 1–2 张。",
  },
  {
    id: "contract",
    title: "合约参数",
    detail: "DTE 30–45（最长 60）；Delta 0.20–0.30（硬上限 0.35）；避开 7 天内财报。",
  },
  {
    id: "exit",
    title: "主止盈：链累计净权利金的 50%",
    detail:
      "展期链条：链净权利金 = 当前腿入场权利金 − 此前腿已实现亏损。目标利润 = 链净权利金 × 50%。平仓单价使整条链最终录得该利润。单腿 50% 仅作参考，不作主止盈。",
  },
  {
    id: "pools",
    title: "核心 / 卫星 / 慎做",
    detail:
      "核心：AMAT COHR MU LRCX KLAC ARM MRVL WDC STX TER INTC DELL（及 AVGO TSM GLW 等）。卫星：ALAB LITE CRWV。慎做：RKLB AAOI CRDO SPCX。",
  },
] as const;

export function scoreAgainstPlaybook(params: {
  symbol: string;
  ivRankProxy: number;
  liquidityScore: number;
  portfolioOk: boolean;
  themeBlocked: boolean;
}): { playbookScore: number; notes: string[]; tier: PoolTier } {
  const tier = getPoolTier(params.symbol);
  const notes: string[] = [];
  let score = 50;

  score += POOL_SCORE_BONUS[tier];
  if (tier === "core") notes.push("核心池：质量优先");
  else if (tier === "satellite") notes.push("卫星池：仅权利金足够厚时小仓");
  else if (tier === "caution") notes.push("慎做：不建议作为每期收租主力");

  if (params.ivRankProxy >= OPTION_RULES.ivRankStrong) {
    score += 15;
    notes.push("IV Rank 代理偏强，权利金环境较好");
  } else if (params.ivRankProxy >= OPTION_RULES.ivRankPrefer) {
    score += 8;
    notes.push("IV Rank 代理尚可");
  } else {
    score -= 5;
    notes.push("IV 一般，勿为凑权利金加深 Delta");
  }

  if (params.liquidityScore >= 75) score += 8;
  else if (params.liquidityScore < 55) {
    score -= 10;
    notes.push("流动性一般");
  }

  if (params.themeBlocked) {
    score -= 25;
    notes.push("主题额度已满（同主题 Put≤2），先平旧仓");
  } else if (!params.portfolioOk) {
    score -= 15;
    notes.push("组合层限制");
  }

  score = Math.max(0, Math.min(100, score));
  return { playbookScore: score, notes, tier };
}
