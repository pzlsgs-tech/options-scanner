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

/** Snapshot 2026-09-14 from live IBKR + BS greeks */
export const IBKR_SNAPSHOT: IbkrSnapshot = {
  updatedAt: "2026-09-14T15:11:00.000Z",
  source: "ibkr_live",
  positions: [
    {
      symbol: "AMAT",
      description: "AMAT Nov20'26 540 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 122.933,
      marketValue: -12293.31,
      averagePrice: 129.759535,
      unrealizedPnl: 682.64,
      dailyPnl: -2393.93,
      right: "P",
      strike: 540,
      expiry: "2026-11-20",
      underlying: "AMAT",
      delta: -0.778,
      iv: 0.601,
      spot: 425.33,
    },
    {
      symbol: "COHR",
      description: "COHR Nov20'26 310 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 60.549,
      marketValue: -6054.89,
      averagePrice: 107.865034,
      unrealizedPnl: 4731.61,
      dailyPnl: -1802.55,
      right: "P",
      strike: 310,
      expiry: "2026-11-20",
      underlying: "COHR",
      delta: -0.578,
      iv: 0.803,
      spot: 270.87,
    },
    {
      symbol: "CRDO",
      description: "CRDO Nov20'26 180 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 37.258,
      marketValue: -3725.76,
      averagePrice: 42.086511,
      unrealizedPnl: 482.89,
      dailyPnl: -768.78,
      right: "P",
      strike: 180,
      expiry: "2026-11-20",
      underlying: "CRDO",
      delta: -0.651,
      iv: 0.727,
      spot: 150.74,
    },
    {
      symbol: "MCD",
      description: "MCD",
      assetClass: "STK",
      position: 100,
      marketPrice: 257.97,
      marketValue: 25797.0,
      averagePrice: 280.300363,
      unrealizedPnl: -2233.04,
      dailyPnl: 544.0,
    },
    {
      symbol: "NVDA",
      description: "NVDA",
      assetClass: "STK",
      position: 40,
      marketPrice: 210.76,
      marketValue: 8430.6,
      averagePrice: 172.516855,
      unrealizedPnl: 1529.93,
      dailyPnl: -301.0,
    },
    {
      symbol: "VWRA",
      description: "VWRA @LSEETF",
      assetClass: "STK",
      position: 100,
      marketPrice: 191.42,
      marketValue: 19142.0,
      averagePrice: 173.483392,
      unrealizedPnl: 1793.66,
      dailyPnl: -224.0,
    },
    {
      symbol: "IBKR",
      description: "IBKR",
      assetClass: "STK",
      position: 6.8302,
      marketPrice: 89.37,
      marketValue: 610.41,
      averagePrice: 76.58633715,
      unrealizedPnl: 87.31,
      dailyPnl: -13.66,
    },
  ],
  balances: {
    netLiquidation: 192758.34,
    cashBalance: 151968.75,
    stockMarketValue: 68628.23,
    unrealizedPnl: 8955.74,
    cashPct: 78.8,
    currency: "BASE",
  },
  sectors: [
    { name: "Cash", nav: 151968.75, weight: 0.788, side: "long" },
    { name: "Consumer Cyclicals", nav: 25797.0, weight: 0.134, side: "long" },
    { name: "Broad", nav: 19142.0, weight: 0.099, side: "long" },
    { name: "Technology", nav: 8430.6, weight: 0.044, side: "long" },
    { name: "Financials", nav: 610.41, weight: 0.003, side: "long" },
    { name: "Technology (short options)", nav: -22073.96, weight: 1.0, side: "short" },
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

  const amat = shorts.find((p) => p.underlying === "AMAT");
  if (amat && amat.profitPctOfCredit < 0.1) {
    flags.push("AMAT 单腿浮盈已收至~5%，接近入场权利金 — 重点观察 thesis");
  }
  const crdo = shorts.find((p) => p.underlying === "CRDO");
  if (crdo && (crdo.spot ?? 999) < (crdo.strike ?? 0) * 0.9) {
    flags.push("CRDO 深实值（现价远低于180）— 按接股意愿管理，勿为浮盈收窄盲目砍仓");
  }

  return { flags, limits, cashPct: balances.cashPct, nlv: balances.netLiquidation };
}
