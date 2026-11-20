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

/** Snapshot 2026-11-21: IBKR live */
export const IBKR_SNAPSHOT: IbkrSnapshot = {
  updatedAt: "2026-11-21T04:27:00.000Z",
  source: "ibkr_live",
  positions: [
    {
      symbol: "AMAT",
      description: "AMAT Nov20'26 540 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 228.93,
      marketValue: -22893.14,
      averagePrice: 129.76,
      unrealizedPnl: -9917.19,
      dailyPnl: -2786.14,
      right: "P",
      strike: 540,
      expiry: "2026-11-20",
      underlying: "AMAT",
      delta: -0.99,
      iv: 0.82,
      spot: 315.0,
    },
    {
      symbol: "COHR",
      description: "COHR",
      assetClass: "STK",
      position: 100,
      marketPrice: 187.01,
      marketValue: 18701.50,
      averagePrice: 202.13,
      unrealizedPnl: -1512.00,
      dailyPnl: -2792.50,
    },
    {
      symbol: "IBKR",
      description: "IBKR",
      assetClass: "STK",
      position: 6.8302,
      marketPrice: 72.79,
      marketValue: 497.17,
      averagePrice: 76.59,
      unrealizedPnl: -25.93,
      dailyPnl: -19.53,
    },
    {
      symbol: "MCD",
      description: "MCD",
      assetClass: "STK",
      position: 100,
      marketPrice: 275.51,
      marketValue: 27551.00,
      averagePrice: 280.30,
      unrealizedPnl: -479.04,
      dailyPnl: 316.00,
    },
    {
      symbol: "NVDA",
      description: "NVDA",
      assetClass: "STK",
      position: 40,
      marketPrice: 136.76,
      marketValue: 5470.37,
      averagePrice: 172.52,
      unrealizedPnl: -1430.30,
      dailyPnl: -368.83,
    },
    {
      symbol: "SMERY",
      description: "SMERY @PINK",
      assetClass: "STK",
      position: 100,
      marketPrice: 26.08,
      marketValue: 2608.00,
      averagePrice: 28.89,
      unrealizedPnl: -280.73,
      dailyPnl: -110.00,
    },
    {
      symbol: "VWRA",
      description: "VWRA @LSEETF",
      assetClass: "STK",
      position: 130,
      marketPrice: 175.30,
      marketValue: 22789.00,
      averagePrice: 177.32,
      unrealizedPnl: -262.53,
      dailyPnl: -733.20,
    },
  ],
  balances: {
    netLiquidation: 174074.32,
    cashBalance: 103454.48,
    stockMarketValue: 100019.25,
    unrealizedPnl: -18040.57,
    cashPct: 59.43,
    currency: "BASE",
  },
  sectors: [
    { name: "Cash", nav: 103454.48, weight: 0.5943, side: "long" },
    { name: "Consumer Cyclicals", nav: 27551.00, weight: 0.1583, side: "long" },
    { name: "Broad", nav: 22789.00, weight: 0.1309, side: "long" },
    { name: "Technology", nav: 24171.87, weight: 0.1389, side: "long" },
    { name: "Financials", nav: 497.17, weight: 0.0029, side: "long" },
    { name: "Other", nav: 2608.00, weight: 0.0150, side: "long" },
    { name: "Technology (short options)", nav: -22893.14, weight: 1.0, side: "short" },
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
    flags.push(`已有 ${shorts.length} 张空头 Put（主题偏集中）`);
  } else if (shorts.length <= 2) {
    flags.push(`空头 Put 仅 ${shorts.length} 张 — 主题额度有空位（仍建议等链级止盈后再开）`);
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
  } else if (shorts.length > 0) {
    flags.push("主止盈=链累计净权利金 50%：当前空头 Put 均未达链目标平仓价");
  }

  return { flags, limits, cashPct: balances.cashPct, nlv: balances.netLiquidation };
}
