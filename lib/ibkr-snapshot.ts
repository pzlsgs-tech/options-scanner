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
  updatedAt: "2026-11-24T15:59:00.000Z",
  source: "ibkr_live",
  positions: [
    {
      symbol: "AMAT",
      description: "AMAT",
      assetClass: "STK",
      position: 100,
      marketPrice: 318.05,
      marketValue: 31805.0,
      averagePrice: 410.24,
      unrealizedPnl: -9219.05,
      dailyPnl: -2882.0,
    },
    {
      symbol: "COHR",
      description: "COHR",
      assetClass: "STK",
      position: 100,
      marketPrice: 193.76,
      marketValue: 19375.5,
      averagePrice: 202.13,
      unrealizedPnl: -838.0,
      dailyPnl: -2205.5,
    },
    {
      symbol: "COHR",
      description: "COHR Dec24'26 310 CALL @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 0.947,
      marketValue: -94.7,
      averagePrice: 4.3,
      unrealizedPnl: 335.24,
      dailyPnl: 118.17,
      right: "C",
      strike: 310,
      expiry: "2026-12-24",
      underlying: "COHR",
      delta: null,
      iv: null,
      spot: 193.76,
    },
    {
      symbol: "IBKR",
      description: "IBKR",
      assetClass: "STK",
      position: 6.8302,
      marketPrice: 73.8,
      marketValue: 504.07,
      averagePrice: 76.59,
      unrealizedPnl: -19.03,
      dailyPnl: -18.24,
    },
    {
      symbol: "MCD",
      description: "MCD",
      assetClass: "STK",
      position: 100,
      marketPrice: 279.4,
      marketValue: 27940.0,
      averagePrice: 280.3,
      unrealizedPnl: -90.04,
      dailyPnl: 302.0,
    },
    {
      symbol: "NVDA",
      description: "NVDA",
      assetClass: "STK",
      position: 60,
      marketPrice: 152.21,
      marketValue: 9132.6,
      averagePrice: 160.83,
      unrealizedPnl: -517.46,
      dailyPnl: -770.4,
    },
    {
      symbol: "NVDA",
      description: "NVDA Dec24'26 150 PUT @AMEX",
      assetClass: "OPT",
      position: -1,
      marketPrice: 10.496,
      marketValue: -1049.56,
      averagePrice: 4.692,
      unrealizedPnl: -580.41,
      dailyPnl: -457.06,
      right: "P",
      strike: 150,
      expiry: "2026-12-24",
      underlying: "NVDA",
      delta: null,
      iv: null,
      spot: 152.21,
    },
    {
      symbol: "SMERY",
      description: "SMERY @PINK",
      assetClass: "STK",
      position: 100,
      marketPrice: 25.94,
      marketValue: 2594.2,
      averagePrice: 28.89,
      unrealizedPnl: -294.53,
      dailyPnl: -176.8,
    },
    {
      symbol: "VWRA",
      description: "VWRA @LSEETF",
      assetClass: "STK",
      position: 150,
      marketPrice: 177.66,
      marketValue: 26649.0,
      averagePrice: 177.02,
      unrealizedPnl: 96.27,
      dailyPnl: -357.0,
    },
  ],
  balances: {
    netLiquidation: 178125.55,
    cashBalance: 26932.84,
    stockMarketValue: 152446.87,
    unrealizedPnl: -14028.14,
    cashPct: 15.12,
    currency: "BASE",
  },
  sectors: [
    { name: "Cash", nav: 26932.84, weight: 0.1512, side: "long" },
    { name: "Semiconductors / Tech", nav: 60313.1, weight: 0.3385, side: "long" },
    { name: "Consumer Cyclicals", nav: 27940.0, weight: 0.1569, side: "long" },
    { name: "Broad", nav: 26649.0, weight: 0.1496, side: "long" },
    { name: "Other", nav: 2594.2, weight: 0.0146, side: "long" },
    { name: "Financials", nav: 504.07, weight: 0.0028, side: "long" },
    { name: "Short options", nav: -1144.26, weight: 1.0, side: "short" },
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
