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
  /** Put/Call delta（卖方仓位仍存合约希腊字母，如 Put 约 -0.5） */
  delta?: number | null;
  /** 年化 IV，0.59 = 59% */
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

/** Snapshot captured 2026-08-28 from live IBKR + BS greeks */
export const IBKR_SNAPSHOT: IbkrSnapshot = {
  updatedAt: "2026-08-28T03:10:00.000Z",
  source: "ibkr_live",
  positions: [
    {
      symbol: "AMAT",
      description: "AMAT Nov20'26 540 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 87.388,
      marketValue: -8738.78,
      averagePrice: 129.759535,
      unrealizedPnl: 4237.17,
      dailyPnl: 319.61,
      right: "P",
      strike: 540,
      expiry: "2026-11-20",
      underlying: "AMAT",
      delta: -0.587,
      iv: 0.59,
      spot: 482.36,
    },
    {
      symbol: "COHR",
      description: "COHR Nov20'26 310 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 50.993,
      marketValue: -5099.26,
      averagePrice: 107.865034,
      unrealizedPnl: 5687.25,
      dailyPnl: 257.96,
      right: "P",
      strike: 310,
      expiry: "2026-11-20",
      underlying: "COHR",
      delta: -0.466,
      iv: 0.781,
      spot: 295.39,
    },
    {
      symbol: "CRDO",
      description: "CRDO Nov20'26 180 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 11.909,
      marketValue: -1190.85,
      averagePrice: 42.086511,
      unrealizedPnl: 3017.8,
      dailyPnl: 347.54,
      right: "P",
      strike: 180,
      expiry: "2026-11-20",
      underlying: "CRDO",
      delta: -0.178,
      iv: 0.867,
      spot: 240.24,
    },
    {
      symbol: "GDX",
      description: "GDX Sep04'26 87 CALL @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 16.939,
      marketValue: -1693.91,
      averagePrice: 2.05351,
      unrealizedPnl: -1488.55,
      dailyPnl: -125.52,
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
      marketPrice: 0.051,
      marketValue: -5.11,
      averagePrice: 3.488623,
      unrealizedPnl: 343.75,
      dailyPnl: 7.04,
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
      marketPrice: 103.18,
      marketValue: 10318.0,
      averagePrice: 87.308467,
      unrealizedPnl: 1587.15,
      dailyPnl: -51.0,
    },
    {
      symbol: "MCD",
      description: "MCD",
      assetClass: "STK",
      position: 100,
      marketPrice: 261.51,
      marketValue: 26151.0,
      averagePrice: 280.300363,
      unrealizedPnl: -1879.04,
      dailyPnl: 145.0,
    },
    {
      symbol: "NVDA",
      description: "NVDA",
      assetClass: "STK",
      position: 40,
      marketPrice: 226.67,
      marketValue: 9066.8,
      averagePrice: 172.516855,
      unrealizedPnl: 2166.13,
      dailyPnl: -52.4,
    },
    {
      symbol: "VWRA",
      description: "VWRA @LSEETF",
      assetClass: "STK",
      position: 100,
      marketPrice: 194.76,
      marketValue: 19476.0,
      averagePrice: 173.483392,
      unrealizedPnl: 2127.66,
      dailyPnl: 0.0,
    },
    {
      symbol: "IBKR",
      description: "IBKR",
      assetClass: "STK",
      position: 6.262,
      marketPrice: 96.55,
      marketValue: 604.6,
      averagePrice: 75.13094858,
      unrealizedPnl: 134.13,
      dailyPnl: 0.0,
    },
  ],
  balances: {
    netLiquidation: 182323.64,
    cashBalance: 120492.52,
    stockMarketValue: 83322.0,
    unrealizedPnl: 19753.26,
    cashPct: 66.1,
    currency: "BASE",
  },
  sectors: [
    { name: "Cash", nav: 120492.52, weight: 0.661, side: "long" },
    { name: "Consumer Cyclicals", nav: 26151.0, weight: 0.143, side: "long" },
    { name: "Broad", nav: 19476.0, weight: 0.107, side: "long" },
    { name: "Technology", nav: 9066.8, weight: 0.05, side: "long" },
    { name: "Basic Materials", nav: 10318.0, weight: 0.057, side: "long" },
    { name: "Financials", nav: 604.6, weight: 0.003, side: "long" },
    { name: "Technology (short options)", nav: -15028.89, weight: 1.0, side: "short" },
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

  return { flags, limits, cashPct: balances.cashPct, nlv: balances.netLiquidation };
}
