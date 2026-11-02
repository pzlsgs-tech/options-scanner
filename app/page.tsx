"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Search, RefreshCw, Zap, Layers, Briefcase, RefreshCcw, TrendingUp, BookOpen, History, Newspaper,
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
  { id: "scan", label: "2 选股/期权", icon: Search },
  { id: "portfolio", label: "3 组合·IBKR", icon: Briefcase },
  { id: "roll", label: "4 展期", icon: RefreshCcw },
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
  const [monitorData, setMonitorData] = useState<{ updatedAt: string; items: any[]; note?: string } | null>(null);
  const [monitorLoading, setMonitorLoading] = useState(false);
  const [monitorError, setMonitorError] = useState<string | null>(null);
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

  useEffect(() => {
    if (tab !== "trend") return;
    let cancelled = false;
    (async () => {
      setMonitorLoading(true);
      setMonitorError(null);
      try {
        const res = await fetch("/api/holdings-monitor", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) setMonitorData(data);
      } catch (e: any) {
        if (!cancelled) setMonitorError(e.message || "持仓监控加载失败");
      } finally {
        if (!cancelled) setMonitorLoading(false);
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
    const today = riskOff
      ? "偏空 / 谨慎"
      : market.spyTrend === "up" && market.qqqTrend === "up"
        ? "偏多"
        : "震荡";
    return {
      today,
      weekBase: riskOff
        ? "基准：震荡偏弱，半导 Put 可能继续承压"
        : "基准：震荡为主，按链 50% 与现金纪律执行",
      weekBull: "乐观：风险偏好回升，可考虑在合规下补 1 个 CSP",
      weekBear: "悲观：继续 Risk-Off，优先保现金与接股意愿",
      action: riskOff
        ? "本周：不新开；管理 AMAT/COHR 链进度"
        : "本周：可扫描下一期 1 个 CSP（核心池）",
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
              <p className="text-xs text-slate-400">持有优先 · 链级50% · 持仓动态监控</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400 flex-wrap">
            {updatedAt && (
              <span>
                更新 {new Date(updatedAt).toLocaleString("zh-CN")}
                {refreshing && <span className="ml-1 text-sky-400">刷新中…</span>}
              </span>
            )}
            <button
              onClick={() => fetchScan({ silent: hasData.current })}
              disabled={loading || refreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading || refreshing ? "animate-spin" : ""}`} /> 刷新
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 pb-3 flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                  tab === t.id ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {t.label}
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-200 rounded-xl px-4 py-3">错误: {error}</div>
        )}
        {loading && !hasData.current && (
          <div className="flex justify-center py-20 text-slate-400 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin" /> 加载中...
          </div>
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

            {tab === "scan" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">选股 / 期权（五步纪律）</h2>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-1">
                  <div><span className="text-sky-400 font-semibold">① 先选股</span>：不看权利金，只问在平衡点价位是否愿意长期持有</div>
                  <div><span className="text-sky-400 font-semibold">② 再看权利金</span>：是对风险的补偿，不是选股理由</div>
                  <div><span className="text-sky-400 font-semibold">③ 看催化剂</span>：到期前是否有财报、数据、监管事件</div>
                  <div><span className="text-sky-400 font-semibold">④ 控仓位</span>：单只最大亏损（现金占用）占 NLV 比例，高波动更小</div>
                  <div><span className="text-sky-400 font-semibold">⑤ 想好后路</span>：被行权后持股、卖 Covered Call，还是逻辑破坏止损</div>
                </div>
                <div className="flex gap-3">
                  <input type="number" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索标的" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                </div>
                {filtered.slice(0, 30).map((r) => {
                  const tier = r.poolTier || "";
                  const holdOk = tier === "core";
                  const holdCaution = tier === "caution";
                  const iv = r.ivRankProxy ?? r.optionLayer?.ivRankProxy;
                  return (
                    <div key={r.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                      <div className="flex flex-wrap gap-3 items-center">
                        <div className="font-bold min-w-[100px]">{r.symbol} <span className="text-sky-400">{r.aiScore}</span></div>
                        {r.poolLabel && <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">{r.poolLabel}</span>}
                        <div className="text-xs text-sky-300 flex-1">{r.recommendedAction}</div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-1.5 text-xs">
                        <div className={holdOk ? "text-emerald-400" : holdCaution ? "text-rose-400" : "text-amber-300"}>
                          ① 愿持有：{holdOk ? "核心池" : holdCaution ? "慎做" : "卫星/常规 · 需自行确认"}
                        </div>
                        <div className="text-slate-400">② 权利金：IV代理 {iv != null ? iv : "—"}（仅补偿）</div>
                        <div className="text-slate-400">③ 催化剂：{r.catalystNote || "需人工确认财报/监管"}</div>
                        <div className="text-slate-400">④ 仓位：assignment ≤10% NLV · 保证金 ≤15%</div>
                        <div className="text-slate-400 sm:col-span-2">⑤ 后路：{r.exitPlan || "接货持有 / 备兑 / 逻辑破坏止损"}</div>
                      </div>
                    </div>
                  );
                })}
              </section>
            )}

            {tab === "portfolio" && ibkr && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">组合 · 全部持仓</h2>
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
                <h3 className="font-semibold text-slate-300">股票 / ETF</h3>
                {(ibkr.stocks || []).map((s: any) => (
                  <div key={s.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm flex flex-wrap gap-x-4 gap-y-1">
                    <span className="font-bold">{s.symbol}</span>
                    <span>{Number(s.qty).toFixed(s.qty % 1 ? 2 : 0)} 股</span>
                    <span>现价 ${Number(s.price).toFixed(2)}</span>
                    <span className={Number(s.pnl) >= 0 ? "text-emerald-400" : "text-red-400"}>未实现 ${Number(s.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                ))}
                <h3 className="font-semibold text-slate-300">空头 Put</h3>
                {(ibkr.shortPuts || []).map((p: any) => (
                  <div key={p.description || p.underlying} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm space-y-1">
                    <div className="font-bold">{p.underlying} {p.strike}P · DTE {p.dte}</div>
                    <div>入场 {Number(p.entryPremium).toFixed(2)} → 现价 {Number(p.currentPremium).toFixed(2)}</div>
                    <div className="text-slate-400">Δ {p.delta != null ? Number(p.delta).toFixed(2) : "—"} · IV {p.iv != null ? `${(Number(p.iv) * 100).toFixed(0)}%` : "—"}</div>
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
                <h2 className="text-lg font-semibold">展期</h2>
                {(ibkr.shortPuts || []).map((p: any) => (
                  <div key={p.underlying} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm">
                    <div className="font-bold">{p.underlying}</div>
                    <div className="text-slate-400 mt-1">{p.chain?.takeProfitHit ? "已达链级止盈，可考虑减仓/平仓" : "未达链 50%，默认继续持有"}</div>
                  </div>
                ))}
              </section>
            )}

            {tab === "news" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">持仓相关新闻</h2>
                {newsError && <div className="bg-red-950/50 border border-red-800 text-red-200 rounded-xl px-4 py-3 text-sm">{newsError}</div>}
                {newsLoading && !newsData && <div className="flex justify-center py-12 text-slate-400 gap-3"><RefreshCw className="w-5 h-5 animate-spin" /> 加载中…</div>}
                {(newsData?.items || []).map((group: any) => (
                  <div key={group.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="font-bold text-sky-300">{group.symbol}</div>
                    {(group.news || []).slice(0, 3).map((n: any, i: number) => (
                      <a key={i} href={n.link || "#"} target="_blank" rel="noopener noreferrer" className="block text-sm hover:text-sky-300">{n.title}</a>
                    ))}
                  </div>
                ))}
              </section>
            )}

            {tab === "trend" && (
              <section className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">趋势预测 + 持仓动态监控</h2>
                  <button
                    onClick={async () => {
                      setMonitorLoading(true);
                      setMonitorError(null);
                      try {
                        const res = await fetch("/api/holdings-monitor", { cache: "no-store" });
                        if (!res.ok) throw new Error(`HTTP ${res.status}`);
                        setMonitorData(await res.json());
                      } catch (e: any) {
                        setMonitorError(e.message || "加载失败");
                      } finally {
                        setMonitorLoading(false);
                      }
                    }}
                    disabled={monitorLoading}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${monitorLoading ? "animate-spin" : ""}`} /> 刷新监控
                  </button>
                </div>

                {trendForecast && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-sm">
                    <div>宏观当日：<strong>{trendForecast.today}</strong></div>
                    <div className="text-slate-400">{trendForecast.weekBase}</div>
                    <div className="text-emerald-400/90">{trendForecast.weekBull}</div>
                    <div className="text-rose-400/90">{trendForecast.weekBear}</div>
                    <div className="pt-2 border-t border-slate-800 text-sky-300">{trendForecast.action}</div>
                  </div>
                )}

                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-200">持仓监控：财报拐点 · 估值 · 共识 · IV</h3>
                  <p className="text-xs text-slate-500">
                    数据源：Yahoo 公开摘要 + 账户空头 Put IV（与上一历史快照对比）。
                    {monitorData?.updatedAt && (
                      <span className="ml-2">更新于 {new Date(monitorData.updatedAt).toLocaleString("zh-CN")}</span>
                    )}
                  </p>
                  {monitorError && (
                    <div className="bg-red-950/50 border border-red-800 text-red-200 rounded-xl px-4 py-3 text-sm">{monitorError}</div>
                  )}
                  {monitorLoading && !monitorData && (
                    <div className="flex justify-center py-10 text-slate-400 gap-3">
                      <RefreshCw className="w-5 h-5 animate-spin" /> 拉取持仓监控…
                    </div>
                  )}
                  {(monitorData?.items || []).map((m: any) => {
                    const earnColor =
                      m.earningsFlag === "imminent"
                        ? "text-rose-400"
                        : m.earningsFlag === "soon"
                          ? "text-amber-300"
                          : "text-slate-400";
                    const ivColor =
                      m.ivFlag === "spike"
                        ? "text-rose-400 font-semibold"
                        : m.ivFlag === "elevated"
                          ? "text-amber-300"
                          : "text-slate-400";
                    return (
                      <div key={m.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-lg text-sky-300">{m.symbol}</span>
                          {m.name && <span className="text-xs text-slate-500">{m.name}</span>}
                          {m.price != null && (
                            <span className="text-sm text-slate-300 ml-auto">
                              ${Number(m.price).toFixed(2)}
                              {m.changePct != null && (
                                <span className={m.changePct >= 0 ? " text-emerald-400" : " text-red-400"}>
                                  {" "}{m.changePct >= 0 ? "+" : ""}{Number(m.changePct).toFixed(2)}%
                                </span>
                              )}
                            </span>
                          )}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-1.5 text-xs">
                          <div className={earnColor}>
                            财报拐点：{m.earningsDate || "未知"}
                            {m.daysToEarnings != null && `（${m.daysToEarnings} 天）`}
                            {m.epsTrendSummary && <span className="text-slate-500"> · {m.epsTrendSummary}</span>}
                          </div>
                          <div className="text-slate-400">估值：{m.peVsForwardNote || "—"}</div>
                          <div className="text-slate-400">
                            华尔街共识：{m.consensusNote || "—"}
                            {m.numberOfAnalysts != null && ` · ${m.numberOfAnalysts} 家`}
                          </div>
                          <div className={ivColor}>
                            IV：{m.iv != null ? `${(Number(m.iv) * 100).toFixed(0)}%` : "—"}
                            {m.ivPrev != null && `（前次 ${(Number(m.ivPrev) * 100).toFixed(0)}%）`}
                            {m.ivChangePctPts != null &&
                              ` · 变动 ${m.ivChangePctPts >= 0 ? "+" : ""}${Number(m.ivChangePctPts).toFixed(0)}pt`}
                            {m.ivSource && <span className="text-slate-600"> · {m.ivSource}</span>}
                          </div>
                        </div>
                        {(m.alerts || []).length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-slate-800">
                            {m.alerts.map((a: string, i: number) => (
                              <div key={i} className="text-xs text-amber-200">⚠ {a}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {monitorData && (!monitorData.items || monitorData.items.length === 0) && !monitorLoading && (
                    <div className="text-sm text-slate-500">无持仓标的可监控。</div>
                  )}
                </div>
              </section>
            )}

            {tab === "history" && history && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">历史账本</h2>
                <div className="flex flex-wrap gap-2">
                  {(["全部", "成交", "每日持仓", "账户快照"] as const).map((f) => (
                    <button key={f} onClick={() => setHistFilter(f)} className={`px-3 py-1 rounded-lg text-sm ${histFilter === f ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400"}`}>{f}</button>
                  ))}
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="min-w-full text-xs">
                    <thead className="bg-slate-900 text-slate-400"><tr>
                      {["类型","时间","标的","动作","方向","行权价","已实现","未实现","NLV","备注"].map((h) => (
                        <th key={h} className="px-2 py-2 text-left whitespace-nowrap">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {ledgerRows.slice(0, 100).map((r) => (
                        <tr key={r.id} className="border-t border-slate-800">
                          <td className="px-2 py-1.5">{r.recordType}</td>
                          <td className="px-2 py-1.5">{r.datetime?.slice(0, 16)?.replace("T", " ")}</td>
                          <td className="px-2 py-1.5 font-medium">{r.symbol}</td>
                          <td className="px-2 py-1.5">{r.action}</td>
                          <td className="px-2 py-1.5">{r.direction}</td>
                          <td className="px-2 py-1.5">{r.strike ?? ""}</td>
                          <td className="px-2 py-1.5">{fmt(r.realizedPnl, 0)}</td>
                          <td className="px-2 py-1.5">{fmt(r.unrealizedPnl, 0)}</td>
                          <td className="px-2 py-1.5">{fmt(r.nlv, 0)}</td>
                          <td className="px-2 py-1.5 max-w-[240px] truncate text-slate-400">{r.reason}</td>
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
                <pre className="text-xs text-slate-400 whitespace-pre-wrap bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-auto max-h-[70vh]">{JSON.stringify(playbook, null, 2)}</pre>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
