// src/app/facebook-ads-dashboard/page.tsx
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
import { motion } from "framer-motion";

interface FacebookAdsCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  impressions: number;
  clicks: number;
  spend: number;
  cpm: number;
  cpc: number;
  ctr: number;
  conversions: number;
  costPerConversion: number;
}

interface FacebookAdsResponse {
  campaigns: FacebookAdsCampaign[];
  summary: {
    totalImpressions: number;
    totalClicks: number;
    totalSpend: number;
    averageCpm: number;
    averageCpc: number;
    averageCtr: number;
    totalConversions: number;
  };
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

interface DateRangeFilter {
  startDate: string;
  endDate: string;
}

export default function FacebookAdsDashboard() {
  const [data, setData] = useState<FacebookAdsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dateRange, setDateRange] = useState<DateRangeFilter>({
    startDate: "2024-01-01",
    endDate: "2024-12-04",
  });

  const fetchData = async (start: string, end: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/facebook-ads-simple?startDate=${start}&endDate=${end}`
      );

      const result = await response.json();

      if (!response.ok) {
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

    // Auto refresh ทุก 5 นาที
    const interval = setInterval(() => {
      fetchData(dateRange.startDate, dateRange.endDate);
    }, 300000);

    return () => clearInterval(interval);
  }, [dateRange.startDate, dateRange.endDate]);

  const handleDateChange = (newDateRange: DateRangeFilter) => {
    setDateRange(newDateRange);
  };

  const handleRefresh = () => {
    console.log("🔄 Refreshing data...", {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    });
    fetchData(dateRange.startDate, dateRange.endDate);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("th-TH").format(Math.round(num));
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(num);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
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
                href="/FACEBOOK_ADS_SETUP.md"
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

  // แปลง Facebook campaigns เป็นรูปแบบที่ CampaignTable ต้องการ
  const campaignsForTable = data.campaigns.map((c) => ({
    id: c.id,
    name: c.name,
    clicks: c.clicks,
    impressions: c.impressions,
    averageCpc: c.cpc,
    cost: c.spend,
    ctr: c.ctr,
    conversions: c.conversions,
  }));

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
                    <h1 className="text-4xl font-bold">
                      Facebook Ads Dashboard
                    </h1>
                    <p className="text-blue-100 mt-1">
                      ภาพรวมการทำงานของแคมเปญโฆษณา Facebook
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleRefresh}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  />
                  <span className="font-medium">รีเฟรช</span>
                </button>
                {lastUpdated && (
                  <p className="text-sm text-blue-100">
                    อัปเดตล่าสุด:{" "}
                    {lastUpdated.toLocaleString("th-TH", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
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
            title="ค่าใช้จ่าย"
            value={formatCurrency(data.summary.totalSpend)}
            icon={DollarSign}
            color="purple"
            index={2}
            trend={{ value: 15.2, isPositive: false }}
          />
          <MetricCard
            title="Conversions"
            value={formatNumber(data.summary.totalConversions)}
            icon={TrendingUp}
            color="orange"
            index={3}
            trend={{ value: 23.4, isPositive: true }}
          />
        </div>

        {/* Campaign Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-8"
        >
          <CampaignTable campaigns={campaignsForTable} />
        </motion.div>

        {/* Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <PerformanceChart campaigns={campaignsForTable} />
        </motion.div>
      </div>
    </div>
  );
}
