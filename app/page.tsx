"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Search, RefreshCw, Zap, Layers, Target, Briefcase, RefreshCcw, TrendingUp, BookOpen, History, Newspaper,
} from "lucide-react";

type StrategyScore = { name: string; score: number; reason: string };
type LedgerRow = {
  id: string; recordType: string; datetime: string; symbol: string; assetType: string;
  action: string; openClose: string; direction: string; expiry: string;
  strike: number | null; qty: number | null; fillPrice: number | null;
  underlyingPrice: number | null; optionPremium: number | null; commission: number | null;
  realizedPnl: number | null; unrealizedPnl: number | null; marketValue: number | null;
  nlv: number | null; usdCash: number | null; maintenanceMargin: number | null;
  availableFunds: number | null; excessLiquidity: number | null;
  iv: number | null; delta: number | null; marketTrend: string;
  reason: string; riskReview: string; orderId: string; currency: string;
};

const TABS = [
  { id: "market", label: "1 市场", icon: Layers },
  { id: "strategy", label: "2 策略", icon: Target },
  { id: "scan", label: "3-4 标的/期权", icon: Search },
  { id: "portfolio", label: "5 组合·IBKR", icon: Briefcase },
  { id: "roll", label: "6 展期", icon: RefreshCcw },
  { id: "news", label: "持仓新闻", icon: Newspaper },
  { id: "trend", label: "趋势预测", icon: TrendingUp },
  { id: "history", label: "历史", icon: History },
  { id: "rules", label: "原则", icon: BookOpen },
] as const;
type TabId = (typeof TABS)[number]["id"];
const AUTO_REFRESH_MS = 2 * 60 * 1000;

function fmt(v: number | null | undefined, dig = 2): string {
  if (v == null || Number.isNaN(v)) return "";
  return Number(v).toLocaleString(undefined, { maximumFractionDigits: dig });
}
function fmtPct(v: number | null | undefined): string {
  if (v == null || Number.isNaN(v)) return "";
  return `${(v * 100).toFixed(1)}%`;
}

export default function Home() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState("");
  const [market, setMarket] = useState<any>(null);
  const [topStrategy, setTopStrategy] = useState<StrategyScore | null>(null);
  const [ibkr, setIbkr] = useState<any>(null);
  const [playbook, setPlaybook] = useState<any>(null);
  const [history, setHistory] = useState<{ count: number; entries: any[]; ledger?: LedgerRow[] } | null>(null);
  const [tab, setTab] = useState<TabId>("market");
  const [minScore, setMinScore] = useState(50);
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [histFilter, setHistFilter] = useState<"全部" | "成交" | "每日持仓" | "账户快照">("全部");
  const [newsData, setNewsData] = useState<{ updatedAt: string; symbols: string[]; items: any[] } | null>(null);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState<string | null>(null);
  const hasData = useRef(false);

  const fetchScan = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent && hasData.current;
    if (silent) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/scan?minScore=${minScore}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(data.results || []);
      setUpdatedAt(data.updatedAt || "");
      setMarket(data.market);
      setTopStrategy(data.topStrategy || null);
      setIbkr(data.ibkr);
      setPlaybook(data.playbook);
      setHistory(data.history || null);
      hasData.current = true;
    } catch (e: any) {
      setError(e.message || "扫描失败");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [minScore]);

  useEffect(() => { fetchScan(); }, [fetchScan]);
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => fetchScan({ silent: true }), AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [autoRefresh, fetchScan]);

  useEffect(() => {
    if (tab !== "news") return;
    let cancelled = false;
    (async () => {
      setNewsLoading(true);
      setNewsError(null);
      try {
        const res = await fetch("/api/news", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setNewsData(data);
      } catch (e: any) {
        if (!cancelled) setNewsError(e.message || "新闻加载失败");
      } finally {
        if (!cancelled) setNewsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [tab]);

  const filtered = results.filter((r) => {
    if (!search) return true;
    const q = search.toUpperCase();
    return r.symbol?.includes(q) || r.name?.toUpperCase().includes(q);
  });

  const ledgerRows = useMemo(() => {
    const rows: LedgerRow[] = history?.ledger || [];
    if (histFilter === "全部") return rows;
    return rows.filter((r) => r.recordType === histFilter);
  }, [history, histFilter]);

  const brent = market?.brentPrice;
  const fgi = market?.fearGreedIndex;
  const fgiLabel = market?.fearGreedLabel || "—";

  const trendForecast = useMemo(() => {
    if (!market) return null;
    const regimes: string[] = market.regimes || [];
    const riskOff = regimes.some((r) => /Risk Off|Bear|Correction/i.test(r));
    const highIv = regimes.some((r) => /High IV/i.test(r));
    const today = riskOff ? "偏空 / 谨慎" : market.spyTrend === "up" && market.qqqTrend === "up" ? "偏多" : "震荡";
    return {
      today,
      weekBase: riskOff ? "基准：震荡偏弱，半导 Put 可能继续承压" : "基准：震荡为主，按链 50% 与现金纪律执行",
      weekBull: "乐观：风险偏好回升，可考虑在合规下补 1 个 CSP",
      weekBear: "悲观：继续 Risk-Off，优先保现金与接股意愿",
      action: riskOff ? "本周：不新开；管理 AMAT/COHR 链进度" : "本周：可扫描下一期 1 个 CSP（核心池）",
      highIv,
      riskOff,
    };
  }, [market]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Options Scanner Pro</h1>
              <p className="text-xs text-slate-400">六层筛选 · 链级50% · 完整历史账本</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400 flex-wrap">
            {updatedAt && (
              <span>更新 {new Date(updatedAt).toLocaleString("zh-CN")}{refreshing && <span className="ml-1 text-sky-400">刷新中…</span>}</span>
            )}
            <button onClick={() => fetchScan({ silent: hasData.current })} disabled={loading || refreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading || refreshing ? "animate-spin" : ""}`} /> 刷新
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-3 flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                  tab === t.id ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}>
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {error && <div className="bg-red-950/50 border border-red-800 text-red-200 rounded-xl px-4 py-3">错误: {error}</div>}
        {loading && !hasData.current && (
          <div className="flex justify-center py-20 text-slate-400 gap-3"><RefreshCw className="w-6 h-6 animate-spin" /> 加载中...</div>
        )}

        {(!loading || hasData.current) && !error && (
          <>
            {tab === "market" && market && (
              <section className="space-y-5">
                <h2 className="text-lg font-semibold">第一层：市场环境</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className={`rounded-2xl border-2 p-6 ${(brent ?? 0) >= 100 ? "bg-orange-950/60 border-orange-500" : "bg-emerald-950/50 border-emerald-500"}`}>
                    <div className="text-sm mb-1">布伦特原油 Brent</div>
                    <div className="text-5xl font-black text-orange-400">{brent != null ? `$${Number(brent).toFixed(2)}` : "—"}</div>
                  </div>
                  <div className={`rounded-2xl border-2 p-6 ${(fgi ?? 50) <= 44 ? "bg-rose-950/60 border-rose-400" : "bg-slate-900 border-slate-500"}`}>
                    <div className="text-sm mb-1">Fear & Greed Index</div>
                    <div className="text-5xl font-black">{fgi != null ? fgi : "—"}</div>
                    <div className="mt-2 text-xl font-bold">{fgiLabel}</div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-900 border border-slate-700 p-4">
                    <div className="text-xs text-slate-500">VIX 代理</div>
                    <div className="text-3xl font-bold text-sky-300">{market.vixProxy ?? "—"}</div>
                  </div>
                  <div className="rounded-xl bg-slate-900 border border-slate-700 p-4">
                    <div className="text-xs text-slate-500">SPY</div>
                    <div className="text-3xl font-bold">{Number(market.spyChange ?? 0).toFixed(2)}%</div>
                  </div>
                  <div className="rounded-xl bg-slate-900 border border-slate-700 p-4">
                    <div className="text-xs text-slate-500">QQQ</div>
                    <div className="text-3xl font-bold">{Number(market.qqqChange ?? 0).toFixed(2)}%</div>
                  </div>
                </div>
              </section>
            )}

            {tab === "strategy" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">第二层：策略筛选</h2>
                {topStrategy && (
                  <div className="bg-sky-950/40 border border-sky-800 rounded-xl px-4 py-3 text-sky-200">
                    今日首选：<strong>{topStrategy.name}</strong>（{topStrategy.score}）— {topStrategy.reason}
                  </div>
                )}
              </section>
            )}

            {tab === "scan" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">第三/四层</h2>
                <div className="flex gap-3">
                  <input type="number" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                </div>
                {filtered.slice(0, 30).map((r) => (
                  <div key={r.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-3 items-center">
                    <div className="font-bold min-w-[100px]">{r.symbol} <span className="text-sky-400">{r.aiScore}</span></div>
                    <div className="text-xs text-sky-300 flex-1">{r.recommendedAction}</div>
                  </div>
                ))}
              </section>
            )}

            {tab === "portfolio" && ibkr && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">第五层：组合 · 全部持仓</h2>
                <div className="grid sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500">NLV</div>
                    <div className="text-xl font-bold">${ibkr.balances?.netLiquidation?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500">现金</div>
                    <div className="text-xl font-bold">${ibkr.balances?.cashBalance?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="text-xs text-emerald-400">{ibkr.balances?.cashPct?.toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500">股票市值</div>
                    <div className="text-xl font-bold">${ibkr.balances?.stockMarketValue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500">未实现盈亏</div>
                    <div className={`text-xl font-bold ${(ibkr.balances?.unrealizedPnl ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      ${ibkr.balances?.unrealizedPnl?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                </div>
                {ibkr.riskFlags?.length > 0 && (
                  <div className="space-y-1">
                    {ibkr.riskFlags.map((w: string, i: number) => (
                      <div key={i} className="text-amber-200 text-sm">⚠ {w}</div>
                    ))}
                  </div>
                )}
                <h3 className="font-semibold text-slate-300">股票 / ETF</h3>
                {(ibkr.stocks?.length ? ibkr.stocks : []).map((s: any) => (
                  <div key={s.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm flex flex-wrap gap-x-4 gap-y-1 items-center">
                    <span className="font-bold min-w-[64px]">{s.symbol}</span>
                    <span className="text-slate-400">{Number(s.qty).toFixed(s.qty % 1 ? 2 : 0)} 股</span>
                    <span>成本 ${Number(s.avg).toFixed(2)}</span>
                    <span>现价 ${Number(s.price).toFixed(2)}</span>
                    <span>市值 ${Number(s.value ?? s.price * s.qty).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    <span className={Number(s.pnl) >= 0 ? "text-emerald-400" : "text-red-400"}>
                      未实现 ${Number(s.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
                <h3 className="font-semibold text-slate-300">空头 Put</h3>
                {(ibkr.shortPuts?.length ? ibkr.shortPuts : []).map((p: any) => (
                  <div key={p.description || p.underlying} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm space-y-1">
                    <div className="font-bold">{p.underlying} {p.strike}P · DTE {p.dte}</div>
                    <div>入场 {Number(p.entryPremium).toFixed(2)} → 现价 {Number(p.currentPremium).toFixed(2)} · 单腿 {(Number(p.profitPctOfCredit) * 100).toFixed(0)}%</div>
                    <div className="text-slate-400">
                      Δ {p.delta != null ? Number(p.delta).toFixed(2) : "—"}
                      {" · "}IV {p.iv != null ? `${(Number(p.iv) * 100).toFixed(0)}%` : "—"}
                      {" · "}标的 {p.spot ?? "—"}
                    </div>
                    {p.chain && (
                      <div className={p.chain.takeProfitHit ? "text-emerald-400 font-semibold" : "text-slate-400"}>
                        链目标 ≤${Number(p.chain.targetClosePrice).toFixed(2)} · 进度 {(Number(p.chain.progressToTarget) * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {tab === "roll" && ibkr && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">第六层：展期</h2>
                {(ibkr.shortPuts || []).map((p: any) => (
                  <div key={p.underlying} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm">
                    <div className="font-bold">{p.underlying}</div>
                    <div className="text-slate-400 mt-1">
                      {p.chain?.takeProfitHit ? "已达链级止盈，可考虑减仓/平仓" : "未达链 50%，默认继续持有，不因单腿回撤急平"}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {tab === "news" && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">持仓相关新闻</h2>
                  <button
                    onClick={async () => {
                      setNewsLoading(true);
                      setNewsError(null);
                      try {
                        const res = await fetch("/api/news", { cache: "no-store" });
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        setNewsData(await res.json());
                      } catch (e: any) {
                        setNewsError(e.message || "新闻加载失败");
                      } finally {
                        setNewsLoading(false);
                      }
                    }}
                    disabled={newsLoading}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${newsLoading ? "animate-spin" : ""}`} /> 刷新新闻
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  基于当前 IBKR 持仓标的（股票 + 空头 Put 标的）拉取近期新闻摘要。数据源：Yahoo Finance。
                  {newsData?.updatedAt && (
                    <span className="ml-2">更新于 {new Date(newsData.updatedAt).toLocaleString("zh-CN")}</span>
                  )}
                </p>
                {newsError && (
                  <div className="bg-red-950/50 border border-red-800 text-red-200 rounded-xl px-4 py-3 text-sm">{newsError}</div>
                )}
                {newsLoading && !newsData && (
                  <div className="flex justify-center py-12 text-slate-400 gap-3">
                    <RefreshCw className="w-5 h-5 animate-spin" /> 加载新闻中…
                  </div>
                )}
                {newsData?.symbols?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newsData.symbols.map((s: string) => (
                      <span key={s} className="text-xs px-2 py-1 rounded-full bg-sky-950/50 border border-sky-800 text-sky-300">{s}</span>
                    ))}
                  </div>
                )}
                <div className="space-y-4">
                  {(newsData?.items || []).map((group: any) => (
                    <div key={group.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-sky-300">{group.symbol}</span>
                        {group.name && <span className="text-sm text-slate-500">{group.name}</span>}
                        <span className="text-xs text-slate-500 ml-auto">{(group.news || []).length} 条</span>
                      </div>
                      {(group.news || []).length === 0 && (
                        <div className="text-sm text-slate-500">暂无重大新闻</div>
                      )}
                      <ul className="space-y-3">
                        {(group.news || []).map((n: any, i: number) => (
                          <li key={i} className="border-t border-slate-800 pt-3 first:border-0 first:pt-0">
                            <a href={n.link || "#"} target="_blank" rel="noopener noreferrer"
                              className="text-sm font-medium text-slate-100 hover:text-sky-300 leading-snug">
                              {n.title}
                            </a>
                            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
                              {n.publisher && <span>{n.publisher}</span>}
                              {n.publishedAt && <span>{new Date(n.publishedAt).toLocaleString("zh-CN")}</span>}
                            </div>
                            {n.summary && (
                              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed line-clamp-3">{n.summary}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {newsData && (!newsData.items || newsData.items.length === 0) && !newsLoading && (
                  <div className="text-sm text-slate-500">当前无持仓标的或未能获取新闻。</div>
                )}
              </section>
            )}

            {tab === "trend" && trendForecast && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">趋势预测（当天 + 未来 7 天）</h2>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-sm">
                  <div>当日：<strong>{trendForecast.today}</strong></div>
                  <div className="text-slate-400">{trendForecast.weekBase}</div>
                  <div className="text-emerald-400/90">{trendForecast.weekBull}</div>
                  <div className="text-rose-400/90">{trendForecast.weekBear}</div>
                  <div className="pt-2 border-t border-slate-800 text-sky-300">{trendForecast.action}</div>
                </div>
              </section>
            )}

            {tab === "history" && history && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">历史账本</h2>
                <div className="flex flex-wrap gap-2">
                  {(["全部", "成交", "每日持仓", "账户快照"] as const).map((f) => (
                    <button key={f} onClick={() => setHistFilter(f)}
                      className={`px-3 py-1 rounded-lg text-sm ${histFilter === f ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                      {f}
                    </button>
                  ))}
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="min-w-full text-xs">
                    <thead className="bg-slate-900 text-slate-400">
                      <tr>
                        {["类型", "时间", "标的", "资产", "动作", "开平", "方向", "到期", "行权价", "数量", "成交价", "标的价", "权利金", "已实现", "未实现", "市值", "NLV", "现金", "IV", "Δ", "趋势", "备注", "风险"].map((h) => (
                          <th key={h} className="px-2 py-2 text-left whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerRows.slice(0, 200).map((r) => (
                        <tr key={r.id} className="border-t border-slate-800 align-top">
                          <td className="px-2 py-1.5 whitespace-nowrap">{r.recordType}</td>
                          <td className="px-2 py-1.5 whitespace-nowrap">{r.datetime?.slice(0, 16)?.replace("T", " ")}</td>
                          <td className="px-2 py-1.5 font-medium">{r.symbol}</td>
                          <td className="px-2 py-1.5">{r.assetType}</td>
                          <td className="px-2 py-1.5">{r.action}</td>
                          <td className="px-2 py-1.5">{r.openClose}</td>
                          <td className="px-2 py-1.5">{r.direction}</td>
                          <td className="px-2 py-1.5">{r.expiry}</td>
                          <td className="px-2 py-1.5">{r.strike != null ? r.strike : ""}</td>
                          <td className="px-2 py-1.5">{r.qty != null ? r.qty : ""}</td>
                          <td className="px-2 py-1.5">{fmt(r.fillPrice)}</td>
                          <td className="px-2 py-1.5">{fmt(r.underlyingPrice)}</td>
                          <td className="px-2 py-1.5">{fmt(r.optionPremium)}</td>
                          <td className={`px-2 py-1.5 ${(r.realizedPnl ?? 0) > 0 ? "text-emerald-400" : (r.realizedPnl ?? 0) < 0 ? "text-red-400" : ""}`}>{fmt(r.realizedPnl, 0)}</td>
                          <td className={`px-2 py-1.5 ${(r.unrealizedPnl ?? 0) > 0 ? "text-emerald-400" : (r.unrealizedPnl ?? 0) < 0 ? "text-red-400" : ""}`}>{fmt(r.unrealizedPnl, 0)}</td>
                          <td className="px-2 py-1.5">{fmt(r.marketValue, 0)}</td>
                          <td className="px-2 py-1.5">{fmt(r.nlv, 0)}</td>
                          <td className="px-2 py-1.5">{fmt(r.usdCash, 0)}</td>
                          <td className="px-2 py-1.5">{fmtPct(r.iv)}</td>
                          <td className="px-2 py-1.5">{r.delta != null ? r.delta.toFixed(2) : ""}</td>
                          <td className="px-2 py-1.5">{r.marketTrend}</td>
                          <td className="px-2 py-1.5 min-w-[200px] max-w-[360px] whitespace-normal break-words text-slate-300">{r.reason}</td>
                          <td className="px-2 py-1.5 min-w-[160px] max-w-[280px] whitespace-normal break-words text-slate-400">{r.riskReview}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {tab === "rules" && playbook && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">原则</h2>
                <pre className="text-xs text-slate-400 whitespace-pre-wrap bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-auto max-h-[70vh]">
                  {JSON.stringify(playbook, null, 2)}
                </pre>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
