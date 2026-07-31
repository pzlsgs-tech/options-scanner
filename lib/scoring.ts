import type { StockMeta } from "./universe";

export type Quote = {
  symbol: string;
  price: number;
  changePercent: number;
  volume: number;
  averageVolume?: number;
  marketCap?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
};

export type ScoredStock = StockMeta & Quote & {
  liquidityScore: number;
  optionsSuitabilityScore: number;
  ivRankProxy: number;
  trend: "up" | "down" | "sideways";
  volatilityProxy: number;
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function scoreStock(meta: StockMeta, quote: Quote): ScoredStock {
  const price = quote.price || 0;
  const vol = quote.volume || 0;
  const avgVol = quote.averageVolume || vol || 1;
  const change = quote.changePercent || 0;

  // Liquidity score
  let liquidityScore = 40;
  if (meta.typicalOptionsVolume === "Very High") liquidityScore = 95;
  else if (meta.typicalOptionsVolume === "High") liquidityScore = 80;
  else liquidityScore = 60;

  // boost by stock volume
  if (vol > 20_000_000) liquidityScore = Math.min(100, liquidityScore + 8);
  else if (vol > 5_000_000) liquidityScore = Math.min(100, liquidityScore + 4);

  // price suitability (options work better above ~$15-20 for most retail)
  let priceScore = 50;
  if (price >= 50 && price <= 500) priceScore = 90;
  else if (price >= 20 && price < 50) priceScore = 75;
  else if (price >= 10 && price < 20) priceScore = 55;
  else if (price < 10) priceScore = 30;
  else priceScore = 70; // very expensive still ok for options

  // simple trend from daily change (proxy only)
  let trend: "up" | "down" | "sideways" = "sideways";
  if (change > 1.5) trend = "up";
  else if (change < -1.5) trend = "down";

  // volatility proxy from daily move magnitude
  const volatilityProxy = clamp(Math.abs(change) * 12, 10, 95);

  // IV Rank proxy: higher daily move + high options volume names get higher "IV" feel
  // This is an approximation — real IV Rank needs historical IV data.
  let ivRankProxy = 40 + volatilityProxy * 0.35;
  if (meta.typicalOptionsVolume === "Very High") ivRankProxy += 8;
  if (Math.abs(change) > 3) ivRankProxy += 10;
  ivRankProxy = clamp(ivRankProxy);

  // overall options suitability
  const optionsSuitabilityScore = clamp(
    liquidityScore * 0.45 +
      priceScore * 0.25 +
      (meta.typicalOptionsVolume === "Very High" ? 90 : meta.typicalOptionsVolume === "High" ? 75 : 55) * 0.3
  );

  return {
    ...meta,
    ...quote,
    liquidityScore: Math.round(liquidityScore),
    optionsSuitabilityScore: Math.round(optionsSuitabilityScore),
    ivRankProxy: Math.round(ivRankProxy),
    trend,
    volatilityProxy: Math.round(volatilityProxy),
  };
}
