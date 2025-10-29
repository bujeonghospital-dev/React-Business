"use client";

import React, { useState, useEffect, useRef } from "react";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

// Types for SET API data
interface StockData {
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

interface ApiResponse {
  data?: StockData[];
  error?: string;
}

// Types for SETSMART API data
interface SetSmartPriceData {
  symbol: string;
  date: string;
  securityType?: string;
  adjustedPriceFlag?: string;
  prior: number;
  open: number;
  high: number;
  low: number;
  close: number;
  average?: number;
  aomVolume?: number;
  aomValue?: number;
  trVolume?: number;
  trValue?: number;
  totalVolume?: number;
  totalValue?: number;
  volume?: number;
  value: number;
  priorClose: number;
  change: number;
  percentChange: number;
  pe?: number;
  pbv?: number;
  bvps?: number;
  dividendYield?: number;
  marketCap?: number;
  volumeTurnover?: number;
}

interface SetSmartApiResponse {
  data?: SetSmartPriceData[];
  error?: string;
}

// Types for Financial Data and Ratio API
interface FinancialDataItem {
  symbol: string;
  year: string;
  quarter: string;
  financialStatementType: string;
  dateAsof: string;
  accountPeriod: string;
  totalAssets: number; // in thousand baht
  totalLiabilities: number;
  paidupShareCapital: number;
  shareholderEquity: number;
  totalEquity: number;
  totalRevenueQuarter: number;
  totalRevenueAccum: number;
  totalExpensesQuarter: number;
  totalExpensesAccum: number;
  ebitQuarter: number;
  ebitAccum: number;
  netProfitQuarter: number;
  netProfitAccum: number;
  epsQuarter: number;
  epsAccum: number;
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  roe: number;
  roa: number;
  netProfitMarginQuarter: number;
  netProfitMarginAccum: number;
  de: number;
  fixedAssetTurnover: number;
  totalAssetTurnover: number;
}

interface FinancialDataResponse {
  data?: FinancialDataItem[];
  error?: string;
}

// Add styles for animations
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .animate-pulse-slow {
      animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `;
  document.head.appendChild(style);
}

// Intersection Observer Hook for scroll animations
const useScrollAnimation = (threshold = 0.1) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

// Stock Market Widget Component with SETSMART API
const StockMarketWidget: React.FC<{ symbol?: string }> = ({
  symbol = "TPP",
}) => {
  const [stockData, setStockData] = useState<SetSmartPriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const { ref, isVisible } = useScrollAnimation();

  // Initialize dates (last 7 days to today)
  useEffect(() => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    setEndDate(formatDate(today));
    setStartDate(formatDate(lastWeek));
  }, []);

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchStockData = async () => {
      try {
        setLoading(true);
        const url = `/api/stock?symbol=${symbol}&startDate=${startDate}&endDate=${endDate}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data: any = await response.json();

        // Get the most recent data (last item in array)
        // Handle multiple response formats: {value: []}, {data: []}, or direct array []
        let dataArray: SetSmartPriceData[] = [];
        if (Array.isArray(data)) {
          dataArray = data;
        } else if (data?.value && Array.isArray(data.value)) {
          // Format from SETSMART API: {value: [...], Count: number}
          dataArray = data.value;
        } else if (data?.data && Array.isArray(data.data)) {
          dataArray = data.data;
        }

        if (dataArray && Array.isArray(dataArray) && dataArray.length > 0) {
          const latestData = dataArray[dataArray.length - 1];

          // Calculate change and percentChange from close and prior
          const change = latestData.close - latestData.prior;
          const percentChange = (change / latestData.prior) * 100;

          // Map totalValue to value and add calculated fields
          const stockData: SetSmartPriceData = {
            ...latestData,
            value: latestData.totalValue || latestData.value || 0,
            volume: latestData.totalVolume || latestData.volume || 0,
            change: change,
            percentChange: percentChange,
            priorClose: latestData.prior,
          };

          setStockData(stockData);
          setError(null);
        } else {
          setError(`ไม่พบข้อมูลหุ้น ${symbol} ในช่วงวันที่ที่เลือก`);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStockData, 300000);
    return () => clearInterval(interval);
  }, [symbol, startDate, endDate]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-12 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="text-yellow-500 text-2xl">⚠️</div>
          <div>
            <h3 className="font-semibold text-gray-800">ข้อมูลหุ้น {symbol}</h3>
            <p className="text-sm text-gray-600">
              {error || "กำลังโหลดข้อมูล..."}
            </p>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">
                วันที่เริ่มต้น
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">
                วันที่สิ้นสุด
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isPositive = stockData.change >= 0;

  return (
    <div
      ref={ref}
      className={`bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg p-6 border-l-4 transform transition-all duration-700 hover:shadow-xl hover:-translate-y-1 ${
        isPositive ? "border-green-500" : "border-red-500"
      } opacity-100 translate-y-0`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {stockData.symbol}
          </h3>
          <p className="text-sm text-gray-500">
            📅{" "}
            {new Date(stockData.date).toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-800">
            {stockData.close.toFixed(2)}
          </div>
          <div
            className={`flex items-center justify-end gap-1 text-lg font-semibold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            {isPositive ? "+" : ""}
            {stockData.change.toFixed(2)} ({isPositive ? "+" : ""}
            {stockData.percentChange.toFixed(2)}%)
          </div>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">
              วันที่เริ่มต้น
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                const newDate = e.target.value;
                if (newDate !== endDate) {
                  setStartDate(newDate);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-600 mb-1">
              วันที่สิ้นสุด
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                const newDate = e.target.value;
                if (newDate !== startDate) {
                  setEndDate(newDate);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500 mb-1">เปิด</p>
          <p className="text-lg font-semibold text-gray-800">
            {stockData.open.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">ปิด</p>
          <p className="text-lg font-semibold text-gray-800">
            {stockData.close.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">สูงสุด</p>
          <p className="text-lg font-semibold text-gray-800">
            {stockData.high.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">ต่ำสุด</p>
          <p className="text-lg font-semibold text-gray-800">
            {stockData.low.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">ปริมาณ (หุ้น)</p>
          <p className="text-lg font-semibold text-gray-800">
            {stockData.volume && stockData.volume > 1000000
              ? (stockData.volume / 1000000).toFixed(2) + "M"
              : stockData.volume?.toLocaleString("th-TH") || "0"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">มูลค่า (บาท)</p>
          <p className="text-lg font-semibold text-gray-800">
            {stockData.value && stockData.value > 1000000
              ? (stockData.value / 1000000).toFixed(2) + "M"
              : stockData.value?.toLocaleString("th-TH") || "0"}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          ราคาปิดก่อนหน้า: {stockData.priorClose.toFixed(2)} บาท
        </p>
        <p className="text-xs text-gray-400 mt-1">
          ข้อมูลจาก SETSMART API • ปรับราคาแล้ว
        </p>
      </div>
    </div>
  );
};

// Chart Component with data from API
interface ChartData {
  year: string;
  quarter?: string;
  label: string; // e.g., "2024 Q3" or "2024 FY"
  value: number;
}

interface DynamicFinancialChartProps {
  title: string;
  unit: string;
  color: string;
  symbol: string;
  dataField: keyof FinancialDataItem; // e.g., 'totalRevenueAccum', 'netProfitAccum', 'totalAssets'
  divideBy?: number; // to convert from thousand baht to million baht
}

const DynamicFinancialChart: React.FC<DynamicFinancialChartProps> = React.memo(
  ({
    title,
    unit,
    color,
    symbol,
    dataField,
    divideBy = 1000, // Default: convert from thousand to million
  }) => {
    const [data, setData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAnimated, setIsAnimated] = useState(false);
    const { ref, isVisible } = useScrollAnimation();

    useEffect(() => {
      // Early return if symbol not set
      if (!symbol) {
        setLoading(false);
        return;
      }

      let isMounted = true;

      const fetchFinancialData = async () => {
        try {
          setLoading(true);
          // Fetch data from 2022 to 2025
          const url = `/api/financial-data?symbol=${symbol}&startYear=2022&startQuarter=4&endYear=2025&endQuarter=4`;

          const response = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
          }

          const result: any = await response.json();
          let financialItems: FinancialDataItem[] = [];

          // Handle multiple response formats
          if (Array.isArray(result)) {
            financialItems = result;
          } else if (result?.value && Array.isArray(result.value)) {
            financialItems = result.value;
          } else if (result?.data && Array.isArray(result.data)) {
            financialItems = result.data;
          }

          if (!isMounted) return;

          if (financialItems.length === 0) {
            setError(`ไม่พบข้อมูลการเงิน ${symbol} สำหรับช่วงเวลาที่ขอ`);
            setData([]);
          } else {
            // Pick best entry per year (prefer Full year, else highest quarter)
            const byYear = new Map<string, FinancialDataItem[]>();
            for (const item of financialItems) {
              const y = item.year;
              if (!byYear.has(y)) byYear.set(y, []);
              byYear.get(y)!.push(item);
            }

            const rank = (it: FinancialDataItem) => {
              if (it.accountPeriod === "F") return 5;
              const q = parseInt(it.quarter || "0", 10);
              return Number.isNaN(q) ? 0 : q;
            };

            const yearlyData = Array.from(byYear.entries())
              .map(
                ([_year, items]) => items.sort((a, b) => rank(b) - rank(a))[0]
              )
              .sort((a, b) => parseInt(a.year) - parseInt(b.year));

            // Transform data
            const chartData = yearlyData.map((item) => {
              const raw = (item as any)[dataField];
              const value =
                typeof raw === "string"
                  ? parseFloat(raw)
                  : typeof raw === "number"
                  ? raw
                  : 0;
              const qNum = parseInt(item.quarter || "", 10);
              const hasQuarter = !Number.isNaN(qNum) && qNum >= 1 && qNum <= 4;
              const yearNum = parseInt(item.year || "", 10);
              const yearBE = Number.isNaN(yearNum)
                ? item.year
                : String(yearNum + 543);
              const label = `${yearBE} ${
                item.accountPeriod === "F" ? "FY" : hasQuarter ? `Q${qNum}` : ""
              }`.trim();
              return {
                year: item.year,
                quarter: hasQuarter ? String(qNum) : undefined,
                label,
                value: value / divideBy, // Convert to million
              };
            });

            setData(chartData);
            setError(null);
          }
        } catch (err) {
          if (!isMounted) return;
          setError(
            err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล"
          );
          setData([]);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      fetchFinancialData();

      return () => {
        isMounted = false;
      };
    }, [symbol, dataField, divideBy]);

    useEffect(() => {
      if (isVisible) {
        setTimeout(() => setIsAnimated(true), 100);
      }
    }, [isVisible]);

    const maxValue =
      data.length > 0 ? Math.max(...data.map((d) => d.value)) : 0;
    const chartHeight = 200;

    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg shadow-md p-6 transform transition-all duration-700 hover:shadow-xl hover:-translate-y-1 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">{unit}</p>
        </div>

        {/* Chart Display */}
        <div className="relative" style={{ height: `${chartHeight}px` }}>
          {loading ? (
            <div className="flex items-end justify-around h-full pb-2">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div
                    className="w-16 bg-gray-200 rounded-t animate-pulse"
                    style={{ height: `${50 + idx * 20}px` }}
                  />
                  <span className="text-xs mt-2 text-gray-300">&nbsp;</span>
                </div>
              ))}
            </div>
          ) : error || data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              {error || "ไม่มีข้อมูลสำหรับแสดง"}
            </div>
          ) : (
            <div className="flex items-end justify-around h-full border-b border-gray-300 pb-2">
              {data.map((item, index) => {
                const barHeight =
                  maxValue > 0
                    ? (item.value / maxValue) * (chartHeight - 50)
                    : 0;
                const animatedHeight = isAnimated ? barHeight : 0;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center group"
                    style={{
                      animation: isAnimated
                        ? `slideUp 0.6s ease-out ${index * 0.1}s forwards`
                        : "none",
                      opacity: isAnimated ? 1 : 0,
                    }}
                  >
                    <div className="relative flex flex-col items-center">
                      <span
                        className={`text-xs font-semibold mb-1 transition-all duration-300 ${
                          isAnimated
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 -translate-y-2"
                        }`}
                        style={{
                          color,
                          transitionDelay: `${index * 0.1 + 0.3}s`,
                        }}
                      >
                        {item.value.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <div
                        className="w-16 rounded-t transition-all duration-700 group-hover:opacity-80 relative overflow-hidden"
                        style={{
                          height: `${animatedHeight}px`,
                          backgroundColor: color,
                        }}
                      >
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                      </div>
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium text-gray-700 transition-all duration-300 ${
                        isAnimated
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-2"
                      }`}
                      style={{ transitionDelay: `${index * 0.1 + 0.4}s` }}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            ข้อมูลจาก SETSMART API • สำหรับการอ้างอิงเท่านั้น
          </p>
        </div>
      </div>
    );
  }
);

// Satisfy eslint react/display-name for memoized component
DynamicFinancialChart.displayName = "DynamicFinancialChart";

// Financial Table Component with dynamic data from API
interface FinancialTableProps {
  symbol: string;
}

const FinancialTable: React.FC<FinancialTableProps> = React.memo(
  ({ symbol }) => {
    const { ref, isVisible } = useScrollAnimation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tableData, setTableData] = useState<{
      headers: string[];
      rows: Array<{
        label: string;
        values: number[];
      }>;
      ratios: Array<{
        label: string;
        values: number[];
      }>;
    } | null>(null);

    useEffect(() => {
      // Early return if symbol not set
      if (!symbol) {
        setLoading(false);
        return;
      }

      let isMounted = true;

      const fetchFinancialData = async () => {
        try {
          setLoading(true);
          // Use the same range as charts to leverage server cache and reduce rate limits
          const url = `/api/financial-data?symbol=${symbol}&startYear=2022&startQuarter=4&endYear=2025&endQuarter=4`;

          const response = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
          }

          const result: any = await response.json();
          let financialItems: FinancialDataItem[] = [];

          // Handle multiple response formats
          if (Array.isArray(result)) {
            financialItems = result;
          } else if (result?.value && Array.isArray(result.value)) {
            financialItems = result.value;
          } else if (result?.data && Array.isArray(result.data)) {
            financialItems = result.data;
          }

          if (!isMounted) return;

          if (financialItems.length === 0) {
            setError(`ไม่พบข้อมูลการเงิน ${symbol}`);
            return;
          }

          // Select only year-end records: prefer entries whose `dateAsof` is Dec 31.
          // Fallback: if dateAsof missing/invalid, accept items with quarter==='4' or accountPeriod==='F'.
          const yearEndItems = financialItems.filter((item) => {
            if (item.dateAsof) {
              const d = new Date(item.dateAsof);
              if (!Number.isNaN(d.getTime())) {
                return d.getMonth() === 11 && d.getDate() === 31; // month is 0-based
              }
            }
            // Fallback heuristics
            if (item.quarter === "4") return true;
            if (item.accountPeriod === "F") return true;
            return false;
          });

          const yearlyData = yearEndItems
            .sort((a, b) => parseInt(a.year) - parseInt(b.year))
            .slice(-5); // last 5 year-end records

          if (yearlyData.length === 0) {
            setError("ไม่มีข้อมูลประจำปี");
            return;
          }

          // Build table headers
          const headers = yearlyData.map((item) => {
            // Prefer provided date; otherwise, fallback to correct fiscal quarter end date
            if (item.dateAsof) {
              const dateAsof = new Date(item.dateAsof);
              if (!Number.isNaN(dateAsof.getTime())) {
                const day = String(dateAsof.getDate()).padStart(2, "0");
                const month = String(dateAsof.getMonth() + 1).padStart(2, "0");
                const yearAD = dateAsof.getFullYear();
                const yearBE = yearAD + 543;
                return `${day}/${month}/${yearBE}`;
              }
            }
            const q = parseInt(item.quarter || "4", 10);
            const quarterEnd: Record<number, string> = {
              1: "31/03",
              2: "30/06",
              3: "30/09",
              4: "31/12",
            };
            const y = parseInt(item.year || "", 10);
            const yearBE = Number.isNaN(y) ? item.year : String(y + 543);
            return `${quarterEnd[q] || "31/12"}/${yearBE}`;
          });

          // Helper to coerce possible string values to numbers
          const toNum = (v: any) => {
            const n = typeof v === "string" ? parseFloat(v) : v;
            return Number.isFinite(n) ? (n as number) : 0;
          };

          // Build data rows - convert from thousand baht to million baht
          const rows = [
            {
              label: "สินทรัพย์รวม",
              values: yearlyData.map(
                (item) => toNum(item.totalAssets ?? 0) / 1000
              ),
            },
            {
              label: "หนี้สินรวม",
              values: yearlyData.map(
                (item) => toNum(item.totalLiabilities ?? 0) / 1000
              ),
            },
            {
              label: "ส่วนของผู้ถือหุ้น",
              values: yearlyData.map(
                (item) => toNum(item.shareholderEquity ?? 0) / 1000
              ),
            },
            {
              label: "มูลค่าหุ้นที่เรียกชำระแล้ว",
              values: yearlyData.map(
                (item) => toNum(item.paidupShareCapital ?? 0) / 1000
              ),
            },
            {
              label: "รายได้รวม",
              values: yearlyData.map(
                (item) => toNum(item.totalRevenueAccum ?? 0) / 1000
              ),
            },
            {
              label: "กำไรสุทธิ",
              values: yearlyData.map(
                (item) => toNum(item.netProfitAccum ?? 0) / 1000
              ),
            },
            {
              label: "กำไรต่อหุ้น (บาท)",
              values: yearlyData.map((item) => toNum(item.epsAccum ?? 0)),
            },
          ];

          // Build ratios
          const ratios = [
            {
              label: "ROA(%)",
              values: yearlyData.map((item) => toNum(item.roa ?? 0) * 100),
            },
            {
              label: "ROE(%)",
              values: yearlyData.map((item) => toNum(item.roe ?? 0) * 100),
            },
            {
              label: "อัตรากำไรสุทธิ(%)",
              values: yearlyData.map(
                (item) => toNum(item.netProfitMarginAccum ?? 0) * 100
              ),
            },
          ];

          if (isMounted) {
            setTableData({ headers, rows, ratios });
            setError(null);
          }
        } catch (err) {
          if (!isMounted) return;
          setError(
            err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล"
          );
          setTableData(null);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      };

      fetchFinancialData();

      return () => {
        isMounted = false;
      };
    }, [symbol]);

    if (loading) {
      // While fetching, render the same visible table layout but with placeholder cells
      const now = new Date();
      const thisYear = now.getFullYear();
      const placeholderYears = Array.from({ length: 5 }, (_, i) => {
        const ad = thisYear - (4 - i);
        return `31/12/${ad + 543}`;
      });

      const placeholderRows = [
        "สินทรัพย์รวม",
        "หนี้สินรวม",
        "ส่วนของผู้ถือหุ้น",
        "มูลค่าหุ้นที่เรียกชำระแล้ว",
        "รายได้รวม",
        "กำไรสุทธิ",
        "กำไรต่อหุ้น (บาท)",
      ];

      const placeholderRatios = ["ROA(%)", "ROE(%)", "อัตรากำไรสุทธิ(%)"];

      return (
        <div
          ref={ref}
          className={`bg-white rounded-lg shadow-md p-6 overflow-x-auto transform transition-all duration-700 hover:shadow-xl ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            ข้อมูลสำคัญทางการเงิน{" "}
            <span className="text-sm font-normal">(หน่วย: ล้านบาท)</span>
          </h2>

          <div className="mb-3 text-sm text-gray-600">กำลังโหลดข้อมูล...</div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-teal-700 text-white">
                  <th className="border border-gray-300 px-4 py-3 text-left">
                    ปีบัญชี สิ้นสุดวันที่
                  </th>
                  {placeholderYears.map((h, idx) => (
                    <th
                      key={idx}
                      className="border border-gray-300 px-4 py-3 text-center"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-teal-600 text-white">
                  <td
                    className="border border-gray-300 px-4 py-2 font-semibold"
                    colSpan={placeholderYears.length + 1}
                  >
                    บัญชีทางการเงินที่สำคัญ
                  </td>
                </tr>
                {placeholderRows.map((label, rIdx) => (
                  <tr
                    key={rIdx}
                    className={rIdx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      {label}
                    </td>
                    {placeholderYears.map((_, cIdx) => (
                      <td
                        key={cIdx}
                        className="border border-gray-300 px-4 py-2 text-right text-gray-300 animate-pulse"
                      >
                        &nbsp;
                      </td>
                    ))}
                  </tr>
                ))}

                <tr className="bg-teal-600 text-white">
                  <td
                    className="border border-gray-300 px-4 py-2 font-semibold"
                    colSpan={placeholderYears.length + 1}
                  >
                    อัตราส่วนทางการเงินที่สำคัญ
                  </td>
                </tr>
                {placeholderRatios.map((label, rIdx) => (
                  <tr
                    key={rIdx}
                    className={rIdx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      {label}
                    </td>
                    {placeholderYears.map((_, cIdx) => (
                      <td
                        key={cIdx}
                        className="border border-gray-300 px-4 py-2 text-right text-gray-300 animate-pulse"
                      >
                        &nbsp;
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              ข้อมูลจาก SETSMART API • สำหรับการอ้างอิงเท่านั้น
            </p>
          </div>
        </div>
      );
    }

    if (error || !tableData) {
      // Render a visible placeholder table so the user always sees the table layout
      // even if the API failed. This helps debugging and UX — shows headings and
      // empty cells rather than hiding the whole area.
      const now = new Date();
      const thisYear = now.getFullYear();
      // Build placeholder headers: last 5 years (as BE year end date 31/12)
      const placeholderYears = Array.from({ length: 5 }, (_, i) => {
        const ad = thisYear - (4 - i);
        return `31/12/${ad + 543}`;
      });

      const placeholderRows = [
        "สินทรัพย์รวม",
        "หนี้สินรวม",
        "ส่วนของผู้ถือหุ้น",
        "มูลค่าหุ้นที่เรียกชำระแล้ว",
        "รายได้รวม",
        "กำไรสุทธิ",
        "กำไรต่อหุ้น (บาท)",
      ];

      const placeholderRatios = ["ROA(%)", "ROE(%)", "อัตรากำไรสุทธิ(%)"];

      return (
        <div
          ref={ref}
          className={`bg-white rounded-lg shadow-md p-6 overflow-x-auto transform transition-all duration-700 hover:shadow-xl ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2
            className={`text-2xl font-bold text-gray-800 mb-6 transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4"
            }`}
          >
            ข้อมูลสำคัญทางการเงิน{" "}
            <span className="text-sm font-normal">(หน่วย: ล้านบาท)</span>
          </h2>

          <div className="mb-3 text-sm text-red-600">
            {error || "ไม่พบข้อมูลสำหรับแสดงผล"}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-teal-700 text-white">
                  <th className="border border-gray-300 px-4 py-3 text-left">
                    ปีบัญชี สิ้นสุดวันที่
                  </th>
                  {placeholderYears.map((h, idx) => (
                    <th
                      key={idx}
                      className="border border-gray-300 px-4 py-3 text-center"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-teal-600 text-white">
                  <td
                    className="border border-gray-300 px-4 py-2 font-semibold"
                    colSpan={placeholderYears.length + 1}
                  >
                    บัญชีทางการเงินที่สำคัญ
                  </td>
                </tr>
                {placeholderRows.map((label, rIdx) => (
                  <tr
                    key={rIdx}
                    className={rIdx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      {label}
                    </td>
                    {placeholderYears.map((_, cIdx) => (
                      <td
                        key={cIdx}
                        className="border border-gray-300 px-4 py-2 text-right text-gray-400"
                      >
                        -
                      </td>
                    ))}
                  </tr>
                ))}

                <tr className="bg-teal-600 text-white">
                  <td
                    className="border border-gray-300 px-4 py-2 font-semibold"
                    colSpan={placeholderYears.length + 1}
                  >
                    อัตราส่วนทางการเงินที่สำคัญ
                  </td>
                </tr>
                {placeholderRatios.map((label, rIdx) => (
                  <tr
                    key={rIdx}
                    className={rIdx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="border border-gray-300 px-4 py-2 font-medium">
                      {label}
                    </td>
                    {placeholderYears.map((_, cIdx) => (
                      <td
                        key={cIdx}
                        className="border border-gray-300 px-4 py-2 text-right text-gray-400"
                      >
                        -
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center">
              ข้อมูลจาก SETSMART API • สำหรับการอ้างอิงเท่านั้น
            </p>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`bg-white rounded-lg shadow-md p-6 overflow-x-auto transform transition-all duration-700 hover:shadow-xl ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2
          className={`text-2xl font-bold text-gray-800 mb-6 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
          }`}
        >
          ข้อมูลสำคัญทางการเงิน{" "}
          <span className="text-sm font-normal">(หน่วย: ล้านบาท)</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-teal-700 text-white">
                <th className="border border-gray-300 px-4 py-3 text-left transition-colors duration-300 hover:bg-teal-800">
                  ปีบัญชี สิ้นสุดวันที่
                </th>
                {tableData.headers.map((header, idx) => (
                  <th
                    key={idx}
                    className="border border-gray-300 px-4 py-3 text-center transition-colors duration-300 hover:bg-teal-800"
                    style={{
                      animation: isVisible
                        ? `fadeIn 0.5s ease-out ${idx * 0.1}s forwards`
                        : "none",
                      opacity: isVisible ? 1 : 0,
                    }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="bg-teal-600 text-white transition-colors duration-300 hover:bg-teal-700">
                <td
                  className="border border-gray-300 px-4 py-2 font-semibold"
                  colSpan={tableData.headers.length + 1}
                >
                  บัญชีทางการเงินที่สำคัญ
                </td>
              </tr>
              {tableData.rows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`${
                    rowIdx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } transition-all duration-300 hover:bg-teal-50`}
                  style={{
                    animation: isVisible
                      ? `slideInLeft 0.5s ease-out ${rowIdx * 0.05}s forwards`
                      : "none",
                    opacity: isVisible ? 1 : 0,
                  }}
                >
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    {row.label}
                  </td>
                  {row.values.map((value, valIdx) => (
                    <td
                      key={valIdx}
                      className="border border-gray-300 px-4 py-2 text-right transition-all duration-200 hover:bg-teal-100"
                    >
                      {value.toLocaleString("th-TH", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-teal-600 text-white transition-colors duration-300 hover:bg-teal-700">
                <td
                  className="border border-gray-300 px-4 py-2 font-semibold"
                  colSpan={tableData.headers.length + 1}
                >
                  อัตราส่วนทางการเงินที่สำคัญ
                </td>
              </tr>
              {tableData.ratios.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={`${
                    rowIdx % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } transition-all duration-300 hover:bg-teal-50`}
                  style={{
                    animation: isVisible
                      ? `slideInLeft 0.5s ease-out ${
                          (rowIdx + tableData.rows.length) * 0.05
                        }s forwards`
                      : "none",
                    opacity: isVisible ? 1 : 0,
                  }}
                >
                  <td className="border border-gray-300 px-4 py-2 font-medium">
                    {row.label}
                  </td>
                  {row.values.map((value, valIdx) => (
                    <td
                      key={valIdx}
                      className="border border-gray-300 px-4 py-2 text-right transition-all duration-200 hover:bg-teal-100"
                    >
                      {value.toFixed(2)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            ข้อมูลจาก SETSMART API • สำหรับการอ้างอิงเท่านั้น
          </p>
        </div>
      </div>
    );
  }
);

// Satisfy eslint react/display-name for memoized component
FinancialTable.displayName = "FinancialTable";

// Market Overview Component - Using SETSMART API for multiple stocks
const MarketOverview: React.FC = () => {
  const [marketData, setMarketData] = useState<SetSmartPriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, isVisible } = useScrollAnimation();

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoading(true);

        // Popular Thai stocks to display (reduced to 5 to avoid rate limit)
        const symbols = ["TPP", "KBANK", "SCB", "AOT", "CPALL"];

        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        const formatDate = (date: Date): string => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        };

        const startDate = formatDate(lastWeek);
        const endDate = formatDate(today);

        // Fetch data for all symbols sequentially to avoid rate limit
        const stocksData: SetSmartPriceData[] = [];

        for (const symbol of symbols) {
          try {
            const res = await fetch(
              `/api/stock?symbol=${symbol}&startDate=${startDate}&endDate=${endDate}`,
              {
                headers: { Accept: "application/json" },
              }
            );

            if (!res.ok) {
              continue;
            }

            const result: any = await res.json();

            // Handle multiple response formats: {value: []}, {data: []}, or direct array []
            let dataArray: SetSmartPriceData[] = [];
            if (Array.isArray(result)) {
              dataArray = result;
            } else if (result?.value && Array.isArray(result.value)) {
              // Format from SETSMART API: {value: [...], Count: number}
              dataArray = result.value;
            } else if (result?.data && Array.isArray(result.data)) {
              dataArray = result.data;
            }

            if (dataArray && Array.isArray(dataArray) && dataArray.length > 0) {
              const latestData = dataArray[dataArray.length - 1];

              // Calculate change and percentChange from close and prior
              const change = latestData.close - latestData.prior;
              const percentChange = (change / latestData.prior) * 100;

              // Map totalValue to value for sorting
              const stockData: SetSmartPriceData = {
                ...latestData,
                value: latestData.totalValue || latestData.value || 0,
                change: change,
                percentChange: percentChange,
                priorClose: latestData.prior,
              };

              stocksData.push(stockData);
            }

            // Add delay between requests to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 1500));
          } catch (err) {
            // Silent catch to continue with next stock
          }
        }

        // Sort by value (descending)
        stocksData.sort((a, b) => b.value - a.value);

        setMarketData(stocksData);
      } catch (err) {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    };

    fetchMarketData();
    const interval = setInterval(fetchMarketData, 300000); // Refresh every 5 min
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`bg-white rounded-lg shadow-md p-6 transform transition-all duration-700 hover:shadow-xl opacity-100 translate-y-0`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          หุ้นมูลค่าซื้อขายสูงสุด ({marketData.length} หุ้น)
        </h3>
        <span className="text-sm text-gray-500">อัพเดตทุก 5 นาที</span>
      </div>

      {marketData.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>ไม่พบข้อมูลหุ้น</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-teal-600">
                <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                  สัญลักษณ์
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                  ราคา
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                  เปลี่ยนแปลง
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                  %
                </th>
                <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                  มูลค่า (ล้าน)
                </th>
              </tr>
            </thead>
            <tbody>
              {marketData.map((stock, idx) => {
                const isPositive = stock.change >= 0;
                return (
                  <tr
                    key={stock.symbol}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 opacity-100"
                    style={{
                      animation: `slideInLeft 0.5s ease-out ${
                        idx * 0.05
                      }s forwards`,
                    }}
                  >
                    <td className="py-3 px-2">
                      <span className="font-semibold text-gray-800">
                        {stock.symbol}
                      </span>
                    </td>
                    <td className="text-right py-3 px-2 font-medium">
                      {stock.close.toFixed(2)}
                    </td>
                    <td
                      className={`text-right py-3 px-2 font-semibold ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {stock.change.toFixed(2)}
                    </td>
                    <td
                      className={`text-right py-3 px-2 font-semibold ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? "+" : ""}
                      {stock.percentChange.toFixed(2)}%
                    </td>
                    <td className="text-right py-3 px-2 text-gray-700">
                      {stock.value >= 1000000
                        ? (stock.value / 1000000).toFixed(2)
                        : (stock.value / 1000).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          ข้อมูลจาก SETSMART API • สำหรับการอ้างอิงเท่านั้น
        </p>
      </div>
    </div>
  );
};

// Download Section Component
interface DownloadItem {
  title: string;
  filename: string;
}

const DownloadSection: React.FC<{ title: string; items: DownloadItem[] }> = ({
  title,
  items,
}) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <div
      ref={ref}
      className={`bg-white rounded-lg shadow-md p-6 transform transition-all duration-700 hover:shadow-xl ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div
        className={`flex items-center justify-between mb-4 pb-3 border-b-2 border-teal-600 transition-all duration-500 ${
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
      >
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <span className="text-sm bg-teal-600 text-white px-3 py-1 rounded animate-pulse-slow">
          ดาวน์โหลด
        </span>
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between border-b border-gray-200 pb-3 transition-all duration-300 hover:bg-gray-50 hover:px-2 hover:py-2 hover:rounded-lg group"
            style={{
              animation: isVisible
                ? `slideInRight 0.5s ease-out ${idx * 0.1}s forwards`
                : "none",
              opacity: isVisible ? 1 : 0,
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-300 group-hover:bg-teal-100 group-hover:scale-110">
                <Download className="w-4 h-4 text-gray-600 transition-colors duration-300 group-hover:text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-800 transition-colors duration-300 group-hover:text-teal-700">
                  {item.title}
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
              <Download className="w-4 h-4 transition-transform duration-300 group-hover:animate-bounce" />
              ดาวน์โหลด
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Page Component
export default function InvestorFinancials() {
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [stockSymbol, setStockSymbol] = useState("TPP");

  useEffect(() => {
    setIsHeroVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 mt-5">
      {/* Web Section - Placeholder for image */}
      <div
        className="relative w-full overflow-hidden h-[55svh]"
        style={{
          backgroundImage: "url(/images/financials/financials_1.png)",
        }}
      >
        {/* Linear gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(90deg,rgba(237, 66, 9, 0.69) 0%, rgba(184, 28, 46, 0.61) 50%, rgba(227, 20, 20, 0) 75%)",
          }}
        />

        <div className="absolute inset-0 flex items-start justify-start py-5">
          <div className="mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8">
            {/* ระยะห่างจากด้านบน */}
            <div
              className={`pt-8 sm:pt-12 lg:pt-20 xl:pt-24 ${
                isHeroVisible ? "mounted" : ""
              }`}
            >
              <h2 className="my-heading sm:text-[24px] md:text-[28px] lg:text-5xl font-extrabold leading-[1.2] tracking-tight text-black relative inline-block">
                <span className="relative z-10">ข้อมูลทางการเงิน</span>
                {/* Underline animation */}
                <span
                  className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-orange-400 to-red-600 rounded-full"
                  style={{
                    width: isHeroVisible ? "100%" : "0",
                    transition: "width 1s ease-out 0.5s",
                  }}
                />
              </h2>

              <p
                className="mt-3 sm:mt-4 max-w-[760px] text-sm sm:text-base md:text-lg leading-relaxed text-black"
                style={{
                  opacity: isHeroVisible ? 1 : 0,
                  transform: isHeroVisible
                    ? "translateY(0)"
                    : "translateY(20px)",
                  transition: "all 0.8s ease-out 0.8s",
                }}
              >
                ทีพีพี
                ตระหนักถึงความสำคัญของการเปิดเผยข้อมูลสารสนเทศที่สำคัญของบริษัทฯ
                ให้มีความถูกต้อง ครบถ้วน เป็นปัจจุบัน โปร่งใส ตรวจสอบได้
                ในระยะเวลาเหมาะสม และเป็นประโยชน์เพื่อการตัดสินใจในการลงทุน
                การบริหารงาน และตัดสินใจดำเนินการใดๆ
                สำหรับผู้มีส่วนได้เสียทุกฝ่าย
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        {/* Real-time Stock Data Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-3xl font-bold text-gray-800">
              ราคาหุ้นแบบเรียลไทม์
            </h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">สัญลักษณ์หุ้น:</label>
              <input
                type="text"
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-semibold uppercase"
                placeholder="TPP"
                maxLength={10}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StockMarketWidget symbol={stockSymbol} />
            <MarketOverview />
          </div>
        </div>

        {/* Charts Section: stack each chart on its own row for better readability */}
        <div className="grid grid-cols-1 gap-6">
          <DynamicFinancialChart
            title="รายได้จากการขาย"
            unit="(หน่วย: ล้านบาท)"
            symbol={stockSymbol}
            dataField="totalRevenueAccum"
            color="#4A9B8E"
            divideBy={1000}
          />

          <DynamicFinancialChart
            title="กำไรสุทธิ"
            unit="(หน่วย: ล้านบาท)"
            symbol={stockSymbol}
            dataField="netProfitAccum"
            color="#7EC4A8"
            divideBy={1000}
          />

          <DynamicFinancialChart
            title="สินทรัพย์รวม"
            unit="(หน่วย: ล้านบาท)"
            symbol={stockSymbol}
            dataField="totalAssets"
            color="#A8D5A8"
            divideBy={1000}
          />
        </div>

        {/* Financial Table */}
        <FinancialTable symbol={stockSymbol} />

        {/* Download Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DownloadSection
            title="งบการเงิน"
            items={[
              {
                title: "งบการเงิน ไตรมาสที่ 2/2568 (สอบทานแล้ว)",
                filename: "financial-q2-2568.pdf",
              },
              {
                title: "งบการเงิน ไตรมาสที่ 1/2568 (สอบทานแล้ว)",
                filename: "financial-q1-2568.pdf",
              },
            ]}
          />

          <DownloadSection
            title="คำอธิบายและวิเคราะห์ของฝ่ายจัดการ"
            items={[
              {
                title:
                  "คำอธิบายและวิเคราะห์ของฝ่ายจัดการ ไตรมาสที่ 2 สิ้นสุดวันที่ 30 มิ.ย. 2568",
                filename: "mda-q2-2568.pdf",
              },
              {
                title:
                  "คำอธิบายและวิเคราะห์ของฝ่ายจัดการ ไตรมาสที่ 1 สิ้นสุดวันที่ 31 มี.ค. 2568",
                filename: "mda-q1-2568.pdf",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
