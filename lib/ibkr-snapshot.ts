/**
 * IBKR live snapshot — positions + balances
 * source = ibkr_live
 * captured: 2026-11-26
 */
export const IBKR_SNAPSHOT = {
  source: "ibkr_live" as const,
  capturedAt: "2026-11-26T00:09:00.000Z",
  baseCurrency: "SGD",
  positions: [
    { contract_id: 266093, contract_description: "AMAT", position: 100.0, market_price: 312.1661072, market_value: 31216.61072, currency: "USD", average_price: 410.240465, unrealized_pnl: -9807.43578, daily_pnl: -1159.38928, asset_class: "STK" },
    { contract_id: 584127832, contract_description: "COHR", position: 100.0, market_price: 200.7899933, market_value: 20078.99933, currency: "USD", average_price: 202.134966, unrealized_pnl: -134.49727, daily_pnl: 454.99933, asset_class: "STK" },
    { contract_id: 943797844, contract_description: "COHR Dec24'26 310 CALL @AMEX", position: -1.0, market_price: 0.71642775, market_value: -71.642775, currency: "USD", average_price: 4.299551, unrealized_pnl: 358.312325, daily_pnl: 38.637225, asset_class: "OPT" },
    { contract_id: 43645865, contract_description: "IBKR", position: 6.8302, market_price: 75.0, market_value: 512.265, currency: "USD", average_price: 76.58633715, unrealized_pnl: -10.835, daily_pnl: 1.980758, asset_class: "STK" },
    { contract_id: 9408, contract_description: "MCD", position: 100.0, market_price: 284.0, market_value: 28400.0, currency: "USD", average_price: 280.300363, unrealized_pnl: 369.9637, daily_pnl: 330.0, asset_class: "STK" },
    { contract_id: 4815747, contract_description: "NVDA", position: 60.0, market_price: 150.91000365, market_value: 9054.600219, currency: "USD", average_price: 160.83434, unrealized_pnl: -595.460181, daily_pnl: -268.199781, asset_class: "STK" },
    { contract_id: 942243853, contract_description: "NVDA Dec24'26 150 PUT @AMEX", position: -1.0, market_price: 12.2537813, market_value: -1225.37813, currency: "USD", average_price: 4.691531, unrealized_pnl: -756.22503, daily_pnl: -315.37813, asset_class: "OPT" },
    { contract_id: 850786702, contract_description: "SMERY @PINK", position: 100.0, market_price: 25.7800007, market_value: 2578.00007, currency: "USD", average_price: 28.887306, unrealized_pnl: -310.73053, daily_pnl: -49.99993, asset_class: "STK" },
    { contract_id: 375855577, contract_description: "VWRA @LSEETF", position: 150.0, market_price: 174.0, market_value: 26100.0, currency: "USD", average_price: 177.01818133, unrealized_pnl: -452.7272, daily_pnl: 0.0, asset_class: "STK" },
  ],
  balances: [
    { currency: "BASE", cash_balance: 26947.0504, settled_cash: 26947.0504, net_liquidation_value: 177613.435, stock_market_value: 152032.08, unrealized_pnl: -14643.7, realized_pnl: 0.0, exchange_rate: 1.0 },
    { currency: "SGD", cash_balance: 30.49, settled_cash: 30.49, net_liquidation_value: 30.49, stock_market_value: 0.0, unrealized_pnl: 0.0, realized_pnl: 0.0, exchange_rate: 1.0 },
    { currency: "USD", cash_balance: 20865.21, settled_cash: 20865.21, net_liquidation_value: 137658.9501, stock_market_value: 117852.4, unrealized_pnl: -11351.52, realized_pnl: 0.0, exchange_rate: 1.29002105 },
  ],
  summary: {
    currency: "SGD",
    net_liquidation: 177613.44,
    equity_with_loan_value: 177613.44,
    buying_power: 889053.22,
    gross_position_value: 153606.97,
    total_cash_value: 26947.05,
    available_funds: 133357.98,
    initial_margin: 44255.45,
    maintenance_margin: 40305.06,
    excess_liquidity: 137308.38,
    dividends: 0.0,
    leverage: "0.86",
  },
};
