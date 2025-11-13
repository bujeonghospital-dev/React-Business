"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Action {
  action_type: string;
  value: string;
}

interface AdInsight {
  ad_id: string;
  ad_name: string;
  adset_id: string;
  adset_name: string;
  campaign_id: string;
  campaign_name: string;
  spend: string;
  impressions: string;
  clicks: string;
  ctr: string;
  cpc: string;
  cpm: string;
  actions?: Action[];
  date_start: string;
  date_stop: string;
}

interface ApiResponse {
  success: boolean;
  data: AdInsight[];
  error?: string;
  details?: any;
}

export default function FacebookAdsInsightsPage() {
  const [insights, setInsights] = useState<AdInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAd, setSelectedAd] = useState<AdInsight | null>(null);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "/api/facebook-ads-insights?level=ad&date_preset=today&fields=ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,clicks,ctr,cpc,cpm,actions&action_breakdowns=action_type"
      );

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "ไม่สามารถดึงข้อมูลได้");
      }

      setInsights(result.data);
    } catch (err) {
      console.error("Error fetching insights:", err);
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num)
      ? "0"
      : num.toLocaleString("th-TH", { maximumFractionDigits: 2 });
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num)
      ? "฿0"
      : `฿${num.toLocaleString("th-TH", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
  };

  const getTotalSpend = () => {
    return insights.reduce((sum, ad) => sum + parseFloat(ad.spend || "0"), 0);
  };

  const getTotalImpressions = () => {
    return insights.reduce(
      (sum, ad) => sum + parseInt(ad.impressions || "0"),
      0
    );
  };

  const getTotalClicks = () => {
    return insights.reduce((sum, ad) => sum + parseInt(ad.clicks || "0"), 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-xl text-gray-700">
            กำลังโหลดข้อมูล Facebook Ads...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
        >
          <div className="text-red-500 text-6xl mb-4 text-center">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            เกิดข้อผิดพลาด
          </h2>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button
            onClick={fetchInsights}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            ลองอีกครั้ง
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            📊 Facebook Ads Insights - วันนี้
          </h1>
          <p className="text-gray-600">รายละเอียดข้อมูลโฆษณาแบบละเอียด</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">ค่าใช้จ่ายทั้งหมด</p>
                <p className="text-3xl font-bold text-blue-600">
                  {formatCurrency(getTotalSpend())}
                </p>
              </div>
              <div className="bg-blue-100 rounded-full p-4">
                <span className="text-3xl">💰</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">การแสดงผลทั้งหมด</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatNumber(getTotalImpressions())}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-4">
                <span className="text-3xl">👁️</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">คลิกทั้งหมด</p>
                <p className="text-3xl font-bold text-purple-600">
                  {formatNumber(getTotalClicks())}
                </p>
              </div>
              <div className="bg-purple-100 rounded-full p-4">
                <span className="text-3xl">🖱️</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Ads Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">
              รายการโฆษณา ({insights.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ชื่อโฆษณา
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ค่าใช้จ่าย
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    แสดงผล
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    คลิก
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    CTR
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    CPC
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    รายละเอียด
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {insights.map((ad, index) => (
                  <motion.tr
                    key={ad.ad_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">
                          {ad.ad_name}
                        </p>
                        <p className="text-xs text-gray-500">{ad.adset_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {ad.campaign_name}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-blue-600">
                      {formatCurrency(ad.spend)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">
                      {formatNumber(ad.impressions)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">
                      {formatNumber(ad.clicks)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">
                      {formatNumber(ad.ctr)}%
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">
                      {formatCurrency(ad.cpc)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {ad.actions?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedAd(ad)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                      >
                        ดูเพิ่มเติม
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Modal for Ad Details */}
        {selectedAd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedAd(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {selectedAd.ad_name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Ad ID: {selectedAd.ad_id}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAd(null)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Campaign</p>
                    <p className="font-medium text-gray-800">
                      {selectedAd.campaign_name}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">Ad Set</p>
                    <p className="font-medium text-gray-800">
                      {selectedAd.adset_name}
                    </p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">ค่าใช้จ่าย</p>
                    <p className="font-bold text-blue-600 text-lg">
                      {formatCurrency(selectedAd.spend)}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">การแสดงผล</p>
                    <p className="font-bold text-green-600 text-lg">
                      {formatNumber(selectedAd.impressions)}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">คลิก</p>
                    <p className="font-bold text-purple-600 text-lg">
                      {formatNumber(selectedAd.clicks)}
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-xs text-gray-500 mb-1">CTR</p>
                    <p className="font-bold text-orange-600 text-lg">
                      {formatNumber(selectedAd.ctr)}%
                    </p>
                  </div>
                </div>

                {selectedAd.actions && selectedAd.actions.length > 0 && (
                  <div>
                    <h4 className="text-lg font-bold text-gray-800 mb-4">
                      Actions
                    </h4>
                    <div className="space-y-2">
                      {selectedAd.actions.map((action, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                        >
                          <span className="text-sm text-gray-600">
                            {action.action_type}
                          </span>
                          <span className="font-semibold text-gray-800">
                            {formatNumber(action.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!selectedAd.actions || selectedAd.actions.length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">ไม่มีข้อมูล Actions</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
