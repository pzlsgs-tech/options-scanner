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
  delta?: number | null;
  iv?: number | null;
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

/** 新→旧 */
export const IBKR_HISTORY: IbkrHistoryEntry[] = [
  {
    id: "2026-09-02",
    capturedAt: "2026-09-02T02:10:00.000Z",
    source: "ibkr_live",
    nlv: 177004.07,
    cash: 120814.72,
    cashPct: 68.3,
    stockMv: 81854.39,
    unrealizedPnl: 13785.67,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 111.13, unrealizedPnl: 1862.83, legPct: 0.144, delta: -0.72, iv: 0.571, spot: 441.85 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 60.64, unrealizedPnl: 4722.86, legPct: 0.438, delta: -0.566, iv: 0.758, spot: 272.03 },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 16.45, unrealizedPnl: 2563.84, legPct: 0.609, delta: -0.28, iv: 0.796, spot: 206.63 },
    ],
    coveredCalls: [
      { underlying: "GDX", strike: 87, expiry: "2026-09-04", entry: 2.05, mark: 7.67, unrealizedPnl: -561.6 },
      { underlying: "MCD", strike: 285, expiry: "2026-09-04", entry: 3.49, mark: 0.02, unrealizedPnl: 346.61 },
    ],
    stocks: [
      { symbol: "GDX", qty: 100, avg: 87.31, mark: 93.98, unrealizedPnl: 667.15 },
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 261.41, unrealizedPnl: -1889.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 216.91, unrealizedPnl: 1775.73 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 193.12, unrealizedPnl: 1963.66 },
      { symbol: "IBKR", qty: 6.262, avg: 75.13, mark: 90.4, unrealizedPnl: 95.61 },
    ],
    note: "AMAT 急跌~482→442，Put mark 87→111，Δ加深至-0.72；GDX 回落 87C 时间价值收窄；Sep04 临近",
  },
  {
    id: "2026-08-28",
    capturedAt: "2026-08-28T03:10:00.000Z",
    source: "ibkr_live",
    nlv: 182323.64,
    cash: 120492.52,
    cashPct: 66.1,
    stockMv: 83322.0,
    unrealizedPnl: 19753.26,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 87.39, unrealizedPnl: 4237.17, legPct: 0.326, delta: -0.587, iv: 0.59, spot: 482.36 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 50.99, unrealizedPnl: 5687.25, legPct: 0.527, delta: -0.466, iv: 0.781, spot: 295.39 },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 11.91, unrealizedPnl: 3017.8, legPct: 0.717, delta: -0.178, iv: 0.867, spot: 240.24 },
    ],
    coveredCalls: [
      { underlying: "GDX", strike: 87, expiry: "2026-09-04", entry: 2.05, mark: 16.94, unrealizedPnl: -1488.55 },
      { underlying: "MCD", strike: 285, expiry: "2026-09-04", entry: 3.49, mark: 0.05, unrealizedPnl: 343.75 },
    ],
    stocks: [
      { symbol: "GDX", qty: 100, avg: 87.31, mark: 103.18, unrealizedPnl: 1587.15 },
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 261.51, unrealizedPnl: -1879.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 226.67, unrealizedPnl: 2166.13 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 194.76, unrealizedPnl: 2127.66 },
      { symbol: "IBKR", qty: 6.262, avg: 75.13, mark: 96.55, unrealizedPnl: 134.13 },
    ],
    note: "首次系统记录 Delta/IV",
  },
  {
    id: "2026-08-26",
    capturedAt: "2026-08-26T04:40:00.000Z",
    source: "ibkr_live",
    nlv: 181277.0,
    cash: 120463.29,
    cashPct: 66.5,
    stockMv: 83739.12,
    unrealizedPnl: 18764.78,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 90.8, unrealizedPnl: 3896.15, legPct: 0.3, delta: null, iv: null },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 56.9, unrealizedPnl: 5096.75, legPct: 0.472, delta: null, iv: null },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 15.63, unrealizedPnl: 2645.93, legPct: 0.629, delta: null, iv: null },
    ],
    coveredCalls: [
      { underlying: "GDX", strike: 87, expiry: "2026-09-04", entry: 2.05, mark: 18.56, unrealizedPnl: -1650.8 },
      { underlying: "MCD", strike: 285, expiry: "2026-09-04", entry: 3.49, mark: 0.19, unrealizedPnl: 330.26 },
    ],
    stocks: [
      { symbol: "GDX", qty: 100, avg: 87.31, mark: 105.07, unrealizedPnl: 1776.15 },
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 268.73, unrealizedPnl: -1157.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 213.83, unrealizedPnl: 1652.53 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 194.16, unrealizedPnl: 2067.66 },
      { symbol: "IBKR", qty: 6.262, avg: 75.13, mark: 98.73, unrealizedPnl: 147.78 },
    ],
  },
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
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 92.57, unrealizedPnl: 3718.49, legPct: 0.287, delta: null, iv: null },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 67.19, unrealizedPnl: 4067.84, legPct: 0.377, delta: null, iv: null },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 18.12, unrealizedPnl: 2396.75, legPct: 0.57, delta: null, iv: null },
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
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 84.86, unrealizedPnl: 4490.41, legPct: 0.346, delta: null, iv: null },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 56.04, unrealizedPnl: 5182.72, legPct: 0.48, delta: null, iv: null },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 16.28, unrealizedPnl: 2580.49, legPct: 0.613, delta: null, iv: null },
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
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 85.42, unrealizedPnl: 4433.85, legPct: 0.342, delta: null, iv: null },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 53.5, unrealizedPnl: 5436.97, legPct: 0.504, delta: null, iv: null },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 19.63, unrealizedPnl: 2245.66, legPct: 0.534, delta: null, iv: null },
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
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 81.48, unrealizedPnl: 4828.39, legPct: 0.372, delta: -0.469, iv: 0.799 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 39.96, unrealizedPnl: 6790.35, legPct: 0.63, delta: null, iv: null },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 19.18, unrealizedPnl: 2291.11, legPct: 0.544, delta: null, iv: null },
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
    putDelta: Object.fromEntries(h.shortPuts.map((p) => [p.underlying, p.delta ?? null])),
    putIv: Object.fromEntries(h.shortPuts.map((p) => [p.underlying, p.iv ?? null])),
    note: h.note,
  }));
}
