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

/** Snapshot 2026-11-25: IBKR live */
export const IBKR_SNAPSHOT: IbkrSnapshot = {
  updatedAt: "2026-11-25T00:07:00.000Z",
  source: "ibkr_live",
  positions: [
    {
      symbol: "AMAT",
      description: "AMAT",
      assetClass: "STK",
      position: 100,
      marketPrice: 322.75,
      marketValue: 32275.0,
      averagePrice: 410.24,
      unrealizedPnl: -8749.05,
      dailyPnl: -2412.0,
    },
    {
      symbol: "COHR",
      description: "COHR",
      assetClass: "STK",
      position: 100,
      marketPrice: 195.20,
      marketValue: 19520.33,
      averagePrice: 202.13,
      unrealizedPnl: -693.17,
      dailyPnl: -2060.67,
    },
    {
      symbol: "COHR",
      description: "COHR Dec24'26 310 CALL @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 0.92,
      marketValue: -92.02,
      averagePrice: 4.30,
      unrealizedPnl: 337.94,
      dailyPnl: 120.86,
      right: "C",
      strike: 310,
      expiry: "2026-12-24",
      underlying: "COHR",
      delta: null,
      iv: null,
      spot: 195.20,
    },
    {
      symbol: "IBKR",
      description: "IBKR",
      assetClass: "STK",
      position: 6.8302,
      marketPrice: 75.40,
      marketValue: 515.00,
      averagePrice: 76.59,
      unrealizedPnl: -8.10,
      dailyPnl: -7.31,
    },
    {
      symbol: "MCD",
      description: "MCD",
      assetClass: "STK",
      position: 100,
      marketPrice: 280.05,
      marketValue: 28004.60,
      averagePrice: 280.30,
      unrealizedPnl: -25.44,
      dailyPnl: 366.60,
    },
    {
      symbol: "NVDA",
      description: "NVDA",
      assetClass: "STK",
      position: 60,
      marketPrice: 152.49,
      marketValue: 9149.40,
      averagePrice: 160.83,
      unrealizedPnl: -500.66,
      dailyPnl: -753.60,
    },
    {
      symbol: "NVDA",
      description: "NVDA Dec24'26 150 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 9.83,
      marketValue: -983.11,
      averagePrice: 4.69,
      unrealizedPnl: -513.96,
      dailyPnl: -390.61,
      right: "P",
      strike: 150,
      expiry: "2026-12-24",
      underlying: "NVDA",
      delta: null,
      iv: null,
      spot: 152.49,
    },
    {
      symbol: "SMERY",
      description: "SMERY @PINK",
      assetClass: "STK",
      position: 100,
      marketPrice: 26.28,
      marketValue: 2628.00,
      averagePrice: 28.89,
      unrealizedPnl: -260.73,
      dailyPnl: -143.00,
    },
    {
      symbol: "VWRA",
      description: "VWRA @LSEETF",
      assetClass: "STK",
      position: 150,
      marketPrice: 177.56,
      marketValue: 26634.00,
      averagePrice: 177.02,
      unrealizedPnl: 81.27,
      dailyPnl: 0.0,
    },
  ],
  balances: {
    netLiquidation: 179105.29,
    cashBalance: 26936.43,
    stockMarketValue: 153401.61,
    unrealizedPnl: -13074.07,
    cashPct: 15.04,
    currency: "BASE",
  },
  sectors: [
    { name: "Cash", nav: 26936.43, weight: 0.1504, side: "long" },
    { name: "Semiconductors / Tech", nav: 60944.73, weight: 0.3403, side: "long" },
    { name: "Consumer Cyclicals", nav: 28004.60, weight: 0.1564, side: "long" },
    { name: "Broad", nav: 26634.00, weight: 0.1487, side: "long" },
    { name: "Other", nav: 2628.00, weight: 0.0147, side: "long" },
    { name: "Financials", nav: 515.00, weight: 0.0029, side: "long" },
    { name: "Short options", nav: -1075.13, weight: 1.0, side: "short" },
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
