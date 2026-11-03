"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Search, RefreshCw, Zap, Layers, Briefcase, RefreshCcw, TrendingUp, BookOpen, History, Newspaper, Download,
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
    const today = riskOff
      ? "偏空 / 谨慎"
      : market.spyTrend === "up" && market.qqqTrend === "up"
        ? "偏多"
        : "震荡";
    return {
      today,
      weekBase: riskOff ? "基准：震荡偏弱" : "基准：震荡为主，按链 50% 与现金纪律执行",
      weekBull: "乐观：可考虑合规下补 1 个 CSP",
      weekBear: "悲观：优先保现金与接股意愿",
      action: riskOff ? "本周：不新开；管理 AMAT/COHR 链进度" : "本周：可扫描下一期 1 个 CSP（核心池）",
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
              <p className="text-xs text-slate-400">持有优先 · 链级50% · 完整历史可导出</p>
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
              </section>
            )}

            {tab === "scan" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">选股 / 期权（五步纪律）</h2>
                <div className="flex gap-3">
                  <input type="number" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索标的" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                </div>
                {filtered.slice(0, 25).map((r) => (
                  <div key={r.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm">
                    <span className="font-bold">{r.symbol}</span> <span className="text-sky-400">{r.aiScore}</span>
                    {r.poolLabel && <span className="ml-2 text-xs text-slate-400">{r.poolLabel}</span>}
                  </div>
                ))}
              </section>
            )}

            {tab === "portfolio" && ibkr && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">组合 · IBKR</h2>
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
                </div>
                <h3 className="font-semibold text-slate-300">股票</h3>
                {(ibkr.stocks || []).map((s: any) => (
                  <div key={s.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm flex gap-3">
                    <span className="font-bold">{s.symbol}</span>
                    <span>{Number(s.qty).toFixed(s.qty % 1 ? 2 : 0)} 股</span>
                    <span className={Number(s.pnl) >= 0 ? "text-emerald-400" : "text-red-400"}>${Number(s.pnl).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                ))}
                <h3 className="font-semibold text-slate-300">空头 Put</h3>
                {(ibkr.shortPuts || []).map((p: any) => (
                  <div key={p.underlying} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm">
                    {p.underlying} {p.strike}P · mark {Number(p.currentPremium).toFixed(2)}
                  </div>
                ))}
              </section>
            )}

            {tab === "roll" && ibkr && (
              <section className="space-y-3">
                <h2 className="text-lg font-semibold">展期</h2>
                {(ibkr.shortPuts || []).map((p: any) => (
                  <div key={p.underlying} className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm">
                    {p.underlying}: {p.chain?.takeProfitHit ? "已达链级止盈" : "未达链 50%，默认持有"}
                  </div>
                ))}
              </section>
            )}

            {tab === "news" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">持仓新闻</h2>
                {newsLoading && !newsData && <div className="text-slate-400">加载中…</div>}
                {newsError && <div className="text-red-300 text-sm">{newsError}</div>}
                {(newsData?.items || []).map((g: any) => (
                  <div key={g.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="font-bold text-sky-300">{g.symbol}</div>
                    {(g.news || []).slice(0, 3).map((n: any, i: number) => (
                      <a key={i} href={n.link || "#"} target="_blank" rel="noreferrer" className="block text-sm hover:text-sky-300">{n.title}</a>
                    ))}
                  </div>
                ))}
              </section>
            )}

            {tab === "trend" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">趋势预测 + 持仓监控</h2>
                {trendForecast && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm space-y-1">
                    <div>宏观：<strong>{trendForecast.today}</strong></div>
                    <div className="text-sky-300">{trendForecast.action}</div>
                  </div>
                )}
                {monitorLoading && !monitorData && <div className="text-slate-400">拉取监控…</div>}
                {monitorError && <div className="text-red-300 text-sm">{monitorError}</div>}
                {(monitorData?.items || []).map((m: any) => (
                  <div key={m.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-1">
                    <div className="font-bold text-sky-300 text-sm">{m.symbol}</div>
                    <div>财报：{m.earningsDate || "—"} {m.daysToEarnings != null ? `（${m.daysToEarnings}天）` : ""}</div>
                    <div>估值：{m.peVsForwardNote || "—"}</div>
                    <div>共识：{m.consensusNote || "—"}</div>
                    <div>IV：{m.iv != null ? `${(Number(m.iv) * 100).toFixed(0)}%` : "—"}</div>
                    {(m.alerts || []).map((a: string, i: number) => (
                      <div key={i} className="text-amber-200">⚠ {a}</div>
                    ))}
                  </div>
                ))}
              </section>
            )}

            {tab === "history" && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold">历史账本（完整）</h2>
                  <a
                    href="/api/history-export"
                    download="ibkr-history-full.csv"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-sm"
                  >
                    <Download className="w-4 h-4" /> 导出全部 CSV
                  </a>
                </div>
                <p className="text-xs text-slate-500">
                  含 2026-08-09 起归档 + 近期每日快照。导出接口：/api/history-export
                  {history?.count != null && ` · 当前账本行数约 ${history.count}`}
                </p>
                <div className="flex flex-wrap gap-2">
                  {(["全部", "成交", "每日持仓", "账户快照"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setHistFilter(f)}
                      className={`px-3 py-1 rounded-lg text-sm ${histFilter === f ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-400"}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="min-w-full text-xs">
                    <thead className="bg-slate-900 text-slate-400">
                      <tr>
                        {["类型", "时间", "标的", "动作", "方向", "行权价", "已实现", "未实现", "NLV", "备注"].map((h) => (
                          <th key={h} className="px-2 py-2 text-left whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerRows.slice(0, 150).map((r) => (
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
                          <td className="px-2 py-1.5 max-w-[220px] truncate text-slate-400">{r.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {(!history || ledgerRows.length === 0) && (
                  <div className="text-sm text-slate-500">暂无账本行；请点「导出全部 CSV」下载快照历史。</div>
                )}
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
