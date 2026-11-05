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

/** Snapshot 2026-11-05: IBKR live */
export const IBKR_SNAPSHOT: IbkrSnapshot = {
  updatedAt: "2026-11-05T15:59:00.000Z",
  source: "ibkr_live",
  positions: [
    {
      symbol: "AMAT",
      description: "AMAT Nov20'26 540 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 212.70,
      marketValue: -21270.10,
      averagePrice: 129.76,
      unrealizedPnl: -8294.15,
      dailyPnl: -4201.11,
      right: "P",
      strike: 540,
      expiry: "2026-11-20",
      underlying: "AMAT",
      delta: -0.999,
      iv: 1.00,
      spot: 327.49,
    },
    {
      symbol: "COHR",
      description: "COHR Nov20'26 310 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 146.26,
      marketValue: -14626.08,
      averagePrice: 107.87,
      unrealizedPnl: -3839.58,
      dailyPnl: -2957.82,
      right: "P",
      strike: 310,
      expiry: "2026-11-20",
      underlying: "COHR",
      delta: -1.0,
      iv: 1.10,
      spot: 163.81,
    },
    {
      symbol: "MCD",
      description: "MCD",
      assetClass: "STK",
      position: 100,
      marketPrice: 279.44,
      marketValue: 27944.00,
      averagePrice: 280.30,
      unrealizedPnl: -86.04,
      dailyPnl: -78.00,
    },
    {
      symbol: "NVDA",
      description: "NVDA",
      assetClass: "STK",
      position: 40,
      marketPrice: 183.86,
      marketValue: 7354.40,
      averagePrice: 172.52,
      unrealizedPnl: 453.73,
      dailyPnl: -650.80,
    },
    {
      symbol: "TTWO",
      description: "TTWO",
      assetClass: "STK",
      position: 10,
      marketPrice: 209.38,
      marketValue: 2093.80,
      averagePrice: 192.04,
      unrealizedPnl: 173.43,
      dailyPnl: 4.80,
    },
    {
      symbol: "VWRA",
      description: "VWRA @LSEETF",
      assetClass: "STK",
      position: 130,
      marketPrice: 185.38,
      marketValue: 24099.40,
      averagePrice: 177.32,
      unrealizedPnl: 1047.87,
      dailyPnl: -683.80,
    },
    {
      symbol: "IBKR",
      description: "IBKR",
      assetClass: "STK",
      position: 6.8302,
      marketPrice: 72.46,
      marketValue: 494.92,
      averagePrice: 76.59,
      unrealizedPnl: -28.18,
      dailyPnl: -37.02,
    },
  ],
  balances: {
    netLiquidation: 176476.94,
    cashBalance: 142799.41,
    stockMarketValue: 79142.72,
    unrealizedPnl: -13197.39,
    cashPct: 80.92,
    currency: "BASE",
  },
  sectors: [
    { name: "Cash", nav: 142799.41, weight: 0.8092, side: "long" },
    { name: "Consumer Cyclicals", nav: 27944.00, weight: 0.1583, side: "long" },
    { name: "Broad", nav: 24099.40, weight: 0.1366, side: "long" },
    { name: "Technology", nav: 9448.20, weight: 0.0535, side: "long" },
    { name: "Financials", nav: 494.92, weight: 0.0028, side: "long" },
    { name: "Technology (short options)", nav: -35896.18, weight: 1.0, side: "short" },
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
