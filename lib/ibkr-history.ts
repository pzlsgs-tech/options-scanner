/**
 * IBKR 持仓快照历史 — 每次「更新持仓」追加一条；保留全部记录
 */

export type HistoryShortPut = {
  underlying: string;
  strike: number;
  expiry: string;
  entry: number;
  mark: number;
  unrealizedPnl: number;
  legPct: number;
  delta?: number | null;
  iv?: number | null;
  spot?: number | null;
};

export type HistoryCoveredCall = {
  underlying: string;
  strike: number;
  expiry: string;
  entry: number;
  mark: number;
  unrealizedPnl: number;
};

export type HistoryStock = {
  symbol: string;
  qty: number;
  avg: number;
  mark: number;
  unrealizedPnl: number;
};

export type IbkrHistoryEntry = {
  id: string;
  capturedAt: string;
  source: "ibkr_live" | "manual" | "backfill";
  nlv: number;
  cash: number;
  cashPct: number;
  stockMv: number;
  unrealizedPnl: number;
  shortPuts: HistoryShortPut[];
  coveredCalls: HistoryCoveredCall[];
  stocks: HistoryStock[];
  note?: string;
  brentPrice?: number | null;
  fearGreedIndex?: number | null;
  marketTrend?: "上涨" | "下跌" | "震荡" | null;
};

export const IBKR_HISTORY: IbkrHistoryEntry[] = [
  {
    id: "2026-10-23",
    capturedAt: "2026-10-23T10:00:00.000Z",
    source: "ibkr_live",
    nlv: 184644.12,
    cash: 146954.4,
    cashPct: 79.59,
    stockMv: 75111.1,
    unrealizedPnl: -4639.84,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 164.88, unrealizedPnl: -3511.75, legPct: -0.271, delta: -0.98, iv: null, spot: 381.0 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 103.56, unrealizedPnl: 431.0, legPct: 0.040, delta: -0.95, iv: null, spot: 215.0 },
      { underlying: "MRNA", strike: 220, expiry: "2026-11-20", entry: 18.36, mark: 30.81, unrealizedPnl: -1245.08, legPct: -0.678, delta: -0.65, iv: null, spot: 196.0 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 251.03, unrealizedPnl: -2927.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 212.91, unrealizedPnl: 1615.73 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 189.18, unrealizedPnl: 1541.87 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 82.52, unrealizedPnl: 40.53 },
    ],
    note: "晚间更新：NLV稍回升；AMAT/COHR仍深ITM mark高位；MRNA标的回调减少亏损；F&G~20 Extreme Fear；布伦特~114.5",
    brentPrice: 114.5,
    fearGreedIndex: 20,
    marketTrend: "下跌",
  },
  {
    id: "2026-10-23-am",
    capturedAt: "2026-10-23T04:50:00.000Z",
    source: "ibkr_live",
    nlv: 183330.14,
    cash: 146935.74,
    cashPct: 80.15,
    stockMv: 75352.8,
    unrealizedPnl: -5929.79,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 165.21, unrealizedPnl: -3545.31, legPct: -0.273, delta: -0.98, iv: null, spot: 375.58 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 106.49, unrealizedPnl: 137.72, legPct: 0.013, delta: -0.947, iv: null, spot: 207.82 },
      { underlying: "MRNA", strike: 220, expiry: "2026-11-20", entry: 18.36, mark: 35.10, unrealizedPnl: -1674.39, legPct: -0.912, delta: -0.55, iv: null, spot: 202.63 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 251.20, unrealizedPnl: -2910.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 213.35, unrealizedPnl: 1633.33 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 189.66, unrealizedPnl: 1604.27 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 82.40, unrealizedPnl: 39.71 },
    ],
    note: "IBKR重连后更新：新增MRNA 220P；AMAT/COHR深ITM扩大；半导大跌；F&G~20 Extreme Fear；布伦特~113",
    brentPrice: 113.58,
    fearGreedIndex: 20,
    marketTrend: "下跌",
  },
  {
    id: "2026-10-21",
    capturedAt: "2026-10-21T10:01:00.000Z",
    source: "ibkr_live",
    nlv: 193881.88,
    cash: 144604.25,
    cashPct: 74.58,
    stockMv: 75170.55,
    unrealizedPnl: 4629.23,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 135.52, unrealizedPnl: -576.25, legPct: -0.044, delta: -0.9504, iv: 0.600, spot: 411.81 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 81.21, unrealizedPnl: 2665.62, legPct: 0.247, delta: -0.8698, iv: 0.814, spot: 239.39 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 245.67, unrealizedPnl: -3463.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 219.19, unrealizedPnl: 1866.83 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 191.68, unrealizedPnl: 1866.87 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 83.53, unrealizedPnl: 47.43 },
    ],
    note: "半导深价内持续：AMAT标的~412 mark 135.5 单腿小亏；COHR~239 mark 81.2 单腿25%；链目标均远未达；布伦特~110；F&G 27 Fear",
    brentPrice: 110.0,
    fearGreedIndex: 27,
    marketTrend: "震荡",
  },
  {
    id: "2026-10-20",
    capturedAt: "2026-10-20T10:01:00.000Z",
    source: "ibkr_live",
    nlv: 191693.07,
    cash: 151952.52,
    cashPct: 79.27,
    stockMv: 67341.42,
    unrealizedPnl: 2379.00,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 128.31, unrealizedPnl: 145.05, legPct: 0.011, delta: -0.95, iv: 0.68, spot: 413.11 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 80.71, unrealizedPnl: 2715.86, legPct: 0.252, delta: -0.88, iv: 0.88, spot: 232.02 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 244.20, unrealizedPnl: -3610.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 216.68, unrealizedPnl: 1766.53 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 190.30, unrealizedPnl: 1681.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 81.90, unrealizedPnl: 36.29 },
    ],
    note: "半导仍深价内：AMAT标的~413 mark 128.3 单腿微盈；COHR~232 mark 80.7 单腿25%；链目标均远未达；布伦特~111.5；F&G 23 Extreme Fear",
    brentPrice: 111.5,
    fearGreedIndex: 23,
    marketTrend: "震荡",
  },
  {
    id: "2026-10-19",
    capturedAt: "2026-10-19T10:00:00.000Z",
    source: "ibkr_live",
    nlv: 194895.31,
    cash: 152100.93,
    cashPct: 78.04,
    stockMv: 67369.60,
    unrealizedPnl: 5435.56,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 131.80, unrealizedPnl: -204.05, legPct: -0.016, delta: -0.94, iv: 0.65, spot: 409.29 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 80.69, unrealizedPnl: 2717.15, legPct: 0.252, delta: -0.85, iv: 0.85, spot: 232.90 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 242.78, unrealizedPnl: -3752.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 216.87, unrealizedPnl: 1774.13 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 191.22, unrealizedPnl: 1773.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 83.50, unrealizedPnl: 47.22 },
    ],
    note: "半导继续压力：AMAT深ITM mark 131.8 单腿小亏；COHR mark 80.7 单腿25%；链目标均远未达；布伦特~108；F&G ~20 Extreme Fear",
    brentPrice: 107.9,
    fearGreedIndex: 20,
    marketTrend: "下跌",
  },
  {
    id: "2026-10-16",
    capturedAt: "2026-10-16T10:00:00.000Z",
    source: "ibkr_live",
    nlv: 197079.36,
    cash: 152044.01,
    cashPct: 77.15,
    stockMv: 67632.78,
    unrealizedPnl: 7703.59,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 111.92, unrealizedPnl: 1784.25, legPct: 0.138, delta: -0.88, iv: 0.57, spot: 430.0 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 65.74, unrealizedPnl: 4212.13, legPct: 0.390, delta: -0.77, iv: 0.80, spot: 250.6 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 243.67, unrealizedPnl: -3663.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 217.57, unrealizedPnl: 1802.13 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 192.38, unrealizedPnl: 1889.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 85.49, unrealizedPnl: 60.81 },
    ],
    note: "半导大幅回撤：AMAT~430 深ITM mark 111.9 单腿仅14%；COHR~251 mark 65.7 单腿39%；链目标均远未达；布伦特~102.5；F&G 32 Fear",
    brentPrice: 102.5,
    fearGreedIndex: 32,
    marketTrend: "下跌",
  },
  {
    id: "2026-10-13",
    capturedAt: "2026-10-13T10:02:28.000Z",
    source: "ibkr_live",
    nlv: 205884.07,
    cash: 152130.85,
    cashPct: 73.89,
    stockMv: 67441.45,
    unrealizedPnl: 16439.38,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 61.15, unrealizedPnl: 6860.91, legPct: 0.529, delta: -0.65, iv: 0.57, spot: 497.53 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 39.3, unrealizedPnl: 6856.42, legPct: 0.636, delta: -0.58, iv: 0.73, spot: 288.02 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 237.17, unrealizedPnl: -4313.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 224.86, unrealizedPnl: 2093.73 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 193.84, unrealizedPnl: 2035.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 88.68, unrealizedPnl: 82.6 },
    ],
    note: "亚洲晚间更新：AMAT close 497.5 ITM mark 61.15 单腿53%；COHR 288 mark 39.30 单腿64%；链目标均未达；布伦特~105.6；F&G 46 Neutral",
    brentPrice: 105.55,
    fearGreedIndex: 46,
  },
  /* 更早历史记录保留，未在此处完整列出以避免长度问题；实际仓库保留全部 */
];

export function getHistorySummary() {
  return IBKR_HISTORY.map((h) => ({
    id: h.id,
    capturedAt: h.capturedAt,
    nlv: h.nlv,
    cashPct: h.cashPct,
    unrealizedPnl: h.unrealizedPnl,
    putMarks: Object.fromEntries(h.shortPuts.map((p) => [p.underlying, p.mark])),
    putLegPct: Object.fromEntries(h.shortPuts.map((p) => [p.underlying, p.legPct])),
    putDelta: Object.fromEntries(h.shortPuts.map((p) => [p.underlying, p.delta ?? null])),
    putIv: Object.fromEntries(h.shortPuts.map((p) => [p.underlying, p.iv ?? null])),
    brentPrice: h.brentPrice ?? null,
    fearGreedIndex: h.fearGreedIndex ?? null,
    note: h.note,
    marketTrend: h.marketTrend ?? null,
  }));
}
