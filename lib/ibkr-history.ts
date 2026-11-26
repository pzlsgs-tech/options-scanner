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
