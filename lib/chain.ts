/**
 * 展期链条会计：主止盈 = 链累计净权利金的 50%
 *
 * 链净权利金 = 当前腿入场权利金 − 此前腿已实现亏损
 * 目标利润   = 链净权利金 × 50%
 * 最大买回成本 = 链净权利金 − 目标利润 = 链净权利金 × 50%
 * 目标平仓单价 = 最大买回成本 / (100 × 张数)
 *
 * 例 AMAT：净 5009.95 → 目标利润 2505 → 买回成本 ≤2505 → 单价 ≤25.05
 */

export type RollChain = {
  underlying: string;
  /** 此前腿已实现亏损（正数表示亏损金额 USD） */
  priorRealizedLossUsd: number;
  /** 当前腿建仓权利金总额 USD（已扣佣金优先用 net） */
  currentLegCreditUsd: number;
  /** 当前腿合约张数（通常 1） */
  contracts: number;
  notes?: string;
};

/**
 * 用户提供的链条数据（2026-08-09）
 * 更新持仓时若换腿/新腿，请同步改这里
 */
export const ROLL_CHAINS: Record<string, RollChain> = {
  AMAT: {
    underlying: "AMAT",
    priorRealizedLossUsd: 7966.0,
    currentLegCreditUsd: 12975.95,
    contracts: 1,
    notes: "21AUG26 580P 亏损 → 20NOV26 540P",
  },
  COHR: {
    underlying: "COHR",
    priorRealizedLossUsd: 7765.46,
    currentLegCreditUsd: 10786.5,
    contracts: 1,
    notes: "21AUG26 330P 亏损 → 20NOV26 310P",
  },
  CRDO: {
    underlying: "CRDO",
    priorRealizedLossUsd: 2430.7,
    currentLegCreditUsd: 4208.65,
    contracts: 1,
    notes: "235P & 210P 累计亏损 → 20NOV26 180P",
  },
};

export type ChainTakeProfit = {
  underlying: string;
  priorRealizedLossUsd: number;
  currentLegCreditUsd: number;
  chainNetCreditUsd: number;
  targetProfitUsd: number;
  maxBuybackCostUsd: number;
  targetClosePrice: number;
  currentPrice: number;
  chainPnlIfCloseNowUsd: number;
  chainProfitPctIfCloseNow: number;
  takeProfitHit: boolean;
  progressToTarget: number;
  notes?: string;
};

export function computeChainTakeProfit(params: {
  underlying: string;
  currentPremium: number;
  position?: number;
}): ChainTakeProfit | null {
  const chain = ROLL_CHAINS[params.underlying];
  if (!chain) return null;

  const contracts = Math.abs(params.position ?? chain.contracts);
  const mult = 100 * contracts;

  // 链净权利金 = 本腿入场 − 历史已实现亏损
  const chainNet = chain.currentLegCreditUsd - chain.priorRealizedLossUsd;
  // 目标：整条链最终净利润 = 链净的 50%
  const targetProfit = chainNet * 0.5;
  // 买回成本上限：本腿入场 − 历史亏 − 目标利润 = 链净 − 目标利润 = 链净 × 50%
  const maxBuyback = chainNet - targetProfit; // === chainNet * 0.5
  const targetClosePrice = maxBuyback / mult;

  const currentCost = params.currentPremium * mult;
  // 现价平仓时的链级盈亏
  const chainPnlNow = chain.currentLegCreditUsd - currentCost - chain.priorRealizedLossUsd;
  const chainPct = chainNet > 0 ? chainPnlNow / chainNet : 0;

  // 进度：从本腿入场价 → 目标价（0=刚开仓，1=到达目标价）
  const entryPx = chain.currentLegCreditUsd / mult;
  const span = entryPx - targetClosePrice;
  const progress =
    span > 0
      ? Math.max(0, Math.min(1, (entryPx - params.currentPremium) / span))
      : 0;

  return {
    underlying: params.underlying,
    priorRealizedLossUsd: chain.priorRealizedLossUsd,
    currentLegCreditUsd: chain.currentLegCreditUsd,
    chainNetCreditUsd: chainNet,
    targetProfitUsd: targetProfit,
    maxBuybackCostUsd: maxBuyback,
    targetClosePrice,
    currentPrice: params.currentPremium,
    chainPnlIfCloseNowUsd: chainPnlNow,
    chainProfitPctIfCloseNow: chainPct,
    takeProfitHit: params.currentPremium <= targetClosePrice + 0.05,
    progressToTarget: progress,
    notes: chain.notes,
  };
}
