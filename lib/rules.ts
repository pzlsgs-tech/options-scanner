/**
 * Options Scanner Pro — CSP 筛选原则（交易实践总结）
 * 来源：账户节奏 + 持仓管理 + 核心/卫星池讨论
 */

export type PoolTier = "core" | "satellite" | "caution" | "standard";

/** 账户与仓位纪律 */
export const ACCOUNT_RULES = {
  /** 大约每 N 天只新开 1–2 个 CSP */
  cycleDays: 35,
  maxNewCspPerCycle: 2,
  /** 现金占 NLV */
  minCashPct: 40,
  /** 单票保证金占 NLV */
  maxSingleMarginPct: 15,
  /** 单行业占比 */
  maxSectorPct: 30,
  /** 同一主题空头 Put 上限 */
  maxThemePuts: 2,
  /** 目标周期权利金收入（美元，指引不是硬指标） */
  targetPremiumPerCycleUsd: 2000,
  /** 浮盈占已收权利金达到此比例 → 优先买回 */
  takeProfitPctOfCredit: 50,
  /** 可考虑提前管理的浮盈下限 */
  earlyManagePctOfCredit: 30,
} as const;

/** 期权合约参数 */
export const OPTION_RULES = {
  dteMin: 30,
  dteMax: 45,
  dteHardMax: 60,
  deltaMin: 0.2,
  deltaMax: 0.3,
  deltaHardMax: 0.35,
  /** IV Rank 优先门槛（不是唯一条件） */
  ivRankPrefer: 50,
  ivRankStrong: 60,
  /** 年化 IV 高只是加分，不是入场硬门槛（曾讨论过勿死守 IV>80） */
  ivAnnualBonus: 70,
  minOpenInterest: 500,
  minOptionVolume: 100,
  maxBidAskPct: 5,
  minPopOtm: 65,
  /** 财报回避：到期前 N 天内有财报则降权/跳过 */
  earningsAvoidDays: 7,
} as const;

/**
 * 池分层：质量优先，权利金其次
 * core = 愿在行权价持有 6–12 个月
 * satellite = 权利金厚才小仓
 * caution = 不作为每期收租主力
 */
export const POOL: Record<string, PoolTier> = {
  // A 核心 — 半导/设备/存储
  AMAT: "core",
  MU: "core",
  MRVL: "core",
  AVGO: "core",
  TSM: "core",
  LRCX: "core",
  KLAC: "core",
  // A 核心 — 分散
  GLW: "core",
  WDC: "core",
  INTC: "core",
  // B 卫星
  ALAB: "satellite",
  LITE: "satellite",
  CRWV: "satellite",
  COHR: "satellite",
  // C 慎做
  RKLB: "caution",
  AAOI: "caution",
  CRDO: "caution",
  SPCX: "caution",
  // 其他高质量流动性格
  AAPL: "core",
  MSFT: "core",
  NVDA: "satellite", // 波动与仓位占用大
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

/** 原则文案（UI / API 展示） */
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
    detail: "Semi/AI 等主题严格限制；先平旧仓再开新仓。",
  },
  {
    id: "contract",
    title: "合约参数",
    detail: "DTE 30–45（最长 60）；Delta 0.20–0.30（硬上限 0.35）；避开 7 天内财报。",
  },
  {
    id: "exit",
    title: "退出",
    detail: "浮盈 ≥ 已收权利金 50% → 优先买回；30%+ 可提前管理以释放主题额度。",
  },
  {
    id: "pools",
    title: "核心 / 卫星 / 慎做",
    detail: "核心：AMAT MU MRVL AVGO TSM LRCX KLAC GLW WDC INTC 等；卫星：ALAB LITE CRWV COHR；慎做：RKLB AAOI CRDO SPCX。",
  },
] as const;

/** 给标的打原则符合分（0–100 附加分逻辑用） */
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
