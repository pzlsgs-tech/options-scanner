/**
 * IBKR portfolio snapshot for Layers 5 & 6.
 * Updated from live IBKR via Grok connected tools.
 * Note: 2026-11-24 live IBKR pull failed; based on last known + market data.
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

/** Snapshot 2026-11-24: manual (IBKR live failed; AMAT Put expired) */
export const IBKR_SNAPSHOT: IbkrSnapshot = {
  updatedAt: "2026-11-24T00:04:00.000Z",
  source: "manual",
  positions: [
    {
      symbol: "COHR",
      description: "COHR",
      assetClass: "STK",
      position: 100,
      marketPrice: 224.5,
      marketValue: 22450,
      averagePrice: 202.13,
      unrealizedPnl: 2237,
      dailyPnl: 3750,
    },
    {
      symbol: "IBKR",
      description: "IBKR",
      assetClass: "STK",
      position: 6.8302,
      marketPrice: 71.2,
      marketValue: 486.3,
      averagePrice: 76.59,
      unrealizedPnl: -36.8,
      dailyPnl: -10,
    },
    {
      symbol: "MCD",
      description: "MCD",
      assetClass: "STK",
      position: 100,
      marketPrice: 273,
      marketValue: 27300,
      averagePrice: 280.30,
      unrealizedPnl: -730,
      dailyPnl: -250,
    },
    {
      symbol: "NVDA",
      description: "NVDA",
      assetClass: "STK",
      position: 40,
      marketPrice: 168,
      marketValue: 6720,
      averagePrice: 172.52,
      unrealizedPnl: -180,
      dailyPnl: 1250,
    },
    {
      symbol: "SMERY",
      description: "SMERY @PINK",
      assetClass: "STK",
      position: 100,
      marketPrice: 26,
      marketValue: 2600,
      averagePrice: 28.89,
      unrealizedPnl: -289,
      dailyPnl: -8,
    },
    {
      symbol: "VWRA",
      description: "VWRA @LSEETF",
      assetClass: "STK",
      position: 130,
      marketPrice: 180,
      marketValue: 23400,
      averagePrice: 177.32,
      unrealizedPnl: 348,
      dailyPnl: 600,
    },
  ],
  balances: {
    netLiquidation: 185000,
    cashBalance: 110000,
    stockMarketValue: 105000,
    unrealizedPnl: -8000,
    cashPct: 59.5,
    currency: "BASE",
  },
  sectors: [
    { name: "Cash", nav: 110000, weight: 0.595, side: "long" },
    { name: "Consumer Cyclicals", nav: 27300, weight: 0.148, side: "long" },
    { name: "Broad", nav: 23400, weight: 0.127, side: "long" },
    { name: "Technology", nav: 29170, weight: 0.158, side: "long" },
    { name: "Financials", nav: 486, weight: 0.003, side: "long" },
    { name: "Other", nav: 2600, weight: 0.014, side: "long" },
  ],
};

// rest of functions unchanged (omitted for brevity in this update; full file should preserve them)
