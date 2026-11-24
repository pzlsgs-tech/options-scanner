/**
 * IBKR portfolio snapshot — single source of truth for all tabs/APIs.
 * Rule: every「更新持仓」MUST overwrite this from live IBKR positions+balances first.
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

/** Snapshot 2026-11-24: IBKR live */
export const IBKR_SNAPSHOT: IbkrSnapshot = {
  updatedAt: "2026-11-24T03:03:00.000Z",
  source: "ibkr_live",
  positions: [
    {
      symbol: "AMAT",
      description: "AMAT",
      assetClass: "STK",
      position: 100,
      marketPrice: 344.88,
      marketValue: 34488.0,
      averagePrice: 410.24,
      unrealizedPnl: -6536.05,
      dailyPnl: -199.0,
    },
    {
      symbol: "COHR",
      description: "COHR",
      assetClass: "STK",
      position: 100,
      marketPrice: 213.67,
      marketValue: 21367.0,
      averagePrice: 202.13,
      unrealizedPnl: 1153.5,
      dailyPnl: -214.0,
    },
    {
      symbol: "COHR",
      description: "COHR Dec24'26 310 CALL @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 2.243,
      marketValue: -224.3,
      averagePrice: 4.3,
      unrealizedPnl: 205.65,
      dailyPnl: 205.65,
      right: "C",
      strike: 310,
      expiry: "2026-12-24",
      underlying: "COHR",
      delta: null,
      iv: null,
      spot: 213.67,
    },
    {
      symbol: "MCD",
      description: "MCD",
      assetClass: "STK",
      position: 100,
      marketPrice: 276.0,
      marketValue: 27600.0,
      averagePrice: 280.3,
      unrealizedPnl: -430.04,
      dailyPnl: -38.0,
    },
    {
      symbol: "NVDA",
      description: "NVDA",
      assetClass: "STK",
      position: 60,
      marketPrice: 164.38,
      marketValue: 9862.8,
      averagePrice: 160.83,
      unrealizedPnl: 212.74,
      dailyPnl: -40.2,
    },
    {
      symbol: "NVDA",
      description: "NVDA Dec24'26 150 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 6.018,
      marketValue: -601.77,
      averagePrice: 4.692,
      unrealizedPnl: -132.62,
      dailyPnl: -132.62,
      right: "P",
      strike: 150,
      expiry: "2026-12-24",
      underlying: "NVDA",
      delta: null,
      iv: null,
      spot: 164.38,
    },
    {
      symbol: "SMERY",
      description: "SMERY @PINK",
      assetClass: "STK",
      position: 100,
      marketPrice: 27.71,
      marketValue: 2771.0,
      averagePrice: 28.89,
      unrealizedPnl: -117.73,
      dailyPnl: 226.0,
    },
    {
      symbol: "VWRA",
      description: "VWRA @LSEETF",
      assetClass: "STK",
      position: 150,
      marketPrice: 180.04,
      marketValue: 27006.0,
      averagePrice: 177.02,
      unrealizedPnl: 453.27,
      dailyPnl: 0,
    },
    {
      symbol: "IBKR",
      description: "IBKR",
      assetClass: "STK",
      position: 6.8302,
      marketPrice: 76.5,
      marketValue: 522.51,
      averagePrice: 76.59,
      unrealizedPnl: -0.59,
      dailyPnl: 0.2,
    },
  ],
  balances: {
    netLiquidation: 186646.82,
    cashBalance: 26974.15,
    stockMarketValue: 160529.97,
    unrealizedPnl: -5776.37,
    cashPct: 14.45,
    currency: "BASE",
  },
  sectors: [
    { name: "Cash", nav: 26974.15, weight: 0.1445, side: "long" },
    { name: "Semiconductors / Tech", nav: 65717.8, weight: 0.352, side: "long" },
    { name: "Consumer Cyclicals", nav: 27600.0, weight: 0.148, side: "long" },
    { name: "Broad", nav: 27006.0, weight: 0.145, side: "long" },
    { name: "Other", nav: 2771.0, weight: 0.015, side: "long" },
    { name: "Financials", nav: 522.51, weight: 0.003, side: "long" },
    { name: "Short options", nav: -826.07, weight: 1.0, side: "short" },
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
  return snapshot.positions
    .filter((p) => p.assetClass === "OPT" && p.right === "C" && p.position < 0)
    .map((p) => ({
      ...p,
      underlying: p.underlying || p.symbol,
      dte: p.expiry ? daysToExpiry(p.expiry) : 90,
      profitPctOfCredit:
        p.averagePrice > 0
          ? p.unrealizedPnl / (Math.abs(p.averagePrice) * 100 * Math.abs(p.position))
          : 0,
    }));
}

export function getStockPositions(snapshot: IbkrSnapshot = IBKR_SNAPSHOT) {
  return snapshot.positions.filter((p) => p.assetClass === "STK");
}

/** Cash needed if all short puts assigned (strike * 100 * |qty|) */
export function assignmentCashRequired(snapshot: IbkrSnapshot = IBKR_SNAPSHOT): number {
  return getShortPuts(snapshot).reduce(
    (sum, p) => sum + (p.strike || 0) * 100 * Math.abs(p.position),
    0
  );
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

  const assignCash = assignmentCashRequired(snapshot);
  if (assignCash > 0 && balances.cashBalance < assignCash) {
    flags.push(
      `行权现金不足：空头 Put 全行权需约 $${assignCash.toLocaleString()}，当前现金 $${balances.cashBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    );
  }

  for (const s of sectors.filter((x) => x.side === "long" && x.name !== "Cash")) {
    if (s.weight * 100 > limits.maxSectorPct) {
      flags.push(`行业 ${s.name} 占比 ${(s.weight * 100).toFixed(1)}% > ${limits.maxSectorPct}%`);
    }
  }

  const shorts = getShortPuts(snapshot);
  const ccs = getCoveredCalls(snapshot);
  if (shorts.length >= 3) {
    flags.push(`已有 ${shorts.length} 张空头 Put（主题偏集中）`);
  } else if (shorts.length === 0) {
    flags.push("当前无空头 Put — 可按纪律评估 1 个 CSP（需先恢复现金缓冲）");
  }
  if (ccs.length > 0) {
    flags.push(`备兑 Call ${ccs.length} 张：${ccs.map((c) => c.underlying).join(", ")}`);
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

  return { flags, limits, cashPct: balances.cashPct, nlv: balances.netLiquidation, assignCash };
}
