/**
 * IBKR 持仓快照历史 — 每次「更新持仓」追加一条
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
};

export const IBKR_HISTORY: IbkrHistoryEntry[] = [
  {
    id: "2026-10-13",
    capturedAt: "2026-10-13T02:56:00.000Z",
    source: "ibkr_live",
    nlv: 205923.93,
    cash: 152190.66,
    cashPct: 73.91,
    stockMv: 67229.76,
    unrealizedPnl: 16444.02,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 61.15, unrealizedPnl: 6860.92, legPct: 0.529, delta: -0.636, iv: 0.556, spot: 493.5 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 39.30, unrealizedPnl: 6856.42, legPct: 0.636, delta: -0.572, iv: 0.722, spot: 280.36 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.30, mark: 236.29, unrealizedPnl: -4401.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 223.51, unrealizedPnl: 2039.73 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 193.72, unrealizedPnl: 2023.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 87.33, unrealizedPnl: 73.38 },
    ],
    note: "盘后：AMAT~494 ITM mark 61.2 单腿53%；COHR~280 mark 39.3 单腿64%；链目标均未达；布伦特~106；F&G 46 Neutral",
    brentPrice: 105.62,
    fearGreedIndex: 46,
  },
  {
    id: "2026-10-12",
    capturedAt: "2026-10-12T10:00:00.000Z",
    source: "ibkr_live",
    nlv: 208489.24,
    cash: 152214.61,
    cashPct: 73.01,
    stockMv: 67586.61,
    unrealizedPnl: 18979.51,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 56.81, unrealizedPnl: 7294.75, legPct: 0.562, delta: -0.584, iv: 0.582, spot: 507.03 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 28.18, unrealizedPnl: 7968.52, legPct: 0.739, delta: -0.431, iv: 0.745, spot: 312.62 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 235.95, unrealizedPnl: -4435.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 229.70, unrealizedPnl: 2287.33 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 193.94, unrealizedPnl: 2045.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 88.89, unrealizedPnl: 84.04 },
    ],
    note: "盘前/开盘：AMAT~507 ITM mark 56.8 单腿56%；COHR~313 mark 28.2 单腿74%；链目标均未达；布伦特~105；F&G 45 Neutral",
    brentPrice: 105.0,
    fearGreedIndex: 45,
  },
  // Previous entries preserved in full history; this update refreshes 2026-10-13 with live spots/Greeks.
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
  }));
}
