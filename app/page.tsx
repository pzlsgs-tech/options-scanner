"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search, RefreshCw, Zap, Layers, Target, Briefcase, RefreshCcw, Brain, ChevronDown,
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
};

const TABS = [
  { id: "market", label: "1 市场", icon: Layers },
  { id: "strategy", label: "2 策略", icon: Target },
  { id: "scan", label: "3-4 标的/期权", icon: Search },
  { id: "portfolio", label: "5 组合·IBKR", icon: Briefcase },
  { id: "roll", label: "6 展期", icon: RefreshCcw },
  { id: "ai", label: "7 AI评分", icon: Brain },
] as const;
type TabId = (typeof TABS)[number]["id"];

export default function Home() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState("");
  const [note, setNote] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const [market, setMarket] = useState<any>(null);
  const [strategyScores, setStrategyScores] = useState<StrategyScore[]>([]);
  const [topStrategy, setTopStrategy] = useState<StrategyScore | null>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [ibkr, setIbkr] = useState<any>(null);
  const [tab, setTab] = useState<TabId>("portfolio");
  const [minScore, setMinScore] = useState(50);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchScan = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/scan?minScore=${minScore}`);
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
    } catch (e: any) {
      setError(e.message || "扫描失败");
    } finally {
      setLoading(false);
    }
  }, [minScore]);

  useEffect(() => { fetchScan(); }, [fetchScan]);

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
              <p className="text-xs text-slate-400">六层筛选 · IBKR 持仓已接入第5/6层</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            {updatedAt && <span>{new Date(updatedAt).toLocaleString("zh-CN")}</span>}
            <button onClick={fetchScan} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> 刷新
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
            行情报价使用代理/缓存；持仓数据来自 IBKR 快照。
          </div>
        )}
        {error && <div className="bg-red-950/50 border border-red-800 text-red-200 rounded-xl px-4 py-3">错误: {error}</div>}
        {loading && <div className="flex justify-center py-20 text-slate-400 gap-3"><RefreshCw className="w-6 h-6 animate-spin" />加载中...</div>}

        {!loading && !error && (
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
                  <input type="number" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" placeholder="最低分" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索" className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" />
                </div>
                {filtered.slice(0, 25).map((r) => (
                  <div key={r.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-3 items-center">
                    <div className="font-bold min-w-[90px]">{r.symbol} <span className="text-sky-400">{r.aiScore}</span></div>
                    <div className="text-sm">${r.price.toFixed(2)} <span className={r.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}>{r.changePercent.toFixed(2)}%</span></div>
                    <div className="text-xs text-sky-300">{r.recommendedAction}</div>
                  </div>
                ))}
              </section>
            )}

            {/* PORTFOLIO IBKR */}
            {tab === "portfolio" && ibkr && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Briefcase className="w-5 h-5 text-sky-400" />第五层：组合风险（IBKR 实时快照）</h2>
                <p className="text-xs text-slate-500">快照时间：{new Date(ibkr.snapshotAt).toLocaleString("zh-CN")} · 来源 {ibkr.source}</p>

                <div className="grid sm:grid-cols-4 gap-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500">Net Liquidation</div>
                    <div className="text-xl font-bold">${ibkr.balances?.netLiquidation?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500">现金</div>
                    <div className="text-xl font-bold">${ibkr.balances?.cashBalance?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className={`text-xs ${ibkr.balances?.cashPct >= 40 ? "text-emerald-400" : "text-amber-400"}`}>{ibkr.balances?.cashPct?.toFixed(1)}% {ibkr.balances?.cashPct >= 40 ? "✓≥40%" : "<40%"}</div>
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

                <h3 className="font-semibold text-slate-300">股票持仓</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-900 text-slate-400 text-xs"><tr>
                      <th className="text-left p-3">标的</th><th className="text-right p-3">数量</th><th className="text-right p-3">成本</th><th className="text-right p-3">现价</th><th className="text-right p-3">市值</th><th className="text-right p-3">浮盈亏</th>
                    </tr></thead>
                    <tbody>
                      {ibkr.stocks?.map((s: any) => (
                        <tr key={s.symbol} className="border-t border-slate-800">
                          <td className="p-3 font-medium">{s.symbol}</td>
                          <td className="p-3 text-right">{s.qty}</td>
                          <td className="p-3 text-right">{s.avg?.toFixed(2)}</td>
                          <td className="p-3 text-right">{s.price?.toFixed(2)}</td>
                          <td className="p-3 text-right">{s.value?.toFixed(0)}</td>
                          <td className={`p-3 text-right ${s.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{s.pnl?.toFixed(0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h3 className="font-semibold text-slate-300">空头 Put（保证金占用核心）</h3>
                <div className="space-y-2">
                  {ibkr.shortPuts?.map((p: any) => (
                    <div key={p.description} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap gap-4 text-sm">
                      <div className="font-bold">{p.underlying} {p.strike}P</div>
                      <div className="text-slate-400">{p.expiry} · DTE {p.dte}</div>
                      <div>入场 {p.entryPremium?.toFixed(2)} → 现价 {p.currentPremium?.toFixed(2)}</div>
                      <div className={p.unrealizedPnl >= 0 ? "text-emerald-400" : "text-red-400"}>浮盈 ${p.unrealizedPnl?.toFixed(0)} ({(p.profitPctOfCredit * 100).toFixed(0)}%)</div>
                    </div>
                  ))}
                </div>

                {ibkr.coveredCalls?.length > 0 && (
                  <>
                    <h3 className="font-semibold text-slate-300">备兑 Call</h3>
                    {ibkr.coveredCalls.map((c: any) => (
                      <div key={c.description} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm flex flex-wrap gap-4">
                        <div className="font-bold">{c.underlying} {c.strike}C</div>
                        <div className="text-slate-400">{c.expiry}</div>
                        <div>权利金 {c.entryPremium?.toFixed(2)} → {c.currentPremium?.toFixed(2)}</div>
                        <div className="text-emerald-400">浮盈 ${c.unrealizedPnl?.toFixed(0)}</div>
                      </div>
                    ))}
                  </>
                )}

                <h3 className="font-semibold text-slate-300">行业配置</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {ibkr.sectors?.filter((s: any) => s.side === "long").map((s: any) => (
                    <div key={s.name} className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 flex justify-between text-sm">
                      <span>{s.name}</span>
                      <span className={s.weight * 100 > 30 ? "text-amber-400" : "text-slate-300"}>{(s.weight * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-slate-600">限制：同主题 Sell Put ≤2 · 单行业 ≤30% · 单票 ≤15% · 现金 &gt;40%</div>
              </section>
            )}

            {/* ROLL */}
            {tab === "roll" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><RefreshCcw className="w-5 h-5 text-sky-400" />第六层：Roll Scanner（基于 IBKR 空头 Put）</h2>
                {rollResults.length === 0 && <div className="text-slate-500">无空头 Put 持仓</div>}
                {rollResults.map((r) => (
                  <div key={r.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-lg">{r.symbol} {r.roll!.detail.strike} Put</div>
                        <div className="text-xs text-slate-500">{r.roll!.detail.expiry} · DTE {r.roll!.detail.dte}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">{"★".repeat(r.roll!.stars)}{"☆".repeat(5 - r.roll!.stars)}</span>
                        <span className={`px-2 py-0.5 rounded text-sm ${
                          r.roll!.recommendation === "获利了结" || r.roll!.recommendation === "Roll" ? "bg-emerald-900/60 text-emerald-300" :
                          r.roll!.recommendation === "观察" ? "bg-amber-900/60 text-amber-300" : "bg-slate-700 text-slate-400"
                        }`}>{r.roll!.recommendation}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                      <div className="bg-slate-950 rounded-lg p-3"><div className="text-xs text-slate-500">入场权利金</div>{r.roll!.detail.entryPremium.toFixed(2)}</div>
                      <div className="bg-slate-950 rounded-lg p-3"><div className="text-xs text-slate-500">当前权利金</div>{r.roll!.detail.currentPremium.toFixed(2)}</div>
                      <div className="bg-slate-950 rounded-lg p-3"><div className="text-xs text-slate-500">浮盈</div><span className="text-emerald-400">${r.roll!.detail.unrealizedPnl.toFixed(0)}</span></div>
                      <div className="bg-slate-950 rounded-lg p-3"><div className="text-xs text-slate-500">占权利金</div>{(r.roll!.detail.profitPctOfCredit * 100).toFixed(0)}%</div>
                    </div>
                    <div className="text-sm text-sky-300">{r.recommendedAction}</div>
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      {r.roll!.factors.map((f, i) => (
                        <div key={i} className="bg-slate-950 rounded-lg p-3">
                          <div className="text-xs text-slate-500">{f.label} {f.weight}</div>
                          <div>{f.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>
            )}

            {tab === "ai" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">第七层：AI 综合评分</h2>
                {filtered.slice(0, 20).map((r) => (
                  <div key={r.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-4">
                    <div className={`text-2xl font-bold w-14 text-center ${r.aiScore >= 80 ? "text-emerald-400" : r.aiScore >= 65 ? "text-sky-400" : "text-slate-400"}`}>{r.aiScore}</div>
                    <div className="font-bold min-w-[70px]">{r.symbol}</div>
                    <div className="text-sm text-sky-300 flex-1">{r.recommendedAction}</div>
                  </div>
                ))}
              </section>
            )}

            {note && <p className="text-xs text-slate-600 border-t border-slate-800 pt-4">{note}</p>}
          </>
        )}
      </main>
    </div>
  );
}
