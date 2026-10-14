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
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 229.7, unrealizedPnl: 2287.33 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 193.94, unrealizedPnl: 2045.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 88.89, unrealizedPnl: 84.04 },
    ],
    note: "盘前/开盘：AMAT~507 ITM mark 56.8 单腿56%；COHR~313 mark 28.2 单腿74%；链目标均未达；布伦特~105；F&G 45 Neutral",
    brentPrice: 105.0,
    fearGreedIndex: 45,
  },
  {
    id: "2026-10-11",
    capturedAt: "2026-10-11T10:01:00.000Z",
    source: "ibkr_live",
    nlv: 208911.23,
    cash: 152233.64,
    cashPct: 72.87,
    stockMv: 67507.2,
    unrealizedPnl: 19377.81,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 56.81, unrealizedPnl: 7294.75, legPct: 0.562, delta: -0.583, iv: 0.571, spot: 507.03 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 28.18, unrealizedPnl: 7968.52, legPct: 0.739, delta: -0.43, iv: 0.729, spot: 312.62 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 235.82, unrealizedPnl: -4448.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 229.33, unrealizedPnl: 2272.53 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 193.5, unrealizedPnl: 2001.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 88.0, unrealizedPnl: 77.96 },
    ],
    note: "周末：AMAT~507 ITM 单腿56%；COHR~313 单腿74%；链目标均未达；布伦特~104.5；F&G ~45 Neutral",
    brentPrice: 104.5,
    fearGreedIndex: 45,
  },
  {
    id: "2026-10-10",
    capturedAt: "2026-10-10T16:00:00.000Z",
    source: "ibkr_live",
    nlv: 207500.0,
    cash: 152200.0,
    cashPct: 73.3,
    stockMv: 67200.0,
    unrealizedPnl: 17500.0,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 57.0, unrealizedPnl: 7276.0, legPct: 0.56, delta: -0.57, iv: 0.57, spot: 510.0 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 33.98, unrealizedPnl: 7389.0, legPct: 0.69, delta: -0.48, iv: 0.74, spot: 302.0 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 234.0, unrealizedPnl: -4630.0 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 228.0, unrealizedPnl: 2220.0 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 193.0, unrealizedPnl: 1950.0 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 87.5, unrealizedPnl: 74.0 },
    ],
    note: "半导回撤：AMAT~510 ITM 单腿56%；COHR~302 mark 33.98 单腿69%；布伦特~$104；F&G~38 Fear",
    brentPrice: 104.28,
    fearGreedIndex: 38,
  },
  {
    id: "2026-10-09",
    capturedAt: "2026-10-09T12:00:00.000Z",
    source: "ibkr_live",
    nlv: 208200.0,
    cash: 152300.0,
    cashPct: 73.1,
    stockMv: 67100.0,
    unrealizedPnl: 18500.0,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 52.0, unrealizedPnl: 7776.0, legPct: 0.6, delta: -0.53, iv: 0.56, spot: 518.0 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 22.0, unrealizedPnl: 8587.0, legPct: 0.8, delta: -0.34, iv: 0.73, spot: 330.0 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 231.0, unrealizedPnl: -4930.0 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 235.0, unrealizedPnl: 2500.0 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 192.5, unrealizedPnl: 1900.0 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 86.8, unrealizedPnl: 70.0 },
    ],
    note: "AMAT~518 单腿约60%；COHR 单腿约80%；布伦特偏高",
    brentPrice: 104.0,
    fearGreedIndex: 40,
  },
  {
    id: "2026-10-08",
    capturedAt: "2026-10-08T12:19:00.000Z",
    source: "ibkr_live",
    nlv: 208889.81,
    cash: 152360.0,
    cashPct: 72.9,
    stockMv: 67136.78,
    unrealizedPnl: 19225.27,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 50.14, unrealizedPnl: 7961.62, legPct: 0.614, delta: -0.525, iv: 0.569, spot: 520.65 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 20.84, unrealizedPnl: 8702.72, legPct: 0.807, delta: -0.327, iv: 0.731, spot: 334.56 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 231.05, unrealizedPnl: -4925.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 235.1, unrealizedPnl: 2503.33 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 192.56, unrealizedPnl: 1907.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 86.68, unrealizedPnl: 68.94 },
    ],
    note: "AMAT~521 单腿61%；COHR~335 mark 20.8 单腿81%；布伦特~$105",
    brentPrice: 104.78,
    fearGreedIndex: null,
  },
  {
    id: "2026-10-07",
    capturedAt: "2026-10-07T14:46:00.000Z",
    source: "ibkr_live",
    nlv: 209933.55,
    cash: 152118.16,
    cashPct: 72.5,
    stockMv: 67261.46,
    unrealizedPnl: 20583.15,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 48.59, unrealizedPnl: 8116.89, legPct: 0.626, delta: -0.526, iv: 0.545, spot: 521.09 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 25.75, unrealizedPnl: 8211.58, legPct: 0.761, delta: -0.387, iv: 0.727, spot: 321.15 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 231.51, unrealizedPnl: -4879.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 237.71, unrealizedPnl: 2607.73 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 193.08, unrealizedPnl: 1959.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 86.36, unrealizedPnl: 66.72 },
    ],
    note: "AMAT~521 单腿63% Δ-0.53；COHR~321 单腿76%；布伦特~$101",
    brentPrice: 101.44,
    fearGreedIndex: null,
  },
  {
    id: "2026-10-05",
    capturedAt: "2026-10-05T14:36:00.000Z",
    source: "ibkr_live",
    nlv: 210689.24,
    cash: 151820.55,
    cashPct: 72.1,
    stockMv: 67216.31,
    unrealizedPnl: 21316.51,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 44.36, unrealizedPnl: 8540.46, legPct: 0.658, delta: -0.462, iv: 0.578, spot: 536.38 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 24.33, unrealizedPnl: 8353.21, legPct: 0.774, delta: -0.352, iv: 0.748, spot: 329.23 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 230.63, unrealizedPnl: -4967.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 237.29, unrealizedPnl: 2590.93 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 193.66, unrealizedPnl: 2017.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 88.83, unrealizedPnl: 83.63 },
    ],
    note: "AMAT~536 单腿66%；COHR~329 单腿77%；DTE~46；布伦特~$101",
    brentPrice: 101.4,
    fearGreedIndex: null,
  },
  {
    id: "2026-10-03",
    capturedAt: "2026-10-03T02:43:00.000Z",
    source: "ibkr_live",
    nlv: 210589.84,
    cash: 151665.49,
    cashPct: 72.0,
    stockMv: 67112.8,
    unrealizedPnl: 21423.7,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 43.82, unrealizedPnl: 8593.88, legPct: 0.662, delta: -0.447, iv: 0.579, spot: 540.04 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 23.22, unrealizedPnl: 8464.77, legPct: 0.785, delta: -0.323, iv: 0.764, spot: 337.04 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 232.23, unrealizedPnl: -4807.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 234.22, unrealizedPnl: 2468.13 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 192.76, unrealizedPnl: 1927.86 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 88.2, unrealizedPnl: 79.32 },
    ],
    note: "CRDO 已于10/01买回@11.26，本腿已实现约+$3,082；AMAT 单腿66%；COHR 单腿78%；F&G~31 Fear",
    brentPrice: 102.7,
    fearGreedIndex: 31,
  },
  {
    id: "2026-10-01",
    capturedAt: "2026-10-01T08:11:00.000Z",
    source: "ibkr_live",
    nlv: 206212.18,
    cash: 153254.71,
    cashPct: 74.3,
    stockMv: 66592.32,
    unrealizedPnl: 20811.8,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 59.7, unrealizedPnl: 7006.13, legPct: 0.54, delta: -0.544, iv: 0.591, spot: 511.38 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 45.01, unrealizedPnl: 6285.16, legPct: 0.583, delta: -0.539, iv: 0.768, spot: 287.81 },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 14.25, unrealizedPnl: 2783.87, legPct: 0.661, delta: -0.33, iv: 0.769, spot: 194.79 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 231.05, unrealizedPnl: -4925.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 229.9, unrealizedPnl: 2295.33 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 191.0, unrealizedPnl: 1751.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 85.96, unrealizedPnl: 64.02 },
    ],
    note: "AMAT 单腿54%；当日稍后 CRDO 买回@11.26 已实现约+$3,082（本腿）",
  },
  {
    id: "2026-09-30",
    capturedAt: "2026-09-30T00:42:00.000Z",
    source: "ibkr_live",
    nlv: 205200.29,
    cash: 152968.44,
    cashPct: 74.5,
    stockMv: 66890.79,
    unrealizedPnl: 20172.56,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 61.49, unrealizedPnl: 6827.18, legPct: 0.526, delta: -0.536, iv: 0.612, spot: 512.01 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 42.78, unrealizedPnl: 6508.34, legPct: 0.603, delta: -0.517, iv: 0.761, spot: 292.21 },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 15.19, unrealizedPnl: 2689.43, legPct: 0.639, delta: -0.346, iv: 0.764, spot: 192.35 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 234.36, unrealizedPnl: -4594.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 228.16, unrealizedPnl: 2225.73 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 192.02, unrealizedPnl: 1853.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 86.5, unrealizedPnl: 67.71 },
    ],
  },
  {
    id: "2026-09-22",
    capturedAt: "2026-09-22T03:05:00.000Z",
    source: "ibkr_live",
    nlv: 203788.39,
    cash: 152739.4,
    cashPct: 74.9,
    stockMv: 68899.51,
    unrealizedPnl: 19129.73,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 92.15, unrealizedPnl: 3761.48, legPct: 0.29, delta: -0.685, iv: 0.593, spot: 464.24 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 34.32, unrealizedPnl: 7354.47, legPct: 0.682, delta: -0.384, iv: 0.807, spot: 321.52 },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 17.64, unrealizedPnl: 2444.9, legPct: 0.581, delta: -0.38, iv: 0.735, spot: 187.27 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 248.15, unrealizedPnl: -3215.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 227.5, unrealizedPnl: 2199.33 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 194.42, unrealizedPnl: 2093.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 93.25, unrealizedPnl: 113.82 },
    ],
  },
  {
    id: "2026-09-17",
    capturedAt: "2026-09-17T06:45:00.000Z",
    source: "ibkr_live",
    nlv: 195485.04,
    cash: 152649.19,
    cashPct: 78.1,
    stockMv: 68042.46,
    unrealizedPnl: 11000.14,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 131.41, unrealizedPnl: -164.65, legPct: -0.013, delta: -0.8, iv: 0.623, spot: 415.38 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 47.74, unrealizedPnl: 6012.18, legPct: 0.557, delta: -0.51, iv: 0.765, spot: 289.93 },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 30.45, unrealizedPnl: 1163.31, legPct: 0.276, delta: -0.57, iv: 0.73, spot: 161.49 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 249.8, unrealizedPnl: -3050.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 215.75, unrealizedPnl: 1729.33 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 191.84, unrealizedPnl: 1835.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 87.96, unrealizedPnl: 77.68 },
    ],
  },
  {
    id: "2026-09-08",
    capturedAt: "2026-09-08T15:11:00.000Z",
    source: "ibkr_live",
    nlv: 200135.92,
    cash: 151199.02,
    cashPct: 75.5,
    stockMv: 69253.75,
    unrealizedPnl: 17343.2,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 95.1, unrealizedPnl: 3466.31, legPct: 0.267, delta: -0.638, iv: 0.614, spot: 467.83 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 41.14, unrealizedPnl: 6672.66, legPct: 0.619, delta: -0.415, iv: 0.785, spot: 311.51 },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 25.25, unrealizedPnl: 1683.48, legPct: 0.4, delta: -0.442, iv: 0.773, spot: 176.83 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 255.56, unrealizedPnl: -2474.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 227.57, unrealizedPnl: 2202.26 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 194.96, unrealizedPnl: 2147.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 91.67, unrealizedPnl: 103.02 },
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
    putDelta: Object.fromEntries(h.shortPuts.map((p) => [p.underlying, p.delta ?? null])),
    putIv: Object.fromEntries(h.shortPuts.map((p) => [p.underlying, p.iv ?? null])),
    brentPrice: h.brentPrice ?? null,
    fearGreedIndex: h.fearGreedIndex ?? null,
    note: h.note,
    marketTrend: h.marketTrend ?? null,
  }));
}
