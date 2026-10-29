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

/** Snapshot 2026-10-29: IBKR live */
export const IBKR_SNAPSHOT: IbkrSnapshot = {
  updatedAt: "2026-10-29T10:01:00.000Z",
  source: "ibkr_live",
  positions: [
    {
      symbol: "AMAT",
      description: "AMAT Nov20'26 540 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 125.31,
      marketValue: -12530.90,
      averagePrice: 129.76,
      unrealizedPnl: 445.05,
      dailyPnl: -13.37,
      right: "P",
      strike: 540,
      expiry: "2026-11-20",
      underlying: "AMAT",
      delta: -0.91,
      iv: 0.72,
      spot: 416.0,
    },
    {
      symbol: "COHR",
      description: "COHR Nov20'26 310 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 72.89,
      marketValue: -7288.74,
      averagePrice: 107.87,
      unrealizedPnl: 3497.76,
      dailyPnl: 69.89,
      right: "P",
      strike: 310,
      expiry: "2026-11-20",
      underlying: "COHR",
      delta: -0.86,
      iv: 0.87,
      spot: 239.59,
    },
    {
      symbol: "MRNA",
      description: "MRNA Nov20'26 220 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 21.83,
      marketValue: -2182.75,
      averagePrice: 18.36,
      unrealizedPnl: -346.93,
      dailyPnl: 2.97,
      right: "P",
      strike: 220,
      expiry: "2026-11-20",
      underlying: "MRNA",
      delta: -0.50,
      iv: 0.90,
      spot: 214.17,
    },
    {
      symbol: "MCD",
      description: "MCD",
      assetClass: "STK",
      position: 100,
      marketPrice: 253.16,
      marketValue: 25316.00,
      averagePrice: 280.30,
      unrealizedPnl: -2714.04,
      dailyPnl: 266.00,
    },
    {
      symbol: "NVDA",
      description: "NVDA",
      assetClass: "STK",
      position: 40,
      marketPrice: 213.95,
      marketValue: 8558.00,
      averagePrice: 172.52,
      unrealizedPnl: 1657.33,
      dailyPnl: -57.20,
    },
    {
      symbol: "VWRA",
      description: "VWRA @LSEETF",
      assetClass: "STK",
      position: 130,
      marketPrice: 191.58,
      marketValue: 24905.40,
      averagePrice: 177.32,
      unrealizedPnl: 1853.87,
      dailyPnl: -7.80,
    },
    {
      symbol: "IBKR",
      description: "IBKR",
      assetClass: "STK",
      position: 6.8302,
      marketPrice: 83.45,
      marketValue: 569.98,
      averagePrice: 76.59,
      unrealizedPnl: 46.88,
      dailyPnl: -0.61,
    },
  ],
  balances: {
    netLiquidation: 194363.92,
    cashBalance: 147332.58,
    stockMarketValue: 76013.39,
    unrealizedPnl: 4517.1,
    cashPct: 75.80,
    currency: "BASE",
  },
  sectors: [
    { name: "Cash", nav: 147332.58, weight: 0.7580, side: "long" },
    { name: "Consumer Cyclicals", nav: 25316.00, weight: 0.1302, side: "long" },
    { name: "Broad", nav: 24905.40, weight: 0.1281, side: "long" },
    { name: "Technology", nav: 8558.00, weight: 0.0440, side: "long" },
    { name: "Financials", nav: 569.98, weight: 0.0029, side: "long" },
    { name: "Technology (short options)", nav: -19819.64, weight: 1.0, side: "short" },
    { name: "Healthcare (short options)", nav: -2182.75, weight: 1.0, side: "short" },
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
    flags.push(`已有 ${shorts.length} 张空头 Put（科技/半导/医疗主题偏集中）`);
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
