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
    id: "2026-11-09",
    capturedAt: "2026-11-09T16:00:00.000Z",
    source: "ibkr_live",
    nlv: 189976.37,
    cash: 103410.79,
    cashPct: 54.43,
    stockMv: 108758.15,
    unrealizedPnl: -116.01,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 172.57, unrealizedPnl: -4281.55, legPct: -0.330, delta: -0.997, iv: 0.85, spot: 362.5 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "COHR", qty: 100, avg: 202.13, mark: 227.55, unrealizedPnl: 2542.00 },
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 280.19, unrealizedPnl: -11.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 179.77, unrealizedPnl: 290.33 },
      { symbol: "TTWO", qty: 10, avg: 192.04, mark: 214.07, unrealizedPnl: 220.28 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 187.92, unrealizedPnl: 1378.07 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 78.28, unrealizedPnl: 11.53 },
    ],
    note: "AMAT Put深ITM单腿浮亏改善；COHR股票大涨；现金约54%；F&G~31 Fear；市场Risk-On反弹",
    brentPrice: 95.19,
    fearGreedIndex: 31,
    marketTrend: "上涨",
  },
  {
    id: "2026-11-06",
    capturedAt: "2026-11-06T15:59:00.000Z",
    source: "ibkr_live",
    nlv: 180953.38,
    cash: 103576.31,
    cashPct: 57.24,
    stockMv: 103689.43,
    unrealizedPnl: -9431.06,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 206.15, unrealizedPnl: -7639.12, legPct: -0.589, delta: -0.998, iv: 0.80, spot: 338 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "COHR", qty: 100, avg: 202.13, mark: 187.26, unrealizedPnl: -1487.50 },
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 277.55, unrealizedPnl: -275.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 189.46, unrealizedPnl: 677.53 },
      { symbol: "TTWO", qty: 10, avg: 192.04, mark: 214.09, unrealizedPnl: 220.53 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 184.60, unrealizedPnl: 946.47 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 75.95, unrealizedPnl: -4.35 },
    ],
    note: "COHR Put已平；新增COHR股票；AMAT Put仍深ITM单腿浮亏稍改善；现金降至57%；F&G~25 Fear；市场反弹震荡",
    brentPrice: 96.5,
    fearGreedIndex: 25,
    marketTrend: "震荡",
  },
  {
    id: "2026-11-05",
    capturedAt: "2026-11-05T15:59:00.000Z",
    source: "ibkr_live",
    nlv: 176476.94,
    cash: 142799.41,
    cashPct: 80.92,
    stockMv: 79142.72,
    unrealizedPnl: -13197.39,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 212.70, unrealizedPnl: -8294.15, legPct: -0.639, delta: -0.999, iv: 1.00, spot: 327.49 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 146.26, unrealizedPnl: -3839.58, legPct: -0.356, delta: -1.0, iv: 1.10, spot: 163.81 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 279.44, unrealizedPnl: -86.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 183.86, unrealizedPnl: 453.73 },
      { symbol: "TTWO", qty: 10, avg: 192.04, mark: 209.38, unrealizedPnl: 173.43 },
      { symbol: "VWRA", qty: 130, avg: 177.32, mark: 185.38, unrealizedPnl: 1047.87 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 72.46, unrealizedPnl: -28.18 },
    ],
    note: "半导体大跌：AMAT/COHR 深ITM单腿浮亏扩大，链目标仍远；F&G~28 Fear；SPY/QQQ 明显Risk-Off",
    brentPrice: 96.6,
    fearGreedIndex: 28,
    marketTrend: "下跌",
  },
  // older entries preserved in archive and previous RECENT truncated for update; full history maintained via archive
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
