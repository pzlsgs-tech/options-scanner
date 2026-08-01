/**
 * IBKR portfolio snapshot for Layers 5 & 6.
 * Updated from live IBKR via Grok connected tools.
 * Vercel cannot call IBKR MCP directly — refresh this file (or POST /api/portfolio)
 * when positions change. Structure matches IBKR get_account_positions + balances.
 */

export type IbkrPosition = {
  symbol: string;
  description: string;
  assetClass: "STK" | "OPT";
  position: number;
  marketPrice: number;
  marketValue: number;
  averagePrice: number;
  unrealizedPnl: number;
  dailyPnl: number;
  // option fields
  right?: "P" | "C";
  strike?: number;
  expiry?: string; // YYYY-MM-DD
  underlying?: string;
};

export type IbkrBalances = {
  netLiquidation: number;
  cashBalance: number;
  stockMarketValue: number;
  unrealizedPnl: number;
  cashPct: number;
  currency: string;
};

export type IbkrSectorAlloc = {
  name: string;
  nav: number;
  weight: number; // 0-1 long side
  side: "long" | "short";
};

export type IbkrSnapshot = {
  updatedAt: string;
  source: "ibkr_live" | "manual";
  positions: IbkrPosition[];
  balances: IbkrBalances;
  sectors: IbkrSectorAlloc[];
};

/** Parse "AMAT Nov20'26 540 PUT @AMEX" style descriptions */
export function parseOptionDescription(desc: string): {
  underlying: string;
  right: "P" | "C";
  strike: number;
  expiry: string;
} | null {
  // e.g. AMAT Nov20'26 540 PUT @AMEX | MCD Sep04'26 285 CALL @AMEX
  const m = desc.match(
    /^([A-Z.]+)\s+([A-Za-z]{3})(\d{1,2})'(\d{2})\s+(\d+(?:\.\d+)?)\s+(PUT|CALL)/i
  );
  if (!m) return null;
  const months: Record<string, string> = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
  };
  const mon = months[m[2]] || "01";
  const day = m[3].padStart(2, "0");
  const year = `20${m[4]}`;
  return {
    underlying: m[1].toUpperCase(),
    right: m[6].toUpperCase().startsWith("P") ? "P" : "C",
    strike: Number(m[5]),
    expiry: `${year}-${mon}-${day}`,
  };
}

function daysToExpiry(expiry: string): number {
  const t = Date.parse(expiry + "T21:00:00Z");
  if (Number.isNaN(t)) return 90;
  return Math.max(0, Math.round((t - Date.now()) / 86400000));
}

/** Snapshot captured 2026-08-01 from live IBKR */
export const IBKR_SNAPSHOT: IbkrSnapshot = {
  updatedAt: "2026-08-01T03:30:00.000Z",
  source: "ibkr_live",
  positions: [
    {
      symbol: "AMAT",
      description: "AMAT Nov20'26 540 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 103.88,
      marketValue: -10388.21,
      averagePrice: 129.76,
      unrealizedPnl: 2587.74,
      dailyPnl: 316.18,
      right: "P",
      strike: 540,
      expiry: "2026-11-20",
      underlying: "AMAT",
    },
    {
      symbol: "COHR",
      description: "COHR Nov20'26 310 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 84.3,
      marketValue: -8429.84,
      averagePrice: 107.87,
      unrealizedPnl: 2356.66,
      dailyPnl: 793.64,
      right: "P",
      strike: 310,
      expiry: "2026-11-20",
      underlying: "COHR",
    },
    {
      symbol: "CRDO",
      description: "CRDO Nov20'26 180 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 32.76,
      marketValue: -3275.93,
      averagePrice: 42.09,
      unrealizedPnl: 932.72,
      dailyPnl: 235.97,
      right: "P",
      strike: 180,
      expiry: "2026-11-20",
      underlying: "CRDO",
    },
    {
      symbol: "MCD",
      description: "MCD Sep04'26 285 CALL @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 3.43,
      marketValue: -342.97,
      averagePrice: 3.49,
      unrealizedPnl: 5.89,
      dailyPnl: 5.89,
      right: "C",
      strike: 285,
      expiry: "2026-09-04",
      underlying: "MCD",
    },
    {
      symbol: "GDX",
      description: "GDX",
      assetClass: "STK",
      position: 100,
      marketPrice: 74.1,
      marketValue: 7410.0,
      averagePrice: 87.31,
      unrealizedPnl: -1320.85,
      dailyPnl: -268.0,
    },
    {
      symbol: "MCD",
      description: "MCD",
      assetClass: "STK",
      position: 100,
      marketPrice: 270.64,
      marketValue: 27064.0,
      averagePrice: 280.3,
      unrealizedPnl: -966.03,
      dailyPnl: 220.0,
    },
    {
      symbol: "NVDA",
      description: "NVDA",
      assetClass: "STK",
      position: 40,
      marketPrice: 198.95,
      marketValue: 7958.0,
      averagePrice: 172.52,
      unrealizedPnl: 1057.33,
      dailyPnl: 156.4,
    },
    {
      symbol: "VWRA",
      description: "VWRA @LSEETF",
      assetClass: "STK",
      position: 100,
      marketPrice: 187.42,
      marketValue: 18742.0,
      averagePrice: 173.48,
      unrealizedPnl: 1393.66,
      dailyPnl: 74.0,
    },
    {
      symbol: "IBKR",
      description: "IBKR",
      assetClass: "STK",
      position: 4.7808,
      marketPrice: 87.53,
      marketValue: 418.47,
      averagePrice: 71.22,
      unrealizedPnl: 77.98,
      dailyPnl: -14.1,
    },
  ],
  balances: {
    netLiquidation: 121129.26,
    cashBalance: 71230.26,
    stockMarketValue: 78983.26,
    unrealizedPnl: 7426.56,
    cashPct: 58.8, // cash / NLV
    currency: "BASE",
  },
  sectors: [
    { name: "Cash", nav: 55295.56, weight: 0.474, side: "long" },
    { name: "Consumer Cyclicals", nav: 26844.0, weight: 0.23, side: "long" },
    { name: "Broad", nav: 18668.0, weight: 0.16, side: "long" },
    { name: "Technology", nav: 7801.6, weight: 0.067, side: "long" },
    { name: "Basic Materials", nav: 7678.0, weight: 0.066, side: "long" },
    { name: "Financials", nav: 432.57, weight: 0.004, side: "long" },
    { name: "Technology (short options)", nav: -23439.77, weight: 1.0, side: "short" },
  ],
};

export function getHeldSymbols(snapshot: IbkrSnapshot = IBKR_SNAPSHOT): string[] {
  const set = new Set<string>();
  for (const p of snapshot.positions) {
    if (p.assetClass === "STK") set.add(p.symbol);
    if (p.assetClass === "OPT" && p.underlying) set.add(p.underlying);
    else if (p.assetClass === "OPT") set.add(p.symbol);
  }
  return Array.from(set);
}

export function getShortPuts(snapshot: IbkrSnapshot = IBKR_SNAPSHOT) {
  return snapshot.positions
    .filter((p) => p.assetClass === "OPT" && p.right === "P" && p.position < 0)
    .map((p) => ({
      ...p,
      underlying: p.underlying || p.symbol,
      dte: p.expiry ? daysToExpiry(p.expiry) : 90,
      // profit fraction vs credit received (avg price is entry premium)
      profitPctOfCredit:
        p.averagePrice > 0 ? p.unrealizedPnl / (Math.abs(p.averagePrice) * 100 * Math.abs(p.position)) : 0,
      // how much of max premium is still left (current / entry)
      remainingPremiumRatio:
        p.averagePrice > 0 ? p.marketPrice / p.averagePrice : 1,
    }));
}

export function getCoveredCalls(snapshot: IbkrSnapshot = IBKR_SNAPSHOT) {
  return snapshot.positions.filter(
    (p) => p.assetClass === "OPT" && p.right === "C" && p.position < 0
  );
}

export function getStockPositions(snapshot: IbkrSnapshot = IBKR_SNAPSHOT) {
  return snapshot.positions.filter((p) => p.assetClass === "STK");
}

export function portfolioRiskFlags(snapshot: IbkrSnapshot = IBKR_SNAPSHOT) {
  const flags: string[] = [];
  const { balances, sectors } = snapshot;
  const limits = { maxSectorPct: 30, maxSinglePct: 15, minCashPct: 40 };

  if (balances.cashPct < limits.minCashPct) {
    flags.push(`现金占比 ${balances.cashPct.toFixed(1)}% < 目标 ${limits.minCashPct}%`);
  }

  for (const s of sectors.filter((x) => x.side === "long" && x.name !== "Cash")) {
    if (s.weight * 100 > limits.maxSectorPct) {
      flags.push(`行业 ${s.name} 占比 ${(s.weight * 100).toFixed(1)}% > ${limits.maxSectorPct}%`);
    }
  }

  const shortTech = sectors.find((s) => s.side === "short" && s.name.includes("Technology"));
  if (shortTech) {
    flags.push(`空头期权集中在 Technology，名义约 $${Math.abs(shortTech.nav).toFixed(0)}`);
  }

  const shorts = getShortPuts(snapshot);
  if (shorts.length >= 3) {
    flags.push(`已有 ${shorts.length} 张空头 Put（AMAT/COHR/CRDO 同属科技/半导主题）`);
  }

  return { flags, limits, cashPct: balances.cashPct, nlv: balances.netLiquidation };
}
