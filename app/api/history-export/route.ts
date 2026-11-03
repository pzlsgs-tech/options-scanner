import { NextResponse } from "next/server";
import { IBKR_HISTORY } from "@/lib/ibkr-history";

function esc(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const header = [
    "id",
    "capturedAt",
    "source",
    "nlv",
    "cash",
    "cashPct",
    "stockMv",
    "unrealizedPnl",
    "brentPrice",
    "fearGreedIndex",
    "marketTrend",
    "note",
    "put_underlying",
    "put_strike",
    "put_expiry",
    "put_entry",
    "put_mark",
    "put_unrealizedPnl",
    "put_legPct",
    "put_delta",
    "put_iv",
    "put_spot",
    "stock_symbol",
    "stock_qty",
    "stock_avg",
    "stock_mark",
    "stock_unrealizedPnl",
  ].join(",");

  const rows: string[] = [header];

  for (const h of IBKR_HISTORY) {
    const base = [
      h.id,
      h.capturedAt,
      h.source,
      h.nlv,
      h.cash,
      h.cashPct,
      h.stockMv,
      h.unrealizedPnl,
      h.brentPrice ?? "",
      h.fearGreedIndex ?? "",
      h.marketTrend ?? "",
      h.note ?? "",
    ];

    const puts = h.shortPuts?.length ? h.shortPuts : [null];
    const stocks = h.stocks?.length ? h.stocks : [null];
    const n = Math.max(puts.length, stocks.length, 1);

    for (let i = 0; i < n; i++) {
      const p = puts[i] as (typeof h.shortPuts)[0] | null | undefined;
      const s = stocks[i] as (typeof h.stocks)[0] | null | undefined;
      rows.push(
        [
          ...base,
          p?.underlying ?? "",
          p?.strike ?? "",
          p?.expiry ?? "",
          p?.entry ?? "",
          p?.mark ?? "",
          p?.unrealizedPnl ?? "",
          p?.legPct ?? "",
          p?.delta ?? "",
          p?.iv ?? "",
          p?.spot ?? "",
          s?.symbol ?? "",
          s?.qty ?? "",
          s?.avg ?? "",
          s?.mark ?? "",
          s?.unrealizedPnl ?? "",
        ]
          .map(esc)
          .join(",")
      );
    }
  }

  const body = rows.join("\n") + "\n";
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ibkr-history-full.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
