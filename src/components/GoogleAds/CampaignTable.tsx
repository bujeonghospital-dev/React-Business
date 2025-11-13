// src/components/GoogleAds/CampaignTable.tsx
"use client";

import { GoogleAdsCampaign } from "@/types/google-ads";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CampaignTableProps {
  campaigns: GoogleAdsCampaign[];
}

export default function CampaignTable({ campaigns }: CampaignTableProps) {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("th-TH").format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: 2,
    }).format(num);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <h2 className="text-xl font-bold text-white">รายละเอียดแคมเปญ</h2>
        <p className="text-blue-100 text-sm mt-1">
          ข้อมูลการทำงานของแต่ละแคมเปญ
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ชื่อแคมเปญ
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                คลิก
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                การแสดงผล
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                CTR
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                CPC เฉลี่ย
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                ค่าใช้จ่าย
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {campaigns.map((campaign, index) => (
              <motion.tr
                key={campaign.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-blue-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-3"></div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {campaign.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {campaign.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatNumber(campaign.clicks)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-900">
                    {formatNumber(campaign.impressions)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end">
                    <span
                      className={`text-sm font-medium ${
                        campaign.ctr >= 2 ? "text-green-600" : "text-orange-600"
                      }`}
                    >
                      {campaign.ctr.toFixed(2)}%
                    </span>
                    {campaign.ctr >= 2 ? (
                      <TrendingUp className="w-4 h-4 ml-1 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 ml-1 text-orange-600" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(campaign.averageCpc)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(campaign.cost)}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Summary */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">แสดง {campaigns.length} แคมเปญ</span>
          <span className="text-gray-600">
            รวมค่าใช้จ่าย:{" "}
            <span className="font-bold text-gray-900">
              {formatCurrency(campaigns.reduce((sum, c) => sum + c.cost, 0))}
            </span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
