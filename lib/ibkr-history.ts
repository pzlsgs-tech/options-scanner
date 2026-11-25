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
    id: "2026-11-25",
    capturedAt: "2026-11-25T00:07:00.000Z",
    source: "ibkr_live",
    nlv: 179105.29,
    cash: 26936.43,
    cashPct: 15.04,
    stockMv: 153401.61,
    unrealizedPnl: -13074.07,
    shortPuts: [
      {
        underlying: "NVDA",
        strike: 150,
        expiry: "2026-12-24",
        entry: 4.69,
        mark: 9.83,
        unrealizedPnl: -513.96,
        legPct: -1.096,
        delta: null,
        iv: null,
        spot: 152.49,
      },
    ],
    coveredCalls: [
      {
        underlying: "COHR",
        strike: 310,
        expiry: "2026-12-24",
        entry: 4.30,
        mark: 0.92,
        unrealizedPnl: 337.94,
      },
    ],
    stocks: [
      { symbol: "AMAT", qty: 100, avg: 410.24, mark: 322.75, unrealizedPnl: -8749.05 },
      { symbol: "COHR", qty: 100, avg: 202.13, mark: 195.20, unrealizedPnl: -693.17 },
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 280.05, unrealizedPnl: -25.44 },
      { symbol: "NVDA", qty: 60, avg: 160.83, mark: 152.49, unrealizedPnl: -500.66 },
      { symbol: "VWRA", qty: 150, avg: 177.02, mark: 177.56, unrealizedPnl: 81.27 },
      { symbol: "SMERY", qty: 100, avg: 28.89, mark: 26.28, unrealizedPnl: -260.73 },
      { symbol: "IBKR", qty: 6.8302, avg: 76.59, mark: 75.40, unrealizedPnl: -8.10 },
    ],
    note: "IBKR实盘同步：AMAT/COHR 接货持股；NVDA 60股+150P；COHR 310C 备兑；现金仅15.0%为主要风险",
    brentPrice: 89.0,
    fearGreedIndex: 17,
    marketTrend: "震荡",
  },
  {
    id: "2026-11-24",
    capturedAt: "2026-11-24T15:59:00.000Z",
    source: "ibkr_live",
    nlv: 178125.55,
    cash: 26932.84,
    cashPct: 15.12,
    stockMv: 152446.87,
    unrealizedPnl: -14028.14,
    shortPuts: [
      {
        underlying: "NVDA",
        strike: 150,
        expiry: "2026-12-24",
        entry: 4.692,
        mark: 10.496,
        unrealizedPnl: -580.41,
        legPct: -1.237,
        delta: null,
        iv: null,
        spot: 152.21,
      },
    ],
    coveredCalls: [
      {
        underlying: "COHR",
        strike: 310,
        expiry: "2026-12-24",
        entry: 4.3,
        mark: 0.947,
        unrealizedPnl: 335.24,
      },
    ],
    stocks: [
      { symbol: "AMAT", qty: 100, avg: 410.24, mark: 318.05, unrealizedPnl: -9219.05 },
      { symbol: "COHR", qty: 100, avg: 202.13, mark: 193.76, unrealizedPnl: -838.0 },
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 279.4, unrealizedPnl: -90.04 },
      { symbol: "NVDA", qty: 60, avg: 160.83, mark: 152.21, unrealizedPnl: -517.46 },
      { symbol: "VWRA", qty: 150, avg: 177.02, mark: 177.66, unrealizedPnl: 96.27 },
      { symbol: "SMERY", qty: 100, avg: 28.89, mark: 25.94, unrealizedPnl: -294.53 },
      { symbol: "IBKR", qty: 6.8302, avg: 76.59, mark: 73.8, unrealizedPnl: -19.03 },
    ],
    note: "IBKR实盘同步：AMAT/COHR 接货持股；NVDA 60股+150P；COHR 310C 备兑；现金仅15.1%为主要风险",
    brentPrice: 86.5,
    fearGreedIndex: 15,
    marketTrend: "震荡",
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
      {
        underlying: "AMAT",
        strike: 540,
        expiry: "2026-11-20",
        entry: 129.76,
        mark: 228.93,
        unrealizedPnl: -9917.19,
        legPct: -0.764,
        delta: -0.99,
        iv: 0.82,
        spot: 315.0,
      },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "COHR", qty: 100, avg: 202.13, mark: 187.01, unrealizedPnl: -1512.0 },
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 275.51, unrealizedPnl: -479.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 136.76, unrealizedPnl: -1430.3 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 175.3, unrealizedPnl: -262.53 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 72.79, unrealizedPnl: -25.93 },
      { symbol: "SMERY", qty: 100, avg: 28.89, mark: 26.08, unrealizedPnl: -280.73 },
    ],
    note: "AMAT Put 到期深ITM；现金约59%；F&G Extreme Fear",
    brentPrice: 90.0,
    fearGreedIndex: 17,
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
