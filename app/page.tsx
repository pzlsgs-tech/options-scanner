"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search, RefreshCw, Zap, Layers, Target, Briefcase, RefreshCcw, Brain, BookOpen,
} from "lucide-react";

type StrategyScore = { name: string; score: number; reason: string };
type Result = {
  symbol: string; name: string; sector: string; typicalOptionsVolume: string;
  price: number; changePercent: number; volume: number;
  liquidityScore: number; optionsSuitabilityScore: number; ivRankProxy: number;
  trend: string; volatilityProxy: number; themes: string[];
  underlying: { fundamentalScore: number; technicalScore: number; riskScore: number; total: number; flags: string[] };
  optionLayer: { ivRankProxy: number; liquidityScore: number; premiumQuality: number; yieldProxy: number; total: number; notes: string[] };
  portfolioOk: boolean; portfolioWarning: string | null;
  roll?: {
    score: number; stars: number; recommendation: string;
    factors: { label: string; value: string; weight: string }[];
    detail: { strike: number; expiry: string; dte: number; entryPremium: number; currentPremium: number; unrealizedPnl: number; profitPctOfCredit: number };
  };
  aiScore: number; aiBreakdown: Record<string, number>; recommendedAction: string;
  poolTier?: string; poolLabel?: string; playbookScore?: number; playbookNotes?: string[];
};

const TABS = [
  { id: "market", label: "1 市场", icon: Layers },
  { id: "strategy", label: "2 策略", icon: Target },
  { id: "scan", label: "3-4 标的/期权", icon: Search },
  { id: "portfolio", label: "5 组合·IBKR", icon: Briefcase },
  { id: "roll", label: "6 展期", icon: RefreshCcw },
  { id: "ai", label: "7 AI评分", icon: Brain },
  { id: "rules", label: "原则", icon: BookOpen },
] as const;
type TabId = (typeof TABS)[number]["id"];

const AUTO_REFRESH_MS = 2 * 60 * 1000; // 2 minutes

export default function Home() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState("");
  const [note, setNote] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const [market, setMarket] = useState<any>(null);
  const [strategyScores, setStrategyScores] = useState<StrategyScore[]>([]);
  const [topStrategy, setTopStrategy] = useState<StrategyScore | null>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [ibkr, setIbkr] = useState<any>(null);
  const [playbook, setPlaybook] = useState<any>(null);
  const [optionCriteria, setOptionCriteria] = useState<any>(null);
  const [tab, setTab] = useState<TabId>("rules");
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
      setNote(data.note || "");
      setUsingFallback(!!data.usingFallback);
      setMarket(data.market);
      setStrategyScores(data.strategyScores || []);
      setTopStrategy(data.topStrategy || null);
      setPortfolio(data.portfolio);
      setIbkr(data.ibkr);
      setPlaybook(data.playbook);
      setOptionCriteria(data.optionCriteria);
      hasData.current = true;
    } catch (e: any) {
      setError(e.message || "扫描失败");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [minScore]);

  // Initial load + when minScore changes
  useEffect(() => {
    fetchScan();
  }, [fetchScan]);

  // Auto refresh every 2 minutes when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      fetchScan({ silent: true });
    }, AUTO_REFRESH_MS);
    return () => clearInterval(id);
  }, [autoRefresh, fetchScan]);

  const filtered = results.filter((r) => {
    if (!search) return true;
    const q = search.toUpperCase();
    return r.symbol.includes(q) || r.name.toUpperCase().includes(q);
  });
  const rollResults = results.filter((r) => r.roll);

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
              <p className="text-xs text-slate-400">六层筛选 · CSP Playbook · IBKR</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400 flex-wrap">
            {updatedAt && (
              <span title="行情扫描时间">
                更新 {new Date(updatedAt).toLocaleString("zh-CN")}
                {refreshing && <span className="ml-1 text-sky-400">刷新中…</span>}
              </span>
            )}
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-slate-600"
              />
              <span className={autoRefresh ? "text-sky-300" : "text-slate-500"}>自动刷新 2分钟</span>
            </label>
            <button
              onClick={() => fetchScan({ silent: hasData.current })}
              disabled={loading || refreshing}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading || refreshing ? "animate-spin" : ""}`} />
              刷新
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
        {usingFallback && (
          <div className="bg-amber-950/40 border border-amber-800/60 text-amber-200 rounded-xl px-4 py-3 text-sm">
            行情可能使用缓存价；IBKR 持仓为快照（需对话中「更新持仓」或改代码刷新）。点击「刷新」会重新拉行情与评分。
          </div>
        )}
        {error && <div className="bg-red-950/50 border border-red-800 text-red-200 rounded-xl px-4 py-3">错误: {error}</div>}
        {loading && !hasData.current && (
          <div className="flex justify-center py-20 text-slate-400 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin" /> 加载中...
          </div>
        )}

        {(!loading || hasData.current) && !error && (
          <>
            {tab === "market" && market && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">第一层：市场环境</h2>
                <div className="flex flex-wrap gap-2">
                  {market.regimes?.map((r: string) => (
                    <span key={r} className={`px-3 py-1 rounded-full text-sm font-medium ${
                      r === "Bull" || r === "Risk On" ? "bg-emerald-900/60 text-emerald-300" :
                      r === "Bear" || r === "Risk Off" || r === "Correction" ? "bg-red-900/60 text-red-300" :
                      r === "High IV" ? "bg-amber-900/60 text-amber-300" : "bg-slate-700 text-slate-300"
                    }`}>{r}</span>
                  ))}
                </div>
                <p className="text-sm text-slate-400">{market.summary}</p>
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
                {strategyScores.map((s) => (
                  <div key={s.name} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                    <div className={`text-xl font-bold w-12 ${s.score >= 80 ? "text-emerald-400" : s.score >= 50 ? "text-amber-400" : "text-slate-500"}`}>{s.score}</div>
                    <div className="flex-1"><div className="font-semibold">{s.name}</div><div className="text-sm text-slate-400">{s.reason}</div></div>
                  </div>
                ))}
              </section>
            )}

            {tab === "scan" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">第三/四层：标的与期权</h2>
                <div className="flex gap-3">
                  <input type="number" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                </div>
                {filtered.slice(0, 30).map((r) => (
                  <div key={r.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-3 items-center">
                    <div className="font-bold min-w-[100px]">
                      {r.symbol} <span className="text-sky-400">{r.aiScore}</span>
                      {r.poolLabel && <div className="text-xs text-slate-500">{r.poolLabel}</div>}
                    </div>
                    <div className="text-sm">${r.price.toFixed(2)} <span className={r.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}>{r.changePercent.toFixed(2)}%</span></div>
                    <div className="text-xs text-sky-300 flex-1">{r.recommendedAction}</div>
                  </div>
                ))}
              </section>
            )}

            {tab === "portfolio" && ibkr && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">第五层：组合风险（IBKR 快照）</h2>
                <p className="text-xs text-slate-500">快照时间：{ibkr.snapshotAt ? new Date(ibkr.snapshotAt).toLocaleString("zh-CN") : "—"} · 非每次点击刷新都会变，需对话中更新持仓</p>
                <div className="grid sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500">NLV</div>
                    <div className="text-xl font-bold">${ibkr.balances?.netLiquidation?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500">现金</div>
                    <div className="text-xl font-bold">${ibkr.balances?.cashBalance?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className={`text-xs ${ibkr.balances?.cashPct >= 40 ? "text-emerald-400" : "text-amber-400"}`}>{ibkr.balances?.cashPct?.toFixed(1)}%</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500">股票市值</div>
                    <div className="text-xl font-bold">${ibkr.balances?.stockMarketValue?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500">未实现盈亏</div>
                    <div className={`text-xl font-bold ${ibkr.balances?.unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>${ibkr.balances?.unrealizedPnl?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>
                {ibkr.riskFlags?.length > 0 && (
                  <div className="bg-amber-950/40 border border-amber-800 rounded-xl p-4 space-y-1">
                    {ibkr.riskFlags.map((w: string, i: number) => <div key={i} className="text-amber-200 text-sm">⚠ {w}</div>)}
                  </div>
                )}
                <h3 className="font-semibold text-slate-300">空头 Put</h3>
                {ibkr.shortPuts?.map((p: any) => (
                  <div key={p.description} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 text-sm">
                    <div className="font-bold">{p.underlying} {p.strike}P</div>
                    <div className="text-slate-400">{p.expiry} · DTE {p.dte}</div>
                    <div className={p.unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}>浮盈 ${(p.unrealizedPnl||0).toFixed(0)} ({((p.profitPctOfCredit||0)*100).toFixed(0)}%)</div>
                    {p.takeProfitHit && <span className="text-emerald-300 text-xs">已达50%止盈线</span>}
                  </div>
                ))}
              </section>
            )}

            {tab === "roll" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">第六层：Roll Scanner</h2>
                {rollResults.length === 0 && <div className="text-slate-500">无空头 Put</div>}
                {rollResults.map((r) => (
                  <div key={r.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-bold">{r.symbol} {r.roll!.detail.strike}P</div>
                      <span className="text-sm px-2 py-0.5 rounded bg-slate-800">{r.roll!.recommendation}</span>
                    </div>
                    <div className="text-sm text-sky-300">{r.recommendedAction}</div>
                    <div className="text-xs text-slate-400">浮盈占权利金 {(r.roll!.detail.profitPctOfCredit*100).toFixed(0)}% · DTE {r.roll!.detail.dte}</div>
                  </div>
                ))}
              </section>
            )}

            {tab === "ai" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">第七层：AI 综合评分</h2>
                {filtered.slice(0, 25).map((r) => (
                  <div key={r.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-4">
                    <div className={`text-2xl font-bold w-14 text-center ${r.aiScore >= 80 ? "text-emerald-400" : r.aiScore >= 65 ? "text-sky-400" : "text-slate-400"}`}>{r.aiScore}</div>
                    <div className="font-bold min-w-[70px]">{r.symbol}<div className="text-xs text-slate-500">{r.poolLabel}</div></div>
                    <div className="text-sm text-sky-300 flex-1">{r.recommendedAction}</div>
                  </div>
                ))}
              </section>
            )}

            {tab === "rules" && playbook && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><BookOpen className="w-5 h-5 text-sky-400" />CSP 筛选原则</h2>
                {playbook.nextCycleHint && (
                  <div className="bg-sky-950/40 border border-sky-800 rounded-xl px-4 py-3 text-sky-200 text-sm">{playbook.nextCycleHint}</div>
                )}
                <div className="space-y-3">
                  {(playbook.principles || []).map((pr: any) => (
                    <div key={pr.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <div className="font-semibold">{pr.title}</div>
                      <div className="text-sm text-slate-400 mt-1">{pr.detail}</div>
                    </div>
                  ))}
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
                    <div className="text-xs text-slate-500 mb-2">账户纪律</div>
                    <div>周期：约每 {playbook.accountRules?.cycleDays} 天，最多 {playbook.accountRules?.maxNewCspPerCycle} 个 CSP</div>
                    <div>现金 ≥ {playbook.accountRules?.minCashPct}% NLV</div>
                    <div>单票保证金 ≤ {playbook.accountRules?.maxSingleMarginPct}% NLV</div>
                    <div>同主题 Put ≤ {playbook.accountRules?.maxThemePuts}</div>
                    <div>周期目标权利金 ≈ ${playbook.accountRules?.targetPremiumPerCycleUsd}</div>
                    <div>止盈：浮盈 ≥ 权利金 {playbook.accountRules?.takeProfitPctOfCredit}%</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
                    <div className="text-xs text-slate-500 mb-2">合约参数</div>
                    {optionCriteria && Object.entries(optionCriteria).map(([k, v]) => (
                      <div key={k}><span className="text-slate-500">{k}: </span>{String(v)}</div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {note && <p className="text-xs text-slate-600 border-t border-slate-800 pt-4">{note}</p>}
          </>
        )}
      </main>
    </div>
  );
}
