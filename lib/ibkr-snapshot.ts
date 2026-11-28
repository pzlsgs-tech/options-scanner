/**
 * IBKR live snapshot — positions + balances
 * source = ibkr_live
 * captured: 2026-11-28
 */
export const IBKR_SNAPSHOT = {
  source: "ibkr_live" as const,
  updatedAt: "2026-11-28T00:08:00.000Z",
  baseCurrency: "SGD",
  positions: [
    { contract_id: 266093, contract_description: "AMAT", position: 100.0, market_price: 319.24508665, market_value: 31924.508665, currency: "USD", average_price: 410.240465, unrealized_pnl: -9099.537835, daily_pnl: 806.508665, asset_class: "STK" },
    { contract_id: 584127832, contract_description: "COHR", position: 100.0, market_price: 225.25, market_value: 22525.0, currency: "USD", average_price: 202.134966, unrealized_pnl: 2311.5034, daily_pnl: 2906.0, asset_class: "STK" },
    { contract_id: 943797844, contract_description: "COHR Dec24'26 310 CALL @AMEX", position: -1.0, market_price: 2.13718655, market_value: -213.718655, currency: "USD", average_price: 4.299551, unrealized_pnl: 216.236445, daily_pnl: -112.318655, asset_class: "OPT" },
    { contract_id: 43645865, contract_description: "IBKR", position: 6.8302, market_price: 78.55999755, market_value: 536.58049527, currency: "USD", average_price: 76.58633715, unrealized_pnl: 13.48049527, daily_pnl: 26.09134727, asset_class: "STK" },
    { contract_id: 9408, contract_description: "MCD", position: 100.0, market_price: 283.1499939, market_value: 28314.99939, currency: "USD", average_price: 280.300363, unrealized_pnl: 284.96309, daily_pnl: -35.00061, asset_class: "STK" },
    { contract_id: 4815747, contract_description: "NVDA", position: 60.0, market_price: 149.80000305, market_value: 8988.000183, currency: "USD", average_price: 160.83434, unrealized_pnl: -662.060217, daily_pnl: 30.000183, asset_class: "STK" },
    { contract_id: 942243853, contract_description: "NVDA Dec24'26 150 PUT @AMEX", position: -1.0, market_price: 10.75994205, market_value: -1075.994205, currency: "USD", average_price: 4.691531, unrealized_pnl: -606.841105, daily_pnl: 132.445795, asset_class: "OPT" },
    { contract_id: 850786702, contract_description: "SMERY @PINK", position: 100.0, market_price: 26.22999955, market_value: 2622.999955, currency: "USD", average_price: 28.887306, unrealized_pnl: -265.730645, daily_pnl: 44.999955, asset_class: "STK" },
    { contract_id: 375855577, contract_description: "VWRA @LSEETF", position: 150.0, market_price: 181.272995, market_value: 27190.94925, currency: "USD", average_price: 177.01818133, unrealized_pnl: 638.22205, daily_pnl: 283.94925, asset_class: "STK" },
  ],
  balances: [
    { currency: "BASE", cash_balance: 26961.452, settled_cash: 26961.452, net_liquidation_value: 183074.452, stock_market_value: 157597.52, unrealized_pnl: -9286.85, realized_pnl: 0.0, exchange_rate: 1.0 },
    { currency: "SGD", cash_balance: 30.49, settled_cash: 30.49, net_liquidation_value: 30.49, stock_market_value: 0.0, unrealized_pnl: 0.0, realized_pnl: 0.0, exchange_rate: 1.0 },
    { currency: "USD", cash_balance: 20865.21, settled_cash: 20865.21, net_liquidation_value: 141816.3491, stock_market_value: 122101.29, unrealized_pnl: -7195.14, realized_pnl: 0.0, exchange_rate: 1.2907113 },
  ],
  summary: {
    currency: "SGD",
    net_liquidation: 183074.45,
    equity_with_loan_value: 183074.45,
    buying_power: null,
    gross_position_value: 157597.52,
    total_cash_value: 26961.45,
    available_funds: null,
    initial_margin: null,
    maintenance_margin: null,
    excess_liquidity: null,
    dividends: 0.0,
    leverage: "0.86",
  },
};
