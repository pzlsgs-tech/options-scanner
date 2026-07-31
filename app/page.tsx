"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Activity,
  Filter,
  ChevronDown,
  Info,
  Zap,
} from "lucide-react";

type Strategy = {
  name: string;
  bias: string;
  suitability: string;
  description: string;
  risk: string;
  when: string;
};

type Result = {
  symbol: string;
  name: string;
  sector: string;
  typicalOptionsVolume: string;
  price: number;
  changePercent: number;
  volume: number;
  liquidityScore: number;
  optionsSuitabilityScore: number;
  ivRankProxy: number;
  trend: string;
  volatilityProxy: number;
  strategies: Strategy[];
};

const SECTORS = [
  "All",
  "Technology",
  "Financials",
  "Consumer Discretionary",
  "Communication",
  "Energy",
  "Healthcare",
  "Industrials",
  "Consumer Staples",
  "Materials",
  "ETF",
];

const BIASES = ["All", "Bullish", "Bearish", "Neutral", "Volatile"];

export default function Home() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string>("");
  const [note, setNote] = useState("");

  // filters
  const [minPrice, setMinPrice] = useState(10);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [minScore, setMinScore] = useState(55);
  const [sector, setSector] = useState("All");
  const [bias, setBias] = useState("All");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchScan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        minPrice: String(minPrice),
        maxPrice: String(maxPrice),
        minScore: String(minScore),
        sector,
        bias,
        limit: "50",
      });
      const res = await fetch(`/api/scan?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResults(data.results || []);
      setUpdatedAt(data.updatedAt || "");
      setNote(data.note || "");
    } catch (e: any) {
      setError(e.message || "扫描失败");
    } finally {
      setLoading(false);
    }
  }, [minPrice, maxPrice, minScore, sector, bias]);

  useEffect(() => {
    fetchScan();
  }, [fetchScan]);

  const filtered = results.filter((r) => {
    if (!search) return true;
    const q = search.toUpperCase();
    return r.symbol.includes(q) || r.name.toUpperCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Options Scanner</h1>
              <p className="text-xs text-slate-400">美股期权标的筛选 · 策略推荐</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            {updatedAt && (
              <span>更新: {new Date(updatedAt).toLocaleString("zh-CN")}</span>
            )}
            <button
              onClick={fetchScan}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              刷新扫描
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5">
          <div className="flex items-center gap-2 mb-4 text-slate-300">
            <Filter className="w-4 h-4" />
            <span className="font-medium">筛选条件</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <label className="space-y-1">
              <span className="text-xs text-slate-400">最低价格</span>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-400">最高价格</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-400">最低适合度</span>
              <input
                type="number"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-400">行业</span>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {SECTORS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-400">策略偏向</span>
              <select
                value={bias}
                onChange={(e) => setBias(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {BIASES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-slate-400">搜索代码/名称</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="AAPL / NVIDIA"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </label>
          </div>
          <p className="mt-3 text-xs text-slate-500 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            基于高流动性期权标的宇宙（约 {results.length > 0 ? "80+" : "..."} 只）实时报价 + 规则评分。完整市场需付费期权数据源。
          </p>
        </section>

        {/* Status */}
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-200 rounded-xl px-4 py-3">
            扫描出错: {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20 text-slate-400 gap-3">
            <RefreshCw className="w-6 h-6 animate-spin" />
            正在扫描市场与生成策略建议...
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            <div className="flex items-center justify-between text-sm text-slate-400">
              <span>共 {filtered.length} 只符合条件的标的</span>
            </div>

            <div className="space-y-3">
              {filtered.map((r) => (
                <div
                  key={r.symbol}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition"
                >
                  <button
                    onClick={() => setExpanded(expanded === r.symbol ? null : r.symbol)}
                    className="w-full text-left p-4 md:p-5 flex flex-wrap items-center gap-4"
                  >
                    <div className="min-w-[120px]">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-white">{r.symbol}</span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${
                            r.typicalOptionsVolume === "Very High"
                              ? "bg-emerald-900/60 text-emerald-300"
                              : r.typicalOptionsVolume === "High"
                              ? "bg-sky-900/60 text-sky-300"
                              : "bg-slate-700 text-slate-300"
                          }`}
                        >
                          {r.typicalOptionsVolume} OI
                        </span>
                      </div>
                      <div className="text-sm text-slate-400">{r.name}</div>
                      <div className="text-xs text-slate-500">{r.sector}</div>
                    </div>

                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-slate-500">价格</div>
                        <div className="font-semibold">${r.price.toFixed(2)}</div>
                        <div
                          className={`text-xs flex items-center gap-0.5 ${
                            r.changePercent >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {r.changePercent >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {r.changePercent.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">适合度</div>
                        <div className="font-semibold text-sky-300">{r.optionsSuitabilityScore}</div>
                        <div className="text-xs text-slate-500">流动性 {r.liquidityScore}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">IV Rank 代理</div>
                        <div className="font-semibold">{r.ivRankProxy}</div>
                        <div className="text-xs text-slate-500">波动 {r.volatilityProxy}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">趋势</div>
                        <div className="font-semibold capitalize">{r.trend}</div>
                        <div className="text-xs text-slate-500">
                          成交量 {(r.volume / 1e6).toFixed(1)}M
                        </div>
                      </div>
                    </div>

                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 transition ${expanded === r.symbol ? "rotate-180" : ""}`}
                    />
                  </button>

                  {expanded === r.symbol && (
                    <div className="border-t border-slate-800 bg-slate-950/50 p-4 md:p-5 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                        <Activity className="w-4 h-4 text-sky-400" />
                        推荐期权策略
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        {r.strategies.map((st) => (
                          <div
                            key={st.name}
                            className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-semibold text-white">{st.name}</span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  st.bias === "Bullish"
                                    ? "bg-emerald-900/50 text-emerald-300"
                                    : st.bias === "Bearish"
                                    ? "bg-red-900/50 text-red-300"
                                    : st.bias === "Neutral"
                                    ? "bg-amber-900/50 text-amber-300"
                                    : "bg-purple-900/50 text-purple-300"
                                }`}
                              >
                                {st.bias}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300">{st.description}</p>
                            <div className="text-xs text-slate-500 space-y-1">
                              <div>适用: {st.suitability}</div>
                              <div>何时用: {st.when}</div>
                              <div>风险: {st.risk}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-16 text-slate-500">
                  没有符合当前筛选条件的标的，请放宽条件后重试。
                </div>
              )}
            </div>

            {note && (
              <p className="text-xs text-slate-600 pt-4 border-t border-slate-800">{note}</p>
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-800 mt-12 py-6 text-center text-xs text-slate-600">
        Options Scanner · 数据仅供参考，不构成投资建议 · Powered by Yahoo Finance quotes + rule engine
      </footer>
    </div>
  );
}
