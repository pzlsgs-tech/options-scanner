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
    id: "2026-11-24",
    capturedAt: "2026-11-24T00:04:00.000Z",
    source: "manual",
    nlv: 185000,
    cash: 110000,
    cashPct: 59.5,
    stockMv: 105000,
    unrealizedPnl: -8000,
    shortPuts: [],
    coveredCalls: [],
    stocks: [
      { symbol: "COHR", qty: 100, avg: 202.13, mark: 224.5, unrealizedPnl: 2237 },
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 273, unrealizedPnl: -730 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 168, unrealizedPnl: -180 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 180, unrealizedPnl: 348 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 71.2, unrealizedPnl: -36.8 },
      { symbol: "SMERY", qty: 100, avg: 28.89, mark: 26, unrealizedPnl: -289 },
    ],
    note: "AMAT Put已到期（无空头Put）；科技股强势反弹（NVDA因Huang复出）；现金约妦；F&G Extreme Fear ~18；市场Risk-On反弹；布伦特~88",
    brentPrice: 88.1,
    fearGreedIndex: 18,
    marketTrend: "上涨",
  },
  {
    id: "2026-11-21",
    capturedAt: "2026-11-21T04:27:00.000Z",
    source: "ibkr_live",
    nlv: 174074.32,
    cash: 103454.48,
    cashPct: 59.43,
    stockMv: 100019.25,
    unrealizedPnl: -18040.57,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 228.93, unrealizedPnl: -9917.19, legPct: -0.764, delta: -0.99, iv: 0.82, spot: 315.0 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "COHR", qty: 100, avg: 202.13, mark: 187.01, unrealizedPnl: -1512.00 },
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 275.51, unrealizedPnl: -479.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 136.76, unrealizedPnl: -1430.30 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 175.30, unrealizedPnl: -262.53 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 72.79, unrealizedPnl: -25.93 },
      { symbol: "SMERY", qty: 100, avg: 28.89, mark: 26.08, unrealizedPnl: -280.73 },
    ],
    note: "AMAT Put深ITM到期单腿浮亏扩大；无COHR Put；科技股继续承压；现金约59%；F&G Extreme Fear ~17；市场Risk-Off；布伦特~90",
    brentPrice: 90.0,
    fearGreedIndex: 17,
    marketTrend: "下跌",
  },
  // older preserved
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
