/**
 * IBKR portfolio snapshot for Layers 5 & 6.
 * Updated from live IBKR via Grok connected tools.
 */

import { ACCOUNT_RULES } from "./rules";
import { computeChainTakeProfit } from "./chain";

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
  delta?: number | null;
  iv?: number | null;
  spot?: number | null;
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

/** Snapshot 2026-09-25 from live IBKR + BS greeks */
export const IBKR_SNAPSHOT: IbkrSnapshot = {
  updatedAt: "2026-09-25T14:48:00.000Z",
  source: "ibkr_live",
  positions: [
    {
      symbol: "AMAT",
      description: "AMAT Nov20'26 540 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 80.354,
      marketValue: -8035.37,
      averagePrice: 129.759535,
      unrealizedPnl: 4940.58,
      dailyPnl: 451.43,
      right: "P",
      strike: 540,
      expiry: "2026-11-20",
      underlying: "AMAT",
      delta: -0.639,
      iv: 0.594,
      spot: 480.53,
    },
    {
      symbol: "COHR",
      description: "COHR Nov20'26 310 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 42.787,
      marketValue: -4278.74,
      averagePrice: 107.865034,
      unrealizedPnl: 6507.76,
      dailyPnl: 223.31,
      right: "P",
      strike: 310,
      expiry: "2026-11-20",
      underlying: "COHR",
      delta: -0.505,
      iv: 0.751,
      spot: 293.85,
    },
    {
      symbol: "CRDO",
      description: "CRDO Nov20'26 180 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 11.646,
      marketValue: -1164.64,
      averagePrice: 42.086511,
      unrealizedPnl: 3044.01,
      dailyPnl: 278.3,
      right: "P",
      strike: 180,
      expiry: "2026-11-20",
      underlying: "CRDO",
      delta: -0.273,
      iv: 0.74,
      spot: 204.29,
    },
    {
      symbol: "MCD",
      description: "MCD",
      assetClass: "STK",
      position: 100,
      marketPrice: 236.6,
      marketValue: 23660.4,
      averagePrice: 280.300363,
      unrealizedPnl: -4369.64,
      dailyPnl: -41.6,
    },
    {
      symbol: "NVDA",
      description: "NVDA",
      assetClass: "STK",
      position: 40,
      marketPrice: 223.4,
      marketValue: 8935.8,
      averagePrice: 172.516855,
      unrealizedPnl: 2035.13,
      dailyPnl: -47.4,
    },
    {
      symbol: "VWRA",
      description: "VWRA @LSEETF",
      assetClass: "STK",
      position: 100,
      marketPrice: 193.26,
      marketValue: 19326.0,
      averagePrice: 173.483392,
      unrealizedPnl: 1977.66,
      dailyPnl: 134.0,
    },
    {
      symbol: "IBKR",
      description: "IBKR",
      assetClass: "STK",
      position: 6.8302,
      marketPrice: 88.65,
      marketValue: 605.5,
      averagePrice: 76.58633715,
      unrealizedPnl: 82.4,
      dailyPnl: -7.99,
    },
  ],
  balances: {
    netLiquidation: 203000.43,
    cashBalance: 152958.31,
    stockMarketValue: 67139.64,
    unrealizedPnl: 18037.61,
    cashPct: 75.3,
    currency: "BASE",
  },
  sectors: [
    { name: "Cash", nav: 152958.31, weight: 0.753, side: "long" },
    { name: "Consumer Cyclicals", nav: 23660.4, weight: 0.117, side: "long" },
    { name: "Broad", nav: 19326.0, weight: 0.095, side: "long" },
    { name: "Technology", nav: 8935.8, weight: 0.044, side: "long" },
    { name: "Financials", nav: 605.5, weight: 0.003, side: "long" },
    { name: "Technology (short options)", nav: -13478.75, weight: 1.0, side: "short" },
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

  const chainHits: string[] = [];
  for (const p of shorts) {
    const chain = computeChainTakeProfit({
      underlying: p.underlying,
      currentPremium: p.marketPrice,
      position: p.position,
    });
    if (chain?.takeProfitHit) chainHits.push(p.underlying);
  }
  if (chainHits.length > 0) {
    flags.push(`链级止盈：${chainHits.join(", ")} 已达链累计净权利金 ${ACCOUNT_RULES.takeProfitPctOfChainNet}%`);
  } else {
    flags.push("主止盈=链累计净权利金50%：当前三张均未达链目标平仓价");
  }

  const crdo = shorts.find((p) => p.underlying === "CRDO");
  if (crdo && crdo.marketPrice <= 12) {
    flags.push("CRDO mark ~11.6，接近链级目标约$8.9 — 可开始留意");
  }

  return { flags, limits, cashPct: balances.cashPct, nlv: balances.netLiquidation };
}
