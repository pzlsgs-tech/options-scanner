"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search, RefreshCw, TrendingUp, TrendingDown, Activity, Filter,
  ChevronDown, Info, Zap, Layers, Target, Briefcase, RefreshCcw, Brain,
} from "lucide-react";

type StrategyScore = { name: string; score: number; reason: string };
type Result = {
  symbol: string; name: string; sector: string; typicalOptionsVolume: string;
  price: number; changePercent: number; volume: number;
  liquidityScore: number; optionsSuitabilityScore: number; ivRankProxy: number;
  trend: string; volatilityProxy: number;
  themes: string[];
  underlying: { fundamentalScore: number; technicalScore: number; riskScore: number; total: number; flags: string[] };
  optionLayer: { ivRankProxy: number; liquidityScore: number; premiumQuality: number; yieldProxy: number; total: number; notes: string[] };
  portfolioOk: boolean; portfolioWarning: string | null;
  roll?: { score: number; stars: number; recommendation: string; factors: { label: string; value: string; weight: string }[] };
  aiScore: number; aiBreakdown: Record<string, number>;
  recommendedAction: string;
};

const TABS = [
  { id: "market", label: "1 市场", icon: Layers },
  { id: "strategy", label: "2 策略", icon: Target },
  { id: "scan", label: "3-4 标的/期权", icon: Search },
  { id: "portfolio", label: "5 组合", icon: Briefcase },
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
  const [optionCriteria, setOptionCriteria] = useState<any>(null);
  const [tab, setTab] = useState<TabId>("ai");
  const [minScore, setMinScore] = useState(50);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchScan = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ minScore: String(minScore), held: "AMAT,COHR,CRDO,GDX,MCD,NVDA,IBKR" });
      const res = await fetch(`/api/scan?${params}`);
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
      setOptionCriteria(data.optionCriteria);
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
              <p className="text-xs text-slate-400">六层筛选 · 市场→策略→标的→期权→组合→展期→AI</p>
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition ${
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
            实时报价暂不可用，部分指标为代理值。策略框架与分层逻辑仍完整可用。
          </div>
        )}
        {error && <div className="bg-red-950/50 border border-red-800 text-red-200 rounded-xl px-4 py-3">错误: {error}</div>}
        {loading && <div className="flex justify-center py-20 text-slate-400 gap-3"><RefreshCw className="w-6 h-6 animate-spin" />六层扫描中...</div>}

        {!loading && !error && (
          <>
            {/* TAB: Market */}
            {tab === "market" && market && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Layers className="w-5 h-5 text-sky-400" />第一层：市场环境</h2>
                <div className="flex flex-wrap gap-2">
                  {market.regimes?.map((r: string) => (
                    <span key={r} className={`px-3 py-1 rounded-full text-sm font-medium ${
                      r === "Bull" || r === "Risk On" ? "bg-emerald-900/60 text-emerald-300" :
                      r === "Bear" || r === "Risk Off" || r === "Correction" ? "bg-red-900/60 text-red-300" :
                      r === "High IV" ? "bg-amber-900/60 text-amber-300" :
                      "bg-slate-700 text-slate-300"
                    }`}>{r}</span>
                  ))}
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500">VIX 代理</div>
                    <div className="text-2xl font-bold">{market.vixProxy}</div>
                    <div className="text-xs text-slate-500">18–35 最佳卖权区间</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500">SPY / QQQ</div>
                    <div className="text-lg font-semibold">{market.spyChange?.toFixed(2)}% / {market.qqqChange?.toFixed(2)}%</div>
                    <div className="text-xs text-slate-500">{market.spyTrend} / {market.qqqTrend}</div>
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500">策略偏向</div>
                    <div className="text-lg font-semibold text-sky-300">{market.strategyBias}</div>
                  </div>
                </div>
                <p className="text-sm text-slate-400">{market.summary}</p>
                <p className="text-xs text-slate-600">权重：VIX★★★★★ · SPY/QQQ趋势★★★★★ · 利率/数据/地缘★★★（后几项需接日历数据源）</p>
              </section>
            )}

            {/* TAB: Strategy */}
            {tab === "strategy" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Target className="w-5 h-5 text-sky-400" />第二层：策略筛选</h2>
                {topStrategy && (
                  <div className="bg-sky-950/40 border border-sky-800 rounded-xl px-4 py-3 text-sky-200">
                    今日首选策略：<strong>{topStrategy.name}</strong>（评分 {topStrategy.score}）— {topStrategy.reason}
                  </div>
                )}
                <div className="space-y-2">
                  {strategyScores.map((s) => (
                    <div key={s.name} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-14 text-center">
                        <div className={`text-xl font-bold ${s.score >= 80 ? "text-emerald-400" : s.score >= 50 ? "text-amber-400" : "text-slate-500"}`}>{s.score}</div>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{s.name}</div>
                        <div className="text-sm text-slate-400">{s.reason}</div>
                      </div>
                      <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: `${s.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* TAB: Scan */}
            {tab === "scan" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">第三层标的 + 第四层期权</h2>
                {optionCriteria && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 grid sm:grid-cols-4 gap-2">
                    <div>DTE: {optionCriteria.dte}</div>
                    <div>Delta: {optionCriteria.delta}</div>
                    <div>IV Rank: {optionCriteria.ivRank}</div>
                    <div>OI / Vol: {optionCriteria.oi} / {optionCriteria.volume}</div>
                    <div>Bid-Ask: {optionCriteria.bidAsk}</div>
                    <div>POP OTM: {optionCriteria.popOtm}</div>
                    <div>Premium Quality = 权利金÷保证金÷风险</div>
                    <div>IV/HV、真实链数据需付费源</div>
                  </div>
                )}
                <div className="flex gap-3 items-end">
                  <label className="space-y-1"><span className="text-xs text-slate-400">最低AI分</span>
                    <input type="number" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-24 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" /></label>
                  <label className="space-y-1 flex-1"><span className="text-xs text-slate-400">搜索</span>
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="AAPL" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm" /></label>
                </div>
                <div className="text-sm text-slate-400">{filtered.length} 只标的</div>
                <div className="space-y-2">
                  {filtered.slice(0, 30).map((r) => (
                    <div key={r.symbol} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                      <button onClick={() => setExpanded(expanded === r.symbol ? null : r.symbol)} className="w-full text-left p-4 flex flex-wrap items-center gap-3">
                        <div className="min-w-[100px]">
                          <div className="font-bold">{r.symbol} <span className="text-sky-400 text-sm">{r.aiScore}</span></div>
                          <div className="text-xs text-slate-500">{r.themes?.join(" · ")}</div>
                        </div>
                        <div className="text-sm">${r.price.toFixed(2)} <span className={r.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}>{r.changePercent.toFixed(2)}%</span></div>
                        <div className="text-xs text-slate-400">标的{r.underlying?.total} · 期权{r.optionLayer?.total} · PQ{r.optionLayer?.premiumQuality}</div>
                        <div className="text-xs text-sky-300/80">{r.recommendedAction}</div>
                        <ChevronDown className={`ml-auto w-4 h-4 transition ${expanded === r.symbol ? "rotate-180" : ""}`} />
                      </button>
                      {expanded === r.symbol && (
                        <div className="border-t border-slate-800 p-4 text-sm space-y-2 bg-slate-950/50">
                          <div>基本面 {r.underlying?.fundamentalScore} · 技术 {r.underlying?.technicalScore} · 风险安全 {r.underlying?.riskScore}</div>
                          <div>IV代理 {r.optionLayer?.ivRankProxy} · 流动性 {r.optionLayer?.liquidityScore} · 权利金质量 {r.optionLayer?.premiumQuality}</div>
                          {r.optionLayer?.notes?.map((n, i) => <div key={i} className="text-xs text-slate-500">· {n}</div>)}
                          {r.portfolioWarning && <div className="text-amber-400 text-xs">{r.portfolioWarning}</div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* TAB: Portfolio */}
            {tab === "portfolio" && portfolio && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Briefcase className="w-5 h-5 text-sky-400" />第五层：组合风险</h2>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <div className="text-sm text-slate-400 mb-2">当前持仓（可在 URL held= 参数覆盖）</div>
                  <div className="flex flex-wrap gap-2">{portfolio.held?.map((s: string) => (
                    <span key={s} className="px-2 py-1 bg-slate-800 rounded text-sm">{s}</span>
                  ))}</div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500 mb-2">主题持仓数（同主题 Sell Put ≤2）</div>
                    {Object.entries(portfolio.themeCounts || {}).map(([t, c]) => (
                      <div key={t} className="flex justify-between text-sm py-1">
                        <span>{t}</span>
                        <span className={(c as number) >= 2 ? "text-amber-400" : "text-slate-300"}>{c as number}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-sm">
                    <div>单一行业 ≤ {portfolio.limits?.maxSectorPct}%</div>
                    <div>单一股票 ≤ {portfolio.limits?.maxSinglePct}%</div>
                    <div>现金 &gt; {portfolio.limits?.minCashPct}%</div>
                    <div className="text-xs text-slate-500 pt-2">保证金/Buying Power 可对接 IBKR get_account_balances</div>
                  </div>
                </div>
                {portfolio.warnings?.length > 0 && (
                  <div className="bg-amber-950/40 border border-amber-800 rounded-xl p-4 space-y-1">
                    {portfolio.warnings.map((w: string, i: number) => (
                      <div key={i} className="text-amber-200 text-sm">⚠ {w}</div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* TAB: Roll */}
            {tab === "roll" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><RefreshCcw className="w-5 h-5 text-sky-400" />第六层：Roll Scanner</h2>
                <p className="text-sm text-slate-400">评分维度：Net Credit · Strike降低 · 增加DTE · Cost/Strike · Roll Efficiency · 新Delta/POP</p>
                {rollResults.length === 0 && <div className="text-slate-500">当前 held 列表中无展期候选（默认监控 AMAT/COHR/CRDO）</div>}
                {rollResults.map((r) => (
                  <div key={r.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-lg">{r.symbol}</div>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">{"★".repeat(r.roll!.stars)}{"☆".repeat(5 - r.roll!.stars)}</span>
                        <span className={`px-2 py-0.5 rounded text-sm ${
                          r.roll!.recommendation === "Roll" ? "bg-emerald-900/60 text-emerald-300" :
                          r.roll!.recommendation === "观察" ? "bg-amber-900/60 text-amber-300" : "bg-slate-700 text-slate-400"
                        }`}>{r.roll!.recommendation}</span>
                      </div>
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
                    <div className="text-xs text-slate-600">Cost/Strike、真实 Credit 需结合期权链报价计算；此处为规则评分框架。</div>
                  </div>
                ))}
              </section>
            )}

            {/* TAB: AI */}
            {tab === "ai" && (
              <section className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Brain className="w-5 h-5 text-sky-400" />第七层：AI 综合评分</h2>
                <p className="text-xs text-slate-500">权重：Market 20% · Stock 20% · Option 20% · Premium Quality 15% · Portfolio 15% · Roll 10%</p>
                <div className="space-y-2">
                  {filtered.slice(0, 25).map((r) => (
                    <div key={r.symbol} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-4">
                      <div className="w-16 text-center">
                        <div className={`text-2xl font-bold ${r.aiScore >= 80 ? "text-emerald-400" : r.aiScore >= 65 ? "text-sky-400" : "text-slate-400"}`}>{r.aiScore}</div>
                      </div>
                      <div className="min-w-[80px]">
                        <div className="font-bold">{r.symbol}</div>
                        <div className="text-xs text-slate-500">{r.themes?.join(", ")}</div>
                      </div>
                      <div className="flex-1 grid grid-cols-3 sm:grid-cols-6 gap-1 text-xs text-slate-400">
                        <div>市{r.aiBreakdown?.market}</div>
                        <div>股{r.aiBreakdown?.stock}</div>
                        <div>权{r.aiBreakdown?.option}</div>
                        <div>PQ{r.aiBreakdown?.premium}</div>
                        <div>组{r.aiBreakdown?.portfolio}</div>
                        <div>R{r.aiBreakdown?.roll}</div>
                      </div>
                      <div className="text-sm text-sky-300">{r.recommendedAction}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {note && <p className="text-xs text-slate-600 border-t border-slate-800 pt-4">{note}</p>}
          </>
        )}
      </main>
      <footer className="border-t border-slate-800 mt-12 py-6 text-center text-xs text-slate-600">
        Options Scanner Pro · 六层框架 · 仅供研究参考
      </footer>
    </div>
  );
}
