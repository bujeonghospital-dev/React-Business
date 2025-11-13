// src/app/google-ads-dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  MousePointer,
  Eye,
  DollarSign,
  TrendingUp,
  RefreshCw,
  BarChart3,
} from "lucide-react";
import MetricCard from "@/components/GoogleAds/MetricCard";
import CampaignTable from "@/components/GoogleAds/CampaignTable";
import DateRangePicker from "@/components/GoogleAds/DateRangePicker";
import PerformanceChart from "@/components/GoogleAds/PerformanceChart";
import { GoogleAdsApiResponse, DateRangeFilter } from "@/types/google-ads";
import { motion } from "framer-motion";

export default function GoogleAdsDashboard() {
  const [data, setData] = useState<GoogleAdsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeFilter>({
    startDate: "2025-01-01",
    endDate: "2025-04-04",
  });

  const fetchData = async (start: string, end: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/google-ads?startDate=${start}&endDate=${end}`
      );

      const result = await response.json();

      if (!response.ok) {
        // แสดงข้อความ error จาก API อย่างละเอียด
        if (result.error) {
          const errorDetails = [
            `❌ ${result.error}`,
            result.message || "",
            result.missing ? `\nขาด: ${result.missing.join(", ")}` : "",
            result.instructions ? "\n\nวิธีแก้ไข:" : "",
            result.instructions
              ? Object.entries(result.instructions)
                  .map(([key, value]) => `  ${key}: ${value}`)
                  .join("\n")
              : "",
          ]
            .filter(Boolean)
            .join("\n");

          setError(errorDetails);
          console.error("❌ API Error:", result);
          return;
        }
        throw new Error(result.message || "Failed to fetch data");
      }

      setData(result);
      setLastUpdated(new Date());
      console.log(
        "✅ Data updated successfully",
        new Date().toLocaleTimeString("th-TH")
      );
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "An error occurred";
      setError(errorMsg);
      console.error("❌ Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(dateRange.startDate, dateRange.endDate);

    // Auto refresh ทุก 5 นาที (300000 ms)
    const interval = setInterval(() => {
      fetchData(dateRange.startDate, dateRange.endDate);
    }, 300000);

    return () => clearInterval(interval);
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDateChange = (newDateRange: DateRangeFilter) => {
    setDateRange(newDateRange);
    // fetchData จะถูกเรียกโดย useEffect อัตโนมัติ
  };

  const handleRefresh = () => {
    console.log("🔄 Refreshing data...", {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
    fetchData(dateRange.startDate, dateRange.endDate);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <RefreshCw className="w-12 h-12 text-blue-600" />
          </motion.div>
          <p className="mt-4 text-gray-600 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-red-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  ไม่สามารถโหลดข้อมูลได้
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  กรุณาตรวจสอบการตั้งค่า
                </p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <pre className="text-sm text-red-800 whitespace-pre-wrap font-mono">
                {error}
              </pre>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleRefresh}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                ลองอีกครั้ง
              </button>
              <a
                href="/GOOGLE_ADS_DASHBOARD_SETUP.md"
                target="_blank"
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                ดูคู่มือการตั้งค่า
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white shadow-2xl">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <BarChart3 className="w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold">Google Ads Dashboard</h1>
                    <p className="text-blue-100 mt-1">
                      ภาพรวมการทำงานของแคมเปญโฆษณา
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/20"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  />
                  <span className="font-semibold">รีเฟรช</span>
                </button>
                {lastUpdated && (
                  <p className="text-xs text-blue-200">
                    อัปเดตล่าสุด:{" "}
                    {lastUpdated.toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Loading Indicator */}
        {loading && (
          <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-center">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin mr-3" />
              <p className="text-blue-700 font-medium">กำลังอัปเดตข้อมูล...</p>
            </div>
          </div>
        )}

        {/* Date Range Picker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <DateRangePicker
            onDateChange={handleDateChange}
            initialStartDate={dateRange.startDate}
            initialEndDate={dateRange.endDate}
          />
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="คลิก"
            value={formatNumber(data.summary.totalClicks)}
            icon={MousePointer}
            color="blue"
            index={0}
            trend={{ value: 12.5, isPositive: true }}
          />
          <MetricCard
            title="การแสดงผล"
            value={formatNumber(data.summary.totalImpressions)}
            icon={Eye}
            color="green"
            index={1}
            trend={{ value: 8.3, isPositive: true }}
          />
          <MetricCard
            title="CPC เฉลี่ย"
            value={formatCurrency(data.summary.averageCpc)}
            icon={TrendingUp}
            color="purple"
            index={2}
            trend={{ value: 5.2, isPositive: false }}
          />
          <MetricCard
            title="ค่าใช้จ่าย"
            value={formatCurrency(data.summary.totalCost)}
            icon={DollarSign}
            color="orange"
            index={3}
            trend={{ value: 15.7, isPositive: true }}
          />
        </div>

        {/* Campaign Table */}
        <CampaignTable campaigns={data.campaigns} />

        {/* Performance Chart */}
        <div className="mt-8">
          <PerformanceChart campaigns={data.campaigns} />
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            📊 ข้อมูลการเชื่อมต่อ
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">ช่วงเวลา:</p>
              <p className="font-semibold text-gray-900">
                {new Date(data.dateRange.startDate).toLocaleDateString(
                  "th-TH",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}{" "}
                -{" "}
                {new Date(data.dateRange.endDate).toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">จำนวนแคมเปญ:</p>
              <p className="font-semibold text-gray-900">
                {data.campaigns.length} แคมเปญ
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">CTR เฉลี่ย:</p>
              <p className="font-semibold text-gray-900">
                {data.summary.averageCtr.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">สถานะ:</p>
              <p className="font-semibold text-green-600 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                เชื่อมต่อสำเร็จ
              </p>
            </div>
          </div>
        </motion.div>

        {/* Setup Guide */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8 bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            🔧 คำแนะนำในการตั้งค่า Google Ads API
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                1
              </span>
              <div>
                <p className="font-semibold mb-1">
                  ติดตั้ง Google Ads API Library
                </p>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  npm install google-ads-api
                </code>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                2
              </span>
              <div>
                <p className="font-semibold mb-1">
                  ตั้งค่า Environment Variables ใน{" "}
                  <code className="bg-gray-100 px-1 rounded">.env.local</code>
                </p>
                <pre className="bg-gray-900 text-gray-100 px-3 py-2 rounded mt-2 text-xs overflow-x-auto">
                  {`GOOGLE_ADS_CLIENT_ID=xxx
GOOGLE_ADS_CLIENT_SECRET=xxx
GOOGLE_ADS_DEVELOPER_TOKEN=xxx
GOOGLE_ADS_REFRESH_TOKEN=xxx
GOOGLE_ADS_CUSTOMER_ID=xxx`}
                </pre>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                3
              </span>
              <div>
                <p className="font-semibold mb-1">
                  เปิดใช้งานโค้ดจริงใน API Route
                </p>
                <p className="text-gray-600">
                  ดูตัวอย่างโค้ดได้ที่{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    src/app/api/google-ads/route.ts
                  </code>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
