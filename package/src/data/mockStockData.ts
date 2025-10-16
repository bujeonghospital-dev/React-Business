// Mock Stock Data for Testing
// Use this when SET API is not available

export interface StockData {
  symbol: string;
  last: number;
  change: number;
  percentChange: number;
  high: number;
  low: number;
  volume: number;
  value: number;
  prior: number;
  marketStatus: string;
}

export const MOCK_STOCKS: StockData[] = [
  {
    symbol: "TVO",
    last: 24.5,
    change: 0.5,
    percentChange: 2.08,
    high: 25.0,
    low: 24.0,
    volume: 15500000,
    value: 380250000,
    prior: 24.0,
    marketStatus: "CLOSED",
  },
  {
    symbol: "PTT",
    last: 38.5,
    change: 0.75,
    percentChange: 1.99,
    high: 39.0,
    low: 37.75,
    volume: 320000000,
    value: 12450250000,
    prior: 37.75,
    marketStatus: "CLOSED",
  },
  {
    symbol: "KBANK",
    last: 142.0,
    change: -1.5,
    percentChange: -1.04,
    high: 144.0,
    low: 141.5,
    volume: 58500000,
    value: 8320500000,
    prior: 143.5,
    marketStatus: "CLOSED",
  },
  {
    symbol: "CPALL",
    last: 65.25,
    change: 0.5,
    percentChange: 0.77,
    high: 66.0,
    low: 64.5,
    volume: 120000000,
    value: 7890750000,
    prior: 64.75,
    marketStatus: "CLOSED",
  },
  {
    symbol: "AOT",
    last: 68.0,
    change: 1.25,
    percentChange: 1.87,
    high: 68.5,
    low: 66.75,
    volume: 95000000,
    value: 6543200000,
    prior: 66.75,
    marketStatus: "CLOSED",
  },
  {
    symbol: "ADVANC",
    last: 185.0,
    change: 2.5,
    percentChange: 1.37,
    high: 186.0,
    low: 182.5,
    volume: 35000000,
    value: 6475000000,
    prior: 182.5,
    marketStatus: "CLOSED",
  },
  {
    symbol: "TRUE",
    last: 4.8,
    change: -0.1,
    percentChange: -2.04,
    high: 4.92,
    low: 4.78,
    volume: 950000000,
    value: 4560000000,
    prior: 4.9,
    marketStatus: "CLOSED",
  },
  {
    symbol: "SCB",
    last: 98.5,
    change: 1.0,
    percentChange: 1.03,
    high: 99.5,
    low: 97.5,
    volume: 42000000,
    value: 4137000000,
    prior: 97.5,
    marketStatus: "CLOSED",
  },
  {
    symbol: "BDMS",
    last: 25.75,
    change: 0.25,
    percentChange: 0.98,
    high: 26.0,
    low: 25.5,
    volume: 155000000,
    value: 3991250000,
    prior: 25.5,
    marketStatus: "CLOSED",
  },
  {
    symbol: "GULF",
    last: 42.25,
    change: -0.75,
    percentChange: -1.74,
    high: 43.5,
    low: 42.0,
    volume: 89000000,
    value: 3760250000,
    prior: 43.0,
    marketStatus: "CLOSED",
  },
];

/**
 * Find stock by symbol
 */
export function findStockBySymbol(symbol: string): StockData | undefined {
  return MOCK_STOCKS.find(
    (stock) => stock.symbol.toUpperCase() === symbol.toUpperCase()
  );
}

/**
 * Get top stocks by trading value
 */
export function getTopStocksByValue(count: number = 10): StockData[] {
  return [...MOCK_STOCKS].sort((a, b) => b.value - a.value).slice(0, count);
}

/**
 * Get stocks with positive changes
 */
export function getGainersStocks(count: number = 10): StockData[] {
  return [...MOCK_STOCKS]
    .filter((stock) => stock.change > 0)
    .sort((a, b) => b.percentChange - a.percentChange)
    .slice(0, count);
}

/**
 * Get stocks with negative changes
 */
export function getLosersStocks(count: number = 10): StockData[] {
  return [...MOCK_STOCKS]
    .filter((stock) => stock.change < 0)
    .sort((a, b) => a.percentChange - b.percentChange)
    .slice(0, count);
}
