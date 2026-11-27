/**
 * IBKR live snapshot — positions + balances
 * source = ibkr_live
 * captured: 2026-11-27
 */
export const IBKR_SNAPSHOT = {
  source: "ibkr_live" as const,
  updatedAt: "2026-11-27T15:59:51.000Z",
  baseCurrency: "SGD",
  positions: [
    { contract_id: 266093, contract_description: "AMAT", position: 100.0, market_price: 314.0299988, market_value: 31402.99988, currency: "USD", average_price: 410.240465, unrealized_pnl: -9621.04662, daily_pnl: 284.99988, asset_class: "STK" },
    { contract_id: 584127832, contract_description: "COHR", position: 100.0, market_price: 217.60499575, market_value: 21760.499575, currency: "USD", average_price: 202.134966, unrealized_pnl: 1547.002975, daily_pnl: 2141.499575, asset_class: "STK" },
    { contract_id: 943797844, contract_description: "COHR Dec24'26 310 CALL @AMEX", position: -1.0, market_price: 1.79371155, market_value: -179.371155, currency: "USD", average_price: 4.299551, unrealized_pnl: 250.583945, daily_pnl: -77.971155, asset_class: "OPT" },
    { contract_id: 43645865, contract_description: "IBKR", position: 6.8302, market_price: 77.26999665, market_value: 527.76953112, currency: "USD", average_price: 76.58633715, unrealized_pnl: 4.66953112, daily_pnl: 17.28038312, asset_class: "STK" },
    { contract_id: 9408, contract_description: "MCD", position: 100.0, market_price: 282.45999145, market_value: 28245.999145, currency: "USD", average_price: 280.300363, unrealized_pnl: 215.962845, daily_pnl: -104.000855, asset_class: "STK" },
    { contract_id: 4815747, contract_description: "NVDA", position: 60.0, market_price: 147.6199951, market_value: 8857.199706, currency: "USD", average_price: 160.83434, unrealized_pnl: -792.860694, daily_pnl: -100.800294, asset_class: "STK" },
    { contract_id: 942243853, contract_description: "NVDA Dec24'26 150 PUT @AMEX", position: -1.0, market_price: 12.3410597, market_value: -1234.10597, currency: "USD", average_price: 4.691531, unrealized_pnl: -764.95287, daily_pnl: -25.66597, asset_class: "OPT" },
    { contract_id: 850786702, contract_description: "SMERY @PINK", position: 100.0, market_price: 26.1075001, market_value: 2610.75001, currency: "USD", average_price: 28.887306, unrealized_pnl: -277.98059, daily_pnl: 32.75001, asset_class: "STK" },
    { contract_id: 375855577, contract_description: "VWRA @LSEETF", position: 150.0, market_price: 180.8800049, market_value: 27132.000735, currency: "USD", average_price: 177.01818133, unrealized_pnl: 579.273535, daily_pnl: 225.0000026, asset_class: "STK" },
  ],
  balances: [
    { currency: "BASE", cash_balance: 26958.7259, settled_cash: 26958.7259, net_liquidation_value: 180804.6445, stock_market_value: 155476.74, unrealized_pnl: -11537.19, realized_pnl: 0.0, exchange_rate: 1.0 },
    { currency: "SGD", cash_balance: 30.49, settled_cash: 30.49, net_liquidation_value: 30.49, stock_market_value: 0.0, unrealized_pnl: 0.0, realized_pnl: 0.0, exchange_rate: 1.0 },
    { currency: "USD", cash_balance: 20865.21, settled_cash: 20865.21, net_liquidation_value: 140071.9569, stock_market_value: 120470.38, unrealized_pnl: -8939.53, realized_pnl: 0.0, exchange_rate: 1.29058065 },
  ],
  summary: {
    currency: "SGD",
    net_liquidation: 180804.64,
    equity_with_loan_value: 180804.64,
    buying_power: 901623.12,
    gross_position_value: 157318.17,
    total_cash_value: 26958.73,
    available_funds: 135243.47,
    initial_margin: 45561.18,
    maintenance_margin: 41486.65,
    excess_liquidity: 139318.0,
    dividends: 0.0,
    leverage: "0.87",
  },
};
