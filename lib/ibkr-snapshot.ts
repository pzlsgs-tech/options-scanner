/**
 * IBKR live snapshot — positions + balances
 * source = ibkr_live
 * captured: 2026-11-27
 */
export const IBKR_SNAPSHOT = {
  source: "ibkr_live" as const,
  capturedAt: "2026-11-27T00:08:00.000Z",
  baseCurrency: "SGD",
  positions: [
    { contract_id: 266093, contract_description: "AMAT", position: 100.0, market_price: 312.0, market_value: 31200.0, currency: "USD", average_price: 410.240465, unrealized_pnl: -9824.0465, daily_pnl: 82.0007324, asset_class: "STK" },
    { contract_id: 584127832, contract_description: "COHR", position: 100.0, market_price: 201.0, market_value: 20100.0, currency: "USD", average_price: 202.134966, unrealized_pnl: -113.4966, daily_pnl: 480.99975585, asset_class: "STK" },
    { contract_id: 943797844, contract_description: "COHR Dec24'26 310 CALL @AMEX", position: -1.0, market_price: 0.716428, market_value: -71.6428, currency: "USD", average_price: 4.299551, unrealized_pnl: 358.3123, daily_pnl: 38.6372, asset_class: "OPT" },
    { contract_id: 43645865, contract_description: "IBKR", position: 6.8302, market_price: 74.73999785, market_value: 510.48913332, currency: "USD", average_price: 76.58633715, unrealized_pnl: -12.61086668, daily_pnl: -8e-8, asset_class: "STK" },
    { contract_id: 9408, contract_description: "MCD", position: 100.0, market_price: 283.5, market_value: 28350.0, currency: "USD", average_price: 280.300363, unrealized_pnl: 319.9637, daily_pnl: 0.0, asset_class: "STK" },
    { contract_id: 4815747, contract_description: "NVDA", position: 60.0, market_price: 150.9900055, market_value: 9059.40033, currency: "USD", average_price: 160.83434, unrealized_pnl: -590.66007, daily_pnl: 101.4001469, asset_class: "STK" },
    { contract_id: 942243853, contract_description: "NVDA Dec24'26 150 PUT @AMEX", position: -1.0, market_price: 12.2538004, market_value: -1225.38004, currency: "USD", average_price: 4.691531, unrealized_pnl: -756.22694, daily_pnl: -315.38004, asset_class: "OPT" },
    { contract_id: 850786702, contract_description: "SMERY @PINK", position: 100.0, market_price: 25.7800007, market_value: 2578.00007, currency: "USD", average_price: 28.887306, unrealized_pnl: -310.73053, daily_pnl: -49.99993, asset_class: "STK" },
    { contract_id: 375855577, contract_description: "VWRA @LSEETF", position: 150.0, market_price: 179.3800049, market_value: 26907.000735, currency: "USD", average_price: 177.01818133, unrealized_pnl: 354.273535, daily_pnl: 0.000735, asset_class: "STK" },
  ],
  balances: [
    { currency: "BASE", cash_balance: 26960.9844, settled_cash: 26960.9844, net_liquidation_value: 179388.3255, stock_market_value: 153790.42, unrealized_pnl: -12969.64, realized_pnl: 0.0, exchange_rate: 1.0 },
    { currency: "SGD", cash_balance: 30.49, settled_cash: 30.49, net_liquidation_value: 30.49, stock_market_value: 0.0, unrealized_pnl: 0.0, realized_pnl: 0.0, exchange_rate: 1.0 },
    { currency: "USD", cash_balance: 20865.21, settled_cash: 20865.21, net_liquidation_value: 138962.8743, stock_market_value: 119153.75, unrealized_pnl: -10048.62, realized_pnl: 0.0, exchange_rate: 1.29042735 },
  ],
  summary: {
    currency: "SGD",
    net_liquidation: 179388.33,
    equity_with_loan_value: 179388.33,
    buying_power: 896434.16,
    gross_position_value: 155364.12,
    total_cash_value: 26960.98,
    available_funds: 134465.12,
    initial_margin: 44923.2,
    maintenance_margin: 40905.05,
    excess_liquidity: 138483.27,
    dividends: 0.0,
    leverage: "0.87",
  },
};
