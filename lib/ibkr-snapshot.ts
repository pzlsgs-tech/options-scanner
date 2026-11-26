/**
 * IBKR live snapshot — positions + balances
 * source = ibkr_live
 * captured: 2026-11-26 (updated)
 */
export const IBKR_SNAPSHOT = {
  source: "ibkr_live" as const,
  capturedAt: "2026-11-26T16:00:00.000Z",
  baseCurrency: "SGD",
  positions: [
    { contract_id: 266093, contract_description: "AMAT", position: 100.0, market_price: 314.8500061, market_value: 31485.00061, currency: "USD", average_price: 410.240465, unrealized_pnl: -9539.04589, daily_pnl: -890.99939, asset_class: "STK" },
    { contract_id: 584127832, contract_description: "COHR", position: 100.0, market_price: 202.41999815, market_value: 20241.999815, currency: "USD", average_price: 202.134966, unrealized_pnl: 28.503215, daily_pnl: 617.999815, asset_class: "STK" },
    { contract_id: 943797844, contract_description: "COHR Dec24'26 310 CALL @AMEX", position: -1.0, market_price: 0.716428, market_value: -71.6428, currency: "USD", average_price: 4.299551, unrealized_pnl: 358.3123, daily_pnl: 38.6372, asset_class: "OPT" },
    { contract_id: 43645865, contract_description: "IBKR", position: 6.8302, market_price: 75.19999695, market_value: 513.63101917, currency: "USD", average_price: 76.58633715, unrealized_pnl: -9.46898083, daily_pnl: 3.34677717, asset_class: "STK" },
    { contract_id: 9408, contract_description: "MCD", position: 100.0, market_price: 283.5, market_value: 28350.0, currency: "USD", average_price: 280.300363, unrealized_pnl: 319.9637, daily_pnl: 280.0, asset_class: "STK" },
    { contract_id: 4815747, contract_description: "NVDA", position: 60.0, market_price: 151.2200012, market_value: 9073.200072, currency: "USD", average_price: 160.83434, unrealized_pnl: -576.860328, daily_pnl: -249.599928, asset_class: "STK" },
    { contract_id: 942243853, contract_description: "NVDA Dec24'26 150 PUT @AMEX", position: -1.0, market_price: 12.2538004, market_value: -1225.38004, currency: "USD", average_price: 4.691531, unrealized_pnl: -756.22694, daily_pnl: -315.38004, asset_class: "OPT" },
    { contract_id: 850786702, contract_description: "SMERY @PINK", position: 100.0, market_price: 25.7800007, market_value: 2578.00007, currency: "USD", average_price: 28.887306, unrealized_pnl: -310.73053, daily_pnl: -49.99993, asset_class: "STK" },
    { contract_id: 375855577, contract_description: "VWRA @LSEETF", position: 150.0, market_price: 179.6199951, market_value: 26942.999265, currency: "USD", average_price: 177.01818133, unrealized_pnl: 390.272065, daily_pnl: 842.999265, asset_class: "STK" },
  ],
  balances: [
    { currency: "BASE", cash_balance: 26958.7308, settled_cash: 26958.7308, net_liquidation_value: 179421.3445, stock_market_value: 153825.58, unrealized_pnl: -12912.66, realized_pnl: 0.0, exchange_rate: 1.0 },
    { currency: "SGD", cash_balance: 30.49, settled_cash: 30.49, net_liquidation_value: 30.49, stock_market_value: 0.0, unrealized_pnl: 0.0, realized_pnl: 0.0, exchange_rate: 1.0 },
    { currency: "USD", cash_balance: 20865.21, settled_cash: 20865.21, net_liquidation_value: 139000.0882, stock_market_value: 119190.96, unrealized_pnl: -10005.31, realized_pnl: 0.0, exchange_rate: 1.29058085 },
  ],
  summary: {
    currency: "SGD",
    net_liquidation: 179421.34,
    equity_with_loan_value: 179421.34,
    buying_power: 898929.29,
    gross_position_value: 155399.15,
    total_cash_value: 26958.73,
    available_funds: 134839.39,
    initial_margin: 44581.95,
    maintenance_margin: 40594.49,
    excess_liquidity: 138826.85,
    dividends: 0.0,
    leverage: "0.87",
  },
};
