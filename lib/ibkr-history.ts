/**
 * IBKR 持仓快照历史 — 每次「更新持仓」追加一条；保留全部记录
 * 含 2026-08-09 起归档（见 ibkr-history-archive.ts）
 */

import { IBKR_HISTORY_ARCHIVE } from "./ibkr-history-archive";

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

const RECENT: IbkrHistoryEntry[] = [
  {
    id: "2026-11-04",
    capturedAt: "2026-11-04T15:59:00.000Z",
    source: "ibkr_live",
    nlv: 186455.85,
    cash: 142927.07,
    cashPct: 76.65,
    stockMv: 80737.42,
    unrealizedPnl: -3375.89,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 170.82, unrealizedPnl: -4106.28, legPct: -0.316, delta: -0.99, iv: 0.48, spot: 381.0 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 120.73, unrealizedPnl: -1286.56, legPct: -0.119, delta: -0.99, iv: 0.75, spot: 200.0 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 276.45, unrealizedPnl: -385.54 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 202.12, unrealizedPnl: 1184.13 },
      { symbol: "TTWO", qty: 10, avg: 192.04, mark: 207.04, unrealizedPnl: 150.03 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 190.82, unrealizedPnl: 1755.07 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 77.35, unrealizedPnl: 5.22 },
    ],
    note: "盘后更新：AMAT/COHR 单腿浮亏扩大，链目标仍远；COHR 盈利日；F&G~29 Fear",
    brentPrice: 101.14,
    fearGreedIndex: 29,
    marketTrend: "震荡",
  },
  {
    id: "2026-11-03",
    capturedAt: "2026-11-03T02:56:00.000Z",
    source: "ibkr_live",
    nlv: 187469.44,
    cash: 142693.16,
    cashPct: 76.12,
    stockMv: 79119.43,
    unrealizedPnl: -2533.56,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 166.07, unrealizedPnl: -3630.93, legPct: -0.28, delta: -0.98, iv: 0.85, spot: 374.5 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 110.83, unrealizedPnl: -296.45, legPct: -0.027, delta: -0.96, iv: 0.9, spot: 200.0 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 264.67, unrealizedPnl: -1563.03 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 204.55, unrealizedPnl: 1281.33 },
      { symbol: "TTWO", qty: 10, avg: 192.04, mark: 193.36, unrealizedPnl: 13.23 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 189.7, unrealizedPnl: 1609.47 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 75.2, unrealizedPnl: -9.47 },
    ],
    note: "MRNA Put 已平；新买 TTWO 10 股；AMAT/COHR 压力加大",
    marketTrend: "震荡",
  },
  {
    id: "2026-11-02",
    capturedAt: "2026-11-02T10:01:00.000Z",
    source: "ibkr_live",
    nlv: 190417.68,
    cash: 147026.13,
    cashPct: 77.21,
    stockMv: 75662.24,
    unrealizedPnl: 940.57,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 150.67, unrealizedPnl: -2090.75, legPct: -0.161, delta: -0.98, iv: 0.8, spot: 399.8 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 101.1, unrealizedPnl: 676.4, legPct: 0.063, delta: -0.95, iv: 0.85, spot: 215.3 },
      { underlying: "MRNA", strike: 220, expiry: "2026-11-20", entry: 18.36, mark: 17.48, unrealizedPnl: 88.09, legPct: 0.048, delta: -0.42, iv: 0.82, spot: 220.8 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 256.97, unrealizedPnl: -2333.43 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 207.65, unrealizedPnl: 1405.33 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 189.4, unrealizedPnl: 1570.47 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 78.12, unrealizedPnl: 10.48 },
    ],
    note: "NLV~19.04万；AMAT 浮亏扩大；F&G 26",
    brentPrice: 108.7,
    fearGreedIndex: 26,
    marketTrend: "震荡",
  },
  {
    id: "2026-10-30",
    capturedAt: "2026-10-30T10:01:00.000Z",
    source: "ibkr_live",
    nlv: 191704.51,
    cash: 146856.1,
    cashPct: 76.61,
    stockMv: 76136.33,
    unrealizedPnl: 2459.1,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 119.58, unrealizedPnl: 1017.45, legPct: 0.078, delta: -0.95, iv: 0.75, spot: 404 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 75.4, unrealizedPnl: 3246.03, legPct: 0.301, delta: -0.93, iv: 0.82, spot: 220 },
      { underlying: "MRNA", strike: 220, expiry: "2026-11-20", entry: 18.36, mark: 17.14, unrealizedPnl: 121.44, legPct: 0.066, delta: -0.45, iv: 0.83, spot: 220.6 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 261, unrealizedPnl: -1930.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 207.71, unrealizedPnl: 1407.73 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 189.52, unrealizedPnl: 1586.07 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 79.8, unrealizedPnl: 21.95 },
    ],
    note: "COHR 浮盈扩大；F&G~34",
    brentPrice: 112.7,
    fearGreedIndex: 34,
    marketTrend: "震荡",
  },
  {
    id: "2026-10-29",
    capturedAt: "2026-10-29T10:01:00.000Z",
    source: "ibkr_live",
    nlv: 194363.92,
    cash: 147332.58,
    cashPct: 75.8,
    stockMv: 76013.39,
    unrealizedPnl: 4517.1,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 125.31, unrealizedPnl: 445.05, legPct: 0.034, delta: -0.91, iv: 0.72, spot: 416 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 72.89, unrealizedPnl: 3497.76, legPct: 0.324, delta: -0.86, iv: 0.87, spot: 239.59 },
      { underlying: "MRNA", strike: 220, expiry: "2026-11-20", entry: 18.36, mark: 21.83, unrealizedPnl: -346.93, legPct: -0.189, delta: -0.5, iv: 0.9, spot: 214.17 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 253.16, unrealizedPnl: -2714.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 213.95, unrealizedPnl: 1657.33 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 191.58, unrealizedPnl: 1853.87 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 83.45, unrealizedPnl: 46.88 },
    ],
    note: "NLV~19.44万；AMAT 转正",
    brentPrice: 109,
    fearGreedIndex: 36,
    marketTrend: "震荡",
  },
  {
    id: "2026-10-28",
    capturedAt: "2026-10-28T10:00:00.000Z",
    source: "ibkr_live",
    nlv: 193019.69,
    cash: 147447.34,
    cashPct: 76.39,
    stockMv: 75704.25,
    unrealizedPnl: 3037.62,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 144.19, unrealizedPnl: -1443.35, legPct: -0.111, delta: -0.94, iv: 0.73, spot: 396 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 76.25, unrealizedPnl: 3161.36, legPct: 0.293, delta: -0.87, iv: 0.87, spot: 236 },
      { underlying: "MRNA", strike: 220, expiry: "2026-11-20", entry: 18.36, mark: 25.6, unrealizedPnl: -723.72, legPct: -0.394, delta: -0.55, iv: 0.91, spot: 208 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 248.05, unrealizedPnl: -3225.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 219.69, unrealizedPnl: 1886.93 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 191.38, unrealizedPnl: 1827.87 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 82.74, unrealizedPnl: 42.03 },
    ],
    note: "COHR mark 大幅改善",
    brentPrice: 111,
    fearGreedIndex: 34,
    marketTrend: "震荡",
  },
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
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 89.62, unrealizedPnl: 1824.29, legPct: 0.169, delta: -0.885, iv: 0.98, spot: 221.5 },
      { underlying: "MRNA", strike: 220, expiry: "2026-11-20", entry: 18.36, mark: 30.68, unrealizedPnl: -1232.59, legPct: -0.671, delta: -0.605, iv: 0.98, spot: 198.85 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 250.64, unrealizedPnl: -2966.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 216.35, unrealizedPnl: 1753.25 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 190.22, unrealizedPnl: 1677.07 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 80.5, unrealizedPnl: 26.73 },
    ],
    note: "NLV~18.86万",
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
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 101.63, unrealizedPnl: 623.4, legPct: 0.058, delta: -0.9181, iv: 0.9798, spot: 209.29 },
      { underlying: "MRNA", strike: 220, expiry: "2026-11-20", entry: 18.36, mark: 32.37, unrealizedPnl: -1401.27, legPct: -0.763, delta: -0.5912, iv: 0.9792, spot: 200.1 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 249.4, unrealizedPnl: -3090.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 211.78, unrealizedPnl: 1570.53 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 189.5, unrealizedPnl: 1583.47 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 81, unrealizedPnl: 30.15 },
    ],
    note: "MRNA 卖新闻；F&G~22 Extreme Fear",
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
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 164.88, unrealizedPnl: -3511.75, legPct: -0.271, delta: -0.98, iv: null, spot: 381 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 103.56, unrealizedPnl: 431, legPct: 0.04, delta: -0.95, iv: null, spot: 215 },
      { underlying: "MRNA", strike: 220, expiry: "2026-11-20", entry: 18.36, mark: 30.81, unrealizedPnl: -1245.08, legPct: -0.678, delta: -0.65, iv: null, spot: 196 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 251.03, unrealizedPnl: -2927.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 212.91, unrealizedPnl: 1615.73 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 189.18, unrealizedPnl: 1541.87 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 82.52, unrealizedPnl: 40.53 },
    ],
    note: "深ITM；F&G~20 Extreme Fear",
    brentPrice: 114.5,
    fearGreedIndex: 20,
    marketTrend: "下跌",
  },
];

/** 新→旧：近期 + 归档（去重 by id） */
export const IBKR_HISTORY: IbkrHistoryEntry[] = (() => {
  const seen = new Set<string>();
  const out: IbkrHistoryEntry[] = [];
  for (const e of [...RECENT, ...IBKR_HISTORY_ARCHIVE]) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    out.push(e);
  }
  return out;
})();

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
