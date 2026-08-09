/**
 * 展期链条会计：主止盈 = 链累计净权利金的 50%
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
    currentLegCreditUsd: 12975.95, // 扣佣后
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
  /** 链条累计净收权利金 */
  chainNetCreditUsd: number;
  /** 链级 50% 目标利润 */
  targetProfitUsd: number;
  /** 为达到链 50%，当前腿最多可花费的买回成本 USD */
  maxBuybackCostUsd: number;
  /** 平仓目标单价（USD/股，约等于期权报价） */
  targetClosePrice: number;
  /** 当前报价 */
  currentPrice: number;
  /** 若现在平仓，链级已实现利润 USD */
  chainPnlIfCloseNowUsd: number;
  /** 链级利润占链净权利金比例（现价平） */
  chainProfitPctIfCloseNow: number;
  /** 是否已达到链 50% */
  takeProfitHit: boolean;
  /** 进度：越接近 1 越接近目标价（用价格路径粗算） */
  progressToTarget: number;
  notes?: string;
};

export function computeChainTakeProfit(params: {
  underlying: string;
  currentPremium: number; // 期权现价
  position?: number;
}): ChainTakeProfit | null {
  const chain = ROLL_CHAINS[params.underlying];
  if (!chain) return null;

  const contracts = Math.abs(params.position ?? chain.contracts);
  const chainNet = chain.currentLegCreditUsd - chain.priorRealizedLossUsd;
  const targetProfit = chainNet * 0.5;
  const maxBuyback = chain.currentLegCreditUsd - targetProfit;
  const targetClosePrice = maxBuyback / (100 * contracts);
  const currentCost = params.currentPremium * 100 * contracts;
  const chainPnlNow = chain.currentLegCreditUsd - currentCost - chain.priorRealizedLossUsd;
  const chainPct = chainNet > 0 ? chainPnlNow / chainNet : 0;

  // 进度：从入场价到目标价的路径（用 currentLeg credit /100 作入场参考）
  const entryPx = chain.currentLegCreditUsd / (100 * contracts);
  const span = entryPx - targetClosePrice;
  const progress =
    span > 0 ? Math.max(0, Math.min(1, (entryPx - params.currentPremium) / span)) : 0;

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
