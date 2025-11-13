// src/components/GoogleAds/PerformanceChart.tsx
"use client";

import { GoogleAdsCampaign } from "@/types/google-ads";
import { motion } from "framer-motion";
import { useMemo } from "react";

interface PerformanceChartProps {
  campaigns: GoogleAdsCampaign[];
}

export default function PerformanceChart({ campaigns }: PerformanceChartProps) {
  // คำนวณข้อมูลสำหรับกราฟ
  const chartData = useMemo(() => {
    const maxCost = Math.max(...campaigns.map((c) => c.cost));

    return campaigns.map((campaign) => ({
      ...campaign,
      costPercentage: (campaign.cost / maxCost) * 100,
      clicksPercentage:
        (campaign.clicks / Math.max(...campaigns.map((c) => c.clicks))) * 100,
    }));
  }, [campaigns]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white">
          กราฟเปรียบเทียบประสิทธิภาพ
        </h2>
        <p className="text-purple-100 text-sm mt-1">
          เปรียบเทียบค่าใช้จ่ายและคลิกของแต่ละแคมเปญ
        </p>
      </div>

      {/* Chart */}
      <div className="p-6 space-y-6">
        {chartData.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="space-y-2"
          >
            {/* Campaign Name */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
                <span className="text-sm font-semibold text-gray-900">
                  {campaign.name}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                CTR: {campaign.ctr.toFixed(2)}%
              </span>
            </div>

            {/* Cost Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>ค่าใช้จ่าย</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat("th-TH", {
                    style: "currency",
                    currency: "THB",
                  }).format(campaign.cost)}
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${campaign.costPercentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                  className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                />
              </div>
            </div>

            {/* Clicks Bar */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>คลิก</span>
                <span className="font-semibold">
                  {campaign.clicks.toLocaleString("th-TH")}
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${campaign.clicksPercentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 + 0.3 }}
                  className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                />
              </div>
            </div>

            {/* ROI Indicator */}
            <div className="pt-1">
              <div className="flex items-center gap-2">
                <div
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    campaign.ctr >= 5
                      ? "bg-green-100 text-green-700"
                      : campaign.ctr >= 2
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {campaign.ctr >= 5
                    ? "🎯 ดีเยี่ยม"
                    : campaign.ctr >= 2
                    ? "✓ ดี"
                    : "⚠️ ปรับปรุง"}
                </div>
                {campaign.conversions && campaign.conversions > 0 && (
                  <div className="text-xs text-gray-600">
                    Conversions: {campaign.conversions}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-400 to-orange-600"></div>
            <span>ค่าใช้จ่าย</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600"></div>
            <span>คลิก</span>
          </div>
          <div className="flex items-center gap-2">
            <span>CTR ≥ 5% = ดีเยี่ยม</span>
            <span>|</span>
            <span>CTR ≥ 2% = ดี</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
