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
    id: "2026-11-20",
    capturedAt: "2026-11-19T16:52:00.000Z",
    source: "ibkr_live",
    nlv: 186760.25,
    cash: 103628.84,
    cashPct: 55.49,
    stockMv: 106614.93,
    unrealizedPnl: -5669.97,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 185.44, unrealizedPnl: -5568.16, legPct: -0.429, delta: -0.99, iv: 0.65, spot: 354.5 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "COHR", qty: 100, avg: 202.13, mark: 221.64, unrealizedPnl: 1950.50 },
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 271.13, unrealizedPnl: -917.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 151.90, unrealizedPnl: -824.67 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 180.94, unrealizedPnl: 470.67 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 76.65, unrealizedPnl: 0.43 },
      { symbol: "SMERY", qty: 100, avg: 28.89, mark: 27.83, unrealizedPnl: -105.73 },
    ],
    note: "AMAT Put深ITM即将到期单腿浮亏收窄；无COHR Put；COHR股票反弹；现金约55%；F&G 26 Fear；市场震荡；布伦特~92.6",
    brentPrice: 92.6,
    fearGreedIndex: 26,
    marketTrend: "震荡",
  },
  {
    id: "2026-11-19",
    capturedAt: "2026-11-19T04:23:00.000Z",
    source: "ibkr_live",
    nlv: 183868.39,
    cash: 103500.95,
    cashPct: 56.29,
    stockMv: 104996.44,
    unrealizedPnl: -8315.81,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 191.93, unrealizedPnl: -6217.10, legPct: -0.479, delta: -1.0, iv: 0.58, spot: 350.0 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "COHR", qty: 100, avg: 202.13, mark: 210.85, unrealizedPnl: 872.00 },
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 273.63, unrealizedPnl: -667.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 152.69, unrealizedPnl: -793.07 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 181.32, unrealizedPnl: 520.07 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 76.26, unrealizedPnl: -2.23 },
      { symbol: "SMERY", qty: 100, avg: 28.89, mark: 27.78, unrealizedPnl: -110.73 },
    ],
    note: "AMAT Put深ITM单腿浮亏稳定；无COHR Put；科技股继续承压；现金约56%；F&G 26 Fear；市场Risk-Off震荡；布伦特~93",
    brentPrice: 93.0,
    fearGreedIndex: 26,
    marketTrend: "震荡",
  },
  // older entries preserved in archive and previous RECENT
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
