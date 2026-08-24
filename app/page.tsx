"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import {
  Search, RefreshCw, Zap, Layers, Target, Briefcase, RefreshCcw, Brain, BookOpen, History,
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
    chain?: {
      targetClosePrice: number; progressToTarget: number; takeProfitHit: boolean;
      chainNetCreditUsd: number; chainPnlIfCloseNowUsd: number; chainProfitPctIfCloseNow: number;
    };
  };
  aiScore: number; aiBreakdown: Record<string, number>; recommendedAction: string;
  poolTier?: string; poolLabel?: string; playbookScore?: number; playbookNotes?: string[];
};

type HistoryEntry = {
  id: string;
  capturedAt: string;
  source?: string;
  nlv: number;
  cash: number;
  cashPct: number;
  stockMv: number;
  unrealizedPnl: number;
  shortPuts: { underlying: string; strike: number; mark: number; unrealizedPnl: number; legPct: number }[];
  coveredCalls?: { underlying: string; mark: number; unrealizedPnl: number }[];
  stocks?: { symbol: string; mark: number; unrealizedPnl: number }[];
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

/** 简易折线图（SVG，无第三方依赖） */
function LineChart({
  series,
  height = 220,
  yFormat,
}: {
  series: { name: string; color: string; points: { x: string; y: number }[] }[];
  height?: number;
  yFormat?: (v: number) => string;
}) {
  const width = 640;
  const pad = { top: 16, right: 16, bottom: 36, left: 56 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const allY = series.flatMap((s) => s.points.map((p) => p.y));
  const labels = series[0]?.points.map((p) => p.x) || [];
  const n = Math.max(labels.length, 1);
  const minY = Math.min(...allY, 0);
  const maxY = Math.max(...allY, 1);
  const span = maxY - minY || 1;

  const sx = (i: number) => pad.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const sy = (v: number) => pad.top + innerH - ((v - minY) / span) * innerH;

  const fmt = yFormat || ((v: number) => (Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = pad.top + innerH * (1 - t);
        const val = minY + span * t;
        return (
          <g key={t}>
            <line x1={pad.left} x2={pad.left + innerW} y1={y} y2={y} stroke="#334155" strokeWidth={1} />
            <text x={pad.left - 8} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize={10}>
              {fmt(val)}
            </text>
          </g>
        );
      })}
      {labels.map((lab, i) => (
        <text key={lab + i} x={sx(i)} y={height - 10} textAnchor="middle" fill="#94a3b8" fontSize={10}>
          {lab.slice(5)}
        </text>
      ))}
      {series.map((s) => {
        const d = s.points
          .map((p, i) => `${i === 0 ? "M" : "L"} ${sx(i).toFixed(1)} ${sy(p.y).toFixed(1)}`)
          .join(" ");
        return (
          <g key={s.name}>
            <path d={d} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" />
            {s.points.map((p, i) => (
              <circle key={i} cx={sx(i)} cy={sy(p.y)} r={3.5} fill={s.color} />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

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
  const [ibkr, setIbkr] = useState<any>(null);
  const [playbook, setPlaybook] = useState<any>(null);
  const [optionCriteria, setOptionCriteria] = useState<any>(null);
  const [history, setHistory] = useState<{ count: number; entries: HistoryEntry[]; summary: any[] } | null>(null);
  const [tab, setTab] = useState<TabId>("history");
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
      setIbkr(data.ibkr);
      setPlaybook(data.playbook);
      setOptionCriteria(data.optionCriteria);
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
    return r.symbol.includes(q) || r.name.toUpperCase().includes(q);
  });
  const rollResults = results.filter((r) => r.roll);

  /** 历史按时间正序（旧→新）画图 */
  const chrono = useMemo(() => {
    const entries = history?.entries ? [...history.entries] : [];
    return entries.reverse();
  }, [history]);

  const nlvSeries = useMemo(
    () => [{
      name: "NLV",
      color: "#38bdf8",
      points: chrono.map((e) => ({ x: e.id, y: e.nlv })),
    }],
    [chrono]
  );

  const pnlSeries = useMemo(
    () => [{
      name: "未实现盈亏",
      color: "#34d399",
      points: chrono.map((e) => ({ x: e.id, y: e.unrealizedPnl })),
    }],
    [chrono]
  );

  const putMarkSeries = useMemo(() => {
    const names = ["AMAT", "COHR", "CRDO"] as const;
    const colors = { AMAT: "#f472b6", COHR: "#a78bfa", CRDO: "#fbbf24" };
    return names.map((u) => ({
      name: u,
      color: colors[u],
      points: chrono.map((e) => {
        const p = e.shortPuts?.find((x) => x.underlying === u);
        return { x: e.id, y: p?.mark ?? 0 };
      }),
    }));
  }, [chrono]);

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
              <p className="text-xs text-slate-400">六层筛选 · 链级50% · 历史复盘</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400 flex-wrap">
            {updatedAt && (
              <span>
                更新 {new Date(updatedAt).toLocaleString("zh-CN")}
                {refreshing && <span className="ml-1 text-sky-400">刷新中…</span>}
              </span>
            )}
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-xs">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded border-slate-600" />
              <span className={autoRefresh ? "text-sky-300" : "text-slate-500"}>自动刷新 2分钟</span>
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
        {usingFallback && (
          <div className="bg-amber-950/40 border border-amber-800/60 text-amber-200 rounded-xl px-4 py-3 text-sm">
            行情可能使用缓存价；IBKR 为快照。历史在对话「更新持仓」时追加。
          </div>
        )}
        {error && <div className="bg-red-950/50 border border-red-800 text-red-200 rounded-xl px-4 py-3">错误: {error}</div>}
        {loading && !hasData.current && (
          <div className="flex justify-center py-20 text-slate-400 gap-3"><RefreshCw className="w-6 h-6 animate-spin" /> 加载中...</div>
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
                <h2 className="text-lg font-semibold">第五层：组合（IBKR 快照）</h2>
                <p className="text-xs text-slate-500">
                  快照：{ibkr.snapshotAt ? new Date(ibkr.snapshotAt).toLocaleString("zh-CN") : "—"} · 主止盈 = 链累计净权利金 50%
                </p>
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
                    <div className={`text-xl font-bold ${(ibkr.balances?.unrealizedPnl ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}>${ibkr.balances?.unrealizedPnl?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                </div>
                {ibkr.riskFlags?.length > 0 && (
                  <div className="bg-amber-950/40 border border-amber-800 rounded-xl p-4 space-y-1">
                    {ibkr.riskFlags.map((w: string, i: number) => <div key={i} className="text-amber-200 text-sm">⚠ {w}</div>)}
                  </div>
                )}
                <h3 className="font-semibold text-slate-300 pt-2">股票持仓</h3>
                {ibkr.stocks?.map((s: any) => (
                  <div key={s.symbol + String(s.qty)} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 text-sm items-center">
                    <div className="font-bold min-w-[70px]">{s.symbol}</div>
                    <div className="text-slate-400">{s.qty} 股</div>
                    <div>成本 ${Number(s.avg).toFixed(2)}</div>
                    <div>现价 ${Number(s.price).toFixed(2)}</div>
                    <div className={Number(s.pnl) >= 0 ? "text-emerald-400" : "text-red-400"}>浮盈 ${Number(s.pnl).toFixed(0)}</div>
                  </div>
                ))}
                <h3 className="font-semibold text-slate-300 pt-2">空头 Put（链级止盈）</h3>
                {ibkr.shortPuts?.map((p: any) => (
                  <div key={p.description} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="font-bold">{p.underlying} {p.strike}P</div>
                      <div className="text-slate-400">{p.expiry} · DTE {p.dte}</div>
                      <div>入场 {Number(p.entryPremium).toFixed(2)} → 现价 {Number(p.currentPremium).toFixed(2)}</div>
                      <div className={Number(p.unrealizedPnl) >= 0 ? "text-emerald-400" : "text-red-400"}>
                        单腿 ${Number(p.unrealizedPnl || 0).toFixed(0)} ({((p.profitPctOfCredit || 0) * 100).toFixed(0)}%)
                      </div>
                    </div>
                    {p.chain && (
                      <div className="text-xs text-slate-400 border-t border-slate-800 pt-2 space-y-1">
                        <div className="text-sky-300">
                          链50%目标 ≤ <strong>${Number(p.chain.targetClosePrice).toFixed(2)}</strong>
                          {" "}· 现价平链利润 ${Number(p.chain.chainPnlIfCloseNowUsd).toFixed(0)}
                        </div>
                        {p.chain.takeProfitHit
                          ? <span className="text-emerald-300">已达链级止盈</span>
                          : <span className="text-amber-300">未达链级止盈 — 继续持有</span>}
                      </div>
                    )}
                  </div>
                ))}
                <h3 className="font-semibold text-slate-300 pt-2">备兑 Call</h3>
                {ibkr.coveredCalls?.map((c: any) => (
                  <div key={c.description || c.underlying + c.strike} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 text-sm items-center">
                    <div className="font-bold">{c.underlying} {c.strike}C</div>
                    <div className="text-slate-400">{c.expiry}</div>
                    <div>入场 {Number(c.entryPremium).toFixed(2)} → 现价 {Number(c.currentPremium).toFixed(2)}</div>
                    <div className={Number(c.unrealizedPnl) >= 0 ? "text-emerald-400" : "text-red-400"}>浮盈 ${Number(c.unrealizedPnl || 0).toFixed(0)}</div>
                  </div>
                ))}
              </section>
            )}

            {tab === "roll" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">第六层：Roll / 链级止盈</h2>
                {rollResults.length === 0 && <div className="text-slate-500">无空头 Put</div>}
                {rollResults.map((r) => (
                  <div key={r.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-bold">{r.symbol} {r.roll!.detail.strike}P</div>
                      <span className="text-sm px-2 py-0.5 rounded bg-slate-800">{r.roll!.recommendation}</span>
                    </div>
                    <div className="text-sm text-sky-300">{r.recommendedAction}</div>
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
                    <div className="font-bold min-w-[70px]">{r.symbol}</div>
                    <div className="text-sm text-sky-300 flex-1">{r.recommendedAction}</div>
                  </div>
                ))}
              </section>
            )}

            {tab === "history" && (
              <section className="space-y-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <History className="w-5 h-5 text-sky-400" /> 持仓历史复盘
                </h2>
                <p className="text-xs text-slate-500">
                  共 {history?.count ?? 0} 条 · 在对话中说「更新持仓」会追加最新快照 · 曲线按时间从左（旧）到右（新）
                </p>

                {chrono.length === 0 && <div className="text-slate-500">暂无历史数据</div>}

                {chrono.length > 0 && (
                  <>
                    <div className="grid lg:grid-cols-2 gap-4">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-sm font-medium text-sky-300 mb-2">NLV 曲线</div>
                        <LineChart series={nlvSeries} yFormat={(v) => `$${(v / 1000).toFixed(0)}k`} />
                        <div className="flex gap-3 text-xs text-slate-500 mt-1"><span className="text-sky-400">● NLV</span></div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-sm font-medium text-emerald-300 mb-2">未实现盈亏</div>
                        <LineChart series={pnlSeries} yFormat={(v) => `$${(v / 1000).toFixed(1)}k`} />
                        <div className="flex gap-3 text-xs text-slate-500 mt-1"><span className="text-emerald-400">● 浮盈</span></div>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <div className="text-sm font-medium text-slate-300 mb-2">空头 Put 现价（mark）走势</div>
                      <LineChart series={putMarkSeries} yFormat={(v) => v.toFixed(0)} />
                      <div className="flex flex-wrap gap-4 text-xs mt-2">
                        <span className="text-pink-400">● AMAT</span>
                        <span className="text-violet-400">● COHR</span>
                        <span className="text-amber-400">● CRDO</span>
                        <span className="text-slate-500">（越低越接近链级止盈目标）</span>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-900 text-slate-400 text-xs uppercase">
                          <tr>
                            <th className="px-3 py-2">日期</th>
                            <th className="px-3 py-2">NLV</th>
                            <th className="px-3 py-2">现金%</th>
                            <th className="px-3 py-2">浮盈</th>
                            <th className="px-3 py-2">AMAT</th>
                            <th className="px-3 py-2">COHR</th>
                            <th className="px-3 py-2">CRDO</th>
                            <th className="px-3 py-2">备注</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[...chrono].reverse().map((e, idx, arr) => {
                            const prev = arr[idx + 1];
                            const dNlv = prev ? e.nlv - prev.nlv : 0;
                            const put = (u: string) => e.shortPuts?.find((p) => p.underlying === u);
                            return (
                              <tr key={e.id} className="border-t border-slate-800 hover:bg-slate-900/80">
                                <td className="px-3 py-2 font-medium whitespace-nowrap">{e.id}</td>
                                <td className="px-3 py-2">
                                  ${e.nlv.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                  {prev && (
                                    <span className={`ml-1 text-xs ${dNlv >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                      {dNlv >= 0 ? "+" : ""}{(dNlv / 1000).toFixed(1)}k
                                    </span>
                                  )}
                                </td>
                                <td className="px-3 py-2">{e.cashPct.toFixed(1)}%</td>
                                <td className={`px-3 py-2 ${e.unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                  ${e.unrealizedPnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </td>
                                <td className="px-3 py-2">
                                  {put("AMAT") ? (
                                    <>
                                      {put("AMAT")!.mark.toFixed(1)}
                                      <span className="text-xs text-slate-500 ml-1">{(put("AMAT")!.legPct * 100).toFixed(0)}%</span>
                                    </>
                                  ) : "—"}
                                </td>
                                <td className="px-3 py-2">
                                  {put("COHR") ? (
                                    <>
                                      {put("COHR")!.mark.toFixed(1)}
                                      <span className="text-xs text-slate-500 ml-1">{(put("COHR")!.legPct * 100).toFixed(0)}%</span>
                                    </>
                                  ) : "—"}
                                </td>
                                <td className="px-3 py-2">
                                  {put("CRDO") ? (
                                    <>
                                      {put("CRDO")!.mark.toFixed(1)}
                                      <span className="text-xs text-slate-500 ml-1">{(put("CRDO")!.legPct * 100).toFixed(0)}%</span>
                                    </>
                                  ) : "—"}
                                </td>
                                <td className="px-3 py-2 text-xs text-slate-500 max-w-[200px]">{e.note || "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
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
                    <div className="text-sky-300">主止盈：链累计净权利金 {playbook.accountRules?.takeProfitPctOfChainNet ?? 50}%</div>
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
