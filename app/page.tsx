"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Search, RefreshCw, Zap, Layers, Target, Briefcase, RefreshCcw, Brain, BookOpen, History,
} from "lucide-react";

type StrategyScore = { name: string; score: number; reason: string };
type HistoryEntry = {
  id: string;
  nlv: number;
  cashPct: number;
  unrealizedPnl: number;
  shortPuts: { underlying: string; mark: number; legPct: number; delta?: number | null; iv?: number | null }[];
  note?: string;
};

const TABS = [
  { id: "market", label: "1 市场", icon: Layers },
  { id: "strategy", label: "2 策略", icon: Target },
  { id: "scan", label: "3-4 标的/期权", icon: Search },
  { id: "portfolio", label: "5 组合·IBKR", icon: Briefcase },
  { id: "roll", label: "6 展期", icon: RefreshCcw },
  { id: "ai", label: "7 AI评分", icon: Brain },
  { id: "history", label: "历史", icon: History },
  { id: "rules", label: "原则", icon: BookOpen },
] as const;
type TabId = (typeof TABS)[number]["id"];
const AUTO_REFRESH_MS = 2 * 60 * 1000;

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
  const [history, setHistory] = useState<{ count: number; entries: HistoryEntry[] } | null>(null);
  const [tab, setTab] = useState<TabId>("market");
  const [minScore, setMinScore] = useState(50);
  const [search, setSearch] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const hasData = useRef(false);

  const fetchScan = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent && hasData.current;
    if (silent) setRefreshing(true);
    else setLoading(true);
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

  const filtered = results.filter((r) => {
    if (!search) return true;
    const q = search.toUpperCase();
    return r.symbol?.includes(q) || r.name?.toUpperCase().includes(q);
  });

  const brent = market?.brentPrice;
  const fgi = market?.fearGreedIndex;
  const fgiLabel = market?.fearGreedLabel || "—";

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
              <p className="text-xs text-slate-400">六层筛选 · 链级50% · 布伦特/F&G</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400 flex-wrap">
            {updatedAt && (
              <span>
                更新 {new Date(updatedAt).toLocaleString("zh-CN")}
                {refreshing && <span className="ml-1 text-sky-400">刷新中…</span>}
              </span>
            )}
            <label className="flex items-center gap-1.5 cursor-pointer text-xs">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded border-slate-600" />
              <span className={autoRefresh ? "text-sky-300" : "text-slate-500"}>自动刷新</span>
            </label>
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
                  <div className={`rounded-2xl border-2 p-6 ${
                    (brent ?? 0) >= 100
                      ? "bg-orange-950/60 border-orange-500 shadow-lg shadow-orange-900/40"
                      : (brent ?? 0) >= 80
                      ? "bg-amber-950/50 border-amber-500"
                      : "bg-emerald-950/50 border-emerald-500"
                  }`}>
                    <div className="text-sm font-medium text-orange-200/80 tracking-wide mb-1">布伦特原油 Brent</div>
                    <div className={`text-5xl sm:text-6xl font-black tabular-nums leading-none ${
                      (brent ?? 0) >= 100 ? "text-orange-400" : (brent ?? 0) >= 80 ? "text-amber-300" : "text-emerald-400"
                    }`}>
                      {brent != null ? `$${Number(brent).toFixed(2)}` : "—"}
                    </div>
                    <div className={`mt-3 text-lg font-semibold ${
                      (brent ?? 0) >= 100 ? "text-orange-300" : "text-slate-400"
                    }`}>
                      {(brent ?? 0) >= 100 ? "偏高 · 能源成本压力" : (brent ?? 0) >= 80 ? "中性偏高" : "相对温和"}
                    </div>
                  </div>
                  <div className={`rounded-2xl border-2 p-6 ${
                    (fgi ?? 50) <= 25
                      ? "bg-red-950/70 border-red-500 shadow-lg shadow-red-900/40"
                      : (fgi ?? 50) <= 44
                      ? "bg-rose-950/60 border-rose-400 shadow-md"
                      : (fgi ?? 50) <= 55
                      ? "bg-slate-900 border-slate-500"
                      : (fgi ?? 50) <= 74
                      ? "bg-lime-950/50 border-lime-500"
                      : "bg-emerald-950/60 border-emerald-400"
                  }`}>
                    <div className="text-sm font-medium text-slate-300/80 tracking-wide mb-1">Fear &amp; Greed Index</div>
                    <div className={`text-5xl sm:text-6xl font-black tabular-nums leading-none ${
                      (fgi ?? 50) <= 25 ? "text-red-400"
                      : (fgi ?? 50) <= 44 ? "text-rose-400"
                      : (fgi ?? 50) <= 55 ? "text-slate-200"
                      : (fgi ?? 50) <= 74 ? "text-lime-400"
                      : "text-emerald-400"
                    }`}>
                      {fgi != null ? fgi : "—"}
                    </div>
                    <div className={`mt-3 text-2xl font-bold ${
                      (fgi ?? 50) <= 25 ? "text-red-300"
                      : (fgi ?? 50) <= 44 ? "text-rose-300"
                      : (fgi ?? 50) <= 55 ? "text-slate-300"
                      : (fgi ?? 50) <= 74 ? "text-lime-300"
                      : "text-emerald-300"
                    }`}>
                      {fgiLabel}
                    </div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-900 border border-slate-700 p-4">
                    <div className="text-xs text-slate-500">VIX 代理</div>
                    <div className={`text-3xl font-bold ${(market.vixProxy ?? 0) >= 28 ? "text-amber-400" : "text-sky-300"}`}>{market.vixProxy ?? "—"}</div>
                  </div>
                  <div className="rounded-xl bg-slate-900 border border-slate-700 p-4">
                    <div className="text-xs text-slate-500">SPY</div>
                    <div className={`text-3xl font-bold ${(market.spyChange ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {(market.spyChange ?? 0) >= 0 ? "+" : ""}{Number(market.spyChange ?? 0).toFixed(2)}%
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-900 border border-slate-700 p-4">
                    <div className="text-xs text-slate-500">QQQ</div>
                    <div className={`text-3xl font-bold ${(market.qqqChange ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {(market.qqqChange ?? 0) >= 0 ? "+" : ""}{Number(market.qqqChange ?? 0).toFixed(2)}%
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(market.regimes || []).map((r: string) => (
                    <span key={r} className="px-3 py-1 rounded-full text-sm font-semibold bg-indigo-950 border border-indigo-500 text-indigo-200">{r}</span>
                  ))}
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-sky-950 border border-sky-500 text-sky-200">偏向 {market.strategyBias}</span>
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
                <h2 className="text-lg font-semibold">第五层：组合</h2>
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
                {ibkr.riskFlags?.map((w: string, i: number) => (
                  <div key={i} className="text-amber-200 text-sm">⚠ {w}</div>
                ))}
                <h3 className="font-semibold text-slate-300">股票</h3>
                {ibkr.stocks?.map((s: any) => (
                  <div key={s.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex gap-4 text-sm">
                    <span className="font-bold">{s.symbol}</span>
                    <span>{s.qty}股</span>
                    <span>${Number(s.price).toFixed(2)}</span>
                    <span className={Number(s.pnl) >= 0 ? "text-emerald-400" : "text-red-400"}>${Number(s.pnl).toFixed(0)}</span>
                  </div>
                ))}
                <h3 className="font-semibold text-slate-300">空头 Put</h3>
                {ibkr.shortPuts?.map((p: any) => (
                  <div key={p.description} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm space-y-1">
                    <div className="font-bold">{p.underlying} {p.strike}P · DTE {p.dte}</div>
                    <div>入场 {Number(p.entryPremium).toFixed(2)} → 现价 {Number(p.currentPremium).toFixed(2)} · 单腿 {(p.profitPctOfCredit * 100).toFixed(0)}%</div>
                    <div className="text-slate-400">Δ {p.delta != null ? Number(p.delta).toFixed(2) : "—"} · IV {p.iv != null ? `${(Number(p.iv) * 100).toFixed(0)}%` : "—"} · 标的 {p.spot ?? "—"}</div>
                    {p.chain && (
                      <div className={p.chain.takeProfitHit ? "text-emerald-400 font-semibold" : "text-slate-400"}>
                        链目标 ≤${Number(p.chain.targetClosePrice).toFixed(2)} · 进度 {(Number(p.chain.progressToTarget) * 100).toFixed(0)}%
                        {p.chain.takeProfitHit ? " · 已达链级止盈" : ""}
                      </div>
                    )}
                  </div>
                ))}
              </section>
            )}

            {tab === "roll" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">第六层：展期 / 链级</h2>
                {ibkr?.shortPuts?.map((p: any) => (
                  <div key={p.underlying} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm">
                    <div className="font-bold">{p.underlying}</div>
                    <div>现价 {Number(p.currentPremium).toFixed(2)} · 链目标 ≤${p.chain ? Number(p.chain.targetClosePrice).toFixed(2) : "—"}</div>
                  </div>
                ))}
              </section>
            )}

            {tab === "ai" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">第七层：AI 评分</h2>
                {filtered.slice(0, 15).map((r) => (
                  <div key={r.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex justify-between text-sm gap-2">
                    <span className="font-bold">{r.symbol}</span>
                    <span className="text-sky-400">{r.aiScore}</span>
                    <span className="text-slate-400 text-xs truncate">{r.recommendedAction}</span>
                  </div>
                ))}
              </section>
            )}

            {tab === "history" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">历史</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-500 border-b border-slate-800">
                        <th className="py-2 pr-3">日期</th>
                        <th className="py-2 pr-3">NLV</th>
                        <th className="py-2 pr-3">现金%</th>
                        <th className="py-2 pr-3">Puts</th>
                        <th className="py-2">备注</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(history?.entries || []).map((e) => (
                        <tr key={e.id} className="border-b border-slate-900">
                          <td className="py-2 pr-3 whitespace-nowrap">{e.id}</td>
                          <td className="py-2 pr-3">${(e.nlv / 1000).toFixed(1)}k</td>
                          <td className="py-2 pr-3">{e.cashPct?.toFixed(1)}%</td>
                          <td className="py-2 pr-3 text-xs">{e.shortPuts?.map((p) => `${p.underlying}:${p.mark.toFixed(1)}`).join(" · ")}</td>
                          <td className="py-2 text-xs text-slate-400 max-w-xs truncate">{e.note}</td>
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
