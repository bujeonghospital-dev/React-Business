"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Calendar,
  Clock,
  Download,
  RefreshCw,
} from "lucide-react";

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
  open?: number;
  ceiling?: number;
  floor?: number;
}

interface ApiResponse {
  data?: StockData[];
  error?: string;
}

// Historical Price Data Type (mock data)
interface HistoricalPrice {
  date: string;
  price: number;
  high: number;
  low: number;
  volume: number;
}

// Add animations
if (typeof window !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
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
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes scaleIn {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes pulse-glow {
      0%, 100% {
        box-shadow: 0 0 20px rgba(20, 184, 166, 0.4);
      }
      50% {
        box-shadow: 0 0 30px rgba(20, 184, 166, 0.6);
      }
    }
  `;
  document.head.appendChild(style);
}

// Intersection Observer Hook
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

// Real-time Stock Price Card
const StockPriceCard: React.FC<{ symbol?: string }> = ({ symbol = "TVO" }) => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const { ref, isVisible } = useScrollAnimation();

  const fetchStockData = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://marketplace.set.or.th/api/public/realtime-data/stock",
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data: ApiResponse = await response.json();

      if (data.data && Array.isArray(data.data)) {
        const stock = data.data.find(
          (s) => s.symbol.toUpperCase() === symbol.toUpperCase()
        );
        if (stock) {
          setStockData(stock);
          setLastUpdate(new Date());
        } else {
          setError(`ไม่พบข้อมูลหุ้น ${symbol}`);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูล"
      );
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchStockData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchStockData, 30000);
    return () => clearInterval(interval);
  }, [fetchStockData]);

  if (loading && !stockData) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="h-16 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !stockData) {
    return (
      <div
        ref={ref}
        className={`bg-white rounded-2xl shadow-xl p-8 border-l-8 border-yellow-500 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="text-yellow-500 text-4xl">⚠️</div>
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              ข้อมูลหุ้น {symbol}
            </h3>
            <p className="text-gray-600">{error || "กำลังโหลดข้อมูล..."}</p>
          </div>
        </div>
      </div>
    );
  }

  const isPositive = stockData.change >= 0;
  const isOpen = stockData.marketStatus === "OPEN";

  return (
    <div
      ref={ref}
      className={`bg-gradient-to-br from-white via-teal-50/30 to-white rounded-2xl shadow-2xl p-8 border-l-8 transform transition-all duration-700 hover:shadow-3xl hover:-translate-y-1 ${
        isPositive ? "border-green-500" : "border-red-500"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      style={{
        animation: isVisible ? "scaleIn 0.8s ease-out" : "none",
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-4xl font-extrabold text-gray-900">
              {stockData.symbol}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 ${
                isOpen
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  isOpen ? "bg-green-500 animate-pulse" : "bg-gray-500"
                }`}
              />
              {isOpen ? "เปิดซื้อขาย" : "ปิดตลาด"}
            </span>
          </div>
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            อัพเดทล่าสุด:{" "}
            {lastUpdate.toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </div>
        <button
          onClick={fetchStockData}
          disabled={loading}
          className="p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          title="รีเฟรชข้อมูล"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Main Price Display */}
      <div className="mb-8 pb-8 border-b-2 border-gray-200">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-2">ราคาล่าสุด</p>
            <div className="text-6xl font-bold text-gray-900 mb-3">
              {stockData.last.toFixed(2)}
              <span className="text-2xl text-gray-600 ml-2">บาท</span>
            </div>
            <div
              className={`flex items-center gap-2 text-2xl font-bold ${
                isPositive ? "text-green-600" : "text-red-600"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-7 h-7 animate-bounce" />
              ) : (
                <TrendingDown className="w-7 h-7 animate-bounce" />
              )}
              <span>
                {isPositive ? "+" : ""}
                {stockData.change.toFixed(2)}
              </span>
              <span className="text-xl">
                ({isPositive ? "+" : ""}
                {stockData.percentChange.toFixed(2)}%)
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">ราคาปิดก่อนหน้า</p>
            <p className="text-3xl font-semibold text-gray-700">
              {stockData.prior.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Price Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-white p-5 rounded-xl border border-green-200 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-gray-600">สูงสุด</p>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {stockData.high.toFixed(2)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-white p-5 rounded-xl border border-red-200 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <p className="text-sm font-medium text-gray-600">ต่ำสุด</p>
          </div>
          <p className="text-2xl font-bold text-red-700">
            {stockData.low.toFixed(2)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl border border-blue-200 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <p className="text-sm font-medium text-gray-600">ปริมาณ</p>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {(stockData.volume / 1000000).toFixed(2)}
            <span className="text-sm ml-1">ล้านหุ้น</span>
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white p-5 rounded-xl border border-purple-200 hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <p className="text-sm font-medium text-gray-600">มูลค่า</p>
          </div>
          <p className="text-2xl font-bold text-purple-700">
            {(stockData.value / 1000000).toFixed(2)}
            <span className="text-sm ml-1">ล้านบาท</span>
          </p>
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          ข้อมูลจาก SET Market Data API • อัพเดททุก 30 วินาที •
          สำหรับการอ้างอิงเท่านั้น
        </p>
      </div>
    </div>
  );
};

// Historical Price Chart Component (Mock data for demo)
const PriceHistoryChart: React.FC<{ symbol: string }> = ({ symbol }) => {
  const { ref, isVisible } = useScrollAnimation();
  const [period, setPeriod] = useState<"1M" | "3M" | "6M" | "1Y">("3M");

  // Mock historical data
  const generateMockData = (months: number): HistoricalPrice[] => {
    const data: HistoricalPrice[] = [];
    const today = new Date();
    let basePrice = 25.0;

    for (let i = months * 20; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Random walk
      const change = (Math.random() - 0.5) * 2;
      basePrice = Math.max(20, Math.min(35, basePrice + change));

      const high = basePrice + Math.random() * 1.5;
      const low = basePrice - Math.random() * 1.5;
      const volume = Math.random() * 50000000 + 10000000;

      data.push({
        date: date.toLocaleDateString("th-TH", {
          day: "2-digit",
          month: "short",
        }),
        price: parseFloat(basePrice.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        volume,
      });
    }

    return data;
  };

  const getMonths = () => {
    switch (period) {
      case "1M":
        return 1;
      case "3M":
        return 3;
      case "6M":
        return 6;
      case "1Y":
        return 12;
    }
  };

  const historicalData = generateMockData(getMonths());
  const maxPrice = Math.max(...historicalData.map((d) => d.high));
  const minPrice = Math.min(...historicalData.map((d) => d.low));
  const priceRange = maxPrice - minPrice;

  // Calculate trend
  const firstPrice = historicalData[0]?.price || 0;
  const lastPrice = historicalData[historicalData.length - 1]?.price || 0;
  const trendChange = lastPrice - firstPrice;
  const trendPercent = (trendChange / firstPrice) * 100;
  const isPositiveTrend = trendChange >= 0;

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl shadow-xl p-8 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        animation: isVisible ? "scaleIn 0.8s ease-out 0.2s backwards" : "none",
      }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            ประวัติราคาหลักทรัพย์ {symbol}
          </h3>
          <div
            className={`flex items-center gap-2 text-lg font-semibold ${
              isPositiveTrend ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositiveTrend ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            <span>
              {isPositiveTrend ? "+" : ""}
              {trendChange.toFixed(2)} ({isPositiveTrend ? "+" : ""}
              {trendPercent.toFixed(2)}%)
            </span>
            <span className="text-sm text-gray-500">ใน {period}</span>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          {(["1M", "3M", "6M", "1Y"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-300 ${
                period === p
                  ? "bg-teal-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-80 bg-gradient-to-b from-teal-50/50 to-white rounded-xl p-6 border border-gray-200">
        {/* Y-axis labels */}
        <div className="absolute left-2 top-6 bottom-6 flex flex-col justify-between text-xs text-gray-500">
          <span>{maxPrice.toFixed(2)}</span>
          <span>{((maxPrice + minPrice) / 2).toFixed(2)}</span>
          <span>{minPrice.toFixed(2)}</span>
        </div>

        {/* Chart area */}
        <div className="ml-12 h-full flex items-end justify-between gap-1">
          {historicalData.map((item, index) => {
            const heightPercent =
              ((item.price - minPrice) / priceRange) * 100 || 0;
            const highHeightPercent =
              ((item.high - minPrice) / priceRange) * 100 || 0;
            const lowHeightPercent =
              ((item.low - minPrice) / priceRange) * 100 || 0;

            return (
              <div
                key={index}
                className="flex-1 h-full flex flex-col justify-end items-center group relative"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg p-3 z-10 whitespace-nowrap shadow-xl">
                  <div className="font-semibold mb-1">{item.date}</div>
                  <div>ราคา: {item.price.toFixed(2)}</div>
                  <div className="text-green-400">
                    สูง: {item.high.toFixed(2)}
                  </div>
                  <div className="text-red-400">ต่ำ: {item.low.toFixed(2)}</div>
                  <div className="text-blue-400">
                    ปริมาณ: {(item.volume / 1000000).toFixed(2)}M
                  </div>
                </div>

                {/* High-Low Line */}
                <div
                  className="w-0.5 bg-gray-300 group-hover:bg-teal-400 transition-colors duration-200"
                  style={{ height: `${highHeightPercent - lowHeightPercent}%` }}
                />

                {/* Price Bar */}
                <div
                  className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-sm hover:from-teal-700 hover:to-teal-500 transition-all duration-300 group-hover:shadow-lg"
                  style={{
                    height: `${heightPercent}%`,
                    minHeight: "2px",
                    animation: isVisible
                      ? `slideUp 0.8s ease-out ${index * 0.01}s backwards`
                      : "none",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="ml-12 mt-2 flex justify-between text-xs text-gray-500">
          <span>{historicalData[0]?.date}</span>
          <span>
            {historicalData[Math.floor(historicalData.length / 2)]?.date}
          </span>
          <span>{historicalData[historicalData.length - 1]?.date}</span>
        </div>
      </div>

      {/* Chart Legend */}
      <div className="mt-6 flex flex-wrap gap-6 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-t from-teal-600 to-teal-400 rounded"></div>
          <span className="text-gray-700">ราคาปิด</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-gray-300"></div>
          <span className="text-gray-700">ช่วงราคา (สูง-ต่ำ)</span>
        </div>
      </div>
    </div>
  );
};

// Key Statistics Component
const KeyStatistics: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation();

  const stats = [
    {
      label: "มูลค่าตลาด",
      value: "22,365.00",
      unit: "ล้านบาท",
      icon: BarChart3,
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
    },
    {
      label: "P/E Ratio",
      value: "9.47",
      unit: "เท่า",
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
    },
    {
      label: "Dividend Yield",
      value: "5.32",
      unit: "%",
      icon: Activity,
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
    },
    {
      label: "EPS (TTM)",
      value: "2.51",
      unit: "บาท",
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600",
      bgColor: "from-orange-50 to-orange-100",
    },
  ];

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-6">
        สถิติสำคัญ (ข้อมูลปี 2025)
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-br ${stat.bgColor} rounded-xl p-6 border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}
              style={{
                animation: isVisible
                  ? `slideUp 0.6s ease-out ${index * 0.1}s backwards`
                  : "none",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 bg-gradient-to-br ${stat.color} rounded-lg shadow-md`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>

              <p className="text-sm font-medium text-gray-700 mb-2">
                {stat.label}
              </p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600 mb-1">{stat.unit}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Download Reports Section
const DownloadReports: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation();

  const reports = [
    {
      title: "รายงานราคาหลักทรัพย์ รายเดือน",
      period: "มกราคม - ธันวาคม 2568",
      size: "2.4 MB",
      type: "PDF",
    },
    {
      title: "วิเคราะห์แนวโน้มราคาหุ้น",
      period: "ไตรมาส 1/2568",
      size: "1.8 MB",
      type: "PDF",
    },
    {
      title: "ข้อมูลการซื้อขายย้อนหลัง",
      period: "ปี 2567 - 2568",
      size: "5.2 MB",
      type: "Excel",
    },
  ];

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl shadow-xl p-8 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{
        animation: isVisible ? "scaleIn 0.8s ease-out 0.4s backwards" : "none",
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-teal-600 rounded-lg">
          <Download className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900">
          ดาวน์โหลดรายงานราคาหลักทรัพย์
        </h3>
      </div>

      <div className="space-y-4">
        {reports.map((report, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-teal-300 transition-all duration-300 group"
            style={{
              animation: isVisible
                ? `slideInLeft 0.6s ease-out ${index * 0.1}s backwards`
                : "none",
            }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg group-hover:bg-teal-100 transition-colors duration-300">
                <span className="text-xs font-bold text-gray-600 group-hover:text-teal-700">
                  {report.type}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {report.title}
                </h4>
                <p className="text-sm text-gray-600">
                  {report.period} • {report.size}
                </p>
              </div>
            </div>
            <button className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg">
              <Download className="w-4 h-4" />
              <span className="font-semibold">ดาวน์โหลด</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Page Component
export default function InvestorStockPrice() {
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [stockSymbol, setStockSymbol] = useState("TVO");

  useEffect(() => {
    setIsHeroVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative h-96 bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 flex items-center justify-center overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 10px,
                  rgba(255,255,255,0.1) 10px,
                  rgba(255,255,255,0.1) 20px
                )`,
              }}
            />
          </div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000" />
        </div>

        {/* Content */}
        <div
          className={`relative z-10 text-center max-w-4xl px-6 transform transition-all duration-1000 ${
            isHeroVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-12"
          }`}
        >
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
            <Activity className="w-5 h-5 text-white animate-pulse" />
            <span className="text-white font-semibold">
              ข้อมูลเรียลไทม์จาก SET
            </span>
          </div>

          <h1
            className={`text-5xl md:text-6xl font-extrabold text-white mb-6 transition-all duration-1000 delay-200 ${
              isHeroVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            style={{
              textShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            ข้อมูลราคาหลักทรัพย์
          </h1>

          <p
            className={`text-xl text-teal-50 leading-relaxed max-w-3xl mx-auto transition-all duration-1000 delay-300 ${
              isHeroVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            ติดตามราคาหุ้นแบบเรียลไทม์ พร้อมวิเคราะห์แนวโน้มและสถิติที่สำคัญ
            สำหรับการตัดสินใจลงทุนของคุณ
          </p>

          {/* Stock Symbol Search */}
          <div
            className={`mt-8 flex items-center justify-center gap-3 transition-all duration-1000 delay-400 ${
              isHeroVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div className="bg-white rounded-lg shadow-xl p-1 flex items-center gap-2">
              <input
                type="text"
                value={stockSymbol}
                onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
                className="px-6 py-3 text-lg font-bold text-gray-800 uppercase focus:outline-none rounded-l"
                placeholder="TVO"
                maxLength={10}
              />
              <button className="px-6 py-3 bg-teal-600 text-white rounded-r hover:bg-teal-700 transition-all duration-300 font-semibold">
                ค้นหา
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
        {/* Real-time Stock Price */}
        <section>
          <StockPriceCard symbol={stockSymbol} />
        </section>

        {/* Price History Chart */}
        <section>
          <PriceHistoryChart symbol={stockSymbol} />
        </section>

        {/* Key Statistics */}
        <section>
          <KeyStatistics />
        </section>

        {/* Download Reports */}
        <section>
          <DownloadReports />
        </section>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600 text-2xl">⚠️</div>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-2">
                ข้อจำกัดความรับผิดชอบ
              </h4>
              <p className="text-sm text-yellow-800 leading-relaxed">
                ข้อมูลราคาหลักทรัพย์ที่แสดงเป็นเพียงข้อมูลอ้างอิงเท่านั้น
                และอาจมีความล่าช้าจากราคาจริง
                กรุณาตรวจสอบข้อมูลอย่างเป็นทางการจากตลาดหลักทรัพย์แห่งประเทศไทย
                (SET) ก่อนการตัดสินใจลงทุน
                บริษัทฯไม่รับผิดชอบต่อความเสียหายใดๆที่เกิดจากการใช้ข้อมูลนี้
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
