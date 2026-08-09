/**
 * IBKR portfolio snapshot for Layers 5 & 6.
 * Updated from live IBKR via Grok connected tools.
 */

import { ACCOUNT_RULES } from "./rules";

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
  right?: "P" | "C";
  strike?: number;
  expiry?: string;
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
  weight: number;
  side: "long" | "short";
};

export type IbkrSnapshot = {
  updatedAt: string;
  source: "ibkr_live" | "manual";
  positions: IbkrPosition[];
  balances: IbkrBalances;
  sectors: IbkrSectorAlloc[];
};

export function parseOptionDescription(desc: string): {
  underlying: string;
  right: "P" | "C";
  strike: number;
  expiry: string;
} | null {
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

/** Snapshot captured 2026-08-09 from live IBKR */
export const IBKR_SNAPSHOT: IbkrSnapshot = {
  updatedAt: "2026-08-09T05:00:00.000Z",
  source: "ibkr_live",
  positions: [
    {
      symbol: "AMAT",
      description: "AMAT Nov20'26 540 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 81.4756,
      marketValue: -8147.56,
      averagePrice: 129.759535,
      unrealizedPnl: 4828.39,
      dailyPnl: 829.04,
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
      marketPrice: 39.9615,
      marketValue: -3996.15,
      averagePrice: 107.865034,
      unrealizedPnl: 6790.35,
      dailyPnl: 1368.86,
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
      marketPrice: 19.1754,
      marketValue: -1917.54,
      averagePrice: 42.086511,
      unrealizedPnl: 2291.11,
      dailyPnl: 461.78,
      right: "P",
      strike: 180,
      expiry: "2026-11-20",
      underlying: "CRDO",
    },
    {
      symbol: "GDX",
      description: "GDX Sep04'26 87 CALL @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 5.9518,
      marketValue: -595.18,
      averagePrice: 2.05351,
      unrealizedPnl: -389.83,
      dailyPnl: -319.92,
      right: "C",
      strike: 87,
      expiry: "2026-09-04",
      underlying: "GDX",
    },
    {
      symbol: "MCD",
      description: "MCD Sep04'26 285 CALL @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 2.4762,
      marketValue: -247.62,
      averagePrice: 3.488623,
      unrealizedPnl: 101.24,
      dailyPnl: 107.41,
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
      marketPrice: 90.5676,
      marketValue: 9056.76,
      averagePrice: 87.308467,
      unrealizedPnl: 325.91,
      dailyPnl: 664.76,
    },
    {
      symbol: "MCD",
      description: "MCD",
      assetClass: "STK",
      position: 100,
      marketPrice: 274.48,
      marketValue: 27448.0,
      averagePrice: 280.300363,
      unrealizedPnl: -582.04,
      dailyPnl: -178.0,
    },
    {
      symbol: "NVDA",
      description: "NVDA",
      assetClass: "STK",
      position: 40,
      marketPrice: 223.8,
      marketValue: 8952.0,
      averagePrice: 172.516855,
      unrealizedPnl: 2051.33,
      dailyPnl: 192.4,
    },
    {
      symbol: "VWRA",
      description: "VWRA @LSEETF",
      assetClass: "STK",
      position: 100,
      marketPrice: 194.64,
      marketValue: 19464.0,
      averagePrice: 173.483392,
      unrealizedPnl: 2115.66,
      dailyPnl: 130.0,
    },
    {
      symbol: "IBKR",
      description: "IBKR",
      assetClass: "STK",
      position: 6.262,
      marketPrice: 87.75,
      marketValue: 549.49,
      averagePrice: 75.13094858,
      unrealizedPnl: 79.02,
      dailyPnl: 10.83,
    },
  ],
  balances: {
    netLiquidation: 186215.55,
    cashBalance: 121233.06,
    stockMarketValue: 83723.49,
    unrealizedPnl: 22824.93,
    cashPct: 65.1,
    currency: "BASE",
  },
  sectors: [
    { name: "Cash", nav: 121233.06, weight: 0.651, side: "long" },
    { name: "Consumer Cyclicals", nav: 27448.0, weight: 0.147, side: "long" },
    { name: "Broad", nav: 19464.0, weight: 0.105, side: "long" },
    { name: "Technology", nav: 8952.0, weight: 0.048, side: "long" },
    { name: "Basic Materials", nav: 9056.76, weight: 0.049, side: "long" },
    { name: "Financials", nav: 549.49, weight: 0.003, side: "long" },
    { name: "Technology (short options)", nav: -14061.26, weight: 1.0, side: "short" },
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
      profitPctOfCredit:
        p.averagePrice > 0
          ? p.unrealizedPnl / (Math.abs(p.averagePrice) * 100 * Math.abs(p.position))
          : 0,
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
  const limits = {
    maxSectorPct: ACCOUNT_RULES.maxSectorPct,
    maxSinglePct: ACCOUNT_RULES.maxSingleMarginPct,
    minCashPct: ACCOUNT_RULES.minCashPct,
  };

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
    flags.push(`已有 ${shorts.length} 张空头 Put（科技/半导主题偏集中）`);
  }

  const aboveTp = shorts.filter((p) => p.profitPctOfCredit >= ACCOUNT_RULES.takeProfitPctOfCredit / 100);
  if (aboveTp.length > 0) {
    flags.push(
      `止盈提示：${aboveTp.map((p) => p.underlying).join(", ")} 浮盈≥${ACCOUNT_RULES.takeProfitPctOfCredit}% 权利金，可优先买回`
    );
  }

  return { flags, limits, cashPct: balances.cashPct, nlv: balances.netLiquidation };
}
