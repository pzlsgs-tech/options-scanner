/**
 * 统一账本：成交 + 每日账户快照（展开为表格行）
 * 规则：不适用字段留空（null），不填零；期权保留完整合约信息
 */

import { IBKR_HISTORY, type IbkrHistoryEntry } from "./ibkr-history";

export type RecordType = "成交" | "每日持仓" | "账户快照";
export type AssetType = "股票" | "ETF" | "Put" | "Call";
export type TradeAction = "BUY" | "SELL" | "";
export type OpenClose = "开仓" | "平仓" | "指派" | "到期" | "";
export type Direction = "Long" | "Short" | "";
export type MarketTrendLabel = "上涨" | "下跌" | "震荡" | "";

export type LedgerRow = {
  id: string;
  recordType: RecordType;
  datetime: string;
  symbol: string;
  assetType: AssetType | "";
  action: TradeAction;
  openClose: OpenClose;
  direction: Direction;
  expiry: string;
  strike: number | null;
  qty: number | null;
  fillPrice: number | null;
  underlyingPrice: number | null;
  optionPremium: number | null;
  commission: number | null;
  realizedPnl: number | null;
  unrealizedPnl: number | null;
  marketValue: number | null;
  nlv: number | null;
  usdCash: number | null;
  maintenanceMargin: number | null;
  availableFunds: number | null;
  excessLiquidity: number | null;
  iv: number | null;
  delta: number | null;
  marketTrend: MarketTrendLabel;
  reason: string;
  riskReview: string;
  orderId: string;
  currency: string;
};

/** 已知成交（手工/IBKR 回填；分批成交分行） */
export const KNOWN_TRADES: LedgerRow[] = [
  {
    id: "trade-crdo-close-2026-10-01",
    recordType: "成交",
    datetime: "2026-10-01T20:00:00.000Z",
    symbol: "CRDO",
    assetType: "Put",
    action: "BUY",
    openClose: "平仓",
    direction: "Short",
    expiry: "2026-11-20",
    strike: 180,
    qty: 1,
    fillPrice: 11.26,
    underlyingPrice: null,
    optionPremium: 11.26,
    commission: null,
    realizedPnl: 3082,
    unrealizedPnl: null,
    marketValue: null,
    nlv: null,
    usdCash: null,
    maintenanceMargin: null,
    availableFunds: null,
    excessLiquidity: null,
    iv: null,
    delta: null,
    marketTrend: "",
    reason: "买回平仓 CRDO 180P；本腿入场约 42.09",
    riskReview: "本腿已实现约 +$3,082；链级未完全按 50% 目标价离场，略早锁利",
    orderId: "",
    currency: "USD",
  },
];

function trendFromNote(note?: string, fgi?: number | null): MarketTrendLabel {
  if (!note && fgi == null) return "";
  const n = (note || "").toLowerCase();
  if (/偏弱|回撤|大跌|itm|下跌|bear|risk.?off/.test(n)) return "下跌";
  if (/反弹|偏强|上涨|bull|risk.?on/.test(n)) return "上涨";
  if (fgi != null) {
    if (fgi <= 40) return "下跌";
    if (fgi >= 60) return "上涨";
  }
  return "震荡";
}

/** 将每日快照展开：1 行账户快照 + 各持仓行（每日持仓） */
export function expandSnapshot(h: IbkrHistoryEntry): LedgerRow[] {
  const rows: LedgerRow[] = [];
  const trend = h.marketTrend || trendFromNote(h.note, h.fearGreedIndex);
  const day = h.id;

  rows.push({
    id: `snap-${day}`,
    recordType: "账户快照",
    datetime: h.capturedAt || `${day}T00:00:00.000Z`,
    symbol: "",
    assetType: "",
    action: "",
    openClose: "",
    direction: "",
    expiry: "",
    strike: null,
    qty: null,
    fillPrice: null,
    underlyingPrice: null,
    optionPremium: null,
    commission: null,
    realizedPnl: null,
    unrealizedPnl: h.unrealizedPnl ?? null,
    marketValue: h.stockMv ?? null,
    nlv: h.nlv ?? null,
    usdCash: h.cash ?? null,
    maintenanceMargin: null,
    availableFunds: null,
    excessLiquidity: null,
    iv: null,
    delta: null,
    marketTrend: trend,
    reason: h.note || "",
    riskReview: h.brentPrice != null ? `布伦特 $${h.brentPrice}${h.fearGreedIndex != null ? `；F&G ${h.fearGreedIndex}` : ""}` : "",
    orderId: "",
    currency: "USD",
  });

  for (const p of h.shortPuts || []) {
    rows.push({
      id: `pos-${day}-${p.underlying}-P${p.strike}`,
      recordType: "每日持仓",
      datetime: h.capturedAt || `${day}T00:00:00.000Z`,
      symbol: p.underlying,
      assetType: "Put",
      action: "",
      openClose: "",
      direction: "Short",
      expiry: p.expiry || "",
      strike: p.strike ?? null,
      qty: 1,
      fillPrice: null,
      underlyingPrice: p.spot ?? null,
      optionPremium: p.mark ?? null,
      commission: null,
      realizedPnl: null,
      unrealizedPnl: p.unrealizedPnl ?? null,
      marketValue: p.mark != null ? -Math.abs(p.mark) * 100 : null,
      nlv: null,
      usdCash: null,
      maintenanceMargin: null,
      availableFunds: null,
      excessLiquidity: null,
      iv: p.iv ?? null,
      delta: p.delta ?? null,
      marketTrend: trend,
      reason: `空头 Put 入场 ${p.entry}；单腿 ${((p.legPct ?? 0) * 100).toFixed(0)}%`,
      riskReview: "",
      orderId: "",
      currency: "USD",
    });
  }

  for (const c of h.coveredCalls || []) {
    rows.push({
      id: `pos-${day}-${c.underlying}-C${c.strike}`,
      recordType: "每日持仓",
      datetime: h.capturedAt || `${day}T00:00:00.000Z`,
      symbol: c.underlying,
      assetType: "Call",
      action: "",
      openClose: "",
      direction: "Short",
      expiry: c.expiry || "",
      strike: c.strike ?? null,
      qty: 1,
      fillPrice: null,
      underlyingPrice: null,
      optionPremium: c.mark ?? null,
      commission: null,
      realizedPnl: null,
      unrealizedPnl: c.unrealizedPnl ?? null,
      marketValue: c.mark != null ? -Math.abs(c.mark) * 100 : null,
      nlv: null,
      usdCash: null,
      maintenanceMargin: null,
      availableFunds: null,
      excessLiquidity: null,
      iv: null,
      delta: null,
      marketTrend: trend,
      reason: `备兑 Call 入场 ${c.entry}`,
      riskReview: "",
      orderId: "",
      currency: "USD",
    });
  }

  for (const s of h.stocks || []) {
    const isEtf = ["VWRA", "GDX"].includes(s.symbol);
    rows.push({
      id: `pos-${day}-${s.symbol}-STK`,
      recordType: "每日持仓",
      datetime: h.capturedAt || `${day}T00:00:00.000Z`,
      symbol: s.symbol,
      assetType: isEtf ? "ETF" : "股票",
      action: "",
      openClose: "",
      direction: "Long",
      expiry: "",
      strike: null,
      qty: s.qty ?? null,
      fillPrice: null,
      underlyingPrice: s.mark ?? null,
      optionPremium: null,
      commission: null,
      realizedPnl: null,
      unrealizedPnl: s.unrealizedPnl ?? null,
      marketValue: s.mark != null && s.qty != null ? s.mark * s.qty : null,
      nlv: null,
      usdCash: null,
      maintenanceMargin: null,
      availableFunds: null,
      excessLiquidity: null,
      iv: null,
      delta: null,
      marketTrend: trend,
      reason: `成本均价 ${s.avg}`,
      riskReview: "",
      orderId: "",
      currency: "USD",
    });
  }

  return rows;
}

export function buildLedger(history: IbkrHistoryEntry[] = IBKR_HISTORY): LedgerRow[] {
  const rows: LedgerRow[] = [...KNOWN_TRADES];
  for (const h of history) {
    rows.push(...expandSnapshot(h));
  }
  rows.sort((a, b) => (a.datetime < b.datetime ? 1 : a.datetime > b.datetime ? -1 : 0));
  return rows;
}
