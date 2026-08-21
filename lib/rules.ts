/**
 * Options Scanner Pro — CSP / Sell-Put 系统化交易原则
 * 来源：账户实践 + 链级止盈 + Sell-Put 系统化策略笔记
 */

export type PoolTier = "core" | "satellite" | "caution" | "standard";

export const ACCOUNT_RULES = {
  cycleDays: 35,
  maxNewCspPerCycle: 2,
  minCashPct: 40,
  maxSingleMarginPct: 15,
  /** 单行业/主题最大 exposure（与笔记 20–30% 对齐，取 30） */
  maxSectorPct: 30,
  maxThemePuts: 2,
  /** 单一标的最大 assignment notional 占 NLV */
  maxSingleAssignmentNotionalPct: 10,
  targetPremiumPerCycleUsd: 2000,
  takeProfitMode: "chain_net_credit" as const,
  takeProfitPctOfChainNet: 50,
  singleLegReferencePct: 50,
  earlyManagePctOfCredit: 30,
  /** 接近到期且已赚大部分权利金时可提前平（笔记 70–80%） */
  earlyClosePremiumPctNearExpiry: 70,
  earlyCloseDteThreshold: 20,
} as const;

export const OPTION_RULES = {
  dteMin: 30,
  dteMax: 45,
  dteHardMax: 60,
  /** 笔记：保守 -0.10~-0.20；进取 -0.15~-0.30；本账户取 0.20–0.30 */
  deltaMin: 0.2,
  deltaMax: 0.3,
  deltaHardMax: 0.35,
  ivRankPrefer: 50,
  ivRankStrong: 60,
  /** 笔记 IV Percentile ≥40% 作参考下限 */
  ivPercentileMin: 40,
  ivAnnualBonus: 70,
  minOpenInterest: 500,
  minOptionVolume: 100,
  /** Bid/Ask 最好 < premium 的 5–10% */
  maxBidAskPct: 5,
  minPopOtm: 65,
  /** 笔记 win probability ≥80% ≈ POP OTM 偏高一侧 */
  minWinProbPct: 80,
  earningsAvoidDays: 7,
  minAnnualizedYieldPct: 8,
  noLeveragedEtf: true,
} as const;

/** 宏观/情绪：降低或暂停新开 CSP 的软规则（展示用） */
export const MACRO_FILTERS = {
  vixLow: 15,
  vixHigh: 25,
  vxnLow: 20,
  vxnHigh: 30,
  fgiGreedMin: 55,
  fgiExtremeGreed: 75,
  note:
    "VIX<15 或 VXN<20：少做/不做（权利金薄）；FGI Greed 减少操作，Extreme Greed 不新开；美债10Y急升、跨 FOMC 不新开。",
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
    id: "assignment_first",
    title: "奔着接股去，不是只赚权利金",
    detail:
      "每一笔 Sell Put 默认愿意在行权价接货。若接货感觉不情愿，说明标的或行权价选错了，需 review。避免单纯投机扫货。黄金坑或明确单边上涨时，不要用 Sell Put 接货——直接买正股/Call。",
  },
  {
    id: "edge",
    title: "盈利本质：Theta + 波动率风险溢价",
    detail:
      "Sell Put = Long Delta + Short Vega + Short Gamma + Long Theta。赚的是时间衰减与 IV 相对 HV 的溢价，不是猜方向。高胜率 ≠ 高期望收益（多数小赚 + 少数大亏）。",
  },
  {
    id: "quality_first",
    title: "质量优先于权利金",
    detail:
      "长期看好、基本面/财务健康、PE 相对合理、更愿在破位点接货。第一过滤器：愿持有 6–12 个月；第二：IV Rank/权利金环境。不把 IV>80 当硬门槛。",
  },
  {
    id: "cycle",
    title: "低频：约每 35 天 1–2 个 CSP",
    detail: "不铺仓。单期目标权利金约 $2,000 为指引，不硬凑。新手同样每次 1–2 张把流程跑通。",
  },
  {
    id: "cash",
    title: "现金与保证金缓冲",
    detail:
      "现金 ≥ 40% NLV；单票保证金 ≤ 15% NLV；单一标的 assignment notional ≤ 10% NLV。永远按「所有 Put 同时接股」管理资金；预留集中 assignment 备用金。",
  },
  {
    id: "theme",
    title: "分散：同主题 Put ≤ 2，行业 ≤ 30%",
    detail: "避免风险集中在 AI/半导体等单一主题。Semi 核心池大，是为了轮换选股，不是同时铺满。",
  },
  {
    id: "contract",
    title: "合约参数",
    detail:
      "DTE 30–45（硬上限 60，最短不宜 <15）；Delta 0.20–0.30（硬上限 0.35）；POP/胜率倾向 ≥65–80%；Bid-Ask < 权利金约 5%；IV Rank ≥50 优先、IV Percentile ≥40 参考；年化权利金倾向 ≥8%；避开 7 天内财报；不用杠杆 ETF。",
  },
  {
    id: "macro",
    title: "宏观与情绪过滤",
    detail:
      "适合：缓慢上涨、横盘、小幅回调。不适合：单边急涨（IV/权利金过薄）、单边急跌（易接货踩踏）。VIX 过低减少操作；FGI 贪婪减少、极端贪婪不新开；10Y 急升、跨 FOMC 不新开。",
  },
  {
    id: "exit",
    title: "主止盈：链累计净权利金的 50%",
    detail:
      "链净权利金 = 当前腿入场 − 此前腿已实现亏损；目标利润 = 链净 × 50%。单腿 50% 仅参考。另：约 20 DTE 且已赚 70–80% 权利金时可提前平，释放资金（Gamma 升高前离场）。",
  },
  {
    id: "stop",
    title: "止损与减仓",
    detail:
      "基本面/估值逻辑破坏 → 无条件退出。跌破预设 thesis invalidation → 重估。组合 exposure / margin / Delta 超限 → 必须减仓。",
  },
  {
    id: "roll",
    title: "Roll 纪律",
    detail:
      "Roll 不改变已发生的亏损。自问：若今天手上没有这个仓位，我是否仍愿意新开这张 Put？答案为 No → 不为「扳本」而 Roll。",
  },
  {
    id: "wheel",
    title: "Wheel / 备兑",
    detail:
      "接货后不要只追 Sell Call 权利金；很多时候持有等待修复更好。若不打算留股（如 GDX），应平 Call+卖股或接受行权了结，不要无意义 Roll。",
  },
  {
    id: "journal",
    title: "事后总结",
    detail: "记录每笔时间/价格/盈亏。亏损单对照策略复盘；若因新因素导致，及时更新规则。",
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
  if (tier === "core") notes.push("核心池：质量优先，愿接货");
  else if (tier === "satellite") notes.push("卫星池：仅权利金足够厚时小仓");
  else if (tier === "caution") notes.push("慎做：不建议作为每期收租主力");

  if (params.ivRankProxy >= OPTION_RULES.ivRankStrong) {
    score += 15;
    notes.push("IV Rank 代理偏强，权利金环境较好");
  } else if (params.ivRankProxy >= OPTION_RULES.ivRankPrefer) {
    score += 8;
    notes.push("IV Rank 代理尚可");
  } else if (params.ivRankProxy < OPTION_RULES.ivPercentileMin) {
    score -= 10;
    notes.push("IV 环境偏弱，少做/不做（权利金薄）");
  } else {
    score -= 5;
    notes.push("IV 一般，勿为凑权利金加深 Delta");
  }

  if (params.liquidityScore >= 75) score += 8;
  else if (params.liquidityScore < 55) {
    score -= 10;
    notes.push("流动性一般（影响 roll/止损）");
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
