/**
 * IBKR history entries (live snapshots)
 * Prepended with latest daily entry
 */

export type ShortPut = {
  underlying: string;
  strike: number;
  expiry: string;
  entry: number;
  mark: number;
  unrealizedPnl: number;
  legPct?: number;
  delta?: number;
  iv?: number;
  spot?: number;
};

export type CoveredCall = {
  underlying: string;
  strike: number;
  expiry: string;
  entry: number;
  mark: number;
  unrealizedPnl: number;
};

export type StockPos = {
  symbol: string;
  qty: number;
  avg: number;
  mark: number;
  unrealizedPnl: number;
};

export type IbkrHistoryEntry = {
  id: string;
  capturedAt: string;
  source: "ibkr_live";
  nlv: number;
  cash: number;
  cashPct: number;
  stockMv: number;
  unrealizedPnl: number;
  shortPuts: ShortPut[];
  coveredCalls: CoveredCall[];
  stocks: StockPos[];
  note?: string;
  brentPrice?: number;
  fearGreedIndex?: number;
  marketTrend?: string;
};

export const IBKR_HISTORY: IbkrHistoryEntry[] = [
  {
    id: "2026-11-27",
    capturedAt: "2026-11-27T00:08:00.000Z",
    source: "ibkr_live",
    nlv: 179388.33,
    cash: 26960.98,
    cashPct: 15.03,
    stockMv: 153790.42,
    unrealizedPnl: -12969.64,
    shortPuts: [
      {
        underlying: "NVDA",
        strike: 150,
        expiry: "2026-12-24",
        entry: 4.691531,
        mark: 12.2538004,
        unrealizedPnl: -756.22694,
        spot: 150.99,
        legPct: -161.2,
      },
    ],
    coveredCalls: [
      {
        underlying: "COHR",
        strike: 310,
        expiry: "2026-12-24",
        entry: 4.299551,
        mark: 0.716428,
        unrealizedPnl: 358.3123,
      },
    ],
    stocks: [
      { symbol: "AMAT", qty: 100, avg: 410.240465, mark: 312.0, unrealizedPnl: -9824.05 },
      { symbol: "COHR", qty: 100, avg: 202.134966, mark: 201.0, unrealizedPnl: -113.50 },
      { symbol: "IBKR", qty: 6.8302, avg: 76.58633715, mark: 74.74, unrealizedPnl: -12.61 },
      { symbol: "MCD", qty: 100, avg: 280.300363, mark: 283.5, unrealizedPnl: 319.96 },
      { symbol: "NVDA", qty: 60, avg: 160.83434, mark: 150.99, unrealizedPnl: -590.66 },
      { symbol: "SMERY", qty: 100, avg: 28.887306, mark: 25.78, unrealizedPnl: -310.73 },
      { symbol: "VWRA", qty: 150, avg: 177.01818133, mark: 179.38, unrealizedPnl: 354.27 },
    ],
    note: "Updated live 2026-11-27: NLV ~179.4k SGD; cash ~15%; short NVDA 150P Dec24 deep ITM loss ~-756; covered COHR 310C deep OTM profit +358; AMAT still deep drawdown -9.8k",
    marketTrend: "震荡",
  },
  {
    id: "2026-11-26",
    capturedAt: "2026-11-26T16:00:00.000Z",
    source: "ibkr_live",
    nlv: 179421.34,
    cash: 26958.73,
    cashPct: 15.03,
    stockMv: 153825.58,
    unrealizedPnl: -12912.66,
    shortPuts: [
      {
        underlying: "NVDA",
        strike: 150,
        expiry: "2026-12-24",
        entry: 4.691531,
        mark: 12.2538004,
        unrealizedPnl: -756.22694,
        spot: 151.22,
        legPct: -161.0,
      },
    ],
    coveredCalls: [
      {
        underlying: "COHR",
        strike: 310,
        expiry: "2026-12-24",
        entry: 4.299551,
        mark: 0.716428,
        unrealizedPnl: 358.3123,
      },
    ],
    stocks: [
      { symbol: "AMAT", qty: 100, avg: 410.240465, mark: 314.85, unrealizedPnl: -9539.05 },
      { symbol: "COHR", qty: 100, avg: 202.134966, mark: 202.42, unrealizedPnl: 28.50 },
      { symbol: "IBKR", qty: 6.8302, avg: 76.58633715, mark: 75.20, unrealizedPnl: -9.47 },
      { symbol: "MCD", qty: 100, avg: 280.300363, mark: 283.50, unrealizedPnl: 319.96 },
      { symbol: "NVDA", qty: 60, avg: 160.83434, mark: 151.22, unrealizedPnl: -576.86 },
      { symbol: "SMERY", qty: 100, avg: 28.887306, mark: 25.78, unrealizedPnl: -310.73 },
      { symbol: "VWRA", qty: 150, avg: 177.01818133, mark: 179.62, unrealizedPnl: 390.27 },
    ],
    note: "Updated live: NLV ~179.4k SGD; cash ~15%; short NVDA 150P Dec24 deep ITM loss; covered COHR 310C deep OTM profit; AMAT still deep drawdown",
    brentPrice: 91.34,
    fearGreedIndex: 15,
    marketTrend: "震荡/极度恐慌",
  },
  {
    id: "2026-11-26",
    capturedAt: "2026-11-26T00:09:00.000Z",
    source: "ibkr_live",
    nlv: 177613.44,
    cash: 26947.05,
    cashPct: 15.17,
    stockMv: 152032.08,
    unrealizedPnl: -14643.7,
    shortPuts: [
      {
        underlying: "NVDA",
        strike: 150,
        expiry: "2026-12-24",
        entry: 4.691531,
        mark: 12.2537813,
        unrealizedPnl: -756.22503,
        spot: 150.91,
      },
    ],
    coveredCalls: [
      {
        underlying: "COHR",
        strike: 310,
        expiry: "2026-12-24",
        entry: 4.299551,
        mark: 0.71642775,
        unrealizedPnl: 358.312325,
      },
    ],
    stocks: [
      { symbol: "AMAT", qty: 100, avg: 410.240465, mark: 312.1661072, unrealizedPnl: -9807.43578 },
      { symbol: "COHR", qty: 100, avg: 202.134966, mark: 200.7899933, unrealizedPnl: -134.49727 },
      { symbol: "IBKR", qty: 6.8302, avg: 76.58633715, mark: 75.0, unrealizedPnl: -10.835 },
      { symbol: "MCD", qty: 100, avg: 280.300363, mark: 284.0, unrealizedPnl: 369.9637 },
      { symbol: "NVDA", qty: 60, avg: 160.83434, mark: 150.91000365, unrealizedPnl: -595.460181 },
      { symbol: "SMERY", qty: 100, avg: 28.887306, mark: 25.7800007, unrealizedPnl: -310.73053 },
      { symbol: "VWRA", qty: 150, avg: 177.01818133, mark: 174.0, unrealizedPnl: -452.7272 },
    ],
    note: "NLV ~177.6k SGD; cash ~15%; short NVDA 150P Dec24 ITM-ish; covered COHR 310C OTM deep; AMAT deep drawdown",
    marketTrend: "震荡",
  },
  // Previous entries were PLACEHOLDER; historical archive available in ibkr-history-archive.ts
];
