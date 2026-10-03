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
    note: "CRDO 已于10/01买回@11.26，本腿已实现约+$3,082；AMAT~ATM 单腿66%；COHR 单腿78%；NLV $211k；布伦特~$103；F&G~31 Fear",
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
    id: "2026-09-27",
    capturedAt: "2026-09-27T03:44:00.000Z",
    source: "ibkr_live",
    nlv: 203953.66,
    cash: 152914.48,
    cashPct: 75.0,
    stockMv: 67235.4,
    unrealizedPnl: 19030.68,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 76.58, unrealizedPnl: 5318.45, legPct: 0.41, delta: -0.629, iv: 0.588, spot: 485.0 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 42.33, unrealizedPnl: 6553.86, legPct: 0.608, delta: -0.494, iv: 0.773, spot: 295.83 },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 10.64, unrealizedPnl: 3144.67, legPct: 0.747, delta: -0.242, iv: 0.777, spot: 210.97 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 236.6, unrealizedPnl: -4370.14 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 225.0, unrealizedPnl: 2099.25 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 193.52, unrealizedPnl: 2003.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 89.24, unrealizedPnl: 86.43 },
    ],
  },
  {
    id: "2026-09-25",
    capturedAt: "2026-09-25T14:48:00.000Z",
    source: "ibkr_live",
    nlv: 203000.43,
    cash: 152958.31,
    cashPct: 75.3,
    stockMv: 67139.64,
    unrealizedPnl: 18037.61,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 80.35, unrealizedPnl: 4940.58, legPct: 0.381, delta: -0.639, iv: 0.594, spot: 480.53 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 42.79, unrealizedPnl: 6507.76, legPct: 0.603, delta: -0.505, iv: 0.751, spot: 293.85 },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 11.65, unrealizedPnl: 3044.01, legPct: 0.723, delta: -0.273, iv: 0.74, spot: 204.29 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 236.6, unrealizedPnl: -4369.64 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 223.4, unrealizedPnl: 2035.13 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 193.26, unrealizedPnl: 1977.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 88.65, unrealizedPnl: 82.4 },
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
    id: "2026-09-14",
    capturedAt: "2026-09-14T15:11:00.000Z",
    source: "ibkr_live",
    nlv: 192758.34,
    cash: 151968.75,
    cashPct: 78.8,
    stockMv: 68628.23,
    unrealizedPnl: 8955.74,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 122.93, unrealizedPnl: 682.64, legPct: 0.053, delta: -0.778, iv: 0.601, spot: 425.33 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 60.55, unrealizedPnl: 4731.61, legPct: 0.439, delta: -0.578, iv: 0.803, spot: 270.87 },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 37.26, unrealizedPnl: 482.89, legPct: 0.115, delta: -0.651, iv: 0.727, spot: 150.74 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 257.97, unrealizedPnl: -2233.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 210.76, unrealizedPnl: 1529.93 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 191.42, unrealizedPnl: 1793.66 },
      { symbol: "IBKR", qty: 6.83, avg: 76.59, mark: 89.37, unrealizedPnl: 87.31 },
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
    id: "2026-09-06",
    capturedAt: "2026-09-06T04:06:00.000Z",
    source: "ibkr_live",
    nlv: 197525.35,
    cash: 151428.13,
    cashPct: 76.7,
    stockMv: 69503.97,
    unrealizedPnl: 14518.14,
    shortPuts: [
      { underlying: "AMAT", strike: 540, expiry: "2026-11-20", entry: 129.76, mark: 103.29, unrealizedPnl: 2646.75, legPct: 0.204, delta: -0.678, iv: 0.6, spot: 454.71 },
      { underlying: "COHR", strike: 310, expiry: "2026-11-20", entry: 107.87, mark: 54.9, unrealizedPnl: 5297.0, legPct: 0.491, delta: -0.529, iv: 0.769, spot: 281.86 },
      { underlying: "CRDO", strike: 180, expiry: "2026-11-20", entry: 42.09, mark: 27.85, unrealizedPnl: 1424.0, legPct: 0.338, delta: -0.484, iv: 0.752, spot: 170.57 },
    ],
    coveredCalls: [],
    stocks: [
      { symbol: "MCD", qty: 100, avg: 280.3, mark: 256.0, unrealizedPnl: -2430.04 },
      { symbol: "NVDA", qty: 40, avg: 172.52, mark: 229.49, unrealizedPnl: 2278.81 },
      { symbol: "VWRA", qty: 100, avg: 173.48, mark: 195.06, unrealizedPnl: 2157.66 },
      { symbol: "IBKR", qty: 6.262, avg: 75.13, mark: 92.65, unrealizedPnl: 109.7 },
    ],
  },
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
  }));
}
