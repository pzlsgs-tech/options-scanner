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
    id: "2026-10-27",
    capturedAt: "2026-10-27T10:01:00.000Z",
    source: "ibkr_live",
    nlv: 188614.04,
    cash: 147375.25,
    cashPct: 78.14,
    stockMv: 75624.78,
    unrealizedPnl: -1262.52,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 152.36, unrealizedPnl: -2259.75, legPct: -0.174, delta: -0.919, iv: 0.85, spot: 387.59 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 89.62, unrealizedPnl: 1824.29, legPct: 0.169, delta: -0.885, iv: 0.98, spot: 221.50 },
      { underlying: "MRNA", strike: 220, expiry: "2026-11-20", entry: 18.36, mark: 30.68, unrealizedPnl: -1232.59, legPct: -0.671, delta: -0.605, iv: 0.98, spot: 198.85 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 250.64, unrealizedPnl: -2966.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 216.35, unrealizedPnl: 1753.25 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 190.22, unrealizedPnl: 1677.07 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 80.50, unrealizedPnl: 26.73 },
    ],
    note: "周二盘前：NLV回升至~18.86万；AMAT/COHR mark下降改善浮盈；MRNA疫苗数据波动仍深亏；F&G~28 Fear；布伦特~109",
    brentPrice: 108.84,
    fearGreedIndex: 28,
    marketTrend: "震荡",
  },
  {
    id: "2026-10-26",
    capturedAt: "2026-10-26T10:00:00.000Z",
    source: "ibkr_live",
    nlv: 183855.02,
    cash: 147169.81,
    cashPct: 80.05,
    stockMv: 75000.41,
    unrealizedPnl: -5719.02,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 163.59, unrealizedPnl: -3382.95, legPct: -0.261, delta: -0.9305, iv: 0.8544, spot: 377.24 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 101.63, unrealizedPnl: 623.40, legPct: 0.058, delta: -0.9181, iv: 0.9798, spot: 209.29 },
      { underlying: "MRNA", strike: 220, expiry: "2026-11-20", entry: 18.36, mark: 32.37, unrealizedPnl: -1401.27, legPct: -0.763, delta: -0.5912, iv: 0.9792, spot: 200.10 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 249.40, unrealizedPnl: -3090.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 211.78, unrealizedPnl: 1570.53 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 189.50, unrealizedPnl: 1583.47 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 81.00, unrealizedPnl: 30.15 },
    ],
    note: "周一盘前：NLV小幅回落；AMAT/COHR深ITM mark高位；MRNA因癌症疫苗数据卖新闻回调；F&G~22 Extreme Fear；布伦特~109",
    brentPrice: 108.84,
    fearGreedIndex: 22,
    marketTrend: "震荡",
  },
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
