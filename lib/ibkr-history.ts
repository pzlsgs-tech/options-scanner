/**
 * IBKR 持仓快照历史 — 每次「更新持仓」追加一条，便于复盘
 */

export type HistoryShortPut = {
  underlying: string;
  strike: number;
  expiry: string;
  entry: number;
  mark: number;
  unrealizedPnl: number;
  legPct: number;
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
};

/** 新→旧。每次更新持仓插到头部。 */
export const IBKR_HISTORY: IbkrHistoryEntry[] = [
  {
    id: "2026-08-24",
    capturedAt: "2026-08-24T14:30:00.000Z",
    source: "ibkr_live",
    nlv: 179189.96,
    cash: 120483.79,
    cashPct: 67.2,
    stockMv: 83603.42,
    unrealizedPnl: 16678.16,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 92.57, unrealizedPnl: 3718.49, legPct: 0.287 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 67.19, unrealizedPnl: 4067.84, legPct: 0.377 },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 18.12, unrealizedPnl: 2396.75, legPct: 0.57 },
    ],
    coveredCalls: [
      { underlying: "GDX", strike: 87, expiry: "2026-09-04", entry: 2.05, mark: 17.17, unrealizedPnl: -1511.97 },
      { underlying: "MCD", strike: 285, expiry: "2026-09-04", entry: 3.49, mark: 0.48, unrealizedPnl: 300.86 },
    ],
    stocks: [
      { symbol: "GDX", qty: 100, avg: 87.31, mark: 103.86, unrealizedPnl: 1655.15 },
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 271.81, unrealizedPnl: -849.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 210.04, unrealizedPnl: 1500.73 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 193.2, unrealizedPnl: 1971.66 },
      { symbol: "IBKR", qty: 6.262, avg: 75.13, mark: 94.18, unrealizedPnl: 119.32 },
    ],
    note: "Put 权利金回升（浮盈收窄）；GDX 继续走强，87C 更深实值",
  },
  {
    id: "2026-08-21",
    capturedAt: "2026-08-21T03:45:00.000Z",
    source: "backfill",
    nlv: 181895.96,
    cash: 120485.34,
    cashPct: 66.2,
    stockMv: 83185.32,
    unrealizedPnl: 19400.8,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 84.86, unrealizedPnl: 4490.41, legPct: 0.346 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 56.04, unrealizedPnl: 5182.72, legPct: 0.48 },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 16.28, unrealizedPnl: 2580.49, legPct: 0.613 },
    ],
    coveredCalls: [
      { underlying: "GDX", strike: 87, expiry: "2026-09-04", entry: 2.05, mark: 13.46, unrealizedPnl: -1140.6 },
      { underlying: "MCD", strike: 285, expiry: "2026-09-04", entry: 3.49, mark: 0.48, unrealizedPnl: 300.46 },
    ],
    stocks: [
      { symbol: "GDX", qty: 100, avg: 87.31, mark: 100.58, unrealizedPnl: 1327.15 },
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 269.4, unrealizedPnl: -1090.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 217.76, unrealizedPnl: 1809.73 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 193.5, unrealizedPnl: 2001.66 },
      { symbol: "IBKR", qty: 6.262, avg: 75.13, mark: 89.91, unrealizedPnl: 92.55 },
    ],
    note: "CRDO 最接近链目标；用户决定不留黄金",
  },
  {
    id: "2026-08-11",
    capturedAt: "2026-08-11T05:00:00.000Z",
    source: "backfill",
    nlv: 183591.47,
    cash: 121424.84,
    cashPct: 66.1,
    stockMv: 83449.09,
    unrealizedPnl: 19914.07,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 85.42, unrealizedPnl: 4433.85, legPct: 0.342 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 53.5, unrealizedPnl: 5436.97, legPct: 0.504 },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 19.63, unrealizedPnl: 2245.66, legPct: 0.534 },
    ],
    coveredCalls: [
      { underlying: "GDX", strike: 87, expiry: "2026-09-04", entry: 2.05, mark: 6.43, unrealizedPnl: -438.11 },
      { underlying: "MCD", strike: 285, expiry: "2026-09-04", entry: 3.49, mark: 1.98, unrealizedPnl: 150.92 },
    ],
    stocks: [
      { symbol: "GDX", qty: 100, avg: 87.31, mark: 90.96, unrealizedPnl: 365.15 },
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 273.57, unrealizedPnl: -673.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 219.33, unrealizedPnl: 1872.53 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 194.48, unrealizedPnl: 2099.66 },
      { symbol: "IBKR", qty: 6.262, avg: 75.13, mark: 90.66, unrealizedPnl: 97.24 },
    ],
  },
  {
    id: "2026-08-09",
    capturedAt: "2026-08-09T05:00:00.000Z",
    source: "backfill",
    nlv: 186215.55,
    cash: 121233.06,
    cashPct: 65.1,
    stockMv: 83723.49,
    unrealizedPnl: 22824.93,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 81.48, unrealizedPnl: 4828.39, legPct: 0.372 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 39.96, unrealizedPnl: 6790.35, legPct: 0.63 },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 19.18, unrealizedPnl: 2291.11, legPct: 0.544 },
    ],
    coveredCalls: [
      { underlying: "GDX", strike: 87, expiry: "2026-09-04", entry: 2.05, mark: 5.95, unrealizedPnl: -389.83 },
      { underlying: "MCD", strike: 285, expiry: "2026-09-04", entry: 3.49, mark: 2.48, unrealizedPnl: 101.24 },
    ],
    stocks: [
      { symbol: "GDX", qty: 100, avg: 87.31, mark: 90.57, unrealizedPnl: 325.91 },
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 274.48, unrealizedPnl: -582.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 223.8, unrealizedPnl: 2051.33 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 194.64, unrealizedPnl: 2115.66 },
      { symbol: "IBKR", qty: 6.262, avg: 75.13, mark: 87.75, unrealizedPnl: 79.02 },
    ],
    note: "链级50%止盈正式启用",
  },
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
    note: h.note,
  }));
}
