import { NextResponse } from "next/server";
import { IBKR_SNAPSHOT, getHeldSymbols, getShortPuts } from "@/lib/ibkr-snapshot";
import { IBKR_HISTORY } from "@/lib/ibkr-history";

export type HoldingMonitor = {
  symbol: string;
  name?: string;
  price: number | null;
  changePct: number | null;
  // 财报拐点
  earningsDate: string | null;
  daysToEarnings: number | null;
  earningsFlag: "imminent" | "soon" | "ok" | "unknown";
  epsTrendSummary: string | null;
  // 估值
  trailingPE: number | null;
  forwardPE: number | null;
  peVsForwardNote: string | null;
  // 华尔街共识
  targetMean: number | null;
  targetUpsidePct: number | null;
  recommendation: string | null;
  numberOfAnalysts: number | null;
  consensusNote: string | null;
  // IV
  iv: number | null;
  ivPrev: number | null;
  ivChangePctPts: number | null;
  ivFlag: "spike" | "elevated" | "normal" | "unknown";
  ivSource: string;
  alerts: string[];
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function daysFromNow(isoOrMs: string | number | null): number | null {
  if (isoOrMs == null) return null;
  const t = typeof isoOrMs === "number" ? isoOrMs : Date.parse(isoOrMs);
  if (Number.isNaN(t)) return null;
  return Math.round((t - Date.now()) / 86400000);
}

async function fetchYahooSummary(symbol: string): Promise<any | null> {
  const modules = [
    "calendarEvents",
    "earningsTrend",
    "defaultKeyStatistics",
    "financialData",
    "recommendationTrend",
    "price",
  ].join(",");
  const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(
    symbol
  )}?modules=${modules}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.quoteSummary?.result?.[0] || null;
  } catch {
    return null;
  }
}

function pickNum(obj: any, ...keys: string[]): number | null {
  for (const k of keys) {
    const v = obj?.[k];
    if (v == null) continue;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "object" && typeof v.raw === "number") return v.raw;
  }
  return null;
}

function pickStr(obj: any, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "object" && typeof v.fmt === "string") return v.fmt;
  }
  return null;
}

function buildFromYahoo(
  symbol: string,
  summary: any | null,
  snapIv: number | null,
  histIv: number | null
): HoldingMonitor {
  const alerts: string[] = [];
  const priceMod = summary?.price || {};
  const cal = summary?.calendarEvents || {};
  const ks = summary?.defaultKeyStatistics || {};
  const fd = summary?.financialData || {};
  const et = summary?.earningsTrend?.trend || [];

  const price = pickNum(priceMod, "regularMarketPrice") ?? pickNum(fd, "currentPrice");
  const changePct = pickNum(priceMod, "regularMarketChangePercent");

  // 财报日期：Yahoo calendarEvents.earnings.earningsDate 常为数组
  let earningsDate: string | null = null;
  const ed = cal?.earnings?.earningsDate;
  if (Array.isArray(ed) && ed.length) {
    const raw = ed[0]?.raw ?? ed[0];
    if (typeof raw === "number") earningsDate = new Date(raw * 1000).toISOString().slice(0, 10);
    else if (typeof ed[0]?.fmt === "string") earningsDate = ed[0].fmt;
  }
  const daysToEarnings = daysFromNow(earningsDate ? earningsDate + "T20:00:00Z" : null);
  let earningsFlag: HoldingMonitor["earningsFlag"] = "unknown";
  if (daysToEarnings != null) {
    if (daysToEarnings >= 0 && daysToEarnings <= 7) {
      earningsFlag = "imminent";
      alerts.push(`财报约 ${daysToEarnings} 天内 — 规则：避开 7 天内新开 CSP`);
    } else if (daysToEarnings > 7 && daysToEarnings <= 21) {
      earningsFlag = "soon";
      alerts.push(`财报约 ${daysToEarnings} 天后 — 关注指引/拐点`);
    } else if (daysToEarnings > 21 || daysToEarnings < 0) {
      earningsFlag = "ok";
    }
  }

  // EPS 趋势：0q / +1q
  let epsTrendSummary: string | null = null;
  try {
    const z = et.find((x: any) => x.period === "0q") || et[0];
    const n = et.find((x: any) => x.period === "+1q") || et[1];
    const parts: string[] = [];
    if (z) {
      const e = pickNum(z, "earningsEstimate", "earningsEstimateAvg") ?? pickNum(z?.earningsEstimate, "avg");
      const g = pickNum(z, "growth", "growthRaw") ?? pickNum(z?.growth, "raw");
      if (e != null) parts.push(`当季EPS估 ${e.toFixed(2)}`);
      if (g != null) parts.push(`增长 ${(g * 100).toFixed(0)}%`);
    }
    if (n) {
      const e = pickNum(n?.earningsEstimate, "avg") ?? pickNum(n, "earningsEstimate");
      if (e != null) parts.push(`下季估 ${e.toFixed(2)}`);
    }
    if (parts.length) epsTrendSummary = parts.join(" · ");
  } catch {
    /* ignore */
  }

  const trailingPE = pickNum(ks, "trailingPE");
  const forwardPE = pickNum(ks, "forwardPE") ?? pickNum(fd, "forwardPE");
  let peVsForwardNote: string | null = null;
  if (trailingPE != null && forwardPE != null && forwardPE > 0) {
    const gap = ((trailingPE - forwardPE) / forwardPE) * 100;
    if (gap > 25) {
      peVsForwardNote = `TTM PE ${trailingPE.toFixed(1)} 明显高于远期 ${forwardPE.toFixed(1)}（估值偏贵或盈利回升预期）`;
      alerts.push("估值：TTM PE 显著高于 Forward PE");
    } else if (gap < -15) {
      peVsForwardNote = `远期 PE ${forwardPE.toFixed(1)} 高于 TTM ${trailingPE.toFixed(1)}（盈利预期走弱风险）`;
      alerts.push("估值：Forward PE 高于 TTM，关注盈利下修");
    } else {
      peVsForwardNote = `TTM PE ${trailingPE.toFixed(1)} / Fwd ${forwardPE.toFixed(1)}`;
    }
  } else if (trailingPE != null) {
    peVsForwardNote = `TTM PE ${trailingPE.toFixed(1)}`;
  } else if (forwardPE != null) {
    peVsForwardNote = `Fwd PE ${forwardPE.toFixed(1)}`;
  }

  const targetMean = pickNum(fd, "targetMeanPrice");
  const recommendation = pickStr(fd, "recommendationKey") || pickStr(fd, "recommendationMean");
  const numberOfAnalysts = pickNum(fd, "numberOfAnalystOpinions");
  let targetUpsidePct: number | null = null;
  let consensusNote: string | null = null;
  if (targetMean != null && price != null && price > 0) {
    targetUpsidePct = ((targetMean - price) / price) * 100;
    consensusNote = `目标均价 $${targetMean.toFixed(1)}（相对现价 ${targetUpsidePct >= 0 ? "+" : ""}${targetUpsidePct.toFixed(1)}%）`;
    if (targetUpsidePct < -10) {
      alerts.push("共识目标价低于现价 >10% — 华尔街偏谨慎");
    } else if (targetUpsidePct > 25) {
      alerts.push("共识目标价显著高于现价 — 上行空间大但需防预期已定价");
    }
  }
  if (recommendation) {
    consensusNote = (consensusNote ? consensusNote + " · " : "") + `评级 ${recommendation}`;
  }

  // IV：优先持仓快照，其次历史对比
  const iv = snapIv;
  const ivPrev = histIv;
  let ivChangePctPts: number | null = null;
  let ivFlag: HoldingMonitor["ivFlag"] = "unknown";
  if (iv != null) {
    if (ivPrev != null) {
      ivChangePctPts = (iv - ivPrev) * 100; // 百分点
      if (Math.abs(ivChangePctPts) >= 8) {
        ivFlag = "spike";
        alerts.push(
          `IV 剧烈变动：${(ivPrev * 100).toFixed(0)}% → ${(iv * 100).toFixed(0)}%（${ivChangePctPts >= 0 ? "+" : ""}${ivChangePctPts.toFixed(0)}pt）`
        );
      } else if (iv >= 0.7) {
        ivFlag = "elevated";
        alerts.push(`IV 偏高 ${(iv * 100).toFixed(0)}%`);
      } else {
        ivFlag = "normal";
      }
    } else if (iv >= 0.75) {
      ivFlag = "elevated";
      alerts.push(`IV 偏高 ${(iv * 100).toFixed(0)}%（无历史对比）`);
    } else {
      ivFlag = "normal";
    }
  }

  return {
    symbol,
    name: pickStr(priceMod, "shortName", "longName") || undefined,
    price,
    changePct,
    earningsDate,
    daysToEarnings,
    earningsFlag,
    epsTrendSummary,
    trailingPE,
    forwardPE,
    peVsForwardNote,
    targetMean,
    targetUpsidePct,
    recommendation,
    numberOfAnalysts,
    consensusNote,
    iv,
    ivPrev,
    ivChangePctPts,
    ivFlag,
    ivSource: snapIv != null ? "IBKR 持仓期权" : "无",
    alerts,
  };
}

export async function GET() {
  const symbols = getHeldSymbols(IBKR_SNAPSHOT).filter(
    (s) => s && s.length <= 8 && !/^\d/.test(s) && s !== "VWRA"
  );

  const shortPuts = getShortPuts(IBKR_SNAPSHOT);
  const ivBySym: Record<string, number | null> = {};
  for (const p of shortPuts) {
    if (p.underlying && p.iv != null) ivBySym[p.underlying] = p.iv;
  }

  // 上一历史点的 IV（同标的 short put）
  const prevIvBySym: Record<string, number | null> = {};
  if (IBKR_HISTORY.length >= 2) {
    const prev = IBKR_HISTORY[1];
    for (const p of prev.shortPuts || []) {
      if (p.underlying && p.iv != null) prevIvBySym[p.underlying] = p.iv;
    }
  }

  const items: HoldingMonitor[] = [];
  const concurrency = 3;
  for (let i = 0; i < symbols.length; i += concurrency) {
    const batch = symbols.slice(i, i + concurrency);
    const rows = await Promise.all(
      batch.map(async (symbol) => {
        const summary = await fetchYahooSummary(symbol);
        return buildFromYahoo(
          symbol,
          summary,
          ivBySym[symbol] ?? null,
          prevIvBySym[symbol] ?? null
        );
      })
    );
    items.push(...rows);
  }

  // 有警报的排前面
  items.sort((a, b) => b.alerts.length - a.alerts.length || a.symbol.localeCompare(b.symbol));

  return NextResponse.json({
    updatedAt: new Date().toISOString(),
    symbols,
    items,
    source: "Yahoo quoteSummary + IBKR snapshot IV",
    note: "财报/共识/估值为公开数据近似；IV 优先用账户空头 Put 的 IV，并与上一历史快照对比剧烈变动。",
  });
}
