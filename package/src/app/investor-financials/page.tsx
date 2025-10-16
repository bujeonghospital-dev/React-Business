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

// Stock Market Widget Component
const StockMarketWidget: React.FC<{ symbol?: string }> = ({
  symbol = "TVO",
}) => {
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { ref, isVisible } = useScrollAnimation();

  useEffect(() => {
    const fetchStockData = async () => {
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

        // Find the specific stock symbol
        if (data.data && Array.isArray(data.data)) {
          const stock = data.data.find(
            (s) => s.symbol.toUpperCase() === symbol.toUpperCase()
          );
          if (stock) {
            setStockData(stock);
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
    };

    fetchStockData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStockData, 300000);
    return () => clearInterval(interval);
  }, [symbol]);

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
      </div>
    );
  }

  const isPositive = stockData.change >= 0;

  return (
    <div
      ref={ref}
      className={`bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-lg p-6 border-l-4 transform transition-all duration-700 hover:shadow-xl hover:-translate-y-1 ${
        isPositive ? "border-green-500" : "border-red-500"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 mb-1">
            {stockData.symbol}
          </h3>
          <p className="text-sm text-gray-500">
            {stockData.marketStatus === "OPEN"
              ? "🟢 เปิดซื้อขาย"
              : "🔴 ปิดตลาด"}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-800">
            {stockData.last.toFixed(2)}
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

      <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-gray-200">
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
            {(stockData.volume / 1000000).toFixed(2)}M
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">มูลค่า (บาท)</p>
          <p className="text-lg font-semibold text-gray-800">
            {(stockData.value / 1000000).toFixed(2)}M
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          ราคาปิดก่อนหน้า: {stockData.prior.toFixed(2)} บาท
        </p>
      </div>
    </div>
  );
};

// Chart Component with editable data
interface ChartData {
  year: string;
  value: number;
}

interface EditableChartProps {
  title: string;
  unit: string;
  initialData: ChartData[];
  color: string;
}

const EditableChart: React.FC<EditableChartProps> = ({
  title,
  unit,
  initialData,
  color,
}) => {
  const [data, setData] = useState<ChartData[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [isAnimated, setIsAnimated] = useState(false);
  const { ref, isVisible } = useScrollAnimation();

  const maxValue = Math.max(...data.map((d) => d.value));
  const chartHeight = 200;

  useEffect(() => {
    if (isVisible) {
      setTimeout(() => setIsAnimated(true), 100);
    }
  }, [isVisible]);

  const handleDataChange = (
    index: number,
    field: "year" | "value",
    value: string
  ) => {
    const newData = [...data];
    if (field === "year") {
      newData[index].year = value;
    } else {
      newData[index].value = parseFloat(value) || 0;
    }
    setData(newData);
  };

  const addDataPoint = () => {
    setData([...data, { year: "2568", value: 0 }]);
  };

  const removeDataPoint = (index: number) => {
    if (data.length > 1) {
      setData(data.filter((_, i) => i !== index));
    }
  };

  return (
    <div
      ref={ref}
      className={`bg-white rounded-lg shadow-md p-6 transform transition-all duration-700 hover:shadow-xl hover:-translate-y-1 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div className="transform transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-600">{unit}</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
        >
          {isEditing ? "บันทึก" : "แก้ไข"}
        </button>
      </div>

      {/* Chart Display */}
      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <div className="flex items-end justify-around h-full border-b border-gray-300 pb-2">
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (chartHeight - 50);
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
                  {item.year}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Mode */}
      {isEditing && (
        <div className="mt-6 border-t pt-4 animate-fadeIn">
          <h4 className="font-semibold mb-3 text-sm">แก้ไขข้อมูล:</h4>
          {data.map((item, index) => (
            <div
              key={index}
              className="flex gap-2 mb-2 items-center animate-slideInLeft"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <input
                type="text"
                value={item.year}
                onChange={(e) =>
                  handleDataChange(index, "year", e.target.value)
                }
                className="w-20 px-2 py-1 border rounded text-sm transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="ปี"
              />
              <input
                type="number"
                value={item.value}
                onChange={(e) =>
                  handleDataChange(index, "value", e.target.value)
                }
                className="flex-1 px-2 py-1 border rounded text-sm transition-all duration-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="มูลค่า"
                step="0.01"
              />
              <button
                onClick={() => removeDataPoint(index)}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
                disabled={data.length <= 1}
              >
                ลบ
              </button>
            </div>
          ))}
          <button
            onClick={addDataPoint}
            className="mt-2 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            + เพิ่มข้อมูล
          </button>
        </div>
      )}
    </div>
  );
};

// Financial Table Component
const FinancialTable: React.FC = () => {
  const { ref, isVisible } = useScrollAnimation();
  const [tableData, setTableData] = useState({
    headers: [
      "31/12/2563",
      "31/12/2564",
      "31/12/2565",
      "31/12/2566",
      "31/12/2567",
    ],
    rows: [
      {
        label: "สินทรัพย์รวม",
        values: [13908.11, 13342.68, 18417.43, 13076.07, 14897.65],
      },
      {
        label: "หนี้สินรวม",
        values: [4373.39, 3437.7, 7792.16, 2607.88, 3565.25],
      },
      {
        label: "ส่วนของผู้ถือหุ้น",
        values: [9123.07, 9512.47, 10235.99, 10071.36, 10918.3],
      },
      {
        label: "มูลค่าหุ้นที่เรียกชำระแล้ว",
        values: [808.61, 808.61, 889.47, 889.47, 889.47],
      },
      {
        label: "รายได้รวม",
        values: [25046.43, 31575.67, 39243.29, 34310.86, 30758.58],
      },
      {
        label: "กำไรสุทธิ",
        values: [1655.8, 2067.61, 1604.17, 729.56, 2103.11],
      },
      { label: "กำไรต่อหุ้น (บาท)", values: [2.05, 2.56, 1.8, 0.82, 2.36] },
    ],
    ratios: [
      { label: "ROA(%)", values: [16.66, 19.3, 12.84, 6.01, 19.04] },
      { label: "ROE(%)", values: [18.62, 22.19, 16.25, 7.19, 20.04] },
      { label: "อัตรากำไรสุทธิ(%)", values: [6.88, 6.67, 4.16, 2.18, 6.99] },
    ],
  });

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
                colSpan={6}
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
                colSpan={6}
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
    </div>
  );
};

// Market Overview Component - Top stocks from SET
const MarketOverview: React.FC = () => {
  const [marketData, setMarketData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const { ref, isVisible } = useScrollAnimation();

  useEffect(() => {
    const fetchMarketData = async () => {
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
          // Get top 10 stocks by value
          const topStocks = data.data
            .filter((stock) => stock.value > 0)
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
          setMarketData(topStocks);
        }
      } catch (err) {
        console.error("Market data fetch error:", err);
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
      className={`bg-white rounded-lg shadow-md p-6 transform transition-all duration-700 hover:shadow-xl ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          หุ้นมูลค่าซื้อขายสูงสุด
        </h3>
        <span className="text-sm text-gray-500">อัพเดตทุก 5 นาที</span>
      </div>

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
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                  style={{
                    animation: isVisible
                      ? `slideInLeft 0.5s ease-out ${idx * 0.05}s forwards`
                      : "none",
                    opacity: isVisible ? 1 : 0,
                  }}
                >
                  <td className="py-3 px-2">
                    <span className="font-semibold text-gray-800">
                      {stock.symbol}
                    </span>
                  </td>
                  <td className="text-right py-3 px-2 font-medium">
                    {stock.last.toFixed(2)}
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
                    {(stock.value / 1000000).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">
          ข้อมูลจาก SET Market Data API • สำหรับการอ้างอิงเท่านั้น
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
  const [stockSymbol, setStockSymbol] = useState("TVO");

  useEffect(() => {
    setIsHeroVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 mt-5">
      {/* Hero Section - Placeholder for image */}
      <div className="relative h-80 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-700 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-30" />

        {/* Simplified background pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`text-center text-white z-10 max-w-4xl px-4 transform transition-all duration-1000 ${
              isHeroVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h1
              className={`text-4xl md:text-5xl font-bold mb-4 transition-all duration-1000 delay-200 ${
                isHeroVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              }`}
            >
              ข้อมูลทางการเงิน
            </h1>
            <p
              className={`text-lg leading-relaxed transition-all duration-1000 delay-300 ${
                isHeroVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              ทีวีโอ
              ตระหนักถึงความสำคัญของการเปิดเผยข้อมูลสารสนเทศที่สำคัญของบริษัทฯ
              ให้มีความถูกต้อง ครบถ้วน เป็นปัจจุบัน โปร่งใส ตรวจสอบได้
              ในระยะเวลาเหมาะสม และเป็นประโยชน์เพื่อการตัดสินใจในการลงทุน
              การบริหารงาน และตัดสินใจดำเนินการใดๆ สำหรับผู้มีส่วนได้เสียทุกฝ่าย
            </p>
          </div>
        </div>
        {/* Image placeholder indicator */}
        <div
          className={`absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded text-sm font-semibold transition-all duration-700 ${
            isHeroVisible
              ? "opacity-100 translate-x-0"
              : "opacity-0 translate-x-4"
          }`}
        >
          รอใส่รูปภาพ Hero Image
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
                placeholder="TVO"
                maxLength={10}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <StockMarketWidget symbol={stockSymbol} />
            <MarketOverview />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EditableChart
            title="รายได้จากการขาย"
            unit="(หน่วย: ล้านบาท)"
            initialData={[
              { year: "2565", value: 39107.36 },
              { year: "2566", value: 34194.6 },
              { year: "2567", value: 30596.3 },
            ]}
            color="#4A9B8E"
          />

          <EditableChart
            title="กำไรสุทธิ"
            unit="(หน่วย: ล้านบาท)"
            initialData={[
              { year: "2565", value: 1604.17 },
              { year: "2566", value: 729.56 },
              { year: "2567", value: 2103.11 },
            ]}
            color="#7EC4A8"
          />

          <EditableChart
            title="สินทรัพย์รวม"
            unit="(หน่วย: ล้านบาท)"
            initialData={[
              { year: "2565", value: 18417.43 },
              { year: "2566", value: 13076.07 },
              { year: "2567", value: 14897.65 },
            ]}
            color="#A8D5A8"
          />
        </div>

        {/* Financial Table */}
        <FinancialTable />

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
