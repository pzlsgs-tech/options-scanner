/**
 * Curated universe of highly liquid, optionable US stocks.
 * Focused on names with consistently high options volume / open interest.
 * This is a practical proxy for "whole market" scanning without paid data feeds.
 */
export type StockMeta = {
  symbol: string;
  name: string;
  sector: string;
  typicalOptionsVolume: "Very High" | "High" | "Medium";
  notes?: string;
};

export const UNIVERSE: StockMeta[] = [
  // Mega / High options activity
  { symbol: "AAPL", name: "Apple", sector: "Technology", typicalOptionsVolume: "Very High" },
  { symbol: "MSFT", name: "Microsoft", sector: "Technology", typicalOptionsVolume: "Very High" },
  { symbol: "NVDA", name: "NVIDIA", sector: "Technology", typicalOptionsVolume: "Very High" },
  { symbol: "TSLA", name: "Tesla", sector: "Consumer Discretionary", typicalOptionsVolume: "Very High" },
  { symbol: "AMZN", name: "Amazon", sector: "Consumer Discretionary", typicalOptionsVolume: "Very High" },
  { symbol: "META", name: "Meta Platforms", sector: "Communication", typicalOptionsVolume: "Very High" },
  { symbol: "GOOGL", name: "Alphabet", sector: "Communication", typicalOptionsVolume: "Very High" },
  { symbol: "AMD", name: "AMD", sector: "Technology", typicalOptionsVolume: "Very High" },
  { symbol: "SPY", name: "SPDR S&P 500 ETF", sector: "ETF", typicalOptionsVolume: "Very High" },
  { symbol: "QQQ", name: "Invesco QQQ", sector: "ETF", typicalOptionsVolume: "Very High" },
  { symbol: "IWM", name: "iShares Russell 2000", sector: "ETF", typicalOptionsVolume: "Very High" },

  // Semiconductors & Tech
  { symbol: "AVGO", name: "Broadcom", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "AMAT", name: "Applied Materials", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "LRCX", name: "Lam Research", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "KLAC", name: "KLA", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "MU", name: "Micron", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "INTC", name: "Intel", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "TSM", name: "TSMC", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "ASML", name: "ASML", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "SMCI", name: "Super Micro", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "ARM", name: "Arm Holdings", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "PLTR", name: "Palantir", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "CRM", name: "Salesforce", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "ORCL", name: "Oracle", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "ADBE", name: "Adobe", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "NFLX", name: "Netflix", sector: "Communication", typicalOptionsVolume: "High" },

  // Financials
  { symbol: "JPM", name: "JPMorgan", sector: "Financials", typicalOptionsVolume: "High" },
  { symbol: "BAC", name: "Bank of America", sector: "Financials", typicalOptionsVolume: "High" },
  { symbol: "GS", name: "Goldman Sachs", sector: "Financials", typicalOptionsVolume: "High" },
  { symbol: "MS", name: "Morgan Stanley", sector: "Financials", typicalOptionsVolume: "High" },
  { symbol: "C", name: "Citigroup", sector: "Financials", typicalOptionsVolume: "Medium" },
  { symbol: "WFC", name: "Wells Fargo", sector: "Financials", typicalOptionsVolume: "High" },
  { symbol: "SCHW", name: "Charles Schwab", sector: "Financials", typicalOptionsVolume: "Medium" },
  { symbol: "BLK", name: "BlackRock", sector: "Financials", typicalOptionsVolume: "Medium" },

  // Energy & Materials
  { symbol: "XOM", name: "Exxon Mobil", sector: "Energy", typicalOptionsVolume: "High" },
  { symbol: "CVX", name: "Chevron", sector: "Energy", typicalOptionsVolume: "High" },
  { symbol: "COP", name: "ConocoPhillips", sector: "Energy", typicalOptionsVolume: "Medium" },
  { symbol: "OXY", name: "Occidental", sector: "Energy", typicalOptionsVolume: "High" },
  { symbol: "SLB", name: "Schlumberger", sector: "Energy", typicalOptionsVolume: "Medium" },
  { symbol: "FCX", name: "Freeport-McMoRan", sector: "Materials", typicalOptionsVolume: "High" },
  { symbol: "NEM", name: "Newmont", sector: "Materials", typicalOptionsVolume: "Medium" },

  // Consumer & Retail
  { symbol: "COST", name: "Costco", sector: "Consumer Staples", typicalOptionsVolume: "High" },
  { symbol: "WMT", name: "Walmart", sector: "Consumer Staples", typicalOptionsVolume: "High" },
  { symbol: "HD", name: "Home Depot", sector: "Consumer Discretionary", typicalOptionsVolume: "High" },
  { symbol: "MCD", name: "McDonald's", sector: "Consumer Discretionary", typicalOptionsVolume: "High" },
  { symbol: "NKE", name: "Nike", sector: "Consumer Discretionary", typicalOptionsVolume: "High" },
  { symbol: "SBUX", name: "Starbucks", sector: "Consumer Discretionary", typicalOptionsVolume: "Medium" },
  { symbol: "DIS", name: "Disney", sector: "Communication", typicalOptionsVolume: "High" },
  { symbol: "BA", name: "Boeing", sector: "Industrials", typicalOptionsVolume: "High" },
  { symbol: "CAT", name: "Caterpillar", sector: "Industrials", typicalOptionsVolume: "High" },
  { symbol: "GE", name: "GE Aerospace", sector: "Industrials", typicalOptionsVolume: "High" },

  // Healthcare & Biotech
  { symbol: "UNH", name: "UnitedHealth", sector: "Healthcare", typicalOptionsVolume: "High" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", typicalOptionsVolume: "Medium" },
  { symbol: "LLY", name: "Eli Lilly", sector: "Healthcare", typicalOptionsVolume: "High" },
  { symbol: "ABBV", name: "AbbVie", sector: "Healthcare", typicalOptionsVolume: "Medium" },
  { symbol: "MRK", name: "Merck", sector: "Healthcare", typicalOptionsVolume: "Medium" },
  { symbol: "PFE", name: "Pfizer", sector: "Healthcare", typicalOptionsVolume: "High" },
  { symbol: "MRNA", name: "Moderna", sector: "Healthcare", typicalOptionsVolume: "High" },

  // High beta / Popular retail names
  { symbol: "COIN", name: "Coinbase", sector: "Financials", typicalOptionsVolume: "Very High" },
  { symbol: "MSTR", name: "MicroStrategy", sector: "Technology", typicalOptionsVolume: "Very High" },
  { symbol: "SOFI", name: "SoFi", sector: "Financials", typicalOptionsVolume: "High" },
  { symbol: "HOOD", name: "Robinhood", sector: "Financials", typicalOptionsVolume: "High" },
  { symbol: "RIVN", name: "Rivian", sector: "Consumer Discretionary", typicalOptionsVolume: "High" },
  { symbol: "LCID", name: "Lucid", sector: "Consumer Discretionary", typicalOptionsVolume: "Medium" },
  { symbol: "NIO", name: "NIO", sector: "Consumer Discretionary", typicalOptionsVolume: "High" },
  { symbol: "XPEV", name: "XPeng", sector: "Consumer Discretionary", typicalOptionsVolume: "Medium" },
  { symbol: "BABA", name: "Alibaba", sector: "Consumer Discretionary", typicalOptionsVolume: "High" },
  { symbol: "JD", name: "JD.com", sector: "Consumer Discretionary", typicalOptionsVolume: "Medium" },
  { symbol: "PDD", name: "PDD Holdings", sector: "Consumer Discretionary", typicalOptionsVolume: "High" },
  { symbol: "SNAP", name: "Snap", sector: "Communication", typicalOptionsVolume: "High" },
  { symbol: "UBER", name: "Uber", sector: "Industrials", typicalOptionsVolume: "High" },
  { symbol: "LYFT", name: "Lyft", sector: "Industrials", typicalOptionsVolume: "Medium" },
  { symbol: "ABNB", name: "Airbnb", sector: "Consumer Discretionary", typicalOptionsVolume: "High" },
  { symbol: "SNOW", name: "Snowflake", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "CRWD", name: "CrowdStrike", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "PANW", name: "Palo Alto Networks", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "NET", name: "Cloudflare", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "DDOG", name: "Datadog", sector: "Technology", typicalOptionsVolume: "Medium" },
  { symbol: "ZS", name: "Zscaler", sector: "Technology", typicalOptionsVolume: "Medium" },
  { symbol: "SHOP", name: "Shopify", sector: "Technology", typicalOptionsVolume: "High" },
  { symbol: "SQ", name: "Block", sector: "Financials", typicalOptionsVolume: "High" },
  { symbol: "PYPL", name: "PayPal", sector: "Financials", typicalOptionsVolume: "High" },
  { symbol: "V", name: "Visa", sector: "Financials", typicalOptionsVolume: "High" },
  { symbol: "MA", name: "Mastercard", sector: "Financials", typicalOptionsVolume: "High" },
  { symbol: "IBKR", name: "Interactive Brokers", sector: "Financials", typicalOptionsVolume: "Medium" },

  // More liquid names
  { symbol: "F", name: "Ford", sector: "Consumer Discretionary", typicalOptionsVolume: "High" },
  { symbol: "GM", name: "General Motors", sector: "Consumer Discretionary", typicalOptionsVolume: "High" },
  { symbol: "T", name: "AT&T", sector: "Communication", typicalOptionsVolume: "High" },
  { symbol: "VZ", name: "Verizon", sector: "Communication", typicalOptionsVolume: "Medium" },
  { symbol: "KO", name: "Coca-Cola", sector: "Consumer Staples", typicalOptionsVolume: "Medium" },
  { symbol: "PEP", name: "PepsiCo", sector: "Consumer Staples", typicalOptionsVolume: "Medium" },
  { symbol: "PG", name: "Procter & Gamble", sector: "Consumer Staples", typicalOptionsVolume: "Medium" },
  { symbol: "XLE", name: "Energy Select Sector SPDR", sector: "ETF", typicalOptionsVolume: "High" },
  { symbol: "XLF", name: "Financial Select Sector SPDR", sector: "ETF", typicalOptionsVolume: "High" },
  { symbol: "XLK", name: "Technology Select Sector SPDR", sector: "ETF", typicalOptionsVolume: "High" },
  { symbol: "GLD", name: "SPDR Gold Shares", sector: "ETF", typicalOptionsVolume: "High" },
  { symbol: "SLV", name: "iShares Silver Trust", sector: "ETF", typicalOptionsVolume: "High" },
  { symbol: "TLT", name: "iShares 20+ Year Treasury", sector: "ETF", typicalOptionsVolume: "High" },
  { symbol: "HYG", name: "iShares iBoxx High Yield", sector: "ETF", typicalOptionsVolume: "High" },
];
